---
title: "Maven：坐标、生命周期与最小可用 POM"
date: 2026-02-01 10:35:00 +08:00
categories: [Tools, Maven]
tags: [maven, pom, lifecycle]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 写在前面：本篇面向 Maven 新人和需要快速校准项目基线的同学，覆盖坐标与 packaging、生命周期挂钩点、最小可用 POM 模板、settings.xml 职责分离及常用命令。强调「最小配置 + 清晰职责 + 可复制模板」。

## 1. 坐标与 packaging 设计

### 1.1 命名规范
- groupId：公司域名反写 + 业务线，如 `com.example.pay`; 公共组件放 `com.example.common`。
- artifactId：模块名用短横线连接，如 `pay-api`, `pay-service`; 避免大写与空格。
- version：语义化 `MAJOR.MINOR.PATCH`，快照用 `-SNAPSHOT`；发布正式版前去掉 SNAPSHOT。
- packaging：
	- `jar`：常规服务/库；
	- `war`：传统 Servlet 部署；
	- `pom`：父 POM/聚合模块；
	- 其他（ear）：尽量避免，保持简单。

### 1.2 版本策略
- 主版本不兼容变更；次版本功能兼容；补丁修复。
- SNAPSHOT 仅在内部流转；发布仓库区分 `snapshots` 与 `releases` 路径。

## 2. 生命周期与挂钩

### 2.1 核心阶段
- clean：清理 target；常与 package 组合。
- validate：项目信息校验；很少单独用。
- compile：主源码编译。
- test：测试编译 + 测试执行；Surefire 负责。
- package：生成 jar/war。
- verify：执行集成测试/检查；Failsafe 常绑定在 verify。
- install：安装到本地仓库 `~/.m2/repository`。
- deploy：发布到远程仓库（私服）。

### 2.2 插件与生命周期绑定
- `maven-compiler-plugin` 绑定 compile；
- `maven-surefire-plugin` 绑定 test；
- `maven-failsafe-plugin` 绑定 integration-test/verify；
- `maven-jar-plugin` 或 `spring-boot-maven-plugin` 参与 package；
- `maven-deploy-plugin` 绑定 deploy。

### 2.3 常见命令组合
- `mvn clean package`：最常用，产物在 target。
- `mvn clean verify`：包含集成测试；CI 场景推荐。
- `mvn clean install`：产物进本地仓库，供多模块联调。
- `mvn clean deploy`：发布至私服。
- 并行：`mvn -T 4 clean package` 或 `-T1C` 按 CPU 核数。

## 3. 最小可用 POM 模板

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<groupId>com.example.demo</groupId>
	<artifactId>demo-app</artifactId>
	<version>1.0.0-SNAPSHOT</version>
	<packaging>jar</packaging>

	<properties>
		<maven.compiler.source>17</maven.compiler.source>
		<maven.compiler.target>17</maven.compiler.target>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
	</properties>

	<dependencies>
		<!-- 示例：JUnit 测试依赖 -->
		<dependency>
			<groupId>org.junit.jupiter</groupId>
			<artifactId>junit-jupiter</artifactId>
			<version>5.10.1</version>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>3.11.0</version>
				<configuration>
					<release>17</release>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-surefire-plugin</artifactId>
				<version>3.1.2</version>
				<configuration>
					<useSystemClassLoader>false</useSystemClassLoader>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```

### 3.1 模板解读
- properties：统一编码与 Java 版本；推荐使用 `<release>` 而非 `<source>/<target>`。
- dependencies：示例最小化；真实项目建议使用 BOM 管理版本。
- build/plugins：锁定插件版本，避免使用超旧默认版本。

### 3.2 仓库与插件仓库
- 一般不在项目 POM 定义 mirror；镜像放 settings.xml。
- 如需私服下载插件，配置 `pluginRepositories`；普通仓库放 `repositories`。

## 4. settings.xml 与项目 POM 职责

### 4.1 settings.xml 放什么
- 私服地址（mirrors）和认证（servers）。
- 代理配置。
- 本地仓库位置（可选）。

### 4.2 POM 放什么
- 项目依赖、插件、BOM、构建配置、profile。
- 版本号、属性、模块声明。

### 4.3 职责分离原则
- 凭据、镜像、代理放 settings.xml，不进代码库。
- 与业务相关的依赖、插件、profile 放 POM。
- 这样既安全又可重现。

## 5. 基础命令与场景

- `mvn clean package -DskipTests`：打包跳过测试，谨慎用于 CI 快速反馈。
- `mvn clean verify`：包含集成测试，CI 主线用。
- `mvn dependency:tree`：排查冲突。
- `mvn help:effective-pom`：查看合并后配置。
- `mvn clean deploy -P release`：配合发布 profile 发布正式版。

## 6. 常见问题与修复

### 6.1 JDK 版本不匹配
- 现象：`invalid target release` 或 `UnsupportedClassVersionError`。
- 解决：POM `<release>` 与本地 JDK 对齐；确保 IDE/CI 使用相同 JDK。

### 6.2 插件版本过旧
- 症状：Surefire 不支持 JUnit5；Compiler 不支持新 release。
- 解决：升级插件版本；参考 Maven 官方兼容矩阵。

### 6.3 SNAPSHOT 混用
- 现象：本地/CI 结果不一致。
- 解决：固定版本；发布前消除 SNAPSHOT，或使用私服快照仓库并定期清理。

## 7. 速查清单（团队 Onboarding 可用）

1) 创建 POM：填好 groupId/artifactId/version/packaging。
2) 设置 properties：release/encoding。
3) 锁定插件版本（compiler/surefire/failsafe）。
4) 需要 BOM？在 dependencyManagement import；依赖处不写 version。
5) settings.xml 配私服与凭据。
6) 跑 `mvn clean verify` 验证。

## 8. 总结

最小可用 POM 让项目可快速起步；明确生命周期挂钩点和 settings.xml 职责分离，确保安全与可重现。把插件版本锁定、编码与 Java 版本统一，配合标准命令组合，就能在 CI 和本地获得一致的构建体验。
