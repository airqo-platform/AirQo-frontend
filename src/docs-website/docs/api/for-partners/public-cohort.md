---
sidebar_position: 4
sidebar_label: Public Cohort (Network-wide Data)
description: The recommended way to get data from across the whole AirQo network — a representative sample of public devices behind one stable Cohort ID, airqo-public.
---

# Public Cohort — Network-wide Access

If you are looking for **"all of AirQo's data"** or **data from all AirQo devices**, this is the recommended route. AirQo does not hand out every device in the network. Instead, the **public cohort** gives you a representative sample of the whole network through one stable identifier:

```text
airqo-public
```

Use it anywhere an endpoint takes a Cohort ID.

:::info Tier requirement
Recent measurements are available on all tiers including Free. Data older than 7 days requires a **Standard Tier** subscription or above — see [Pricing & Tiers →](../getting-started/pricing-tiers.md).
:::

---

## What is the public cohort?

The public cohort is a Cohort of public AirQo devices that AirQo maintains automatically.

- **It covers the whole network without including every device.** It contains a small sample of devices (currently up to 5) from every one of AirQo's smallest geographic areas — for example cities and their sub-divisions.
- **The sample size can change.** The number of devices per area is set by AirQo and may be adjusted, so do not build anything that depends on an exact count.
- **Smaller areas contribute fewer devices.** An area with fewer healthy devices than the sample size is represented by the devices it has.
- **Membership is reviewed weekly.** Devices that have been offline for more than 24 hours are swapped for another device in the same area when one is available.
- **Devices can also leave between reviews.** A device is removed from the cohort if it stops being public.

