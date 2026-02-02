---
title: "MySQL 索引体系：聚集、非聚集、联合索引"
date: 2026-01-28 12:00:00 +08:00
categories: [Database, MySQL]
tags: [mysql, index, btree, clustered, covering]
image: /assets/img/【哲风壁纸】SilentShore-俯瞰.png
---

> 目标：理解 B+ 树索引的物理结构与成本，正确选择聚集/非聚集/联合索引并做基本优化。

## 1. 索引类型与存储
- **聚集索引 (clustered)**：数据行与主键索引同一颗 B+ 树叶子节点，叶子即数据页。InnoDB 主键即聚集索引；二级索引叶子存主键。
- **非聚集（二级）索引**：独立 B+ 树，叶子存主键；回表需二次访问。
- **联合索引**：多个列组成一颗索引，遵循最左前缀匹配；可作为覆盖索引减少回表。
- **覆盖索引**：查询所需列都在索引里，避免回表。

## 2. 设计原则
- 选择**高选择性**列放前面；组合查询常用过滤列靠左。
- 避免在索引列上使用函数/隐式类型转换，防止失效。
- 控制索引数量：过多索引增加写放大与维护成本。
- 长字符串可用前缀索引或倒排/全文；但前缀降低选择性需评估。

## 3. 常见 SQL 与索引命中
```sql
-- 覆盖索引示例
CREATE INDEX idx_user_email ON user(email);
SELECT id FROM user WHERE email = 'a@example.com'; -- 覆盖，无回表

-- 联合索引示例：最左前缀
CREATE INDEX idx_order_user_time ON orders(user_id, created_at);
-- 命中：user_id = ? AND created_at BETWEEN ...
-- 部分命中：user_id = ?
-- 不命中：created_at BETWEEN ... （没有 user_id 则不能用）
```

## 4. 优化与排查
- `EXPLAIN` 看 type/rows/Extra；`Using index` 表示覆盖；`Using where`+`Using index` 表示索引过滤。
- 避免 `SELECT *`；只取必要列提升覆盖概率。
- 尽量让排序/分组走索引：`ORDER BY`/`GROUP BY` 按最左前缀顺序，方向一致。
- 数据分布变化后，`ANALYZE TABLE` 更新统计信息；定期检查冗余/重复索引。

## 5. 小结
- 主键默认聚集；二级索引叶子存主键。
- 联合索引用好最左前缀；覆盖索引减少回表。
- 建索引前先想：查询条件/排序字段/返回字段/写入成本。
