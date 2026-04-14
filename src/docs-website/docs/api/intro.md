---
sidebar_position: 1
sidebar_label: Overview
---

# AirQo API

The AirQo API gives you programmatic access to air quality measurements from our sensor network across Africa. Whether you are building a public dashboard, powering a city's environmental platform, or integrating air quality data into a research workflow, the API is designed to fit your use case.

---

## Who is this for?

| I am a... | I should use... |
|-----------|-----------------|
| **Partner or organisation** managing devices across multiple locations | [Cohort ID Access →](./for-partners/intro) |
| **City or municipality** monitoring a defined geographical area | [Grid ID Access →](./for-cities/intro) |
| **Developer** who needs historical or raw sensor data at scale | [Analytics API →](./analytics-api/raw-data) |
| **Researcher or planner** who needs predictive air quality data | [Forecast API →](./forecasts/overview) |

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

See [Authentication & Setup](./getting-started/authentication) for step-by-step instructions on generating your credentials.

---

## Next steps

1. [Set up your account and generate credentials →](./getting-started/authentication)
2. [Choose your subscription tier →](./getting-started/pricing-tiers)
3. [Make your first API call →](./getting-started/quick-start)
