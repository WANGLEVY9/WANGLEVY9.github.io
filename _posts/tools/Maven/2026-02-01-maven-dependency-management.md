---
title: "Maven：依赖管理与冲突调解"
date: 2026-02-01 10:36:00 +08:00
categories: [Tools, Maven]
tags: [maven, dependency, bom, exclusion]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

- 作用域与场景：compile/provided/runtime/test/system/import 的差异与使用建议。
- 可传递依赖规则：“最近优先/路径最短”，冲突定位（dependency:tree / help:effective-pom）。
- 依赖排除与版本对齐：exclusion、dependencyManagement、BOM（import scope），Spring Boot 案例。
- 版本锁定与安全：versions-maven-plugin 升级、避免动态版本、镜像安全审计。
- 常见故障：ClassNotFound/NoSuchMethod 的依赖冲突排查步骤。
