---
sidebar_position: 2
sidebar_label: Recent Measurements
---

# Recent Measurements — Grid ID

Retrieve the latest hourly calibrated air quality measurements from all public monitoring sites within your city's Grid. This endpoint returns data from approximately the last 7 days.

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
    "limit": 50,
    "page": 1,
    "pages": 9,
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
      "frequency": "hourly",
      "deviceDetails": {
        "name": "airqo_bx2847",
        "isOnline": true,
        "status": "deployed",
        "latitude": -1.2921,
        "longitude": 36.8219,
        "lastActive": "2025-09-25T14:00:00.000Z"
      }
    }
  ]
}
```

---

## Response fields

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
| `frequency` | Always `"hourly"` for this endpoint |
| `deviceDetails.latitude` | Device latitude |
| `deviceDetails.longitude` | Device longitude |
| `deviceDetails.isOnline` | Whether device is currently active |

---

## Pagination

Large city Grids can return hundreds of measurements. Use `limit` and `skip` to page through:

```bash
# Get next page (records 51–100)
curl "https://api.airqo.net/api/v2/devices/measurements/grids/{GRID_ID}?token={SECRET_TOKEN}&limit=50&skip=50"
```

---

## Need data older than 7 days?

Use the [Analytics API for historical city data →](./historical-data).

## Want a visual map of your city's air quality?

See [Spatial Heatmaps →](./spatial-heatmaps) for generating Base64-encoded PNG heatmap images.
