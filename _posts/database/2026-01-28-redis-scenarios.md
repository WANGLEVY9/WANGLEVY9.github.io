---
title: "Redis 场景：缓存、分布式锁、消息队列、计数器"
date: 2026-01-28 12:20:00 +08:00
categories: [Database, Redis]
tags: [redis, cache, lock, mq, counter]
image: /assets/img/og-cover.svg
---

> 目标：梳理 Redis 在常见业务中的使用模式与注意点。

## 1. 缓存加速
- 热数据放入 Redis，降低数据库压力。
- Key 设计：前缀区分业务；设置合理过期时间；必要时加版本号方便失效。
- 读写策略：Cache Aside（常用）、Read/Write Through、Write Behind 视一致性要求选择。

## 2. 分布式锁
- 基于 `SET key val NX PX ttl` 获取锁，释放时用 Lua 校验 value 防误删。
- RedLock 适用于多实例，提高可靠性；但锁语义仍需结合业务补充。

## 3. 消息队列/异步
- 简易队列：`LPUSH` + `BRPOP`；或使用 `XADD`/`XREADGROUP`（Stream）。
- 场景：异步任务、削峰、日志收集；需要消费确认与幂等。

## 4. 计数器/限流
- 原子自增：`INCRBY`、`HINCRBY`。
- 限流：滑动窗口 + `ZSET`，或令牌桶用脚本实现；也可用 `INCR` + 过期作为固定窗口。

## 5. 典型代码片段（Lua 锁释放）
```lua
-- 保证只删除自己持有的锁
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
```

## 6. 小结
- Redis 适合低延迟、高并发的热数据与轻量异步场景。
- 分布式锁要有超时与校验；消息要考虑幂等与可重放。
- 计数/限流要设计好 key 粒度与过期，避免热点。
