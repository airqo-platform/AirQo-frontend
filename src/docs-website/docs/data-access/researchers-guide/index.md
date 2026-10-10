---
sidebar_position: 1
sidebar_label: Overview
---

# Data Access Guide for Researchers

Comprehensive guidance on accessing, interpreting, and responsibly using AirQo air quality monitoring data for academic and scientific research across Africa.

:::info Document version
Version 1.0.4 — October 2026
:::

---

## Quick Reference for Publications

| Item | Summary | Details |
|------|---------|---------|
| **Timestamp convention** | Hourly and daily values are labelled with the start of the averaging interval | [Timestamps and Averaging](./data-quality-and-accuracy.md#timestamps-and-averaging) |
| **Timezone** | UTC; exported timestamps end in `Z` | [Timestamps and Averaging](./data-quality-and-accuracy.md#timestamps-and-averaging) |
| **Averaging method** | Arithmetic mean of all valid readings in the interval; no minimum number of readings | [Timestamps and Averaging](./data-quality-and-accuracy.md#timestamps-and-averaging) |
| **Valid range** | 0 to 1000 μg/m³ inclusive for PM2.5 and PM10; values outside the range are removed | [Data Filtering Rules](./data-quality-and-accuracy.md#data-filtering-rules) |
| **Quality flags** | No per-observation flag; removed readings appear as gaps | [Data Quality Flags](./data-quality-and-accuracy.md#data-quality-flags) |
| **Available pollutants** | PM2.5 and PM10 | [Measurement Parameters](./data-quality-and-accuracy.md#measurement-parameters) |
| **Calibration** | Separate machine-learning models for PM2.5 and PM10, applied to hourly averaged data | [How Calibration is Applied](./data-calibration-methodology.md#how-calibration-is-applied) |

---

## Introduction

Thank you for your interest in utilising AirQo's air quality monitoring data for your research. This document provides comprehensive guidance on accessing and interpreting air quality data from our monitoring network across Africa.

AirQo operates a high-density air quality monitoring network across the continent, with significant coverage in major urban centres. Our mission is to advance responsible open-access data sharing to support research, policy development, and public health initiatives.

---

## Open Data, Shared Infrastructure

All AirQo air quality data is provided free of charge. This is a deliberate policy rooted in our commitment to open science and the belief that clean air data should be a public good — accessible to researchers, policymakers, students, and communities alike.

However, free access does not mean unlimited access without consideration. AirQo is a non-commercial initiative operated by Makerere University and funded through research grants and development partnerships. Our data infrastructure (servers, databases, and compute resources) is shared simultaneously by all users across Africa and beyond. These resources are finite.

Equitable access means every user — from a PhD student in Kampala to a government analyst in Nairobi — receives a reliably fast and stable experience. To protect this, we have implemented intentional, permanent design measures that distribute system load fairly across all users.

---

## How Equitable Access Works in Practice

The most visible manifestation of our fair usage policy is the download batch limit on the AirQo Nexus: single data exports are capped at approximately three months of data per query. This is not a bug, a temporary limitation, or something that will be removed upon request. It is an intentional engineering decision.

The rationale is straightforward: a single query for six years of hourly data across 50+ monitors could request tens of millions of database rows, consuming significant server memory, CPU time, and bandwidth. If this were permitted without restriction, it would degrade service for every other concurrent user.

| Scenario | Estimated Data Rows | System Impact |
|----------|---------------------|---------------|
| 1 monitor, 3 months, hourly | ~2,160 rows | Minimal |
| 50 monitors, 1 year, hourly | ~2,628,000 rows | Significant |
| 50 monitors, 6 years, hourly | ~15,768,000 rows | Severe — blocks others |

Downloading data in batches (e.g., quarterly) costs you only a few extra minutes of preparation time, while preserving a stable, fast experience for all users. For researchers who require automated large-scale access, the [AirQo API](../../api/intro.md) (which also applies rate limiting) is the appropriate channel.

:::info See also
For detailed guidance on batch download workflows, API access, and fair usage expectations, see the companion document: [AirQo Fair Usage Policy](../fair-usage-policy/index.md).
:::

---

## Citing AirQo Data

**Calibration methodology** — When describing how the data was calibrated, cite:

> Adong, P., Bainomugisha, E., Okure, D., & Sserunjogi, R. (2022). Applying machine learning for large scale field calibration of low-cost PM2.5 and PM10 air pollution sensors. *Applied AI Letters*, 3(3), e76. [https://doi.org/10.1002/ail2.76](https://doi.org/10.1002/ail2.76)

**Data citation** — When citing the data itself, use:

> TODO(owner): approved data citation text


*This document is prepared by AirQo, Makerere University. For the latest information: https://airqo.africa | Contact: [support@airqo.net](mailto:support@airqo.net)*
