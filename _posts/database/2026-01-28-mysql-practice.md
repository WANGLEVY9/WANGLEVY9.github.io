---
title: "MySQL 实战：索引优化与慢查询排查"
date: 2026-01-28 12:15:00 +08:00
categories: [Database, MySQL]
tags: [mysql, tuning, slowlog, explain, index]
image: /assets/img/og-cover.svg
---

> 目标：结合索引/锁/事务知识，给出实际排查与优化清单。

## 1. 观测与抓数
- 开启慢查询日志：`slow_query_log=1`，`long_query_time` 设置 1s/500ms 视场景。
- 使用 `EXPLAIN` / `EXPLAIN ANALYZE` 看执行计划与真实耗时。
- 关注 `rows` 估算、`type`（ALL/INDEX/RANGE/REF/CONST）、`Extra`（Using index/Using filesort）。

## 2. 常见优化手段
- 覆盖索引替代回表：只选必要列。
- 避免函数/隐式转换导致索引失效：如 `WHERE DATE(create_time)=...` 改为范围查询。
- 合理分页：大偏移分页可用“延迟关联”或基于上次主键游标。
- 写入优化：批量插入、按主键顺序写，减少页分裂；必要时关闭自动提交做批处理。

## 3. 示例：分页与过滤
```sql
-- 慢：offset 大，扫描多行
SELECT * FROM orders ORDER BY id LIMIT 100000, 20;

-- 优化：基于游标
SELECT * FROM orders WHERE id > 500000 ORDER BY id LIMIT 20;
```

## 4. 示例：范围查询走索引
```sql
-- 避免函数包裹
SELECT * FROM logs WHERE create_time >= '2026-01-28' AND create_time < '2026-01-29';
```

## 5. 死锁与阻塞排查
- `SHOW ENGINE INNODB STATUS\G` 获取最后一次死锁信息。
- performance_schema: `data_locks`, `data_lock_waits` 视图定位锁等待链路。
- 减少死锁：固定加锁顺序、拆批、缩短事务、使用合适隔离级别。

## 6. 表结构小贴士
- 主键自增且短；避免过长的复合主键导致二级索引膨胀。
- 必要时分表/分区前先做好归档与索引优化；过早分库分表增加复杂度。

## 7. 小结
- 先观测再优化：慢日志→EXPLAIN→调整索引/SQL。
- 控制事务范围，减少锁冲突。
- 关注数据分布变化，定期 `ANALYZE TABLE`，清理冗余索引。
