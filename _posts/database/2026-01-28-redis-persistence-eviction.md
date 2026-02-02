---
title: "Redis 过期与淘汰、持久化机制"
date: 2026-01-28 12:30:00 +08:00
categories: [Database, Redis]
tags: [redis, persistence, rdb, aof, eviction, ttl]
image: /assets/img/【哲风壁纸】个性少女-二次元少女.png
---

> 目标：理解键过期、内存淘汰策略，以及 RDB/AOF 持久化差异。

## 1. 过期删除
- 设置过期：`EXPIRE key ttl` / `SET key val EX ttl`。
- 删除策略：惰性删除（访问时发现过期才删）、定期删除（随机抽样清理）。

## 2. 内存淘汰（maxmemory-policy）
- 常见策略：
  - `noeviction`：不淘汰，内存满时报错（默认）。
  - `allkeys-lru` / `allkeys-lfu`：全键空间基于 LRU/LFU 淘汰。
  - `volatile-lru` / `volatile-lfu`：只在设置了过期时间的键中淘汰。
  - `allkeys-random` / `volatile-random`：随机。
  - `volatile-ttl`：优先淘汰最早过期的键。
- 建议：缓存场景常用 `allkeys-lru` 或 `allkeys-lfu`；同时设置合理过期时间。

## 3. 持久化
- **RDB**（快照）：定期把内存写成二进制快照；文件小，恢复快；但可能丢失最近一段数据。
- **AOF**（日志追加）：每次写命令记录日志；`appendfsync` 可调（always/everysec/no）。文件可重写瘦身。更实时，文件较大。
- **混合持久化**：Redis 4.0+，在 AOF 中先写 RDB 头再追加增量，兼顾恢复速度与数据安全。

## 4. 配置示例（redis.conf 摘要）
```conf
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 5. 小结
- 过期删除+定期任务保证失效；淘汰策略需结合业务（是否能接受丢数据）。
- RDB 快照适合快速恢复；AOF 保障更小丢失窗口；混合持久化兼顾性能与安全。
- 选择合适的 maxmemory 与策略，避免 OOM。
