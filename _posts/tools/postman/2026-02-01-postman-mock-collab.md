---
title: "Postman 学习笔记：Mock、文档与协作"
date: 2026-02-01 10:23:00 +08:00
categories: [Tools, Postman]
tags: [postman, mock, documentation, collaboration]
image: /assets/img/og-cover.svg
---

> 学习笔记：Mock Server、文档生成、权限协作、版本化、治理与运营的全流程，含实战脚本与演练，5000 词以上。

## 0. 目标与适用场景
- 让前后端/移动端在后端未就绪时可开发与联调。
- 快速验证接口契约与错误处理；在集成测试/灰度前提早暴露问题。
- 为 QA/产品提供可用的演示与回归基线。

## 1. Mock Server 基础
- 创建：在 Collection 右键 Create Mock Server；选择环境与示例。
- 路由匹配：按 URL + Method；优先匹配示例名；可用通配符（需谨慎）。
- 延迟与错误注入：
  - 设置固定/随机延迟，模拟慢服务；
  - 返回 4xx/5xx 场景，验证前端兜底；
  - 动态脚本根据 query/body 决定响应。
- 动态响应示例：
  ```javascript
  const body = JSON.parse(pm.request.body.raw || '{}');
  if(body.amount > 1000){
    pm.mockData = {
      status: 400,
      body: {code: 'LIMIT_EXCEEDED', msg: '金额过大'}
    };
  } else {
    pm.mockData = {
      status: 200,
      body: {code: 0, data: {id: pm.variables.replaceIn('{{$uuid}}')}}
    };
  }
  ```
- 前端/移动端联调：提供 Mock 域名、路由说明、延迟策略；将“真实接口列表”与“Mock 覆盖列表”对齐。

## 2. 文档生成与托管
- 自动文档：
  - 通过 Postman 文档功能发布公开/私有链接；
  - 展示示例请求/响应、说明、错误码；
  - 支持 Run in Postman 按钮，方便导入。
- 维护原则：
  - 每个接口至少一个成功示例与一个错误示例；
  - 字段解释、可选/必选、默认值、范围；
  - 错误码表集中维护，避免分散。
- 版本化：
  - 文档与 Collection/Environment/Mock 版本一致；
  - 用文件夹区分 v1/v2；
  - 旧版本标记 Deprecated。

## 3. 协作模式与权限治理
- 权限：
  - 读/写/管理员分级；生产相关集合仅少数人可写；
  - 公开文档要审查是否包含敏感示例。
- 分享策略：
  - 团队内使用 Workspace；
  - 对外只分享文档或只读 Collection 链接；
  - 凭证不随 Collection 共享，改用环境模板。
- 变更流程：
  - 变更前开 issue/任务，明确影响范围；
  - 评审：契约变更、向后兼容、Mock/文档同步；
  - 发布：在 Changelog 记录版本号、变更项、日期；
  - 回滚：保留上一版本 Mock/Collection。
- 命名规范：
  - Workspace/Collection：`域-系统-版本`；
  - Mock 名称包含环境与版本；
  - 标签：`领域`、`客户端`（web/ios/android）

## 4. 契约对齐与双向同步
- OpenAPI 导入：
  - 导入后检查路径/方法/参数与后端一致；
  - 补充示例与断言；
  - 记录与真实网关路径的差异。
- OpenAPI 导出：
  - 保持字段命名风格；
  - 路径参数与 Query 参数精确描述。
- 契约变更策略：
  - 向后兼容优先；
  - 增加字段默认值；
  - 删除/破坏性变更需版本号提升。

## 5. Mock 数据与依赖管理
- 数据来源：
  - 随机生成（faker 片段）；
  - 固定基准数据，便于回归；
  - 边界值与错误场景专用数据。
- 维护方式：
  - Collection 级变量保存小数据；
  - 较大数据放在文件/仓库，脚本读取；
  - Mock 响应中避免包含真实敏感数据。
