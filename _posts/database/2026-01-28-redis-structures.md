---
title: "Redis 核心数据结构与命令"
date: 2026-01-28 12:25:00 +08:00
categories: [Database, Redis]
tags: [redis, string, list, hash, set, zset]
image: /assets/img/【哲风壁纸】二次元-动漫-夜景 (1).png
---

> 目标：掌握五大基础类型及常用命令，快速找到合适的数据结构。

## 1. String
- 最通用，计数、缓存对象 JSON、分布式锁标记。
- 命令：`GET/SET/INCRBY/SETEX/MSET`。

## 2. List
- 有序队列，支持从两端读写。
- 命令：`LPUSH/RPUSH/LPOP/RPOP/BRPOP/LRANGE`。
- 用途：简单队列、时间顺序列表。

## 3. Hash
- 适合存小对象的字段集合。
- 命令：`HGET/HSET/HGETALL/HMGET/HINCRBY`。
- 适用：用户配置、计数器集合。

## 4. Set
- 无序、不重复集合。
- 命令：`SADD/SREM/SMEMBERS/SISMEMBER/SINTER/SCARD`。
- 适用：去重、标签集合、交集/并集计算。

## 5. ZSet（有序集合）
- 成员带分数，按分数排序。
- 命令：`ZADD/ZREM/ZRANGE/ZREVRANGE/ZRANGEBYSCORE/ZCOUNT`。
- 适用：排行榜、延时队列、按时间排序的 feed。

## 6. 示例：延时队列（ZSet）
```bash
# 生产：score 为触发时间戳
ZADD delay_queue 1700000000 task:123

# 消费：轮询取到期任务
ZREVRANGEBYSCORE delay_queue 0 1700000000 LIMIT 0 10
# 处理后 ZREM 移除
```

## 7. 选型提示
- 是否需要排序？→ ZSet
- 是否需要去重并做集合运算？→ Set
- 是否小对象字段集合？→ Hash
- 是否队列或时间序？→ List
- 计数/简单值 → String
