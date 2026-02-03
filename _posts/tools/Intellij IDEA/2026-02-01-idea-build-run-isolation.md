title: "IntelliJ IDEA：构建、运行与环境隔离"
date: 2026-02-01 10:33:00 +08:00
categories: [Tools, Intellij IDEA]
tags: [idea, build, run, config]
image: /assets/img/【哲风壁纸】二次元少女-动漫.png

> 写在前面：本篇聚焦「Run/Debug 配置、JVM/Agent 参数、Maven/Gradle 集成、数据与配置隔离、常见运行故障排查」。目标是让开发者在本地、预发、CI 三种场景下都能快速起服务、隔离环境、抓到证据。提供示例模板、配置片段和排查清单，可直接放入团队 Wiki。

## 1. Run/Debug Configuration 设计

### 1.1 模板与命名
- Application：命名 `App-模块-环境`（例：`App-account-dev`）；主类使用全限定名；明确模块 classpath，避免跨模块误加载。
- JUnit：命名 `Test-模块-范围`（例：`Test-account-all`）；Scope 优先单模块；开启「Search for tests」的 explicit mode，避免扫描全仓库。
- Spring Boot：命名 `Boot-服务-环境`（例：`Boot-gateway-dev`）；Program args `--spring.profiles.active=dev --logging.file.name=logs/app.log`；勾选「Use classpath of module」为 web 层模块。
- Compound：组合「后端 + 前端 + Mock/依赖」；启动顺序 Mock/DB → 后端 → 前端；设置单独控制台，避免输出混在一起。

### 1.2 VM options / Env 分工
- VM options 负责模式开关、JVM 资源、系统属性：`-Xms512m -Xmx2048m -XX:+UseG1GC -Duser.timezone=Asia/Shanghai -Dfile.encoding=UTF-8 -Dapp.env.mode=dev`。
- Env 负责主机/端口/密钥：`DB_URL`、`DB_USER`、`DB_PASS`、`REDIS_URL`；路径使用 `${PROJECT_DIR}`，保持可移植。
- Agent 链路：`-javaagent:/path/arthas/arthas-agent.jar` 等按「覆盖率/监控/字节码增强」顺序放置，避免织入冲突。

### 1.3 Before/After Launch
- Build/Make：常规应用勾选 Build；Spring Boot 若 delegated to Gradle，可关闭 Make，避免重复编译。
- 预热脚本：Before launch 运行 `docker-compose -f compose.dev.yml up -d redis db` 或 mock server；After launch 关闭或清理。
- 热更新：开启 `Build project automatically` + `Allow auto-make when app is running`；使用 DevTools/JRebel 时确认 classpath 正确。

### 1.4 远程调试模板
- VM options：`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005`，多实例分配 5005/5006/5007；非可信网络用 SSH 隧道。
- 源码匹配：远程分支与本地一致，否则断点灰色不命中。

## 2. JVM/Agent 参数基线

### 2.1 堆与 GC
- 通用：`-Xms512m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+ParallelRefProcEnabled`。
- 大项目：提升至 4G/6G；若存在大量小对象，加入 `-XX:+AlwaysPreTouch` 提升页分配连续性。
- 观察：`-Xlog:gc*:file=gc.log:time,level,tags`，问题期对照 GC 日志。

### 2.2 编码/时区/Locale
- 统一：`-Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai`；日志与 CI 对齐，避免快照类用例失败。

### 2.3 Agent 注意事项
- 顺序影响织入；把核心业务 agent 放最后。
- 覆盖率/探针类 agent（如 Jacoco）调试完及时移除，降低开销。
- 生产远程调试：严格时间窗，只读操作，必要时只开到单节点。

## 3. Maven/Gradle 集成

### 3.1 Wrapper 强制
- 使用项目自带 Wrapper，RunConfig 勾选「Use project wrapper」。
- 不把私有镜像/凭据写死在 `settings.xml/gradle.properties`，改为 env 注入。

### 3.2 缓存/并行/离线
- Maven：网络不稳时 `-o`；预热 `~/.m2/repository`；尽量使用公司内网仓库。
- Gradle：`org.gradle.caching=true`，`org.gradle.parallel=true`；为 Kotlin daemon 单独分配 `-Dkotlin.daemon.jvm.options=-Xmx1g`。
- configuration-cache：在不依赖大量反射扫描的项目开启；若有自定义 Gradle 插件需验证兼容性。

### 3.3 导入与执行器
- Maven：自动导入；多模块 BOM 频繁刷新时可手动 Reimport。
- Gradle：`Build and run using Gradle` 保持一致性；调试单测可临时切 IDE 构建提速。
- 标记目录：确保 `main/resources`、`test/resources` 被识别；生成目录、日志目录标记为 Excluded，减轻索引。

### 3.4 并行测试与 Kotlin/Java 混编
- Maven Surefire/FailSafe `<forkCount>1.5C</forkCount><reuseForks>true</reuseForks>`；端口敏感用例设为 1。
- Gradle Test 并行：`maxParallelForks = Runtime.runtime.availableProcessors().intdiv(2)`；注意共享端口/DB 竞争。

## 4. 数据与配置隔离

### 4.1 Profile 分层
- 公共配置放 `application.yml`；差异放 `application-dev/test/staging.yml`；RunConfig 显式 `--spring.profiles.active=dev`。
- 生产敏感信息不放默认 profile；避免默认 profile 直连生产。

### 4.2 Env vs VM options 角色
- Env：主机、端口、密钥、路径；与宿主环境耦合的变量。
- VM：开关、模式、调试标志；可在 RunConfig 层快速覆盖。

