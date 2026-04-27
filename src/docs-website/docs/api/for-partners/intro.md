---
sidebar_position: 1
sidebar_label: Overview
---

# For Partners — Cohort ID Access

This guide is for **organisations, NGOs, research networks, and corporate partners** who have a group of AirQo devices deployed across multiple locations. Cohort ID access lets you retrieve air quality data from all of your devices with a single API call, regardless of where they are physically located.

---

## What is a Cohort?

A **Cohort** is an organisationally-defined group of devices. Unlike Grid IDs, which are determined by geography, a Cohort is created and managed by AirQo based on your organisation's needs. Your devices might be spread across different cities or even countries — the Cohort groups them together under a single identifier.

:::note Cohort access is currently managed by AirQo
At this time, Cohorts are created and configured by the AirQo team on behalf of partner organisations. Contact [support@airqo.net](mailto:support@airqo.net) to request a Cohort for your network.
:::

---

## Why use Cohort ID access?

| Use case | How Cohort ID helps |
|----------|---------------------|
| Multi-location monitoring | Get all your data with one API call |
| Organisational dashboards | Unified view across your entire network |
| Corporate air quality reporting | Filter to exactly your devices |
| Research networks | Pull data from all participating devices |
| NGO environmental programmes | Monitor all programme sites centrally |

---

## Your Cohort ID endpoint structure

Once you have your Cohort ID, two endpoints cover your primary data needs:

| Data | Endpoint |
|------|----------|
| Recent measurements (last 7 days) | `GET /api/v2/devices/measurements/cohorts/{COHORT_ID}?token={SECRET_TOKEN}` |
| Historical measurements | `POST /api/v3/public/analytics/data-download` |

---

## Privacy and your Cohort

By default, Cohorts are **private** — meaning the devices in your Cohort are not visible through Grid ID (city) endpoints unless you explicitly make them public. This is important for partners who manage proprietary sensor networks.

To change the privacy setting of your Cohort, contact [support@airqo.net](mailto:support@airqo.net).

---

## Getting your Cohort ID

- **Public Cohorts:** Browse the metadata endpoints at [docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata](https://docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata)
- **Private Cohorts:** Contact [support@airqo.net](mailto:support@airqo.net) — your Cohort ID will be shared securely

---

## What data is available?

| Data type | Available? | Notes |
|-----------|-----------|-------|
| Recent hourly measurements | ✅ Free | Last 7 days |
| Historical calibrated data | ✅ Standard+ | Via Analytics API |
| Raw sensor readings | ✅ Standard+ | Via Analytics API |
| Air quality forecasts | ❌ | Not currently available per Cohort ID |
| Spatial heatmaps | ❌ | Heatmaps use Grid ID |

---

## Next steps

- [Fetch recent measurements →](./recent-measurements.md)
- [Access historical data →](./historical-data.md)
- [Set up your account →](../getting-started/authentication.md)
