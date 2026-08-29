---
sidebar_position: 3
sidebar_label: Historical Data
---

# Historical Data — Partners

Access the full history of calibrated air quality measurements for the devices in your Cohort. Historical data is retrieved through the Analytics API using a `POST` request. Each individual request can span up to **365 days** — use batched requests with pagination if you need multiple years of history in one export.

:::info Tier requirement
Historical data access requires a **Standard Tier** subscription or above.
:::

:::caution Cohort ID direct filtering — coming soon
The Analytics API does not yet accept `cohort_id` as a request parameter. You must supply individual device identifiers in the request body instead.

**Workaround:** Call the [Metadata API](../reference/metadata.md#get-all-site-and-device-ids-for-a-cohort) (`GET /api/v2/devices/cohorts/{COHORT_ID}/generate`) to retrieve the `device_ids` for your Cohort, then pass them as the `device_ids` parameter in your Analytics API request.

Direct Cohort ID filtering will be added to the Analytics API in a future release.
:::

---

## Overview

Historical data for your Cohort is fetched via the Analytics API by specifying the device IDs that belong to your Cohort. Use the [Metadata API](../reference/metadata.md#get-all-site-and-device-ids-for-a-cohort) (`GET /api/v2/devices/cohorts/{COHORT_ID}/generate`) to retrieve all device IDs for your Cohort.

---

## Endpoint

```http
POST https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN
Content-Type: application/json
```

---

## Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | No | Always `"airqo"` (default) |
| `startDateTime` | string | Yes | Start of range (ISO 8601) |
| `endDateTime` | string | Yes | End of range (ISO 8601) |
| `datatype` | string | No | `"calibrated"` (default) for quality-controlled data |
| `downloadType` | string | No | `"json"` (default) or `"csv"` |
| `frequency` | string | No | `"hourly"` or `"daily"` (default) |
| `device_ids` | array | No\* | Device IDs in your Cohort (from the Metadata API) |
| `device_names` | array | No\* | Device names in your Cohort |
| `pollutants` | array | No | e.g. `["pm2_5", "pm10"]` |
| `metaDataFields` | array | No | e.g. `["latitude", "longitude"]` |
| `weatherFields` | array | No | e.g. `["temperature", "humidity"]` |
| `cursor` | string | No | Pagination cursor from previous response |

\* Provide exactly one of `device_ids` or `device_names`.

---

## Example request — hourly calibrated data

The example below uses `device_ids`, matching the identifiers returned by the Cohort workaround above. If you already have device names from another endpoint (e.g. the `device` field in [Recent Measurements](./recent-measurements.md)), pass those as `device_names` instead — just don't mix the two in one request.

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-31T23:59:59Z",
    "device_ids": ["65c8d4a2f1b45c0012a3e789"],
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
    "device_ids": ["65c8d4a2f1b45c0012a3e789"],
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
      device_ids: ['65c8d4a2f1b45c0012a3e789'],
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
    "endDateTime": "2025-02-28T23:59:59Z",
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

- **Break multi-year exports into yearly batches** — each request can span up to 365 days.
- **Request only the pollutants you need** — omitting unused fields reduces response size.
- **Cache results** on your side to avoid repeating identical queries.
- **Watch the rate limit** — this endpoint accepts at most 10 requests per minute per client.
