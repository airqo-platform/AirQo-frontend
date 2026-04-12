---
sidebar_position: 1
sidebar_label: Raw Sensor Data
---

# Raw Sensor Data

Retrieve uncalibrated, minute-level sensor readings directly from AirQo devices. This endpoint is suited for advanced users who need high-resolution data or want to apply their own calibration.

:::info Tier requirement
Requires a **Standard Tier** subscription or above.
:::

---

## Endpoint

```
POST https://api.airqo.net/api/v3/public/analytics/raw-data
Content-Type: application/json
Authorization: Bearer YOUR_SECRET_TOKEN
```

---

## Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | Yes | Always `"airqo"` |
| `startDateTime` | string | Yes | Start timestamp (ISO 8601) |
| `endDateTime` | string | Yes | End timestamp (ISO 8601) |
| `pollutants` | array | Yes | Pollutants to retrieve (e.g. `["pm2_5", "pm10", "no2"]`) |
| `device_category` | string | No | Filter by device type, e.g. `"lowcost"` or `"mobile"` |
| `device_names` | array | No | Filter to specific device identifiers |
| `metaDataFields` | array | No | Additional metadata (e.g. `["latitude", "longitude"]`) |
| `weatherFields` | array | No | Weather data (e.g. `["temperature", "humidity"]`) |
| `frequency` | string | No | `"raw"` (default) or `"aggregated"` |
| `cursor` | string | No | Pagination cursor from previous response |

---

## Available pollutants

| Pollutant field | Description |
|----------------|-------------|
| `pm2_5` | Fine particulate matter (calibrated channel 1) |
| `pm10` | Coarse particulate matter |
| `no2` | Nitrogen dioxide |
| `s1_pm2_5` | Raw sensor channel 1 PM2.5 |
| `s2_pm2_5` | Raw sensor channel 2 PM2.5 |
| `s1_pm10` | Raw sensor channel 1 PM10 |
| `s2_pm10` | Raw sensor channel 2 PM10 |

---

## Example request

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/raw-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -d '{
    "network": "airqo",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-01T06:00:00Z",
    "device_names": ["airqo_bx2847"],
    "pollutants": ["pm2_5", "pm10", "no2"],
    "metaDataFields": ["latitude", "longitude"],
    "weatherFields": ["temperature", "humidity"],
    "frequency": "raw"
  }'
```

**Python:**

```python
import requests

token = 'YOUR_SECRET_TOKEN'

payload = {
    "network": "airqo",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-01T06:00:00Z",
    "device_names": ["airqo_bx2847"],
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "weatherFields": ["temperature", "humidity"],
    "frequency": "raw"
}

response = requests.post(
    "https://api.airqo.net/api/v3/public/analytics/raw-data",
    json=payload,
    headers={"Authorization": f"Bearer {token}"}
)
data = response.json()

print(f"Retrieved {len(data['data'])} raw readings")
```

**JavaScript:**

```js
const response = await fetch(
  'https://api.airqo.net/api/v3/public/analytics/raw-data',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer YOUR_SECRET_TOKEN'
    },
    body: JSON.stringify({
      network: 'airqo',
      startDateTime: '2025-01-01T00:00:00Z',
      endDateTime: '2025-01-01T06:00:00Z',
      device_names: ['airqo_bx2847'],
      pollutants: ['pm2_5', 'pm10'],
      metaDataFields: ['latitude', 'longitude'],
      frequency: 'raw'
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
      "device_name": "airqo_bx2847",
      "datetime": "2025-01-01 00:05:00Z",
      "s1_pm2_5": 14.2,
      "s2_pm2_5": 14.8,
      "s1_pm10": 18.4,
      "s2_pm10": 18.9,
      "latitude": 0.3476,
      "longitude": 32.5825,
      "temperature": 24.1,
      "humidity": 68.5,
      "network": "airqo",
      "frequency": "raw"
    }
  ],
  "metadata": {
    "total_count": 2000,
    "has_more": true,
    "next": "eyJsYXN0SWQiOiI2NWM4Z..."
  }
}
```

---

## Response fields

| Field | Description |
|-------|-------------|
| `device_name` | Device identifier |
| `datetime` | Timestamp of reading |
| `s1_pm2_5` / `s2_pm2_5` | Raw dual-channel PM2.5 readings in μg/m³ |
| `s1_pm10` / `s2_pm10` | Raw dual-channel PM10 readings in μg/m³ |
| `latitude` / `longitude` | Device location |
| `temperature` | Ambient temperature (°C) |
| `humidity` | Relative humidity (%) |
| `frequency` | Always `"raw"` for this endpoint |
| `metadata.has_more` | Whether more pages exist |
| `metadata.next` | Cursor to pass in the next request |

---

## Pagination

Raw data queries can return millions of rows. Always paginate:

```python
all_records = []
cursor = None

while True:
    payload = {**your_base_payload}
    if cursor:
        payload['cursor'] = cursor

    response = requests.post(
        "https://api.airqo.net/api/v3/public/analytics/raw-data",
        json=payload,
        headers={"Authorization": f"Bearer {token}"}
    ).json()

    all_records.extend(response['data'])

    if not response['metadata']['has_more']:
        break

    cursor = response['metadata']['next']
```

---

## Tips

- **Limit date ranges** — raw data is high-volume. Use windows of 1–6 hours for exploratory queries.
- **Specify only the pollutants you need** — omitting unused fields speeds up the response.
- **Use mobile category** (`"device_category": "mobile"`) to query data from mobile monitoring units.
