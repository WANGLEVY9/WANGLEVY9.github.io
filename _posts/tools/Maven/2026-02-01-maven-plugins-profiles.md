---
title: "Maven：插件体系与构建增强"
date: 2026-02-01 10:37:00 +08:00
categories: [Tools, Dev]
tags: [maven, plugin, profile, build]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

- 核心插件：maven-compiler-plugin、surefire/failsafe、shade、spring-boot-maven-plugin 的典型配置。
- 插件配置实践：源/目标版本、并行测试、资源过滤、可执行 JAR/Fat JAR 打包要点。
- Profile 设计：dev/stage/prod 激活条件（property/file/os），多数据源配置切换示例。
- 构建性能：`mvn -T` 并行、增量构建、离线模式、本地仓库清理。
- 常见问题：插件版本兼容、目标 JDK 版本不匹配、打包冲突的解决路径。
