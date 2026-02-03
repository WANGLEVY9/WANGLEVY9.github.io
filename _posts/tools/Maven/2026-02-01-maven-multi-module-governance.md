---
title: "Maven：多模块项目治理"
date: 2026-02-01 10:38:00 +08:00
categories: [Tools, Maven]
tags: [maven, multimodule, governance]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

- 聚合与继承：父 POM 结构、modules 与 dependencyManagement 的分工。
- 版本统一：父 POM 管理插件/依赖版本，子模块最小化配置；跨模块引用最佳实践。
- 测试拆分：Surefire vs Failsafe，-pl/-am 选择性执行，多模块的 IT 拆分策略。
- 发布流程：install 与 deploy 区别，私服发布流水线，快照与正式版策略。
- 常见坑：循环依赖、模块未导入、父子 POM 版本错配导致的解析失败。
