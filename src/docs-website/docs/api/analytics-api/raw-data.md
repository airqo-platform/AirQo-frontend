---
sidebar_position: 1
sidebar_label: Raw Sensor Data
---

# Raw Sensor Data

Retrieve uncalibrated, minute-level sensor readings directly from AirQo devices. This endpoint is suited for advanced users who need high-resolution data or want to apply their own calibration.

:::info Tier requirement
Requires a **Standard Tier** subscription or above.
:::

:::tip Full technical reference
The [Analytics API route guide](https://github.com/airqo-platform/AirQo-api/blob/staging/src/analytics/api/routers/README.md#raw-data) in the AirQo-api repository lists every validation rule, limit and error message for this endpoint.
:::

---

:::note Filters
Provide exactly one filter: `sites`, `device_names`, `device_ids`, `grid_ids` or `cohort_ids`. A filter list holds at most 150 values, and `grid_ids` and `cohort_ids` each take one ID. Use the [Metadata API](../reference/metadata.md) to find the identifiers for your Cohort or Grid.
:::

## Endpoint

```http
POST https://api.airqo.net/api/v3/public/analytics/raw-data?token=YOUR_SECRET_TOKEN
Content-Type: application/json
```

---

## Request parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `network` | string | No | Always `"airqo"` (default) |
| `startDateTime` | string | Yes | Start timestamp (ISO 8601). It must not be in the future. |
| `endDateTime` | string | Yes | End timestamp (ISO 8601). It must be later than `startDateTime`, and the range is at most 31 days. |
| `pollutants` | array | Yes | `"pm2_5"`, `"pm10"` or both. For `bam` devices, only `"pm2_5"`. A request without a pollutant receives `422`. |
| `device_category` | string | No | `"lowcost"` (default), `"bam"`, `"gas"`, `"general"`, `"mobile"` or `"satellite"` |
| `device_names` | array | No\* | Filter to specific device IDs. This field matches the same column as `device_ids`, so it does not match a human-readable device name. |
| `device_ids` | array | No\* | Filter to specific device IDs (as returned by the Metadata API) |
| `sites` | array | No\* | Filter to specific Site IDs |
| `grid_ids` | array | No\* | Filter to one Grid ID |
| `cohort_ids` | array | No\* | Filter to one Cohort ID |
| `metaDataFields` | array | No | Any of `"latitude"`, `"longitude"` and `"site_id"` |
| `weatherFields` | array | No | Any of `"temperature"` and `"humidity"` |
| `downloadType` | string | No | `"json"` (default) or `"csv"` |
| `outputFormat` | string | No | Columns of a CSV download: `"airqo-standard"` (default) or `"aqcsv"` |
| `frequency` | string | No | Always `"raw"` for this endpoint |
| `cursor` | string | No | The `metadata.next` value of the previous page |

\* Provide exactly one of `sites`, `device_names`, `device_ids`, `grid_ids` or `cohort_ids`. A filter list holds at most 150 values.

---

## Available pollutants

Only `pm2_5` and `pm10` can be requested via the `pollutants` parameter.

| Pollutant field | Description |
|----------------|-------------|
| `pm2_5` | Fine particulate matter |
| `pm10` | Coarse particulate matter |

For `lowcost` devices, the response also automatically includes the raw dual-channel readings behind each requested pollutant — these aren't requested separately:

| Field | Description |
|-------|-------------|
| `s1_pm2_5` / `s2_pm2_5` | Raw sensor channel 1 / 2 PM2.5 |
| `s1_pm10` / `s2_pm10` | Raw sensor channel 1 / 2 PM10 |

For `bam` devices, request `pm2_5` only. A request for `pm10` receives `422`. Each record carries the keys `realtime_conc`, `hourly_conc` and `short_time_conc`. A key whose values are all zero on a page is left out of that page, so treat a missing key as no reading.

---

## Example request

```bash
curl -X POST "https://api.airqo.net/api/v3/public/analytics/raw-data?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "airqo",
    "startDateTime": "2025-01-01T00:00:00Z",
    "endDateTime": "2025-01-01T06:00:00Z",
    "device_names": ["airqo_bx2847"],
    "pollutants": ["pm2_5", "pm10"],
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
    f"https://api.airqo.net/api/v3/public/analytics/raw-data?token={token}",
    json=payload
)
data = response.json()

print(f"Retrieved {len(data['data'])} raw readings")
```

**JavaScript:**

```js
const token = 'YOUR_SECRET_TOKEN';

const response = await fetch(
  `https://api.airqo.net/api/v3/public/analytics/raw-data?token=${token}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      network: 'airqo',
      startDateTime: '2025-01-01T00:00:00Z',
      endDateTime: '2025-01-01T06:00:00Z',
      device_names: ['airqo_bx2847'],
      pollutants: ['pm2_5', 'pm10'],
      metaDataFields: ['latitude', 'longitude'],
      weatherFields: ['temperature', 'humidity'],
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
  "message": "Data retrieved successfully.",
  "data": [
    {
      "site_name": "Kampala Road",
      "device_name": "airqo_bx2847",
      "datetime": "2025-01-01 00:05:00Z",
      "pm2_5": 14.5,
      "s1_pm2_5": 14.2,
      "s2_pm2_5": 14.8,
      "pm10": 18.65,
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
    "total_count": 5000,
    "has_more": true,
    "next": "eyJleHBpcmVzIjo..."
  }
}
```

The `data` array above is shortened to one record. `total_count` is the number of records in this page.

---

## Response fields

| Field | Description |
|-------|-------------|
| `site_name` | Human-readable site name |
| `device_name` | Device identifier |
| `device_id` | Device ID. It is present when the request filters by `device_ids`. |
| `datetime` | Timestamp of reading |
| `pm2_5` / `pm10` | PM2.5 and PM10 readings in μg/m³ |
| `s1_pm2_5` / `s2_pm2_5` | Raw dual-channel PM2.5 readings in μg/m³ |
| `s1_pm10` / `s2_pm10` | Raw dual-channel PM10 readings in μg/m³ |
| `realtime_conc` / `hourly_conc` / `short_time_conc` | PM2.5 readings of a `bam` device |
| `latitude` / `longitude` | Device location. They are present when `metaDataFields` names them. |
| `site_id` | Site ID. It is present when `metaDataFields` names it. |
| `temperature` | Ambient temperature (°C). It is present when `weatherFields` names it. |
| `humidity` | Relative humidity (%). It is present when `weatherFields` names it. |
| `network` | Always `"airqo"` |
| `frequency` | Always `"raw"` for this endpoint |
| `metadata.total_count` | Number of records in this page |
| `metadata.has_more` | Whether more pages exist |
| `metadata.next` | Cursor to pass in the next request |

---

## Pagination

Raw data queries can return millions of rows. Always paginate:

```python
import time

import requests


def fetch_all(base_payload, token):
    url = f"https://api.airqo.net/api/v3/public/analytics/raw-data?token={token}"
    records, payload = [], dict(base_payload)
    while True:
        response = requests.post(url, json=payload, timeout=120)
        if response.status_code in (429, 503):
            time.sleep(int(response.headers.get("Retry-After", 60)))
            continue
        body = response.json()
        if response.status_code != 200:
            raise RuntimeError(f"HTTP {response.status_code}: {body['message']}")
        records.extend(body["data"])
        if not body["metadata"]["has_more"]:
            return records
        payload["cursor"] = body["metadata"]["next"]
        time.sleep(1)
```

:::caution Cursors expire after 6 minutes
A `cursor` expires 6 minutes after the response that carried it, and it works only with the unchanged request body. An expired or mismatched cursor receives `400` with the message `Invalid or expired cursor token`. Start the export again without a cursor.
:::

With `"downloadType": "csv"`, each response is a CSV file that holds one page. The `X-Total-Count`, `X-Has-More` and `X-Next-Cursor` headers carry the page state, and `X-Next-Cursor` is absent on the last page.

---

## Errors

An error response has this shape:

```json
{
  "status": "error",
  "message": "The requested date range is too wide for raw data. Shorten the date range.",
  "data": null,
  "metadata": null
}
```

| Status | Cause | What to do |
|--------|-------|------------|
| `400` | The date range would scan too much data, the query ran longer than 30 seconds, or the cursor is invalid or expired. | Follow the message. Shorten the date range or request fewer sites or devices. After a cursor error, start again without a cursor. |
| `422` | The request fails validation. The `errors` array names each problem. | Correct the request. |
| `429` | A rate limit is exceeded. | Wait for the seconds in the `Retry-After` header, then send the same request again. |
| `500` | An unexpected server error. | Send the request again later. |
| `503` | The service cannot read the data at that moment. | Send the same request again later. If the request carries a cursor, use the same cursor while it is valid. |

---

## Tips

- **Limit date ranges** — raw data is high-volume. Use windows of 1–6 hours for exploratory queries.
- **Specify only the pollutants you need** — omitting unused fields speeds up the response.
- **Watch the rate limit** — this endpoint starts at most 5 exports per minute for each client. Requests that carry a `cursor` count only against the general limit of 100 requests per minute, so pause at least one second between pages.
- **Stay within 31 days** — a raw-data request covers at most 31 days.
