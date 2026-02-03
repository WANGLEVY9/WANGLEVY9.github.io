---
title: "Maven：插件体系与构建增强"
date: 2026-02-01 10:37:00 +08:00
categories: [Tools, Maven]
tags: [maven, plugin, profile, build]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 写在前面：插件和 Profile 是 Maven 构建的核心调度器。本文覆盖核心插件配置、Fat JAR 打包、Profile 设计与激活、性能优化以及常见问题定位，附带可直接拷贝的片段与命令。

## 1. 核心插件配置

### 1.1 编译与测试
- `maven-compiler-plugin`：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-compiler-plugin</artifactId>
	<version>3.11.0</version>
	<configuration>
		<release>17</release>
		<encoding>UTF-8</encoding>
	</configuration>
</plugin>
```
- `maven-surefire-plugin`（单测）：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-surefire-plugin</artifactId>
	<version>3.1.2</version>
	<configuration>
		<useSystemClassLoader>false</useSystemClassLoader>
		<includes>
			<include>**/*Test.java</include>
		</includes>
	</configuration>
</plugin>
```
- `maven-failsafe-plugin`（集成测试）：绑定 integration-test/verify：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-failsafe-plugin</artifactId>
	<version>3.1.2</version>
	<executions>
		<execution>
			<goals>
				<goal>integration-test</goal>
				<goal>verify</goal>
			</goals>
			<configuration>
				<includes>
					<include>**/*IT.java</include>
				</includes>
			</configuration>
		</execution>
	</executions>
</plugin>
```

### 1.2 打包与可执行 JAR
- `maven-jar-plugin`：配置 Manifest、过滤，适合普通 jar。
- `maven-shade-plugin`：构建 Fat JAR/重定位冲突类。
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-shade-plugin</artifactId>
	<version>3.5.1</version>
	<executions>
		<execution>
			<phase>package</phase>
			<goals><goal>shade</goal></goals>
			<configuration>
				<createDependencyReducedPom>true</createDependencyReducedPom>
				<relocations>
					<relocation>
						<pattern>com.google.common</pattern>
						<shadedPattern>shadow.com.google.common</shadedPattern>
					</relocation>
				</relocations>
				<transformers>
					<transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
						<mainClass>com.example.Main</mainClass>
					</transformer>
				</transformers>
			</configuration>
		</execution>
	</executions>
</plugin>
```
- `spring-boot-maven-plugin`：
```xml
<plugin>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-maven-plugin</artifactId>
	<version>3.2.1</version>
	<executions>
		<execution>
			<goals><goal>repackage</goal></goals>
		</execution>
	</executions>
</plugin>
```

### 1.3 资源过滤与多环境
- `maven-resources-plugin`：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-resources-plugin</artifactId>
	<version>3.3.1</version>
	<configuration>
		<encoding>UTF-8</encoding>
		<useDefaultDelimiters>false</useDefaultDelimiters>
		<delimiters>
			<delimiter>@</delimiter>
		</delimiters>
		<nonFilteredFileExtensions>
			<nonFilteredFileExtension>pem</nonFilteredFileExtension>
		</nonFilteredFileExtensions>
	</configuration>
</plugin>
```
- 配合 Profile 切换不同资源目录或占位符值。

## 2. Profile 设计与激活

### 2.1 激活方式
- property：`mvn -P prod -DskipTests`。
- file：存在/不存在某文件激活；适合本地私密配置。
- os：按操作系统激活；少用。
- default：`<activeByDefault>true</activeByDefault>` 仅保留一个 default。

### 2.2 多数据源示例
```xml
<profiles>
	<profile>
		<id>dev</id>
		<properties>
			<jdbc.url>jdbc:postgresql://127.0.0.1:5432/dev</jdbc.url>
			<jdbc.user>dev</jdbc.user>
		</properties>
	</profile>
	<profile>
		<id>prod</id>
		<properties>
			<jdbc.url>${env.PROD_DB_URL}</jdbc.url>
			<jdbc.user>${env.PROD_DB_USER}</jdbc.user>
		</properties>
	</profile>
</profiles>
```
- 资源文件使用 `@jdbc.url@` 占位，打包时由 resources 插件过滤。

### 2.3 组合 Profile
- 可通过 `-P dev,feature-x` 叠加；避免 default 同时激活多个产生覆盖混乱。

## 3. 构建性能与稳定性

### 3.1 并行与增量
- 并行：`mvn -T 1C clean package` 按核数；在重 IO/网络项目收益有限。
- 增量：`mvn -pl module -am` 局部构建；配合 `-DskipTests` 做快速反馈。

### 3.2 离线与缓存
- 离线：`mvn -o` 在无网环境；前置准备好本地仓库。
- 清理：定期清理 `~/.m2/repository` 中的 SNAPSHOT；或用 `mvn dependency:purge-local-repository`。

### 3.3 稳定性
- 锁定插件版本；禁用超旧默认版本。
- 使用 BOM 统一依赖版本，减少 shade 冲突。

## 4. 常见问题与解决

### 4.1 目标 JDK 不匹配
- 现象：`invalid target release`。
- 解决：compiler plugin 使用 `<release>`；确保 JDK 安装并在 PATH/IDE 配置。

### 4.2 打包冲突（重复类/服务描述符）
- Shade 时开启 `createDependencyReducedPom`；必要时重定位（relocation）。
- 服务文件合并：使用 transformers 处理 `META-INF/services/*`。

### 4.3 测试未执行或全部跳过
- 确认 surefire/failsafe 版本与测试命名匹配；不要混用 `skipTests` 与 `maven.test.skip`。

### 4.4 资源过滤踩坑
- 二进制文件被过滤损坏：将后缀加入 `nonFilteredFileExtensions`。
- 占位符冲突：修改分隔符，如使用 `@`。

## 5. 配方与最佳实践

- 父 POM 的 pluginManagement 锁定版本，子模块继承引用。
- 使用 profiles 切换环境配置，配合资源过滤；敏感信息走环境变量，不写死。
- 构建产物：普通 JAR 用 jar plugin，微服务用 spring-boot-maven-plugin，需单文件交付用 shade。
- 并行与局部构建结合，提升反馈速度；CI 上使用 `clean verify` 保障质量。
- 对外发布前跑 `mvn dependency:tree`，检查冲突和体积。

## 6. 速查命令

- 单测：`mvn -Dtest=ClassNameTest test`
- 集成测试：`mvn -Dit.test=OrderIT verify`
- 并行：`mvn -T 1C clean package`
- 离线：`mvn -o clean package`
- Shade：`mvn clean package -P shade`

## 7. 总结

插件决定了生命周期的行为，Profile 决定了配置与资源的切换。锁定插件版本、合理设计 Profile、按需选择打包方式，并配合并行/增量策略，能大幅提升构建效率并降低冲突。把常见问题和解决路径沉淀到模板与脚本中，团队即可稳定复用。
