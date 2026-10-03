---
sidebar_position: 1
sidebar_label: Overview
description: Programmatic access to AirQo air quality measurements, forecasts, and a shared registry of air quality monitors across Africa.
---

# AirQo API

The AirQo API gives you programmatic access to air quality measurements from AirQo's sensor network, and to a shared, Africa-wide registry of air quality monitors from every manufacturer and operator. Whether you are building a public dashboard, powering a city's environmental platform, integrating air quality data into a research workflow, or mapping where monitoring happens across the continent, the API is designed to fit your use case.

---

## Who is this for?

| I am a... | I should use... |
|-----------|-----------------|
| **Partner or organisation** managing devices across multiple locations | [Cohort ID Access →](./for-partners/intro.md) |
| **City or municipality** monitoring a defined geographical area | [Grid ID Access →](./for-cities/intro.md) |
| **Developer** who needs historical or raw sensor data at scale | [Analytics API →](./analytics-api/raw-data.md) |
| **Researcher or planner** who needs predictive air quality data | [Forecast API →](./forecasts/overview.md) |
| **Funder, coalition, or environment agency** mapping who monitors air quality where across Africa — and where the gaps are | [Network Coverage API →](./network-coverage/intro.md) |

:::info Not after readings?
If you need to know *where* air quality is monitored across Africa — every manufacturer, every operator, including networks AirQo doesn't run — use the [Network Coverage API →](./network-coverage/intro.md). It's a shared registry of monitors that you can embed in your own site and contribute monitors to. It returns monitor locations and profiles, not measurements.
:::

---

## Available data types

| Data Type | Resolution | Use case | Tier |
|-----------|-----------|----------|------|
| Hourly calibrated measurements | Hourly | Dashboards, monitoring | Free+ |
| Raw sensor readings | Minute-level | Advanced analysis | Standard+ |
| Daily aggregated data | Daily | Trend analysis, reporting | Standard+ |
| Spatial heatmaps | Per grid area | Visualisations, city maps | Free+ |
| Air quality forecasts | Hourly & daily (7-day) | Planning, alerts | Premium |

---

## How data access is organised

All measurements can be fetched through four different grouping methods:

- **Site ID** — a specific physical monitoring location
- **Device ID** — a specific sensor unit, wherever it is deployed
- **Cohort ID** — a custom group of devices, typically managed by one organisation
- **Grid ID** — all public devices within a defined geographical boundary

:::tip Choosing the right method
Partners and organisations typically use **Cohort ID** because it groups their devices across regions. Cities and municipalities typically use **Grid ID** because it captures all sensors within their administrative boundary.
:::

---

## Base URL

All API requests are made to:

```text
https://api.airqo.net
```

---

## Authentication

All endpoints require authentication via a `token` query parameter. Pass your `SECRET TOKEN` as `?token=YOUR_SECRET_TOKEN` on every request — both GET and POST.

See [Authentication & Setup](./getting-started/authentication.md) for step-by-step instructions on generating your credentials.

---

## Next steps

1. [Set up your account and generate credentials →](./getting-started/authentication.md)
2. [Choose your subscription tier →](./getting-started/pricing-tiers.md)
3. [Make your first API call →](./getting-started/quick-start.md)
4. Mapping monitoring coverage rather than reading measurements? [Start with the Network Coverage API →](./network-coverage/intro.md)
