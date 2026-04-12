---
sidebar_position: 2
sidebar_label: Calibrated Data Download
---

# Calibrated Data Download

Retrieve AI-calibrated PM2.5 and PM10 measurements at hourly or daily resolution. Calibrated data has been processed through AirQo's machine learning models to correct for environmental factors such as temperature and humidity, making it more suitable for analysis and reporting than raw readings.

:::info Tier requirement
Requires a **Standard Tier** subscription or above.
:::

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
| `startDateTime` | string | Yes | Start timestamp (ISO 8601) |
| `endDateTime` | string | Yes | End timestamp (ISO 8601) |
| `datatype` | string | Yes | Must be `"calibrated"` |
| `downloadType` | string | Yes | Must be `"json"` |
| `frequency` | string | Yes | `"hourly"` or `"daily"` |
| `device_category` | string | No | Filter by device type (e.g. `"lowcost"`) |
| `device_names` | array | No | Specific device identifiers |
| `sites` | array | No | Specific Site IDs |
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
    "endDateTime": "2025-01-02T00:00:00Z",
    "device_category": "lowcost",
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "weatherFields": ["temperature", "humidity"],
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
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "frequency": "hourly"
}

response = requests.post(
    f"https://api.airqo.net/api/v3/public/analytics/data-download?token={token}",
    json=payload
)
data = response.json()

for record in data['data']:
    print(f"{record['datetime']} — {record['device_name']}: PM2.5 = {record['pm2_5']} μg/m³")
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

## Response fields

| Field | Description |
|-------|-------------|
| `site_name` | Human-readable site name |
| `device_name` | Device identifier |
| `datetime` | Measurement timestamp |
| `pm2_5` | Calibrated PM2.5 in μg/m³ |
| `pm10` | Calibrated PM10 in μg/m³ |
| `latitude` / `longitude` | Device location |
| `temperature` | Ambient temperature (°C) |
| `humidity` | Relative humidity (%) |
| `frequency` | `"hourly"` or `"daily"` |
| `metadata.has_more` | Whether more pages are available |
| `metadata.next` | Cursor for the next page |

---

## Calibrated vs raw data

| Aspect | Calibrated | Raw |
|--------|-----------|-----|
| Endpoint | `data-download` | `raw-data` |
| Processing | ML-corrected for temperature & humidity | Unprocessed sensor output |
| Resolution | Hourly or daily | Minute-level |
| Use case | Analysis, dashboards, reporting | Advanced research, custom calibration |
| Data quality | Higher (validated) | Lower (may have noise) |

---

## Pagination

Use cursor-based pagination for large date ranges. See [Pagination →](../reference/pagination) for a complete walkthrough.
