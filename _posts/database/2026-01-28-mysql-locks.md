---
title: "MySQL 锁机制：粒度、类型与实践"
date: 2026-01-28 12:05:00 +08:00
categories: [Database, MySQL]
tags: [mysql, locks, innodb, transaction, row-lock]
image: /assets/img/【哲风壁纸】个性少女-二次元少女.png
---

> 目标：理解锁粒度与类型，避免不必要的锁冲突和死锁。

## 1. 锁的粒度
- **全局锁**：`FLUSH TABLES WITH READ LOCK`，通常用于备份，线上慎用。
- **表级锁**：`LOCK TABLES`；MyISAM 支持表锁，InnoDB 也有元数据锁 (MDL)。
- **行级锁 (InnoDB)**：基于索引的记录锁/间隙锁/下一键锁。必须通过索引精确命中，否则可能升级为更多范围锁。

## 2. 锁的性质
- **共享锁 (S)**：读锁；多个事务可并行读。
- **排他锁 (X)**：写锁；与任何锁冲突。
- **意向锁 (IS/IX)**：表级的声明，配合行锁实现多粒度并发控制。

## 3. 乐观 / 悲观思想
- **悲观锁**：`SELECT ... FOR UPDATE`/`LOCK IN SHARE MODE`，直接加行锁，适合高冲突场景。
- **乐观锁**：版本号或时间戳列，更新时 `WHERE id=? AND version=?`；适合低冲突、高读场景。

## 4. InnoDB 行锁细节
- **记录锁**：精确命中唯一索引的等值查询。
- **间隙锁 (gap)**：范围查询防止插入幻读；只锁区间，不含已有记录。
- **下一键锁 (next-key)**：记录锁 + 间隙锁，`RR` 隔离级别下常见。

## 5. 示例
```sql
-- 悲观锁更新
START TRANSACTION;
SELECT balance FROM account WHERE id = 1 FOR UPDATE;
UPDATE account SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- 乐观锁更新
UPDATE account
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;
```

## 6. 实践要点
- 语句必须走索引才能命中行锁；否则可能锁全表或大范围。
- 尽量**固定访问顺序**，减少死锁（如先锁小表/同一顺序更新多行）。
- 缩短事务，避免长事务持锁导致阻塞。
- 监控：`SHOW ENGINE INNODB STATUS\G` 或 performance_schema 查看等待与死锁。

## 7. 小结
- 先选好索引再谈锁；行锁靠索引定位。
- 悲观锁适合高冲突，乐观锁适合低冲突高并发。
- 使用合适的隔离级别与语句模式，降低锁范围与持续时间。
