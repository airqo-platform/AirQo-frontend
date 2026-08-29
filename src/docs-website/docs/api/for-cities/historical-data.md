---
sidebar_position: 3
sidebar_label: Historical Data
---

# Historical Data — Cities

Access the full history of calibrated air quality measurements for all sites within your city's Grid. Historical data is retrieved through the Analytics API using a `POST` request. Each individual request can span up to **365 days** — use batched requests with pagination if you need multiple years of history in one export.

:::info Tier requirement
Historical data access requires a **Standard Tier** subscription or above.
:::

:::info Grid ID filtering
The Analytics API accepts a Grid ID directly via `grid_ids`, currently limited to **one Grid ID per request** — pass your city's Grid ID as a single-element array.

If you need to narrow results to a subset of sites within a larger Grid, call the [Metadata API](../reference/metadata.md#get-all-site-and-device-ids-for-a-grid) (`GET /api/v2/devices/grids/{GRID_ID}/generate`) to retrieve individual **Site IDs** and pass them as `sites` instead.
:::

---

## Overview

The simplest way to query historical data for your Grid is to pass your Grid ID directly as `grid_ids`. If you need finer-grained control, use the [Metadata API](../reference/metadata.md#get-all-site-and-device-ids-for-a-grid) (`GET /api/v2/devices/grids/{GRID_ID}/generate`) to retrieve individual Site IDs for that Grid and pass them as `sites` instead.

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
| `datatype` | string | No | `"calibrated"` (default) |
| `downloadType` | string | No | `"json"` (default) or `"csv"` |
| `frequency` | string | No | `"hourly"` or `"daily"` (default) |
| `grid_ids` | array | No\* | Your city's Grid ID — one per request |
| `sites` | array | No\* | Filter to specific Site IDs in your Grid |
| `device_names` | array | No\* | Filter to specific device names |
| `pollutants` | array | No | e.g. `["pm2_5", "pm10"]` |
| `metaDataFields` | array | No | e.g. `["latitude", "longitude"]` |
| `weatherFields` | array | No | e.g. `["temperature", "humidity"]` |
| `cursor` | string | No | Pagination cursor from previous response |

\* Provide exactly one of `grid_ids`, `sites`, or `device_names`.

---

## Simplest case — whole-city query

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-02-28T23:59:59Z",
    "grid_ids": ["64b7ac8fd7249f0029feca80"],
    "pollutants": ["pm2_5", "pm10"],
    "frequency": "daily"
  }'
```

---

## Example request — specific sites within a city

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-02-28T23:59:59Z",
    "sites": ["64f7b3e8c9d25a0013f2d456", "64f7b3e8c9d25a0013f2d789"],
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "frequency": "daily"
  }'
```

**Python (with pagination):**

```python
import requests

token = 'YOUR_SECRET_TOKEN'

base_payload = {
    "network": "airqo",
    "datatype": "calibrated",
    "downloadType": "json",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-02-28T23:59:59Z",
    "sites": ["64f7b3e8c9d25a0013f2d456", "64f7b3e8c9d25a0013f2d789"],
    "pollutants": ["pm2_5", "pm10"],
    "metaDataFields": ["latitude", "longitude"],
    "frequency": "daily"
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

print(f"Total records: {len(all_records)}")
```

**JavaScript (async):**

```js
async function fetchAllCityHistory(siteIds, token) {
  const basePayload = {
    network: 'airqo',
    datatype: 'calibrated',
    downloadType: 'json',
    startDateTime: '2025-01-01T00:00:00Z',
    endDateTime: '2025-02-28T23:59:59Z',
    sites: siteIds,
    pollutants: ['pm2_5', 'pm10'],
    metaDataFields: ['latitude', 'longitude'],
    frequency: 'daily'
  };

  let allRecords = [];
  let cursor = null;

  do {
    const payload = cursor ? { ...basePayload, cursor } : basePayload;

    const response = await fetch(
      `https://api.airqo.net/api/v3/public/analytics/data-download?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    allRecords = allRecords.concat(data.data);
    cursor = data.metadata.has_more ? data.metadata.next : null;
  } while (cursor);

  return allRecords;
}
```

---

## Example response

```json
{
  "status": "success",
  "message": "Data downloaded successfully",
  "data": [
    {
      "site_name": "Nairobi CBD",
      "device_name": "airqo_k001",
      "datetime": "2025-01-01 00:00:00Z",
      "pm2_5": 18.7,
      "pm10": 24.3,
      "latitude": -1.2921,
      "longitude": 36.8219,
      "temperature": 21.4,
      "humidity": 70.2,
      "network": "airqo",
      "frequency": "daily"
    }
  ],
  "metadata": {
    "total_count": 2400,
    "has_more": true,
    "next": "eyJsYXN0SWQiOiI2NWM4Z..."
  }
}
```

---

## Choosing frequency

| `frequency` value | Description | When to use |
|-------------------|-------------|-------------|
| `"hourly"` | One row per device per hour | Time-series analysis, charts |
| `"daily"` | One row per device per day (average) | Monthly reports, trend summaries |

---

## Best practices

- **Break multi-year exports into yearly batches** — each request can span up to 365 days. Query in sequential batches and combine the results to cover longer periods.
- **Filter to only the sites you need** — specifying `sites` or `grid_ids` reduces the data returned.
- **Cache your results** — historical data does not change, so you can store it locally and avoid re-querying.
- **Watch the rate limit** — this endpoint accepts at most 10 requests per minute per client.
