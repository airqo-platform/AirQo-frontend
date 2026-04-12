---
sidebar_position: 3
sidebar_label: Historical Data
---

# Historical Data — Cohort ID

Access calibrated air quality measurements going back up to one year for the devices in your Cohort. Historical data is retrieved through the Analytics API using a `POST` request.

:::info Tier requirement
Historical data access requires a **Standard Tier** subscription or above.
:::

---

## Overview

Historical data for your Cohort is fetched via the Analytics API by specifying the device names that belong to your Cohort. If you do not know the device names, use the recent measurements endpoint first — the `device` field in each measurement is the device name.

---

## Endpoint

```
POST https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN
Content-Type: application/json
```

---

## Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | Yes | Always `"airqo"` |
| `startDateTime` | string | Yes | Start of range (ISO 8601) |
| `endDateTime` | string | Yes | End of range (ISO 8601) |
| `datatype` | string | Yes | `"calibrated"` for quality-controlled data |
| `downloadType` | string | Yes | `"json"` |
| `frequency` | string | Yes | `"hourly"` or `"daily"` |
| `device_names` | array | No | Filter to specific devices in your Cohort |
| `pollutants` | array | No | e.g. `["pm2_5", "pm10"]` |
| `metaDataFields` | array | No | e.g. `["latitude", "longitude"]` |
| `weatherFields` | array | No | e.g. `["temperature", "humidity"]` |
| `cursor` | string | No | Pagination cursor from previous response |

---

## Example request — hourly calibrated data

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-31T23:59:59Z",
    "device_names": ["airqo_bx2847", "airqo_cy1523"],
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "frequency": "hourly"
  }'
```

**Python:**

```python
import requests

token = 'YOUR_SECRET_TOKEN'

payload = {
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-31T23:59:59Z",
    "device_names": ["airqo_bx2847", "airqo_cy1523"],
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "frequency": "hourly"
}

response = requests.post(
    f"https://api.airqo.net/api/v3/public/analytics/data-download?token={token}",
    json=payload
)

data = response.json()
print(f"Retrieved {len(data['data'])} records. More available: {data['metadata']['has_more']}")
```

**JavaScript:**

```js
const response = await fetch(
  `https://api.airqo.net/api/v3/public/analytics/data-download?token=${token}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      network: 'airqo',
      datatype: 'calibrated',
      downloadType: 'json',
      startDateTime: '2025-01-01T00:00:00Z',
      endDateTime: '2025-01-31T23:59:59Z',
      device_names: ['airqo_bx2847', 'airqo_cy1523'],
      pollutants: ['pm2_5', 'pm10'],
      metaDataFields: ['latitude', 'longitude'],
      frequency: 'hourly'
    })
  }
);
const data = await response.json();
```

---

## Example response

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

---

## Paginating through large datasets

When `metadata.has_more` is `true`, pass the `metadata.next` cursor in your next request:

```python
import requests

token = 'YOUR_SECRET_TOKEN'
base_payload = {
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-03-31T23:59:59Z",
    "device_names": ["airqo_bx2847"],
    "pollutants": ["pm2_5", "pm10"],
    "frequency": "hourly"
}

all_records = []
cursor = None

while True:
    payload = {**base_payload}
    if cursor:
        payload['cursor'] = cursor

    response = requests.post(
        f"https://api.airqo.net/api/v3/public/analytics/data-download?token={token}",
        json=payload
    ).json()

    all_records.extend(response['data'])

    if not response['metadata']['has_more']:
        break

    cursor = response['metadata']['next']

print(f"Total records fetched: {len(all_records)}")
```

---

## Choosing frequency

| Frequency | When to use |
|-----------|-------------|
| `"hourly"` | Time-series charts, detailed trend analysis |
| `"daily"` | Monthly reports, long-term comparisons |

---

## Tips

- **Limit your date range** to 30-day windows for faster responses on large device networks.
- **Request only the pollutants you need** — omitting unused fields reduces response size.
- **Cache results** on your side to avoid repeating identical queries.