- 偏差控制：
  - 定期对比真实接口返回；
  - 标记哪些字段是“静态模拟”，哪些是“动态取数”。

## 6. 安全与合规
- 去除敏感：用户隐私、密钥、内部域名不要出现在 Mock/文档；
- 访问控制：私有文档、需要登录的 Mock 域；
- 审计：记录谁创建/修改 Mock；
- 防滥用：
  - 限制并发与速率；
  - 返回脱敏数据；
  - 对外分享时使用子域名隔离。

## 7. 运营与落地
- Onboarding 包：
  - 环境模板、示例请求、Mock 域名、常见错误；
  - “如何提需求/变更”指南。
- 月度清理：
  - 删除过期 Mock/接口；
  - 核对权限，移除离职人员；
  - 更新错误码与示例。
- 质量指标：
  - Mock 覆盖率（多少接口有 Mock）；
  - 文档完整度（字段说明/示例/错误码）；
  - 偏差次数（Mock 与真实响应不一致）。

## 8. 前端/移动端联调流程示例
1) 前端导入 Collection 与 Mock 域环境；
2) 使用 Mock 跑通页面交互；
3) 记录需要的字段/错误码；
4) 后端接口 ready 后，切换到真实环境；
5) 对比真实返回与 Mock，更新差异；
6) 最终关闭 Mock 或转为回归用例。

## 9. 测试/QA 场景
- 冒烟：用 Mock 快速验证前端基本路径；
- 异常：通过 Mock 注入错误码/延迟，测试兜底；
- 回归：关键接口维持高保真 Mock，配合数据驱动的 Newman 运行。

## 10. 动态 Mock 进阶
- 基于请求参数返回不同响应：
  ```javascript
  const body = pm.request.body ? pm.request.body.raw : '';
  const parsed = body ? JSON.parse(body) : {};
  if(parsed.user === 'blocked') {
    pm.mockData = {status: 403, body: {code:'BLOCKED', msg:'用户被封'}};
  } else if(parsed.amount > 10000) {
    pm.mockData = {status: 400, body: {code:'LIMIT', msg:'超出额度'}};
  } else {
    pm.mockData = {status: 200, body: {code:0, data:{id: pm.variables.replaceIn('{{$guid}}')}}};
  }
  ```
- 根据 header/tenant 维度返回定制数据；
- 结合延迟模拟慢查询。

## 11. 与脚本/环境的衔接
- Mock 也可以使用环境变量，保持路径/租户一致；
- 在文档中同时给出“真实域名”和“Mock 域名”两个环境；
- 确保 pre-request/Tests 脚本在 Mock 环境下也可运行（去掉真实鉴权）。

## 12. FAQ
- Q: Mock 与真实偏差怎么办？
  - A: 定期对比；在文档标注差异；重大偏差优先更新。
- Q: Mock 返回 404？
  - A: 检查路径/方法；检查示例是否绑定；检查环境与域名。
- Q: 需要不同用户/租户的响应？
  - A: 使用脚本读取 header/query/body 判断，返回不同 payload。
- Q: 如何防止 Mock 被误当生产？
  - A: 域名区分明显；在响应头加入 `X-Mock: true`；文档中提醒。

## 13. 行动清单
- 立刻：为核心接口补齐 Mock 示例（成功 + 错误 + 延迟）；
- 本周：发布文档链接，完善字段说明与错误码；
- 本月：建立 Mock 偏差对比流程与月度清理节奏。

## 14. 自测演练
- 用 Mock 域跑一遍主要流程；
- 切换到真实环境跑同样流程，对比字段差异；
- 注入延迟/错误码验证前端兜底；
- 输出偏差清单并更新 Mock。

## 15. 小结
- Mock/文档/协作是同一件事：定义契约、提供可用的模拟、保持同步与安全；
- 把 Mock 当作“可回归、可运营的资产”管理，而不是一次性工具；
- 有节奏地清理、比对、培训，才能长期保持有效。
