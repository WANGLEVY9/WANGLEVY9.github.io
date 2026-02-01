---
title: "Git 实战提纲：分支、协作与排查"
date: 2026-02-01 10:00:00 +08:00
categories: [Tools, Dev]
tags: [git, vcs, branch, merge, rebase]
image: /assets/img/og-cover.svg
---

> 提纲：覆盖高频工作流、团队协作规范与排障要点。

- 基础与配置
  - 安装与 `git config`（user/email、core.autocrlf、alias）。
  - SSH key 管理、多账号配置。
- 日常工作流
  - 克隆、分支创建/切换、提交、推送、拉取。
  - 提交规范（Commit message、粒度、签名选项）。
- 分支模型
  - Git Flow / Trunk-Based / 简化主干模型对比。
  - Release 分支与热修复策略。
- 变基与合并
  - `merge` vs `rebase` 适用场景；保持历史整洁的实践。
  - `squash` / `fixup` / 交互式 rebase。
- 冲突处理
  - 常见冲突类型（文本、二进制、子模块）；解决步骤与工具。
- 版本回退与救援
  - `reset`/`revert`/`restore` 区别；`stash` 用法；`cherry-pick`。
- 协作与代码评审
  - PR 流程、review checklist、CI 钩子、保护分支策略。
- 性能与大仓库
  - 浅克隆、稀疏检出、LFS 简介。
- 排查技巧
  - `git status -sb`、`git log --oneline --graph`、`git bisect`、`git blame`。