:::caution Do not hardcode device or site IDs
Because membership changes, always request data by the cohort identifier `airqo-public` and treat the list of devices and sites as something that can change from week to week. If you need the current list, [look it up](#which-devices-and-sites-are-in-the-cohort) each time rather than storing it.
:::

---

## Why use the public cohort?

| Use case | How the public cohort helps |
|----------|-----------------------------|
| "All of AirQo's data" in one place | One identifier covers every area of the network |
| Network-wide dashboards and maps | A representative sample from each area, with one API call |
| Regional or continental analysis | Consistent coverage without managing device lists |
| Getting started quickly | No Cohort to request — `airqo-public` is the same for everyone |

Need every public device in one specific city instead? Use [Grid ID access →](../for-cities/intro.md). Managing your own devices? Use [your organisation's Cohort →](./intro.md).

---

## Endpoints

All requests are made to `https://api.airqo.net` and are authenticated exactly like the other measurement endpoints — pass your `SECRET TOKEN` as the `token` query parameter. See [Authentication →](../getting-started/authentication.md).

### Measurements

| Method | Endpoint | Returns |
|--------|----------|---------|
| `GET` | `/api/v2/devices/measurements/cohorts/airqo-public/recent?token={SECRET_TOKEN}` | The most recent measurements from the cohort's devices |
| `GET` | `/api/v2/devices/measurements/cohorts/airqo-public/historical?token={SECRET_TOKEN}` | Historical measurements from the cohort's devices |
| `GET` | `/api/v2/devices/measurements/cohorts/airqo-public?token={SECRET_TOKEN}` | Measurements from the cohort's devices |

These are the standard [Cohort ID measurement endpoints](./recent-measurements.md) with `airqo-public` as the Cohort ID, so they accept the same query parameters and return the same response.

### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Your SECRET TOKEN from Account Settings |
| `startTime` | string | No | Query start (ISO 8601) |
| `endTime` | string | No | Query end (ISO 8601) |
| `limit` | integer | No | Records per page (default 30, max 80) |
| `skip` | integer | No | Records to skip (default 0) |

---

## Example request

Fetch recent measurements for the public cohort:

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/cohorts/airqo-public/recent?token=YOUR_SECRET_TOKEN"
```

**JavaScript (fetch):**

```js
const cohortId = 'airqo-public';
const token = 'YOUR_SECRET_TOKEN';

const response = await fetch(
  `https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}/recent?token=${token}`
);
const data = await response.json();

console.log(`Found ${data.meta.total} measurements across the network.`);
```

**Python:**

```python
import requests

cohort_id = 'airqo-public'
token = 'YOUR_SECRET_TOKEN'

response = requests.get(
    f'https://api.airqo.net/api/v2/devices/measurements/cohorts/{cohort_id}/recent',
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
    "limit": 30,
    "page": 1,
    "pages": 6,
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

The response is identical to every other Cohort ID measurement response. See [Recent Measurements — response fields](./recent-measurements.md#response-fields) for the field-by-field reference, or [Response Structure →](../reference/response-structure.md) for the full schema.

:::note Device and site IDs in responses will change
The `device`, `device_id` and `site_id` values above are examples. The devices you see in real responses depend on the cohort's current membership — do not store them as a fixed list.
:::

---

## Pagination

The public cohort spans the whole network, so results are paginated. Use `skip` and `limit` (default 30, max 80) to page through:

```bash
# Page 2: skip the first 30 records
curl "https://api.airqo.net/api/v2/devices/measurements/cohorts/airqo-public/recent?token={SECRET_TOKEN}&limit=30&skip=30"
```

See [Pagination reference →](../reference/pagination.md) for a full walkthrough.

---

## Historical data

For measurements over a specific period, call the historical endpoint with `startTime` and `endTime`:

```bash
curl -X GET \
  "https://api.airqo.net/api/v2/devices/measurements/cohorts/airqo-public/historical?token=YOUR_SECRET_TOKEN&startTime=2025-09-01T00:00:00.000Z&endTime=2025-09-07T23:59:59.000Z"
```

Keep in mind:

- The recent measurements endpoints return data from approximately the last 7 days.
- Access to data older than 7 days requires a **Standard Tier** subscription or above.
- Membership changes over time, so the devices behind a historical query can differ from one week to the next.

---

## Which devices and sites are in the cohort?

Use these endpoints to see the cohort's current membership. They take the same `token` query parameter as the measurement endpoints.

| Method | Endpoint | Request body | Returns |
|--------|----------|--------------|---------|
| `POST` | `/api/v2/devices/cohorts/devices?token={SECRET_TOKEN}` | `{ "cohort_ids": ["airqo-public"] }` | The devices currently in the cohort (`devices` array) |
| `POST` | `/api/v2/devices/cohorts/sites?token={SECRET_TOKEN}` | `{ "cohort_ids": ["airqo-public"] }` | The sites those devices are deployed at (`sites` array) |
| `GET` | `/api/v2/devices/cohorts/airqo-public?token={SECRET_TOKEN}` | none | Details of the cohort itself |

**Example — list the devices currently in the cohort**

```bash
curl -X POST "https://api.airqo.net/api/v2/devices/cohorts/devices?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cohort_ids": ["airqo-public"]
  }'
```

**Example — list the sites currently in the cohort**

```bash
curl -X POST "https://api.airqo.net/api/v2/devices/cohorts/sites?token=YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cohort_ids": ["airqo-public"]
  }'
```

:::tip Treat the list as a snapshot
Fetch the membership when you need it — for example to draw device locations on a map — and refresh it regularly. Do not use it to build a fixed list of device or site IDs to query individually.
:::

---

## Best practices

- **Always query by `airqo-public`** — it is the same in every environment and never changes, even when the devices behind it do.
- **Expect the set of devices to differ from week to week** — key your own storage on the measurement's `device_id` and `time`, not on a fixed device list.
- **Do not rely on a device count** — neither the total number of devices nor the number per area is guaranteed.
- **Cache responses** on your side to avoid repeating identical queries — see [Best Practices →](../reference/best-practices.md).

---

## Next steps

- [Understand the measurement response →](./recent-measurements.md#response-fields)
- [Page through large result sets →](../reference/pagination.md)
- [Set up your account →](../getting-started/authentication.md)
- Need something the public cohort does not cover? Contact [support@airqo.net](mailto:support@airqo.net)
