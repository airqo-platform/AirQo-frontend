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
- **Public Cohorts:** Use the [Metadata API — List all cohorts](./metadata.md#list-all-public-cohorts) endpoint to browse all publicly visible cohorts
- **Private Cohorts:** Contact [support@airqo.net](mailto:support@airqo.net) — your Cohort ID will be shared securely once your organisation's Cohort is set up

A Cohort ID looks like: `64b9c7d5e3f82b0014c5a123`

---

## Grid ID

A Grid ID represents a geographical area (typically a city or district). Grids are public.

**How to find your Grid ID:**

1. Call the [grid summary endpoint](./metadata.md#grid-summary-with-site-details): `GET /api/v2/devices/grids/summary`
2. Use the `admin_level=city` query parameter to filter to city-level grids
3. Locate your city by `long_name` and copy its `_id` value

**Known Grid IDs (examples):**

| City | Grid ID |
|------|---------|
| Nairobi | `64b7ac8fd7249f0029feca80` |

For other cities, use the [Metadata API](./metadata.md) to browse all available grids.

---

## Site ID

A Site ID identifies a specific physical monitoring location.

**How to find Site IDs:**
- Call [GET /api/v2/devices/grids/{GRID_ID}/generate](./metadata.md#get-all-site-and-device-ids-for-a-grid) to list every site (and its devices) within a grid
- Call the [Metadata API — List all sites](./metadata.md#list-all-public-sites) to browse all public monitoring sites
- Or call the [recent measurements endpoint](../for-cities/recent-measurements.md) for your Grid and collect the `site_id` field from each measurement record

A Site ID looks like: `64f7b3e8c9d25a0013f2d456`

---

## Device ID and Device Name

A Device ID uniquely identifies a sensor unit. Device names follow the pattern `airqo_XXXXX`.

**How to find Device IDs:**
- Call any measurements endpoint and look at the `device_id` and `device` fields in each measurement record
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

---

## Browsing via the Metadata API

The [Metadata API](./metadata.md) provides dedicated endpoints for discovering every public resource:

| What you want | Endpoint |
|---------------|----------|
| Browse all grids | `GET /api/v2/devices/metadata/grids` |
| Browse grids by city/country | `GET /api/v2/devices/grids/summary?admin_level=city` |
| Look up one grid | `GET /api/v2/devices/metadata/grids/{GRID_ID}` |
| Sites in a grid | `GET /api/v2/devices/grids/{GRID_ID}/generate` |
| Browse all cohorts | `GET /api/v2/devices/metadata/cohorts` |
| Sites and devices in a cohort | `GET /api/v2/devices/cohorts/{COHORT_ID}/generate` |
| Browse all sites | `GET /api/v2/devices/metadata/sites` |
| Browse all devices | `GET /api/v2/devices/metadata/devices` |

---

## Still can't find your ID?

Contact [support@airqo.net](mailto:support@airqo.net) with your organisation's name or the city/region you are monitoring. The team can look up the correct IDs for you.
