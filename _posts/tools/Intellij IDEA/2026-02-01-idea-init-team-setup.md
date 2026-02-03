---
title: "IntelliJ IDEA：初始化与团队规范落地"
date: 2026-02-01 10:30:00 +08:00
categories: [Tools, Intellij IDEA]
tags: [idea, setup, style, template]
image: /assets/img/【哲风壁纸】二次元少女-动漫.png
---

> 写在前面：本篇面向团队初始落地阶段，聚焦「环境基线、注解处理、模板化、导包与格式化、配置分层与迁移」五个主题。目标是让新人 30 分钟内完成可工作的 IDEA 配置，并让团队的代码风格在多人协作下保持一致。

## 1. 环境基线：一次配置，全员对齐

### 1.1 JDK/SDK 版本策略
- 项目级固定 JDK：在 `Project Structure > Project SDK` 统一版本，如 `temurin-17`；在仓库根放置 `.sdkmanrc` 或 `.java-version` 提示版本。
- Gradle/Maven 与 IDE 对齐：Gradle wrapper 中 `org.gradle.java.home`、Maven `maven.toolchain` 与 IDEA `Project SDK` 保持一致，避免编译差异。
- 多版本共存：若需兼容 JDK 8/11/17，建议通过 `Project Structure > Modules` 为子模块指定 SDK，避免全局降级。

### 1.2 编码、换行符、区域设置
- 统一 UTF-8：`Editor > File Encodings` 全部设为 UTF-8，`Transparent native-to-ascii conversion` 关闭，避免 properties 自动转义影响可读性。
- 换行符：统一 LF；在 `.gitattributes` 写 `* text=auto eol=lf`，并在 IDEA `Line Separator` 选择 LF。
- 时区与语言：RunConfig 默认 `-Duser.timezone=Asia/Shanghai -Dfile.encoding=UTF-8`；显示语言遵循个人偏好，但团队文档统一使用中文描述配置。

### 1.3 代码风格模板（Code Style）
- 使用共享 XML：在仓库 `config/idea/codeStyle.xml` 保存，`Editor > Code Style > Scheme` 选择 `Project` 并导入。
- 关键项：
	- Java/Kotlin import 顺序：`java.*`, `javax.*`, `org.*`, `com.*`, 其余按字母；每组之间空行。
	- 长度与换行：`Right margin` 120/140，避免过长链式调用换行混乱。
	- 注释对齐：开启 `Align parameter comments`、`Align multiline parameters`。
- 检查保存：启用 `Code Style > Java > Arrangement` 规则，确保字段/方法顺序可控（如常量-静态-字段-构造器-公有方法-私有方法）。

### 1.4 检查器与静态分析
- 打开 `Settings > Editor > Inspections` 的团队基线：空指针风险、魔法值、重复代码、未关闭资源、线程安全警告。
- Kotlin/Java 混合项目，开启 `Kotlin | Interoperability` 检查，避免平台类型隐患。
- 保存时提示：勾选 `Reformat code`, `Optimize imports`, `Rearrange code` 的保存动作，或转而使用 pre-commit 钩子统一。

## 2. Lombok 与 Annotation Processing

### 2.1 何时需要 Annotation Processing
- Lombok、MapStruct、AutoValue、Dagger 等都依赖 Annotation Processing；未启用会导致编译报错或 IDE 不识别生成代码。

### 2.2 IDEA 设置
- `Settings > Build, Execution, Deployment > Compiler > Annotation Processors`：选择 `Enable annotation processing`，并将默认 profile 设为 `Obtain processors from project classpath`。
- Gradle 项目：建议在 `build.gradle` 配置 `tasks.withType(JavaCompile) { options.annotationProcessorGeneratedSourcesDirectory = file("$projectDir/build/generated/sources/annotationProcessor/java/main") }`，IDEA 会自动识别。
- Maven 项目：确保使用 `maven-compiler-plugin` 并开启 `<annotationProcessorPaths>`；IDEA 导入后自动开启。

### 2.3 Lombok 特别提示
- 安装 Lombok 插件；检查 `Settings > Build Tools > Maven/Gradle > Runner` 中没有额外 VM 限制。
- 避免滥用：谨慎使用 `@Data`（可能暴露 `equals/hashCode`），在实体类用 `@Getter/@Setter` + 明确的 `equals/hashCode`。
- Delombok：在 CI 或发布前，可通过 `lombok.delombok` 生成源码做静态扫描，避免注解遮蔽问题。

## 3. 模板化：让重复工作模板化

### 3.1 Live Template（代码片段）
- 常用模板：
	- `logd`：`private static final Logger log = LoggerFactory.getLogger($CLASS$);`
	- `test`：JUnit5 测试骨架，包含 `@DisplayName`。
	- `tryr`：`try-with-resources` 模板，预填资源变量。
	- `resp`：标准响应封装 `Response<T>`。
- 变量与上下文：使用 `$SELECTION$` 包裹选中文本，适配 Java/Kotlin/Markdown 不同上下文。
- 共享方式：`Settings > Editor > Live Templates > Export/Import`，存放仓库 `config/idea/liveTemplates.xml`。

### 3.2 File Template（文件模板）
- 新建类/接口/枚举时自动生成版权、作者、日期；模板示例：
	```
	/**
	 * $NAME$ - 描述
	 * @author $USER$
	 * @since $DATE$
	 */
	public class $NAME$ {
	}
	```
