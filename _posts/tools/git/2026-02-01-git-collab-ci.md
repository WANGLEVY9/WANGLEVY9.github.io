---
title: "Git 协作、代码评审与 CI：流程、文化与门禁体系"
date: 2026-02-01 11:20:00 +08:00
categories: [Tools, Git]
tags: [git, collaboration, pr, ci, governance]
image: /assets/img/og-cover.svg
---

> 定位：本篇讨论团队层面的协作体系——从 PR 模板、评审文化、分支保护、钩子与 CI 门禁，到文档与度量治理。提交粒度、冲突处理、回退与分支模型在系列其它文章已有覆盖，此处不再重复。

## 1. 协作基线：把流程写成文件、放到仓库根目录
- README：开发启动、环境变量示例、常用脚本、约定的分支/PR/提交规范链接。
- CONTRIBUTING：如何起分支、怎么写 PR、必须的测试与安全检查、谁是守门人。
- CODEOWNERS：指定公共文件/目录负责人；PR 自动请求评审，减少“没人看”的情况。
- PULL REQUEST TEMPLATE：固定字段（见下节），确保信息完整。
- 角色定义：DRI（直接负责）、Reviewer、Release Manager；每个角色的 SLA。

## 2. PR 模板与信息完整性
- 模板字段（示例 .github/pull_request_template.md）：
```markdown
## 背景 / 动机
- （为什么改？需求/缺陷/性能/合规）

## 变更摘要
- （主要改动点，按模块/接口列）

## 风险与影响
- 行为变化：
- 影响面：受影响服务/客户端/环境
- 兼容性：是否有开关/双写/降级

## 验证（勾选与说明）
- [ ] 单测：命令/覆盖范围
- [ ] 冒烟 / 手测：场景与结果
- [ ] 契约 / e2e：脚本/报告链接
- [ ] 压测 / 观测截图：指标对比
- [ ] 无需（理由： ）

## 回滚方案
- （revert 提交或开关回滚，需注明脚本/命令）

## 数据变更（如有）
- 迁移脚本：路径 / dry-run 命令
- 回滚脚本：路径 / 依赖

## 截图 / 录屏（前端或接口对照）
- 

## 关联
- Issue: #
- 文档 / 设计链接：
- 监控 / 仪表盘：
```
- 要点：
  - 「风险与影响」「回滚方案」为必填，缺失拒绝合并；验证项需写明命令或报告链接。
  - 前端/接口改动附截图或对照表；数据改动必须写迁移+回滚脚本路径与 dry-run 结果。
  - 跨团队改动必须 @ owner，并在描述中写清沟通结论与生效范围。

## 3. 评审文化与 Checklist
- 评审的目标：发现风险、共享知识、确保一致性，而不是挑格式；格式应由工具解决。
- 精简 Checklist（评审人关注）：
  - 正确性：行为符合需求？边界、异常、幂等、超时、重试？
  - 安全与合规：鉴权、输入校验、日志脱敏、秘钥/凭证是否泄露、第三方依赖是否安全。
  - 性能：是否引入 N+1、重复 IO、无界缓存；是否有可观测性补充。
  - 可运维性：日志级别合理、trace id、指标/告警是否补充；是否有回滚开关。
  - 可维护性：命名/结构、是否删除 dead code、配置化程度、模块边界是否清晰。
- 评审人行为准则：
  - 先读描述和测试，再看 diff；
  - 用数据或规范说话，避免主观争论；
  - 发现风险要给出可行替代方案；
  - 超时未响应时由守门人兜底决策。

## 4. PR 流程与 SLA
- 创建 PR 前自检：格式化、lint、必选测试；`git diff --stat` 检查范围；避免夹带无关文件。
- PR 分类：
  - 小改（<200 行）：1 名 reviewer + 绿灯 CI；
  - 中改（200-600 行）：2 名 reviewer，必须写风险与回滚；
  - 大改（>600 行）：拆分；若无法拆，需设计评审 + 增强测试 + 特批窗口。
- 响应时限：工作日 4 小时内给出首次反馈；若出差/休假，设置代理 Reviewer。
- 阻塞与升级：超时未评审，守门人有权合并或退回；生产风险高的 PR 可插队评审。

