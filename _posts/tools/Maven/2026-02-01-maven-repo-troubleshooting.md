---
title: "Maven：仓库、镜像与故障排查"
date: 2026-02-01 10:39:00 +08:00
categories: [Tools, Dev]
tags: [maven, repository, mirror, troubleshooting]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

- 仓库配置：中央/私服/镜像，认证与代理；settings.xml 中的 mirror 与 server 定义。
- 下载与证书问题：依赖拉取失败、证书/代理、权限 401 的诊断路径。
- 编译与 JDK 版本错配：source/target 对齐，--add-opens 等参数加挂方式。
- 调试工具：dependency:analyze、enforcer 规则、help:effective-pom，-X 日志使用场景。
- 安全与合规：镜像可用性检测、缓存清理策略、禁止“+”动态版本的原因。
