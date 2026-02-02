---
title: "IntelliJ IDEA 提纲：高效开发与调试"
date: 2026-02-01 10:10:00 +08:00
categories: [Tools, Dev]
tags: [idea, jetbrains, shortcut, debug, productivity]
image: /assets/img/【哲风壁纸】二次元少女-动漫.png
---

> 提纲：聚焦快捷键、调试、插件与性能优化，适配 Java 后端开发。

## 主题 1：初始化与团队规范落地
- 环境基线：JDK/SDK、编码/换行符、代码风格模板、Spotless/Checkstyle 配置同步。
- Lombok/Annotation Processing：何时必须开启，Gradle/Maven 项目差异。
- 模板化：Live Template、File Template、后缀补全；团队共享方式（Settings Repository/IDE Sync）。
- 自动导包与格式化：优化 import 规则，保存/提交前格式化策略（预提交钩子）。

## 主题 2：高效导航与重构动作手册
- 全局查找与跳转：双击 Shift、Ctrl+Shift+N/F，快速定位类/文件/符号/动作。
- 结构化导航：书签体系（数字/字母）、最近文件/位置、分屏与分栏对比调试。
- 核心重构快捷键：重命名、抽取方法/变量/参数、内联、移动/安全删除；示例场景和风险点。
- 代码生成功能：Generate/构造器/日志模板、后缀补全、Multi-cursor 编辑技巧。

## 主题 3：调试与故障注入
- 断点体系：行/条件/日志/方法/依赖断点；过滤器与命中次数控制。
- 调试视图：Variables/Watches/Evaluate Expression，Smart Step Into，与内联变量显示。
- 远程与进程附加：本地端口转发、IDEA Attach to Process、常见 JVM 远程调试参数。
- 故障注入：Throw exception、修改返回值、临时覆盖变量，配合内存快照与线程 dump 基础操作。

## 主题 4：构建、运行与环境隔离
- Run/Debug Configuration：Application、JUnit、Spring Boot、Compound 配置模板与示例。
- JVM/Agent 参数：内存与GC参数、-D/-javaagent 注入、环境变量/Profiles 区分。
- Maven/Gradle 集成：导入策略、离线模式、Wrapper 使用、构建缓存与并行编译。
- 数据/配置隔离：运行时 VM options 与 Environment Variables 管理，区分本地/测试/预发。

## 主题 5：性能、插件与常见疑难
- 性能调优：idea64.vmoptions 调整、禁用无用插件、索引卡顿排查（Invalidate Caches 时机）。
- 插件选型：MyBatisX、Rainbow Brackets、Keymap 适配；避免风险插件（如非法试用重置）。
- 版本控制工作流：Git 内置 rebase/merge 冲突界面、cherry-pick、shelf/stash 实战。
- 常见问题速查：控制台中文乱码、Gradle 守护进程/代理、端口占用、内存溢出提示的处理路径。
