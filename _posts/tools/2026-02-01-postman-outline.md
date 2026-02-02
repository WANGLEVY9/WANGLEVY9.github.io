---
title: "Postman 提纲：接口调试与用例管理"
date: 2026-02-01 10:05:00 +08:00
categories: [Tools, Dev]
tags: [postman, api, testing, collections]
image: /assets/img/【哲风壁纸】二次元-动漫.png
---

> 提纲：从单接口调试到用例集合与自动化的实践要点。

- 环境与变量
  - Environment / Global / Collection 变量；变量优先级。
  - Secret 管理与环境切换（dev/stage/prod）。
- 请求调试
  - GET/POST/PUT/DELETE 常见配置；Body（form-data/json/raw）；Headers；文件上传。
  - Auth：Bearer、Basic、API Key、OAuth2。
- Collections 与目录组织
  - 层级管理、标签化、命名规范。
  - 模板化请求，复用公共前置脚本。
- 脚本与断言
  - Pre-request Scripts：签名、时间戳、随机数；
  - Tests：`pm.expect` 断言状态码/JSON 字段/耗时；提取 token 链式请求。
- Mock 与模拟
  - Mock Server 创建、路由匹配、常见场景（前端联调）。
- 环境导入导出与协作
  - 共享 Collections、权限与版本；API 文档生成。
- 自动化与集成
  - Newman CLI 跑集合；结合 CI（GitHub Actions/CircleCI）。
  - 运行参数化（数据驱动）、报告输出。
- 常见问题
  - 跨域/代理配置；SSL 证书；重试与超时；大文件请求。
