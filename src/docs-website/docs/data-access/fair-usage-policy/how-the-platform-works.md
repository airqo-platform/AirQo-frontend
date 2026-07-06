---
sidebar_position: 2
sidebar_label: 2. How the Platform Works
---

# 2. How the Platform Works

### 2.1 Data Volume and Sampling Frequency

To appreciate why large downloads are resource-intensive, consider the raw data volumes involved:

| Period | Readings Per Monitor | Readings (50 Monitors) |
|--------|---------------------|------------------------|
| 1 Hour | 6 | 300 |
| 1 Day | 144 | 7,200 |
| 1 Month | ~4,320 | ~216,000 |
| 1 Year | ~52,560 | ~2,628,000 |
| 6 Years (2019–2024) | ~315,360 | ~15,768,000 |

Note: Kampala alone has over 50 active monitors. A single query for six years of hourly data across all Kampala monitors would request tens of millions of database rows, requiring significant compute time, memory, and bandwidth.

### 2.2 The Batch Download Limit

To protect system stability and ensure equitable access for all users, the AirQo Analytics Platform intentionally limits single downloads to approximately **three months of data per query**.

:::warning This limit is intentional and permanent
This limit is displayed clearly via tooltips in the platform interface. It applies universally to all users regardless of institutional affiliation, seniority, or research scope.
:::
