---
sidebar_position: 4
sidebar_label: Pagination
---

# Pagination

The AirQo API uses two pagination styles depending on the endpoint type.

---

## Skip-based pagination (GET measurement endpoints)

Used by: Cohort ID, Grid ID, Site ID, and Device ID measurement endpoints.

Add `limit` and `skip` as query parameters:

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `limit` | 30 | 80 | Records per page |
| `skip` | 0 | — | Records to skip |

Results are sorted by reading time, most recent first — sort order isn't currently configurable.

### Example

```bash
# Page 1 (records 1–30)
GET .../cohorts/{COHORT_ID}?token={SECRET_TOKEN}&limit=30&skip=0

# Page 2 (records 31–60)
GET .../cohorts/{COHORT_ID}?token={SECRET_TOKEN}&limit=30&skip=30
```

### Pagination response shape

```json
{
  "meta": {
    "total": 5250,
    "limit": 80,
    "skip": 0,
    "page": 1,
    "pages": 66
  }
}
```

Use `meta.pages` to know when you have reached the last page.

### JavaScript — paginate through all records

```js
async function fetchAllMeasurements(cohortId, token) {
  const limit = 80;
  let skip = 0;
  let allMeasurements = [];
  let totalPages = 1;

  do {
    const response = await fetch(
      `https://api.airqo.net/api/v2/devices/measurements/cohorts/${cohortId}?token=${token}&limit=${limit}&skip=${skip}`
    );
    const data = await response.json();

    allMeasurements = allMeasurements.concat(data.measurements);
    totalPages = data.meta.pages;
    skip += limit;
  } while (skip < totalPages * limit);

  return allMeasurements;
}
```

---

## Cursor-based pagination (Analytics API POST endpoints)

Used by: `raw-data` and `data-download` endpoints.

The first request has no cursor. If `metadata.has_more` is `true`, pass the value of `metadata.next` as `cursor` in the next request.

:::caution Cursors expire in a few minutes
Request the next page promptly — a `cursor` is only valid for a short window after it's issued. If you wait too long between requests (e.g. while processing a very large page), the cursor expires and you'll need to resume from a fresh `startDateTime`.
:::

:::note Rate limit
`raw-data` and `data-download` each accept at most 10 requests per minute per client — pace your pagination loop accordingly.
:::

### Response shape

```json
{
  "metadata": {
    "total_count": 2000,
    "has_more": true,
    "next": "eyJsYXN0SWQiOiI2NWM4Z..."
  }
}
```

### Python — fetch all pages

```python
import requests

def fetch_all_pages(base_payload, token):
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

    return all_records
```

### JavaScript — fetch all pages

```js
async function fetchAllPages(basePayload, token) {
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

## Choosing the right page size

| Scenario | Recommended `limit` |
|----------|-------------------|
| Interactive dashboards | 20–30 |
| Background data sync | 50–80 |
| One-off bulk export | Max (80) |

For Analytics API cursor pagination, the page size is determined server-side. Keep re-requesting until `has_more` is `false`.