- 多模块项目可针对 `src/main/java` 与 `src/test/java` 定义不同模板。

### 3.3 Postfix Completion（后缀补全）
- 常用：`var`, `if`, `notnull`, `nn`, `for`, `stream`；团队建议保留默认，不做过度自定义以免分享成本增加。
- 可在 `Settings > Editor > General > Postfix Completion` 中启用/禁用特定后缀，保持一致体验。

### 3.4 共享与同步
- IDEA Sync 或 Settings Repository：在团队中推荐用 VCS 同步（如 JetBrains IDE Sync），若有内网限制可使用 `Settings Repository` 指向 Git 私有仓库。
- 同步白名单：只同步与代码风格、模板相关的设置；不同步个人化的快捷键、主题，避免干扰。

## 4. 自动导包与格式化策略

### 4.1 导包规则
- 去除通配符：`Class count to use import with '*'` 设为 99；静态导入设为 99；确保提交代码时都是显式导入。
- 排序：先标准库，再第三方，再公司/组织包；在 Code Style Import 排序中固化。
- 冲突处理：如果有重复类名，优先使用全限定名或在文件顶部用 `import x.y.Class as Alias`（Kotlin）。

### 4.2 保存/提交前格式化
- 保存动作：`Settings > Tools > Actions on Save` 勾选 `Reformat code`, `Optimize imports`, `Rearrange code`。
- 预提交钩子：
	- 提供 `./tools/pre-commit-format.sh`，调用 IDE CLI 或 `spotlessApply`/`mvn fmt:format`。
	- 对 CI 阶段，强制运行格式化校验 `spotlessCheck` 或 `mvn fmt:check`。
- Markdown/JSON/YAML：为文档目录单独配置格式化规则，避免代码规则污染文档。

### 4.3 多语言项目（Java/Kotlin/JS）
- Kotlin 与 Java 混编：启用 `EditorConfig support`，在 `.editorconfig` 定义统一规则，IDEA 自动应用。
- 前端子仓库：使用内建 ESLint/Prettier 支持，在 `Languages & Frameworks > JavaScript` 指定本地 Node 与包管理器，避免自动下载全局依赖。

## 5. 团队规范落地与迁移

### 5.1 配置分层
- 全局设置（IDE 级）：字体、主题、快捷键属于个人；不要同步。
- 项目级：编码、换行符、Code Style、Inspection Profile、Run Configuration 模板。
- 生成物：`.idea/` 下的 `workspace.xml` 不提交；`codeStyles`、`inspectionProfiles`、`.run` 可以提交。

### 5.2 备份与迁移
- 导出设置：`File > Manage IDE Settings > Export Settings`，选择 `Code style, Inspection, Live Templates, Keymaps（可选）`。
- 新机导入：`Import Settings` 选择上一步导出的 zip，或直接从 Settings Repository 拉取。
- 环境变量与密钥：使用 `.env.example` 指南，实际值不入库。

### 5.3 新人落地手册（30 分钟路线）
1) 安装指定版本 JDK 与 IDEA。
2) Import 项目，确保使用 Wrapper。
3) 导入团队配置包（Code Style、Inspection、Live Templates）。
4) 开启 Annotation Processing。
5) 打开 Actions on Save：格式化 + Optimize imports。
6) 运行 `./tools/check.sh` 或 `mvn verify` 确认环境 OK。

### 5.4 规范检查自动化
- 在 CI 里添加 `lint` 任务：`./gradlew spotlessCheck detekt` 或 `mvn fmt:check pmd:check`；失败时给出修复指引。
- 提交门禁：Pre-commit 阶段运行轻量规则，CI 运行全量规则，避免本地耗时过长。

## 6. 快捷键与工作流建议

- 快速打开设置：`Ctrl+Alt+S`。
- 切换编码/换行：右下角状态栏直接点击。
- 导入设置：`File > Manage IDE Settings`。
- 保存动作开关：`Settings > Tools > Actions on Save`。
- Live Template 插入：`Ctrl+J`。

## 7. 误区与反模式

- 仅在个人电脑上调好配置未共享，导致新人重复踩坑。
- 允许 `*` 导入，合并提交后 diff 难看且易冲突。
- 关闭 Annotation Processing 却使用 Lombok/MapStruct，导致 IDE 报红。
- 过度自定义快捷键/后缀补全，团队协作时难以复现操作。
- 保存动作未启用，格式化靠自觉，最终在 PR 里产生大段无意义格式 diff。

## 8. 模板：团队配置包结构建议

```
config/
	idea/
		codeStyle.xml
		inspectionProfiles/
			Project_Default.xml
		liveTemplates/
			team.xml
		jarRepositories.xml (可选)
	editorconfig/.editorconfig
	git/.gitattributes
tools/
	pre-commit-format.sh
	check.sh
README.md  # 快速落地步骤
```

## 9. 总结

团队规范落地的关键在于「明确基线」「可复制」「自动检查」。用尽量少的步骤让新人落地，同时提供可审计的配置包和脚本化的检查手段。IDEA 的可视化配置应落到仓库文件，配合 CI 校验，才能真正做到「写代码而非调 IDE」。
