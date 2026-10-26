---
sidebar_position: 2
sidebar_label: Calibrated Data Download
---

# Calibrated Data Download

Retrieve AI-calibrated PM2.5 and PM10 measurements at hourly, daily, weekly, monthly or yearly resolution. Calibrated data has been processed through AirQo's machine learning models to correct for environmental factors such as temperature and humidity, making it more suitable for analysis and reporting than raw readings.

:::info Tier requirement
Requires a **Standard Tier** subscription or above.
:::

:::tip Full technical reference
The [Analytics API route guide](https://github.com/airqo-platform/AirQo-api/blob/staging/src/analytics/api/routers/README.md#data-download) in the AirQo-api repository lists every validation rule, limit and error message for this endpoint.
:::

---

:::note Filters
Provide exactly one filter: `sites`, `device_names`, `device_ids`, `grid_ids` or `cohort_ids`. A filter list holds at most 150 values, and `grid_ids` and `cohort_ids` each take one ID. Use the [Metadata API](../reference/metadata.md) to find the identifiers for your Cohort or Grid.
:::

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
| `startDateTime` | string | Yes | Start timestamp (ISO 8601). It must not be in the future. |
| `endDateTime` | string | Yes | End timestamp (ISO 8601). It must be later than `startDateTime`. The range is at most 90 days for hourly data and at most 365 days for daily, weekly, monthly and yearly data. |
| `datatype` | string | No | `"calibrated"` (default) for quality-controlled data. The other values are `"raw"`, `"averaged"` and `"consolidated"`. |
| `downloadType` | string | No | `"json"` (default) or `"csv"` |
| `outputFormat` | string | No | Columns of a CSV download: `"airqo-standard"` (default) or `"aqcsv"`. `"aqcsv"` supports hourly and daily data. |
| `frequency` | string | No | `"hourly"`, `"daily"` (default), `"weekly"`, `"monthly"` or `"yearly"`. For raw readings, use the raw-data endpoint. |
| `device_category` | string | No | `"lowcost"` (default), `"bam"`, `"gas"`, `"general"`, `"mobile"` or `"satellite"` |
| `device_names` | array | No\* | Specific device IDs. This field matches the same column as `device_ids`, so it does not match a human-readable device name. |
| `device_ids` | array | No\* | Specific device IDs (as returned by the Metadata API) |
| `sites` | array | No\* | Specific Site IDs |
| `grid_ids` | array | No\* | One Grid ID |
| `cohort_ids` | array | No\* | One Cohort ID |
| `pollutants` | array | Yes | `"pm2_5"`, `"pm10"` or both. A request without a pollutant receives `422`. |
| `metaDataFields` | array | No | Any of `"latitude"`, `"longitude"` and `"site_id"` |
| `weatherFields` | array | No | Any of `"temperature"` and `"humidity"` |
| `cursor` | string | No | The `metadata.next` value of the previous page |

\* Provide exactly one of `sites`, `device_names`, `device_ids`, `grid_ids` or `cohort_ids`. A filter list holds at most 150 values.

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
    "sites": ["64f7b3e8c9d25a0013f2d456"],
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
    "sites": ["64f7b3e8c9d25a0013f2d456"],
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
const token = 'YOUR_SECRET_TOKEN';

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
      sites: ['64f7b3e8c9d25a0013f2d456'],
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
  "message": "Data retrieved successfully.",
  "data": [
    {
      "site_name": "Kampala Road",
      "device_name": "airqo_bx2847",
      "datetime": "2025-01-01 10:00:00Z",
      "pm2_5": 14.82,
      "pm2_5_calibrated_value": 12.45,
      "pm10": 18.06,
      "pm10_calibrated_value": 15.32,
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

The `data` array above is shortened to one record. `total_count` is the number of records in this page.

---

## Response fields

| Field | Description |
|-------|-------------|
| `site_name` | Human-readable site name |
| `device_name` | Device identifier |
| `device_id` | Device ID. It is present when the request filters by `device_ids`. |
| `datetime` | Measurement timestamp, for example `2025-01-01 10:00:00Z` |
| `week` / `month` / `year` | The period of the record. One of these keys replaces `datetime` at weekly, monthly and yearly frequency. |
| `pm2_5_calibrated_value` | Calibrated PM2.5 in μg/m³ |
| `pm10_calibrated_value` | Calibrated PM10 in μg/m³ |
| `pm2_5` | PM2.5 in μg/m³ |
| `pm10` | PM10 in μg/m³ |
| `latitude` / `longitude` | Device location. They are present when `metaDataFields` names them. |
| `site_id` | Site ID. It is present when `metaDataFields` names it. |
| `temperature` | Ambient temperature (°C). It is present when `weatherFields` names it. |
| `humidity` | Relative humidity (%). It is present when `weatherFields` names it. |
| `network` | Always `"airqo"` |
| `frequency` | The requested frequency |
| `metadata.total_count` | Number of records in this page |
| `metadata.has_more` | Whether more pages are available |
| `metadata.next` | Cursor for the next page |

---

## Calibrated vs raw data

| Aspect | Calibrated | Raw |
|--------|-----------|-----|
| Endpoint | `data-download` | `raw-data` |
| Processing | ML-corrected for temperature & humidity | Unprocessed sensor output |
| Resolution | Hourly, daily, weekly, monthly or yearly | Minute-level |
| Use case | Analysis, dashboards, reporting | Advanced research, custom calibration |
| Data quality | Higher (validated) | Lower (may have noise) |

---

## Pagination

A page holds at most 5000 records. While `metadata.has_more` is `true`, send the same request body again with `cursor` set to `metadata.next`. A page can hold fewer records while more pages follow, so continue until `has_more` is `false`.

- A cursor expires 6 minutes after the response that carried it.
- A cursor works only with the request body that produced it. A changed body or an expired cursor receives `400` with the message `Invalid or expired cursor token`. Start again without a cursor.
- With `"downloadType": "csv"`, each response is a CSV file that holds one page. The `X-Total-Count`, `X-Has-More` and `X-Next-Cursor` headers carry the page state, and `X-Next-Cursor` is absent on the last page.

See [Pagination →](../reference/pagination.md) for a complete walkthrough.

:::note Rate limit
This endpoint starts at most 10 exports per minute for each client. Requests that carry a `cursor` count only against the general limit of 100 requests per minute. A request over a limit receives `429` with a `Retry-After` header that gives the seconds to wait.
:::

---

## Errors

An error response has this shape:

```json
{
  "status": "error",
  "message": "The requested date range is too wide for hourly data. Shorten the date range or request a coarser frequency such as daily.",
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
