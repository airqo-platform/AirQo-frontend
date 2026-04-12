---
sidebar_position: 1
sidebar_label: Response Structure
---

# Response Structure

This page documents the response format for each category of AirQo API endpoint.

---

## Hourly measurements (GET endpoints)

Used by: Site ID, Device ID, Cohort ID, and Grid ID recent measurement endpoints.

```json
{
  "success": true,
  "isCache": false,
  "message": "successfully returned the measurements",
  "meta": {
    "total": 168,
    "skip": 0,
    "limit": 50,
    "page": 1,
    "pages": 4,
    "startTime": "2025-09-21T11:00:00.000Z",
    "endTime": "2025-09-28T11:00:00.000Z",
    "optimized": true
  },
  "measurements": [
    {
      "device": "airqo_bx2847",
      "device_id": "65c8d4a2f1b45c0012a3e789",
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "time": "2025-09-25T14:00:00.000Z",
      "pm2_5": { "value": 23.45 },
      "pm10": { "value": 31.82 },
      "frequency": "hourly",
      "deviceDetails": {
        "_id": "65c8d4a2f1b45c0012a3e789",
        "cohorts": ["64b9c7d5e3f82b0014c5a123"],
        "isOnline": true,
        "status": "deployed",
        "isPrimaryInLocation": true,
        "category": "lowcost",
        "network": "airqo",
        "name": "airqo_bx2847",
        "serial_number": "3456789",
        "latitude": 0.3476,
        "longitude": 32.5825,
        "lastActive": "2025-09-25T14:00:00.000Z",
        "lastRawData": "2025-09-28T08:45:00.000Z",
        "rawOnlineStatus": true
      }
    }
  ]
}
```

### Field reference

**Top-level**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `true` if request succeeded |
| `isCache` | boolean | Whether response was served from cache |
| `message` | string | Human-readable status |
| `meta` | object | Pagination and query metadata |
| `measurements` | array | Measurement records |

**`meta` object**

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total matching records |
| `skip` | number | Records skipped |
| `limit` | number | Records per page |
| `page` | number | Current page |
| `pages` | number | Total pages |
| `startTime` | string | Query start (ISO 8601) |
| `endTime` | string | Query end (ISO 8601) |

**Measurement record**

| Field | Type | Description |
|-------|------|-------------|
| `device` | string | Device name |
| `device_id` | string | Unique device identifier |
| `site_id` | string | Location identifier |
| `time` | string | Reading timestamp (ISO 8601) |
| `pm2_5.value` | number | PM2.5 in μg/m³ |
| `pm10.value` | number | PM10 in μg/m³ |
| `frequency` | string | Always `"hourly"` |

**`deviceDetails` object** (key fields)

| Field | Type | Description |
|-------|------|-------------|
| `isOnline` | boolean | Whether device is currently active |
| `status` | string | `"deployed"`, `"maintenance"`, etc. |
| `category` | string | `"lowcost"` or `"reference"` |
| `latitude` | number | Device latitude |
| `longitude` | number | Device longitude |
| `lastActive` | string | Last calibrated reading timestamp |
| `lastRawData` | string | Last raw reading timestamp |

---

## Analytics API responses (POST endpoints)

Used by: `raw-data` and `data-download` endpoints.

```json
{
  "status": "success",
  "message": "Data downloaded successfully",
  "data": [
    {
      "site_name": "Kampala Road",
      "device_name": "airqo_bx2847",
      "datetime": "2025-01-01 10:00:00Z",
      "pm2_5": 12.45,
      "pm10": 15.32,
      "latitude": 0.33,
      "longitude": 32.56,
      "temperature": 24.5,
      "humidity": 65.4,
      "network": "airqo",
      "frequency": "hourly"
    }
  ],
  "metadata": {
    "total_count": 500,
    "has_more": false,
    "next": null
  }
}
```

**Top-level**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"success"` or `"error"` |
| `message` | string | Human-readable status |
| `data` | array | Data records |
| `metadata` | object | Pagination metadata |

**`metadata` object**

| Field | Type | Description |
|-------|------|-------------|
| `total_count` | number | Total matching records |
| `has_more` | boolean | Whether additional pages exist |
| `next` | string or null | Cursor for the next page (pass as `cursor` parameter) |

---

## Heatmap response

Used by: `/api/v2/spatial/heatmaps` endpoints.

```json
[
  {
    "bounds": [
      [-1.444, 36.650],
      [-1.163, 37.102]
    ],
    "city": "nairobi_city",
    "id": "64b7ac8fd7249f0029feca80",
    "image": "data:image/png;base64,iVBORw0KGgo...",
    "message": "✅ AQI image generated for nairobi_city"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `bounds` | array | `[[sw_lat, sw_lng], [ne_lat, ne_lng]]` bounding box |
| `city` | string | City slug |
| `id` | string | Grid ID |
| `image` | string | Base64-encoded PNG (`data:image/png;base64,...`) |
| `message` | string | Generation status |

---

## Forecast response

Used by: `/api/v2/predict/hourly-forecast` and `/api/v2/predict/daily-forecast`.

```json
{
  "success": true,
  "message": "Forecasts retrieved successfully",
  "forecasts": [
    {
      "time": "2025-09-29T14:00:00+00:00",
      "pm2_5": 24.5,
      "health_tips": ["Air quality is acceptable for most people"]
    }
  ],
  "forecast_metadata": {
    "model_version": "v2.3",
    "generated_at": "2025-09-29T12:00:00+00:00",
    "location": {
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "latitude": 0.3476,
      "longitude": 32.5825
    },
    "forecast_horizon_hours": 168
  }
}
```
