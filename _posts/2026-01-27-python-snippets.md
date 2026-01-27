---
title: "Python 笔记：数据处理片段"
date: 2026-01-27 14:00:00 +08:00
categories: [Tech, Python]
tags: [python, tips, data]
image: /assets/img/og-cover.png
---

日常数据处理时常用的两段代码：

1) 快速读取 CSV 并取前几行：

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.head(5))
```

2) 使用列表推导做简单清洗：

```python
raw = [" Alice ", "Bob", "", "Charlie  "]
clean = [x.strip() for x in raw if x.strip()]
print(clean)
```

后续文章可扩展到 matplotlib 绘图或 PyTorch 笔记，标签沿用 `python`、`tips`。
