---
sidebar_position: 3
sidebar_label: Finding IDs
---

# Finding IDs

To use the AirQo API, you need the right identifier for your data source. This page explains how to find Cohort IDs, Grid IDs, Site IDs, and Device IDs.

---

## Cohort ID

A Cohort ID groups your organisation's devices together. Cohorts are managed by AirQo.

**How to find your Cohort ID:**
- **Public Cohorts:** Browse the metadata endpoints at [docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata](https://docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata)
- **Private Cohorts:** Contact [support@airqo.net](mailto:support@airqo.net) — your Cohort ID will be shared securely once your organisation's Cohort is set up

A Cohort ID looks like: `64b9c7d5e3f82b0014c5a123`

---

## Grid ID

A Grid ID represents a geographical area (typically a city or district). Grids are public.

**How to find your Grid ID:**

1. Visit the [metadata documentation](https://docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata)
2. Use the `admin_level` query parameter to filter by country, province, or city:

```bash
# Filter grids by city
GET https://api.airqo.net/api/v2/spatial/grids?admin_level=city&token=YOUR_SECRET_TOKEN
```

**Known Grid IDs (examples):**

| City | Grid ID |
|------|---------|
| Nairobi | `64b7ac8fd7249f0029feca80` |

For other cities, use the metadata endpoint to browse all available Grids.

---

## Site ID

A Site ID identifies a specific physical monitoring location.

**How to find Site IDs:**
- Call the [recent measurements endpoint](../for-cities/recent-measurements) for your Grid and collect the `site_id` field from each measurement
- Browse the metadata endpoints for a full list: [docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata](https://docs.airqo.net/airqo-rest-api-documentation/api-endpoints/metadata)

A Site ID looks like: `64f7b3e8c9d25a0013f2d456`

---

## Device ID and Device Name

A Device ID uniquely identifies a sensor unit. Device names follow the pattern `airqo_XXXXX`.

**How to find Device IDs:**
- Call any measurements endpoint and look at `device_id` and `device` fields in each measurement record
- The `device` field (e.g. `airqo_bx2847`) is the **device name** used in Analytics API requests
- The `device_id` field (e.g. `65c8d4a2f1b45c0012a3e789`) is used for forecast requests

---

## ID format reference

| Identifier | Format | Example |
|-----------|--------|---------|
| Cohort ID | 24-char hex string | `64b9c7d5e3f82b0014c5a123` |
| Grid ID | 24-char hex string | `64b7ac8fd7249f0029feca80` |
| Site ID | 24-char hex string | `64f7b3e8c9d25a0013f2d456` |
| Device ID | 24-char hex string | `65c8d4a2f1b45c0012a3e789` |
| Device Name | `airqo_XXXXX` | `airqo_bx2847` |

---

## Still can't find your ID?

Contact [support@airqo.net](mailto:support@airqo.net) with your organisation's name or the city/region you are monitoring. The team can look up the correct IDs for you.