## 5. 分支保护与合并门禁（与分支模型解耦）
- 保护项：禁止直接 push、强制 CI 通过、至少 N 个 Reviewer、强制最新主干 rebase、强制签名提交（可选）。
- 按路径强制 Owner：公共目录修改必须有人审核；安全敏感路径（凭证、网关、合规模块）需安全 Owner。
- 自动检查：
  - secret 扫描：防止凭证泄露；
  - 依赖漏洞：Trivy/OWASP/Dependabot；
  - 许可检查：确保引入的依赖许可证可接受；
  - 大文件阻断：避免把二进制误入仓库。
- 合并策略：默认 squash；需要保留语义时 rebase merge；禁止带未通过 CI 的合并提交。

## 6. 钩子体系：把要求前置到本地
- pre-commit：统一格式化、lint、secret 扫描、版权头检查、禁止大文件/二进制；可加 i18n 文案检测。
- commit-msg：校验提交信息格式（与提交与历史篇联动）；拒绝 WIP/空信息。
- pre-push：跑快速单测/构建/静态扫描，阻断明显回归。
- 落地方式：后端可用 pre-commit/lefthook，前端可用 husky；确保与 CI 规则同源，避免「本地过、CI 挂」。

## 7. CI 门禁与流水线设计（不谈部署）
- 基线流水线：checkout → 依赖缓存 → lint/format → unit test → build → （可选）integration/e2e → 报告。
- 加速手段：
  - 缓存：Maven/Gradle/npm/pnpm；
  - 按路径触发：前端改动不跑后端测试，反之亦然；
  - 并行：拆分测试套件并行；
  - 预合并检查：在 CI 中先做一次 `git merge --no-commit` 或 `git rebase --onto` 沙箱预检冲突（不提交结果）。
- 质量门禁：
  - 覆盖率阈值（设起始值，逐步提升）；
  - 静态扫描：ESLint/SpotBugs/Sonar；
  - 依赖漏洞：Trivy/OWASP/Dependabot；
  - 重复代码与复杂度阈值；
  - 二进制/大文件阻断。
- 报告与反馈：
  - 失败要给出可读原因与跳转链接；
  - 在 PR 里标注变更范围对应的测试结果；
  - 为慢测试提供历史趋势，便于拆分与加速。

## 8. 文档、知识与 Onboarding
- Wiki/Docs：存放架构、接口契约、发布与回滚操作、常见故障 FAQ。
- 变更记录：CHANGELOG 与发布说明；关键模块更新需要在文档中标记「何时、为何、影响谁」。
- Onboarding 清单：开发环境搭建、常用脚本、账号/凭证申请、测试数据准备、代码规范、评审与 CI 规则。
- 交接与轮值：
  - 轮值 SRE/守门人制度；
  - 交接文档至少包含：监控面板、告警阈值、常见操作、风险点、联系渠道。

## 9. 异步协作与时区管理
- 异步习惯：PR 描述充分、日志和讨论记录公开；用 issue/看板代替口头同步。
- 时区策略：
  - 设定「合并窗口」适配各时区；
  - 高风险改动需在多人在线时合并；
  - 关键节点（发布、回滚）保留会议纪要和录屏。
- 沟通渠道：
  - 日常用 issue/PR 评论；紧急情况用 IM/电话树；
  - 沟通结论回填到 PR/issue，避免信息散落。

## 10. 度量与改进循环
- 协作指标：
  - PR 周期（创建到合并）中位数；
  - 首次响应时间；
  - 拒绝率与重开率；
  - 评审有效性（被指出的缺陷数 / 评审数）。
- 质量指标：
  - 回滚率、上线故障数、主干红灯时间；
  - 覆盖率趋势、静态扫描问题趋势；
  - 秘钥泄露事件数、大文件阻断次数。
- 改进节奏：每双周复盘一次指标，挑选一项优化（例如拆大 PR、加路径触发、提高评审 SLA）。

## 11. 常见反模式与修正
- 反模式：空 PR 描述。修正：模板必填校验，缺字段 CI 直接失败。
- 反模式：评审只看格式不看逻辑。修正：把格式检查移到钩子/CI，把评审 checklist 聚焦正确性与风险。
- 反模式：大 PR 堵塞。修正：限制单 PR 行数，强制拆分；提供「骨架 PR」先评审设计。
- 反模式：CI 结果不可读。修正：标准化输出，添加跳转链接与定位指引。
- 反模式：公共文件无人负责。修正：CODEOWNERS + 守门人制度。

