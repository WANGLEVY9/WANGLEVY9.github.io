---
title: "MySQL 事务、隔离级别与 MVCC"
date: 2026-01-28 12:10:00 +08:00
categories: [Database, MySQL]
tags: [mysql, transaction, mvcc, isolation, acid]
image: /assets/img/【哲风壁纸】二次元少女-动漫.png
---

> 目标：掌握 ACID、隔离级别、MVCC 的实现与常见问题排查。

## 1. ACID 回顾
- **原子性**：undo log 回滚保证事务要么全成要么全撤。
- **一致性**：约束/日志/双写确保数据从一个一致状态到另一个一致状态。
- **隔离性**：并发事务互不干扰，由锁 + MVCC 保证。
- **持久性**：redo log + binlog 持久化。

## 2. 隔离级别
- **读未提交 (RU)**：可能脏读；几乎不用。
- **读已提交 (RC)**：避免脏读；幻读/不可重复读仍可能。
- **可重复读 (RR, InnoDB 默认)**：避免脏读+不可重复读，幻读通过间隙锁+MVCC 减少。
- **串行化 (SERIALIZABLE)**：最高隔离，读也加锁，性能低。

切换示例：
```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## 3. MVCC 核心
- **快照读**：普通 `SELECT`（无锁），读取历史版本；在 RR 下基于 Read View。
- **当前读**：`SELECT ... FOR UPDATE` / `UPDATE` / `DELETE`，需最新版本并加锁。
- **版本链**：隐藏列 `trx_id`、`roll_pointer`；undo log 存旧版本。
- **Read View**：记录可见性判断（活跃事务 ID 列表 + 已分配最大事务 ID）。

## 4. 幻读与解决
- RR 下：间隙锁/下一键锁阻止插入“幻影”；快照读依赖 MVCC。
- RC 下：每次读都新建 Read View，幻读通过业务或显式锁控制。

## 5. 常见排查
- 查看当前会话隔离级别：`SELECT @@tx_isolation;` / `SELECT @@transaction_isolation;`
- 长事务导致 undo 膨胀：监控 `information_schema.innodb_trx`；及时提交/拆分。
- binlog 与 redo 先后：InnoDB 使用两阶段提交保证 crash-safe。

## 6. 实战建议
- 绝大多数场景用 RR；需要减少间隙锁冲突可用 RC（但注意幻读）。
- 读多写少、允许短暂不一致时可用 RC + 业务校验；金融扣款坚持 RR + 锁。
- 写操作使用主键或唯一索引定位，降低锁范围与死锁概率。

## 7. 小结
- ACID = undo/redo/binlog/锁/MVCC 的组合拳。
- MVCC 让快照读无锁高并发，当前读仍需加锁保证正确性。
- 选择合适隔离级别并缩短事务，是性能与一致性的关键平衡。
