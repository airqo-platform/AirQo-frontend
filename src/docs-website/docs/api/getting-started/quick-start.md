---
sidebar_position: 3
sidebar_label: Quick Start
---

# Quick Start

This page gets you to your first successful API response in under five minutes.

---

## Prerequisites checklist

Before you begin, make sure you have:

- [ ] An AirQo account at [analytics.airqo.net](https://analytics.airqo.net)
- [ ] A `SECRET TOKEN` generated from **Account Settings**
- [ ] Your server's IP address whitelisted (if calling from a server)
- [ ] A Cohort ID or Grid ID to query (see [Finding IDs →](../reference/finding-ids))

---

## Your first request

### Fetch recent measurements for a Cohort

Replace `YOUR_COHORT_ID` and `YOUR_SECRET_TOKEN` with your actual values:

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/cohorts/YOUR_COHORT_ID?token=YOUR_SECRET_TOKEN"
```

### Fetch recent measurements for a Grid (city)

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/grids/YOUR_GRID_ID?token=YOUR_SECRET_TOKEN"
```

A successful response looks like this:

```json
{
  "success": true,
  "message": "successfully returned the measurements",
  "meta": {
    "total": 168,
    "skip": 0,
    "limit": 50,
    "page": 1,
    "pages": 4
  },
  "measurements": [
    {
      "device": "airqo_bx2847",
      "device_id": "65c8d4a2f1b45c0012a3e789",
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "time": "2025-09-25T14:00:00.000Z",
      "pm2_5": { "value": 23.45 },
      "pm10": { "value": 31.82 },
      "frequency": "hourly"
    }
  ]
}
```

---

## Understand the response

| Field | What it tells you |
|-------|-------------------|
| `success` | Whether the request succeeded |
| `meta.total` | Total matching measurements |
| `meta.pages` | How many pages of results exist |
| `measurements[].time` | ISO 8601 timestamp of the reading |
| `measurements[].pm2_5.value` | PM2.5 in μg/m³ |
| `measurements[].pm10.value` | PM10 in μg/m³ |

For the full response reference, see [Response Structure →](../reference/response-structure).

---

## What to do next

You have confirmed that your credentials work. Now choose the path that matches your use case:

- **Partner or organisation using Cohort ID?** → [For Partners →](../for-partners/intro)
- **City or municipality using Grid ID?** → [For Cities →](../for-cities/intro)
- **Need historical or raw data?** → [Analytics API →](../analytics-api/raw-data)
- **Need air quality forecasts?** → [Forecasts →](../forecasts/overview)