## 12. 案例速写
- 案例 A：接口兼容改动。
  - PR 描述需写兼容策略、版本范围、是否有 Feature Flag、回滚方案；
  - 评审重点：调用方影响、错误码、幂等、日志；
  - CI 需增加契约测试或兼容性测试。
- 案例 B：引入新依赖。
  - PR 描述要附 license、大小、用途；
  - CI 加漏洞扫描；
  - 评审关注：是否可用标准库/现有依赖替代，是否引入重复功能。
- 案例 C：跨团队修改公共配置（如路由、权限）。
  - 在 PR @ owner；
  - 描述中写清沟通结果、回滚方式；
  - 合并窗口选择低峰，提前发布通知。

## 13. 安全与合规附录
- 凭证治理：
  - pre-commit + CI 双重 secret 扫描；
  - 凭证轮转流程写入 README；
  - 禁止在 PR 评论中粘贴密钥/令牌。
- 合规操作留痕：
  - 生产分支强制 PR 合并，保留审批链；
  - 重要操作（回滚、数据迁移）在 issue/变更单登记；
  - 日志与审计事件留存周期与访问权限说明。
- 依赖合规：
  - 设 license 白名单；
  - 新依赖必须在 PR 描述注明 license；
  - 定期运行许可扫描并汇报。

## 14. 大型组织/多团队协作要点
- 分域治理：按领域/业务线设子目录、Owner、独立 PR 模板；减少跨域噪音。
- 设计同步：跨域需求在开发前召开「设计/契约评审」，避免评审时才发现分歧。
- 发布协调：Release Manager 维护日历，避免多个高风险改动同窗发布；冲突时按照业务优先级与风险评估排序。
- 知识共享：每月选一到两篇优质 PR 作为范例，拆解「好的描述/验证/回滚/风险提示」。

## 15. 远程与异步团队的运营实践
- 沟通透明：决策写进 PR/issue，会议录音/纪要回填；减少口头黑盒。
- 时区覆盖：设立「同步时间」和「异步时间」，高风险合并安排在覆盖最多人的时段。
- 轮值与守门：异步团队更依赖守门人制度，确保有人对主干质量负责。
- 危机响应：建立「紧急通道」和电话树；危机结束后 24 小时内补全事件时间线与修复/回滚细节。

## 16. 工具实践清单
- GitHub：CODEOWNERS、branch protection、required status checks、review assignment、自动化标签（路径标签）。
- GitLab：Approval Rules、MR Templates、Code Owners、Pipeline-as-Code（.gitlab-ci.yml 路径触发）。
- 其他：lefthook/pre-commit、commitlint、trivy/owasp-depcheck、danger（PR 机器人提示）。
- 仪表盘：
  - PR 周期/首响；
  - 评审人工作量平衡；
  - 红灯时间；
  - 安全/许可问题趋势。

## 17. 成熟度模型
- Lv1：有 PR 流程和模板，但信息常缺失；CI 仅跑编译；无分支保护。
- Lv2：分支保护 + 基本 lint/测试；CODEOWNERS；PR 描述完整率 >80%；有回滚方案字段。
- Lv3：按路径触发 CI；secret/依赖/许可扫描；评审 SLA；指标看板上线；守门人制度。
- Lv4：自动化冲突预检；质量门禁（覆盖率阈值、复杂度阈值）；灰度/回滚脚本集成；演练制度化。
- 评估方法：每季度打分，挑一档内的差距项去做，而不是一次性全补。

## 18. 典型会议与节奏
- 周会：回顾上周 PR 质量、红灯、回滚；预告本周高风险改动与发布窗口。
- 每日站会：同步阻塞 PR、需要 Owner 的公共文件改动、测试环境占用。
- 发布复盘：记录缺陷来源（需求/设计/实现/测试/沟通）、改进项负责人与截止时间。
- 季度演练：
  - 「紧急回滚 + 审计留痕」
  - 「依赖漏洞响应流程」
  - 「跨团队高风险改动协作」

