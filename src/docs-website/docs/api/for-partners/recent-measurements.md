---
sidebar_position: 2
sidebar_label: Recent Measurements
---

# Recent Measurements — Cohort ID

Retrieve the latest hourly calibrated air quality measurements from all devices in your Cohort. This endpoint returns data from approximately the last 7 days.

:::info Tier requirement
Available on all tiers including Free.
:::

---

## Endpoint

```
GET https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token={SECRET_TOKEN}
```

### Path parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `COHORT_ID` | string | Yes | Your unique Cohort identifier |

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Your SECRET TOKEN from Account Settings |

---

## Example request

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/cohorts/64b9c7d5e3f82b0014c5a123?token=YOUR_SECRET_TOKEN"
```

**JavaScript (fetch):**

```js
const cohortId = '64b9c7d5e3f82b0014c5a123';
const token = 'YOUR_SECRET_TOKEN';

const response = await fetch(
  `https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}?token=${token}`
);
const data = await response.json();

console.log(`Found ${data.meta.total} measurements across your devices.`);
```

**Python:**

```python
import requests

cohort_id = '64b9c7d5e3f82b0014c5a123'
token = 'YOUR_SECRET_TOKEN'

response = requests.get(
    f'https://api.airqo.net/api/v2/devices/measurements/cohorts/{cohort_id}',
    params={'token': token}
)
data = response.json()

for measurement in data['measurements']:
    print(f"{measurement['device']} at {measurement['time']}: PM2.5 = {measurement['pm2_5']['value']} μg/m³")
```

---

## Example response

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
        "latitude": 0.3476,
        "longitude": 32.5825,
        "lastActive": "2025-09-25T14:00:00.000Z"
      }
    }
  ]
}
```

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
| `total` | Total matching measurements |
| `skip` | Records skipped (for pagination) |
| `limit` | Max records per page |
| `page` | Current page number |
| `pages` | Total number of pages |
| `startTime` | Query start (ISO 8601) |
| `endTime` | Query end (ISO 8601) |

### Measurement object

| Field | Description |
|-------|-------------|
| `device` | Device name |
| `device_id` | Unique device identifier |
| `site_id` | Location identifier |
| `time` | Reading timestamp (ISO 8601) |
| `pm2_5.value` | PM2.5 in μg/m³ |
| `pm10.value` | PM10 in μg/m³ |
| `frequency` | Always `"hourly"` for this endpoint |
| `deviceDetails.isOnline` | Whether device is currently active |
| `deviceDetails.latitude` | Device latitude |
| `deviceDetails.longitude` | Device longitude |

---

## Pagination

If your Cohort has many devices, results are paginated. Use `skip` and `limit` to page through:

```bash
# Page 2: skip the first 50 records
curl "https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token={SECRET_TOKEN}&limit=50&skip=50"
```

See [Pagination reference →](../reference/pagination.md) for a full walkthrough.

---

## Need data older than 7 days?

The recent measurements endpoint returns approximately the last 7 days. For historical data, use the [Analytics API →](./historical-data.md).