### 4.3 本地数据隔离实践
- DB：本地独立 schema 或容器；禁止直连生产/预发。
- Cache/文件：临时目录 `${PROJECT_DIR}/.local-data/{env}`；不同 env 独立。
- MQ：优先内存/嵌入式或 Testcontainers；不要让本地生产 topic 混用。

### 4.4 密钥管理
- `.env` + `.env.local`（gitignore）；RunConfig 使用 EnvFile 或 IDE Env 读取。
- CI 通过密文注入，避免 VM options 硬编码秘钥。

## 5. 构建与运行问题排查

### 5.1 类路径冲突
- 现象：`NoClassDefFoundError`、`LinkageError`、`NoSuchMethodError`。
- 手段：`-verbose:class`/`-XX:+TraceClassLoading` 查看加载来源；依赖树查版本冲突；对 Shade/FatJar 检查重复打包。
- 解决：统一版本（BOM/resolutionStrategy.force），排除重复依赖。

### 5.2 热更新失效
- 检查 auto-make、DevTools/JRebel 是否启用；确认使用的编译器（IDE/Gradle）与 classpath 一致。
- Kotlin 结构变更需重启；仅方法体改动可 HotSwap。

### 5.3 Gradle 缓存不命中
- 看 `--info` 中 `FROM-CACHE`；若 miss：检查 `@CacheableTask`、绝对路径输入、JDK 版本差异。
- 使用 Build Scan（Enterprise 免费版）定位 cache miss 原因。

### 5.4 端口/进程
- 启动前 netstat/lsof 检查；给每个 RunConfig 分配独立端口，避免 5005 争抢。
- Compound 顺序合理，防止前端先起占用端口。

### 5.5 代理与证书
- 代理用 env 注入，不写死配置；公司 CA 导入 JDK cacerts 或指定 truststore。
- SSL 排查：`-Djavax.net.debug=ssl,handshake` 临时开启。

### 5.6 时区/编码
- 统一 `-Duser.timezone=Asia/Shanghai -Dfile.encoding=UTF-8`；日志与 CI 对齐。

## 6. 场景示例

### 6.1 单体服务（Spring Boot）
- RunConfig: `Boot-gateway-dev`
- VM: `-Xms512m -Xmx2048m -XX:+UseG1GC -Dspring.profiles.active=dev -Dapp.env.mode=dev -Duser.timezone=Asia/Shanghai`
- Env: DB/Redis/消息队列本地地址。
- Before launch: `docker-compose -f compose.dev.yml up -d redis db`

### 6.2 集成测试 + Testcontainers
- RunConfig: `Test-account-all`
- VM: `-XX:+UseG1GC -Dapp.env.mode=test`
- Before/After: `docker-compose up` / `down` 或 Testcontainers 复用 `testcontainers.reuse.enable=true`。
- Runner: 使用 Gradle，保证与容器同 JVM。

### 6.3 Compound 联调
- Compound: `Suite-dev`，包含 Auth、Gateway、FE、Mock；顺序 Mock→Auth→Gateway→FE。
- Shared Env: `ENV=dev LOG_LEVEL=debug`，各子项追加端口。

## 7. 团队共享与规范

- 提交 `.run/*.run.xml` 模板，敏感信息放 `.env.local`；模板中使用 `${ENV_VAR}` 占位。
- `docs/idea-run-config.md` 记录依赖、端口、VM/Env 样例、远程调试指引。
- 新人 30 分钟落地：导入配置包 → 开启 annotation processing → 打开 Actions on Save → 运行 `./tools/check.sh`。

## 8. 速查表（故障→动作）

| 现象            | 快速动作                               | 进一步                  |
| --------------- | -------------------------------------- | ----------------------- |
| 启动慢          | 检查 Gradle Daemon/cache，关闭无关插件 | GC/CPU 分析，调大堆     |
| NoClassDefFound | `-verbose:class` + 依赖树              | 统一版本/排除冲突       |
| 热更新不生效    | 开 auto-make/DevTools/JRebel           | 检查编译器与 classpath  |
| 端口占用        | netstat/lsof + 杀流浪进程              | Compound 顺序/端口规划  |
| SSL/代理        | 配 truststore/代理 env                 | `-Djavax.net.debug=ssl` |

## 9. 最小可行配置清单

1) Wrapper 优先，IDE 选用项目 SDK。
2) RunConfig 命名与模板统一；VM baseline：`-Xms512m -Xmx2048m -XX:+UseG1GC -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai`。
3) Profiles + .env 分层，`.env.local` 不入库。
4) Auto-make 开启；Gradle delegated，调试可临时切 IDE。
5) Before launch 启动依赖，After launch 清理。
6) 依赖/端口/调试文档化。
7) 遇到异常先按「缓存→类路径→代理/证书→端口」顺序排查。

## 10. VM options 片段

- GC 日志：`-Xlog:gc*:file=gc.log:time,level,tags`
- 远程调试：`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005`
- JFR 采样：`-XX:StartFlightRecording=name=dev,filename=jfr.jfr,dumponexit=true,settings=profile`
- 禁用偏向锁（JDK8）：`-XX:-UseBiasedLocking`

## 11. 总结

运行/构建配置的目标是「可复制、可隔离、可诊断」。明确 VM/Env 分工、用 Wrapper 锁版本、用 profile/.env 切分环境，把常见问题的排查路径写进项目文档。这样团队成员可以最快把服务跑起来，把时间用在业务和验证上。
