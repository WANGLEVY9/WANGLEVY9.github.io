---
title: "Redis 缓存问题与防护：穿透、击穿、雪崩、热 key"
date: 2026-01-28 12:35:00 +08:00
categories: [Database, Redis]
tags: [redis, cache, penetration, breakdown, avalanche, hotspot]
image: /assets/img/【哲风壁纸】二次元少女-动漫.png
---

> 目标：梳理常见缓存风险与解决方案，确保高并发场景的稳定性。

## 1. 缓存穿透（不存在的 key 被大量请求）
- 防护：布隆过滤器/本地布隆；对不存在结果也缓存短 TTL；接口参数校验。

## 2. 缓存击穿（热点 key 过期瞬间被并发击穿）
- 防护：
  - 互斥锁/单飞：获取不到缓存先加锁构建，其他请求等待。
  - 逻辑过期：缓存中携带逻辑过期时间，过期后后台异步刷新。
  - 预热：在 TTL 前主动续约/刷新热点 key。

## 3. 缓存雪崩（大量 key 同时过期或 Redis 故障）
- 防护：过期时间加随机抖动；多级缓存（本地 + 分布式）；降级与限流熔断；主从/哨兵/集群高可用。

## 4. 热 key/大 key
- 热 key：拆分热点（分片 key）、本地缓存兜底、限流。
- 大 key：Hash 拆分、分桶；监控 `MEMORY USAGE key`；删除大 key 用 `UNLINK` 异步释放。

## 5. 代码示例：互斥锁防击穿（伪代码）
```python
val = redis.get(key)
if val is None:
    # 简单互斥锁
    if redis.set(lock_key, 1, nx=True, ex=5):
        try:
            val = db.query()
            redis.set(key, val, ex=300)
        finally:
            redis.delete(lock_key)
    else:
        time.sleep(0.05)
        return fallback()
return val
```

## 6. 小结
- 先识别风险类型再选方案：穿透→布隆/空值缓存；击穿→互斥/逻辑过期；雪崩→抖动+多级缓存+限流；热/大 key→拆分与本地缓存。