## 19. FAQ
- 问：评审太慢怎么办？
  - 答：设首响 SLA；自动分配 Reviewer；大 PR 拆小；守门人兜底；关键路径 PR 允许插队。
- 问：CI 太慢？
  - 答：按路径触发、并行拆分、缓存、分层流水线（lint/单测先返回，集成测试异步）；对长测设 nightly。
- 问：代码所有权不清晰？
  - 答：用 CODEOWNERS；在 README/Docs 标明 Owner；公共模块设守门人；评审时自动提醒。
- 问：如何降低「形式化」抵触？
  - 答：模板简洁但必须；工具自动填充；强调目标是降低返工与故障，而非流程本身。
- 问：PR 里需要放二进制文件吗？
  - 答：不建议。若必须（如字体、图片），在 PR 描述说明来源与许可，CI 里开启大文件检查。
- 问：评审人与作者意见不一致怎么办？
  - 答：用数据（测试、指标）和规范作为裁决；无法达成一致时由守门人拍板，并在 PR 记录决策依据。
- 问：CI 过慢但又不想拆仓库？
  - 答：按路径拆任务、引入 test impact analysis、对超长测试设夜间异步流水线；关键路径测试保留阻断。
- 问：如何确保模板被填写？
  - 答：在 CI 或 Danger 校验字段，未填直接失败；对高风险改动要求附截图/日志，否则不允许合并。

## 20. 配置与脚本示例
- **pre-commit（lefthook 版）**：
```yaml
pre-commit:
  parallel: true
  commands:
    fmt:
      run: npm run lint && npm run format
    secrets:
      run: detect-secrets-hook --baseline .secrets.baseline || true
    size-guard:
      run: ./tools/check-size.sh
    license:
      run: ./tools/license-scan.sh

pre-push:
  commands:
    unit:
      run: npm test -- --runInBand
    smoke:
      run: ./scripts/smoke.sh
```
- **Danger 规则示例**（补全 PR 信息，限制大改动）：
```ruby
fail("请填写风险与回滚方案") if pr_body_missing?(["风险", "回滚"])
warn("PR 超过 800 行，建议拆分") if git.lines_of_code > 800
warn("缺少测试说明") unless pr_body_contains?("验证")
fail("检测到密钥") unless secrets_scan_clean?
```
- **commitlint 配置示例**（限制类型与 scope）：
```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat','fix','perf','refactor','chore','docs','test','build','ci','revert','security']],
    'scope-enum': [2, 'always', ['api','ui','db','infra','auth','payment','deploy','ops','observability']],
    'subject-max-length': [2, 'always', 72]
  }
}
```

## 21. GitHub Actions 与 GitLab CI 双栈示例
- **GitHub Actions（前后端混合仓库）**：
```yaml
name: ci

on:
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'
      - 'backend/**'
      - '.github/workflows/ci.yml'
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [frontend, backend]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Cache deps
        uses: actions/cache@v4
        with:
          path: |
            ${{ github.workspace }}/frontend/node_modules
            ${{ github.workspace }}/backend/node_modules
          key: ${{ runner.os }}-${{ matrix.service }}-${{ hashFiles(matrix.service + '/package-lock.json') }}
      - name: Install
        run: cd ${{ matrix.service }} && npm ci
      - name: Lint & Test
        run: cd ${{ matrix.service }} && npm run lint && npm test -- --runInBand

  contract-test:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run pact tests
        run: ./scripts/pact-verify.sh

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@v0.20.0
        with:
          scan-type: 'fs'
          exit-code: '1'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
```
- **GitLab CI（按路径触发 + 分层流水线）**：
```yaml
stages: [lint, test, build]

variables:
  NODE_ENV: test

lint:
  stage: lint
  rules:
    - changes: ["frontend/**"]
  script:
    - cd frontend && npm ci && npm run lint

unit-test:
  stage: test
  rules:
    - changes: ["backend/**"]
  script:
    - cd backend && npm ci && npm test -- --runInBand

contract:
  stage: test
  needs: [unit-test]
  script:
    - ./scripts/pact-verify.sh

build-image:
  stage: build
  needs: [lint, unit-test]
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
  script:
    - docker build -t registry.example.com/app:$CI_COMMIT_SHORT_SHA .
    - docker push registry.example.com/app:$CI_COMMIT_SHORT_SHA
```

