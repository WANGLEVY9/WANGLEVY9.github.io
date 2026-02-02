---
title: "Maven 提纲：构建、依赖与多模块管理"
date: 2026-02-01 10:20:00 +08:00
categories: [Tools, Dev]
tags: [maven, build, dependency, pom, lifecycle]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 提纲：覆盖 Maven 核心概念、常用命令、多模块与仓库管理。

- 基础概念
  - 坐标：groupId/artifactId/version；packaging 类型；仓库（本地/私服/中央）。
  - 生命周期与阶段：clean / validate / compile / test / package / verify / install / deploy。
- 依赖管理
  - 作用域（compile/provided/runtime/test/system/import），可传递依赖与冲突调解（最近优先/路径最短）。
  - 依赖排除、依赖锁定（dependencyManagement）、版本对齐（BOM）。
- 插件与构建
  - 常用插件：compiler、surefire/failsafe、shade、spring-boot-maven-plugin。
  - 自定义 profile：区分 dev/stage/prod 配置与参数。
- 多模块项目
  - 聚合与继承：父 POM 结构，模块间依赖，版本统一管理。
- 仓库与镜像
  - settings.xml 配置私服/镜像、认证、代理；本地仓库清理。
- 常用命令
  - `mvn -T` 并行构建、`-DskipTests`/`-DskipITs`，`dependency:tree`，`help:effective-pom`。
- 问题排查
  - 依赖冲突、编译版本不匹配、插件版本锁定、M2_HOME/JAVA_HOME 配置。
