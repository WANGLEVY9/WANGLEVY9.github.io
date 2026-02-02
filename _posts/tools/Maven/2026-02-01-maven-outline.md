---
title: "Maven 提纲：构建、依赖与多模块管理"
date: 2026-02-01 10:20:00 +08:00
categories: [Tools, Dev]
tags: [maven, build, dependency, pom, lifecycle]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 提纲：覆盖 Maven 核心概念、常用命令、多模块与仓库管理。

## 主题 1：坐标、生命周期与最小可用 POM
- Maven 坐标设计：groupId/artifactId/version 的命名规范、packaging 选择（jar/war/pom）。
- 生命周期与阶段：clean/validate/compile/test/package/verify/install/deploy 对应输出物与常见钩子。
- 最小可用 POM 模板：properties/encoding/source/target、repositories/pluginRepositories 基线设置。
- settings.xml 与项目 POM 职责分离：全局配置 vs 项目内配置的边界。

## 主题 2：依赖管理与冲突调解
- 作用域差异与适用场景：compile/provided/runtime/test/system/import。
- 可传递依赖与“最近优先/路径最短”规则，依赖冲突的定位方法（dependency:tree / mvn help:effective-pom）。
- 依赖排除与版本对齐：exclusion、dependencyManagement、BOM（import scope），以及 Spring Boot 依赖管理案例。
- 版本锁定与安全：使用 versions-maven-plugin 统一升级；避免“+”动态版本；镜像安全审计。

## 主题 3：插件体系与构建增强
- 核心插件：maven-compiler-plugin、maven-surefire-plugin/failsafe、maven-shade-plugin、spring-boot-maven-plugin。
- 插件配置实践：源/目标版本、并行测试、排除/合并资源、可执行 JAR/Fat JAR 打包要点。
- Profile 设计：dev/stage/prod 环境变量、激活条件（property/file/os/profile id）、多数据源配置切换。
- 构建性能：`mvn -T` 并行、增量构建、离线模式、本地仓库清理与磁盘占用治理。

## 主题 4：多模块项目治理
- 聚合与继承：父 POM 结构、modules 与 dependencyManagement 的分工。
- 版本统一：父 POM 管理插件/依赖版本，子模块最小化配置；跨模块引用的最佳实践。
- 测试拆分：单元测试 vs 集成测试（Surefire/Failsafe），多模块下的选择性执行（-pl/-am）。
- 发布流程：install 与 deploy 区别，私服发布流水线，快照与正式版策略。

## 主题 5：仓库、镜像与故障排查
- 仓库配置：中央/私服/镜像，认证与代理；settings.xml 中的 mirror 与 server 定义。
- 典型问题：依赖下载失败、证书/代理问题、权限 401、离线仓库导致版本不可用。
- 编译与 JDK 版本错配：source/target 与实际 JDK 对齐，--add-opens 等参数的加挂方式。
- 调试工具：dependency:analyze、enforcer 规则、help:effective-pom，结合日志级别 -X 的使用场景。