## 22. 分层门禁与风险分级实践
- **分层门禁**：
  - L0（基础）：格式化、lint、secret 扫描、单测；全量阻断。
  - L1（兼容）：契约测试、schema diff、依赖/许可扫描；高风险路径必跑。
  - L2（系统）：集成/e2e/性能基线；对高风险 PR 或发布分支触发。
- **风险分级模板**：
  - 低：文案、样式、注释；仅需 L0。
  - 中：局部业务逻辑、接口兼容改；需 L0+L1。
  - 高：架构变更、依赖升级、跨服务协议；需 L0+L1+L2，且安排同步合并窗口与回滚人。
- **门禁例外流程**：记录豁免理由、时间窗口、责任人，发布后 24 小时内补测并回填结果。

## 23. 评审与 CI 协同剧本
- **先验规则对齐**：在 README 标明「必跑测试列表」「阻断条件」「何时需要双人评审」。
- **自动标记风险**：CI 机器人根据改动路径打标签（如 security/db/infra），自动请求对应 Owner。
- **PR 体自动补全**：脚本抓取改动路径与测试输出，回填到 PR 描述，减少手填遗漏。
- **回滚预案校验**：CI 检查 PR 描述中是否有「回滚脚本/Feature Flag 名」，缺失则标红。

## 24. 典型场景扩展案例
- **数据迁移 PR**：
  - 描述：写清目标表/列、数据范围、迁移窗口、dry-run 命令、回滚脚本。
  - CI：schema diff、迁移脚本 lint、预生产 dry-run；上线前自动生成「回滚指南」链接。
  - 评审：DBA/数据 Owner 必审；检查幂等与长事务风险。
- **前端跨域改动**：
  - 描述：列出受影响域名/环境、缓存策略、兼容旧版本的策略。
  - CI：Cypress/Playwright 冒烟，构建产物大小对比，bundle analyzer 报告。
- **网关/权限策略变更**：
  - 描述：权限矩阵 diff、默认行为、回滚开关；通知相关服务 Owner。
  - CI：契约测试 + 关键路径 API 冒烟；安全扫描规则加严。

## 25. 培训与 Onboarding 套件
- 新人训练营：
  - 第 1 天：拉仓库、跑本地 lint/test、提一个小 PR，体验模板与门禁；
  - 第 3 天：模拟一次回滚流程，在沙箱分支演练 revert + 回填发布记录；
  - 第 5 天：审阅一份老 PR，写出评审意见与风险点。
- 速查手册：一页纸列出「必跑脚本」「风险分级」「热线联系人」，放在仓库根目录并在 PR 模板中链接。
- 影子评审：新人前 3 个 PR 由资深工程师 shadow，帮助建立评审预期与风险嗅觉。

## 26. 指标计算与看板示例
- **指标定义**：
  - PR 周期 = 合并时间 − 创建时间；
  - 首次响应时间 = 第一条非机器人评论时间 − 创建时间；
  - 回滚率 = 回滚提交数 ÷ 总发布数；
  - 红灯时间 = CI 失败到恢复成功的时间。
- **看板配置建议**：
  - 按团队/目录拆分视图，避免信息过载；
  - 展示过去 30/90 天趋势，突出回归点；
  - 关联事故记录与触发的改动，形成因果链。
- **改进闭环**：每月选一个指标做 10% 改进，例如「PR 周期 2 天→1.8 天」，对应行动可能是拆 PR、自动分配 Reviewer、加路径触发。

## 27. 规模化与多代码仓治理
- **统一规范中心**：把模板、lint、CI 片段、Danger 规则放到模板仓库或 npm/gem 包，通过自动化分发到各仓；定期同步版本。
- **跨仓变更**：使用变更提案 + 批量脚本生成 PR；在中央看板追踪状态；设「冻结窗口」避免大规模同步冲突。
- **服务目录与 Owner**：维护一个服务清单，包含仓库链接、Owner、发布节奏、关键仪表盘；PR 机器人按清单自动 @ 责任人。
- **合规审计**：对生产分支强制 PR 合并；CI 输出审计日志（谁批准、哪些检查通过、发布链接），方便审计与追责。

