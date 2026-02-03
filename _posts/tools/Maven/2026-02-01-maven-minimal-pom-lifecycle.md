---
title: "Maven：坐标、生命周期与最小可用 POM"
date: 2026-02-01 10:35:00 +08:00
categories: [Tools, Maven]
tags: [maven, pom, lifecycle]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

- Maven 坐标设计：groupId/artifactId/version 命名规范，packaging 选择（jar/war/pom）。
- 生命周期与阶段：clean/validate/compile/test/package/verify/install/deploy 的输出物和挂钩点。
- 最小可用 POM 模板：properties/encoding/source/target、repositories/pluginRepositories 设置示例。
- settings.xml 与项目 POM 职责分离：何放全局，何放项目。
- 基础命令示例：clean package、install/deploy 区别与场景。
