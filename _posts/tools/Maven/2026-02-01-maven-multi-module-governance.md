---
title: "Maven：多模块项目治理"
date: 2026-02-01 10:38:00 +08:00
categories: [Tools, Maven]
tags: [maven, multimodule, governance]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 写在前面：多模块是大型 Maven 项目的常态。本文从聚合与继承、版本统一、测试拆分、发布流程到常见坑，提供结构范式、命令组合与风险提示，帮助团队搭建「可治理、可演进」的多模块架构。

## 1. 聚合与继承的分工

### 1.1 父 POM（继承）
- 作用：承载 dependencyManagement、pluginManagement、全局属性、公共 profile；子模块继承。
- packaging：`pom`。
- 不负责打包输出，仅提供配置与版本对齐。

### 1.2 聚合 POM（modules）
- 作用：一次性构建多个模块；声明 `<modules>` 列表。
- 可与父 POM 合并（既作为 parent 也作为 aggregator）。常见根 POM 同时承担两者。

### 1.3 典型结构
```
root (pom)
	├── pom.xml        # parent + aggregator
	├── common         # 公共模块，api/infra
	│    └── pom.xml
	├── service-a
	│    └── pom.xml
	├── service-b
	│    └── pom.xml
	└── integration
			 └── pom.xml   # 集成测试/打包
```

## 2. 版本与依赖统一

### 2.1 dependencyManagement
- 父 POM 定义版本：核心库（spring/jackson/logging/db driver）在此锁定。
- 子模块依赖不写 version，遵循父 POM；覆盖时需谨慎，最好记录在父 POM。

### 2.2 pluginManagement
- 父 POM 锁定 compiler/surefire/failsafe/shade/spotless 等插件版本；子模块引用即可。
- 避免子模块各自声明不同插件版本，导致构建不一致。

### 2.3 跨模块依赖最佳实践
- 只依赖 API/接口模块，避免实现模块互相引用导致耦合与循环依赖。
- 公共模块拆分：`common-api`（DTO/接口）、`common-infra`（基础设施实现）。
- 禁止「全家桶」common 把所有依赖都带入，导致树过重。

## 3. 测试拆分与命令

### 3.1 Surefire vs Failsafe
- Surefire：绑定 test，相当于单元测试。
- Failsafe：绑定 integration-test/verify，适合集成测试。
- 规则：单元测试命名 `*Test`；集成测试命名 `*IT`，由 Failsafe 执行。

### 3.2 选择性执行
- `-pl module-a -am`：只构建模块 A 及其依赖；适合局部修改。
- `-DskipTests`：跳过测试；`-DskipITs`：只跳过集成测试（Failsafe）。

### 3.3 集成测试模块化
- 将端到端/集成测试放独立模块（如 `integration`），依赖各服务打包产物或使用 Testcontainers。
- 运行：`mvn clean verify -pl integration -am`。

## 4. 发布与流水线

### 4.1 install vs deploy
- install：安装到本地 `~/.m2`，便于本地多模块互相引用。
- deploy：发布到远程仓库（私服），CI/CD 使用；需要认证与分仓（snapshots/releases）。

### 4.2 版本策略
- SNAPSHOT 用于开发迭代；CI 推送到快照仓库，定期清理。
- 正式版：使用 release profile，关闭快照更新；确保所有模块版本一致。

### 4.3 CI 流程范式
1) `mvn -B -U clean verify`：编译+单测+集成测试。
2) `mvn -B deploy -P release`：仅在 main/release 分支执行。
3) 生成 SBOM/许可证报告，上传制品库。

## 5. 常见坑与规避

### 5.1 循环依赖
- 现象：解析失败或运行时错误。
- 规避：强制「上层依赖下层接口、下层不反向依赖上层」；抽公共接口模块断开环。

### 5.2 父子版本错配
- 现象：`parent.relativePath` 找不到，或版本解析不一致。
- 解决：父 POM version 明确；`relativePath` 默认 `../pom.xml`，若放中央仓库可置空。

### 5.3 模块未导入
- `modules` 漏列导致未构建；检查 aggregator pom。
- IDE 导入：确保「import Maven projects automatically」开启。

### 5.4 插件版本漂移
- 各模块自定义插件版本导致行为不同；统一在 pluginManagement 锁版本。

## 6. 配置示例（父 POM 片段）

```xml
<project>
	<modelVersion>4.0.0</modelVersion>
	<groupId>com.example</groupId>
	<artifactId>demo-parent</artifactId>
	<version>1.0.0-SNAPSHOT</version>
	<packaging>pom</packaging>

	<modules>
		<module>common</module>
		<module>service-a</module>
		<module>service-b</module>
		<module>integration</module>
	</modules>

	<properties>
		<java.version>17</java.version>
	</properties>

	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-dependencies</artifactId>
				<version>3.2.1</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<pluginManagement>
			<plugins>
				<plugin>
					<groupId>org.apache.maven.plugins</groupId>
					<artifactId>maven-compiler-plugin</artifactId>
					<version>3.11.0</version>
					<configuration>
						<release>${java.version}</release>
					</configuration>
				</plugin>
				<plugin>
					<groupId>org.apache.maven.plugins</groupId>
					<artifactId>maven-surefire-plugin</artifactId>
					<version>3.1.2</version>
				</plugin>
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
						</execution>
					</executions>
				</plugin>
			</plugins>
		</pluginManagement>
	</build>
</project>
```

## 7. 演练场景

### 7.1 新增模块
1) 在父 POM modules 添加新模块名。
2) 创建子模块 POM，parent 指向父。
3) 依赖写不带版本，享受 dependencyManagement 对齐。
4) 运行 `mvn -pl new-module -am clean package` 验证。

### 7.2 局部构建与调试
- 修改 service-a：`mvn -pl service-a -am clean test`。
- 集成测试：`mvn -pl integration -am verify`。

### 7.3 版本发布
- 将父子版本统一 bump；可用 `versions-maven-plugin`。
- 主干跑 `mvn clean deploy -P release` 推送制品。

## 8. 速查清单

- 父 POM 负责对齐版本与插件；modules 负责聚合。
- 依赖跨模块只指向 API；避免实现互依与循环。
- 测试分层：Surefire 单测，Failsafe 集成；IT 独立模块更清晰。
- 选择性构建：`-pl/-am`；发布区分 install/deploy。
- 版本一致性：父子同版本，SNAPSHOT/Release 分仓。

## 9. 总结

多模块治理的关键在「分层清晰、版本统一、构建可控」。用父 POM 统一依赖与插件，用模块划分职责；测试与发布分层，构建命令可局部执行。规避循环依赖、版本漂移和模块遗漏，才能在大规模协作下保持可维护性。
