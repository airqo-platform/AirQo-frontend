---
sidebar_position: 1
sidebar_label: Overview
---

# For Cities — Grid ID Access

This guide is for **city authorities, municipal agencies, and urban planners** who want to monitor air quality across an entire geographical area. Grid ID access groups all public AirQo monitoring sites within a defined administrative boundary — giving you a single identifier that covers your whole city or region.

---

## What is a Grid?

A **Grid** is a geographically-defined grouping of monitoring sites. Every site within a city's or district's administrative boundary is automatically included. When you query a Grid ID, you get data from every public sensor in that area — with no need to manage individual site or device IDs.

Grids are **inherently public** and are designed for transparency in regional air quality reporting.

:::note Devices in private Cohorts
If a device belongs to an organisation's private Cohort, it will **not** appear in Grid data unless the Cohort owner has made it public. Grid data reflects publicly accessible sensors only.
:::

---

## Why Grid ID is the right choice for cities

| Use case | How Grid ID helps |
|----------|-------------------|
| City-wide air quality dashboards | One query covers every public sensor |
| Urban planning and policy decisions | Regional view aligned with administrative boundaries |
| Public health studies | Population-level exposure data |
| Environmental compliance reporting | Area-wide measurement history |
| Spatial visualisation | Heatmap images with geo-boundaries included |

---

## Your Grid ID endpoint structure

| Data | Endpoint |
|------|----------|
| Recent measurements | `GET /api/v2/devices/measurements/grids/{GRID_ID}?token={SECRET_TOKEN}` |
| Historical measurements | `POST /api/v3/public/analytics/data-download` |
| Spatial heatmap (city) | `GET /api/v2/spatial/heatmaps/{GRID_ID}?token={SECRET_TOKEN}` |
| All available heatmaps | `GET /api/v2/spatial/heatmaps?token={SECRET_TOKEN}` |

---

## Finding your Grid ID

- **Browse the metadata endpoints** at [docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata](https://docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata)
- **Filter by location** using the `admin_level` query parameter (country, province, or city)
- **Example:** The Grid ID for Nairobi is `64b7ac8fd7249f0029feca80`

---

## What data is available?

| Data type | Available? | Notes |
|-----------|-----------|-------|
| Recent hourly measurements | ✅ Free | Last 7 days |
| Spatial heatmaps | ✅ Free | Base64 PNG with boundary coordinates |
| Historical calibrated data | ✅ Standard+ | Via Analytics API |
| Raw sensor readings | ✅ Standard+ | Via Analytics API |
| Air quality forecasts | ✅ Premium | Via site or device ID from your Grid |

---

## Real-world integrations

City authorities already using Grid ID access:

- **Kampala Capital City Authority** — [kcca.go.ug/kampala-air-quality-monitoring-network](https://kcca.go.ug/kampala-air-quality-monitoring-network)
- **Lagos State Environmental Protection Agency** — [aqi.lasepa.gov.ng](https://aqi.lasepa.gov.ng/)
- **Nairobi City County** — [nairobi.go.ke/nairobi-air-quality](https://nairobi.go.ke/nairobi-air-quality)

---

## Next steps

- [Fetch recent measurements →](./recent-measurements)
- [Access historical data →](./historical-data)
- [Generate spatial heatmaps →](./spatial-heatmaps)
- [Set up your account →](../getting-started/authentication)
