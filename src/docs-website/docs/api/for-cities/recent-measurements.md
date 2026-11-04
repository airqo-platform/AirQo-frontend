---
sidebar_position: 2
sidebar_label: Recent Measurements
---

# Recent Measurements — Grid ID

Retrieve the latest hourly calibrated air quality measurements from all public monitoring sites within your city's Grid. This endpoint returns data from approximately the last 7 days.

:::note Data freshness
Each measurement is an hourly average, so the newest record is for the most recent completed hour, not the last few minutes. See [Data Freshness →](../reference/data-freshness.md) to check how current a reading is and how often to poll.
:::

:::info Tier requirement
Available on all tiers including Free.
:::

---

## Endpoint

```http
GET https://api.airqo.net/api/v2/devices/measurements/grids/{GRID_ID}?token={SECRET_TOKEN}
```

### Path parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `GRID_ID` | string | Yes | Your city's Grid identifier |

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Your SECRET TOKEN from Account Settings |

---

## Example request

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/grids/64b7ac8fd7249f0029feca80?token=YOUR_SECRET_TOKEN"
```

**JavaScript (fetch):**

```js
const gridId = '64b7ac8fd7249f0029feca80'; // Nairobi example
const token = 'YOUR_SECRET_TOKEN';

const response = await fetch(
  `https://api.airqo.net/api/v2/devices/measurements/grids/${gridId}?token=${token}`
);
const data = await response.json();

console.log(`City has ${data.meta.total} total measurements.`);
data.measurements.forEach(m => {
  console.log(`[${m.time}] ${m.device}: PM2.5 = ${m.pm2_5?.value} μg/m³`);
});
```

**Python:**

```python
import requests

grid_id = '64b7ac8fd7249f0029feca80'  # Nairobi example
token = 'YOUR_SECRET_TOKEN'

response = requests.get(
    f'https://api.airqo.net/api/v2/devices/measurements/grids/{grid_id}',
    params={'token': token}
)
data = response.json()

for m in data['measurements']:
    print(f"[{m['time']}] {m['device']}: PM2.5 = {m['pm2_5']['value']} μg/m³")
```

---

## Example response

```json
{
  "success": true,
  "isCache": false,
  "message": "successfully returned the measurements",
  "meta": {
    "total": 420,
    "skip": 0,
    "limit": 30,
    "page": 1,
    "pages": 14,
    "startTime": "2025-09-21T11:00:00.000Z",
    "endTime": "2025-09-28T11:00:00.000Z"
  },
  "measurements": [
    {
      "device": "airqo_bx2847",
      "device_id": "65c8d4a2f1b45c0012a3e789",
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "time": "2025-09-25T14:00:00.000Z",
      "pm2_5": {
        "value": 23.45
      },
      "pm10": {
        "value": 31.82
      },
      "no2": {
        "value": null
      },
      "aqi_category": "Moderate",
      "aqi_color": "ffff00",
      "aqi_index": 75,
      "frequency": "hourly",
      "siteDetails": {
        "name": "Civic Centre, Nairobi",
        "city": "Nairobi",
        "country": "Kenya",
        "approximate_latitude": -1.2921,
        "approximate_longitude": 36.8219
      }
    }
  ]
}
```

This example is abbreviated to the most commonly used fields, so real rows contain more.

:::note Reading the rows
Pollutant fields are objects, so read `pm2_5.value` rather than `pm2_5`.

Each row is the latest reading from one device, so `time` can differ between rows. To summarise a Grid, aggregate across rows or filter by `site_id`. Don't use only the first row, and don't chart the rows as a time series.
:::

---

## Response fields

### Top-level

| Field | Description |
|-------|-------------|
| `success` | `true` if the request succeeded |
| `isCache` | Whether the response was served from cache |
| `message` | Human-readable status message |
| `meta` | Pagination and query metadata |
| `measurements` | Array of measurement objects |

### `meta` object

| Field | Description |
|-------|-------------|
| `total` | Total measurements matching the query |
| `skip` | Records skipped (pagination) |
| `limit` | Max records per page |
| `page` | Current page |
| `pages` | Total pages |
| `startTime` | Query start (ISO 8601) |
| `endTime` | Query end (ISO 8601) |

### Measurement object

| Field | Description |
|-------|-------------|
| `device` | Device name |
| `device_id` | Unique device identifier |
| `site_id` | Location identifier |
| `time` | Reading timestamp (ISO 8601) |
| `pm2_5.value` | PM2.5 concentration in μg/m³ |
| `pm10.value` | PM10 concentration in μg/m³ |
| `no2.value` | NO₂ reading. May be `null`. |
| `aqi_category` | AQI category name for the reading |
| `aqi_color` | Display colour for the AQI category |
| `aqi_index` | AQI value for the reading |
| `frequency` | Always `"hourly"` for this endpoint |
| `siteDetails` | Details of the device's site. Useful fields include `name`, `city`, `country`, `approximate_latitude`, and `approximate_longitude`. |

---

## Pagination

Large city Grids can return hundreds of measurements. Use `limit` (default 30, max 80) and `skip` to page through:

```bash
# Get next page (records 31–60)
curl "https://api.airqo.net/api/v2/devices/measurements/grids/{GRID_ID}?token={SECRET_TOKEN}&limit=30&skip=30"
```

---

## Need data older than 7 days?

Use the [Analytics API for historical city data →](./historical-data.md).

## Want a visual map of your city's air quality?

See [Spatial Heatmaps →](./spatial-heatmaps.md) for generating Base64-encoded PNG heatmap images.
