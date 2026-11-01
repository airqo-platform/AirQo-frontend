---
sidebar_position: 2
sidebar_label: Monitors & Countries
---

# Monitors & Countries

These two endpoints power an Africa Network Map's country overview, its search box, and the per-country drill-down list. Fetch the summary first to render the map, then fetch a single country's monitors when the user clicks into it.

---

## Get the full network summary

```http
GET /api/v2/devices/network-coverage?token={SECRET_TOKEN}
```

Returns every country with monitors, each with its list of monitors nested inside. This is what draws the initial map — both the **Monitors** pins and the **Coverage** choropleth are derived from this one response.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `search` | string | Optional. Filters monitors by country, city, monitor name or network (case-insensitive substring match), or by two-letter country code (exact match, e.g. `KE`). When supplied, the response also includes [`cityMatches`](#city-matches-for-search). |
| `activeOnly` | boolean | Optional. When `true`, excludes monitors with `status: "inactive"`. |
| `types` | string | Optional. Comma-separated: `Reference`, `LCS`. Omit to include both. |
| `network` | string | Optional. Comma-separated network/operator names to filter by. |

:::tip Fetching the full dataset
If you want to filter or search client-side (so a user can toggle filters without a fresh request each time, and the map never shows a partial dataset while typing), omit `search`, `types`, and `network` and fetch everything once.
:::

**Example — all Reference and LCS monitors, active only**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage?activeOnly=true&token={SECRET_TOKEN}"
```

**Example response**

```json
{
  "success": true,
  "message": "Network coverage data retrieved successfully",
  "countries": [
    {
      "id": "uganda",
      "country": "Uganda",
      "iso2": "UG",
      "stats": {
        "total": 136,
        "Reference": 4,
        "LCS": 132,
        "Inactive": 0,
        "active": 136,
        "inactive": 0
      },
      "monitors": [
        {
          "id": "64f7b3e8c9d25a0013f2d456",
          "name": "Kampala Road",
          "city": "Kampala",
          "country": "Uganda",
          "countryId": "uganda",
          "iso2": "UG",
          "latitude": 0.3476,
          "longitude": 32.5825,
          "type": "LCS",
          "status": "active",
          "lastActive": "2025-09-28T08:45:00.000Z",
          "network": "airqo",
          "operator": "AirQo",
          "equipment": "AirQo BAM Node",
          "manufacturer": "AirQo",
          "pollutants": ["PM2.5", "PM10"],
          "resolution": "Hourly",
          "transmission": "GSM",
          "site": "Kampala Road, Kampala",
          "landUse": "Roadside",
          "deployed": "2020-12-01",
          "calibrationLastDate": "2025-06-01",
          "calibrationMethod": "Field co-location",
          "uptime30d": "96%",
          "publicData": "Yes",
          "organisation": "AirQo",
          "coLocation": "Not available",
          "coLocationNote": "",
          "viewDataUrl": "https://airqo.net/explore-data"
        },
        {
          "id": "66f4a2b3c4d5e6f7a8b9c0d2",
          "name": "US Embassy Kampala",
          "city": "Kampala",
          "country": "Uganda",
          "countryId": "uganda",
          "iso2": "UG",
          "latitude": 0.3123,
          "longitude": 32.5811,
          "type": "Reference",
          "status": "active",
          "lastActive": "2025-09-28T07:30:00.000Z",
          "network": "us-embassy",
          "operator": "US Department of State",
          "equipment": "BAM 1022",
          "manufacturer": "Met One Instruments",
          "pollutants": ["PM2.5"],
          "resolution": "Hourly",
          "transmission": "Fiber",
          "site": "US Embassy compound",
          "landUse": "Institutional",
          "deployed": "2019-03-01",
          "publicData": "Yes",
          "organisation": "US Department of State",
          "coLocation": "Not available",
          "coLocationNote": "",
          "viewDataUrl": "https://airnow.gov"
        }
      ]
    }
  ],
  "meta": {
    "totalCountries": 30,
    "monitoredCountries": 12,
    "totalMonitors": 1840,
    "totalPopulationReached": 84500000,
    "citiesWithPopulationData": 46,
    "availableNetworks": ["airqo", "kcca", "us-embassy"],
    "generatedAt": "2025-09-28T09:00:00.000Z"
  }
}
```

Notice that a single country's `monitors[]` mixes an AirQo low-cost sensor with a US Embassy reference monitor from a different manufacturer entirely — that's the point of a shared backend: one query returns the whole monitoring landscape for that country, not just one organisation's fleet.

**Response fields**

| Field | Description |
|-------|-------------|
| `countries[].id` | A slug derived from the country name — use this as `{countryId}` below |
| `countries[].stats` | Per-country monitor counts, broken down by `type` and by `status` |
| `countries[].monitors[]` | Full monitor objects — see [Monitor Details](./monitor-details.md) for the complete field list |
| `meta.totalCountries` | Total African countries tracked (monitored or not) |
| `meta.monitoredCountries` | Countries that have at least one monitor |
| `meta.availableNetworks` | Every distinct `network` value present in the dataset — use this to populate a network filter dropdown |
| `cityMatches[]` | Only present when `search` is sent — see [City matches for search](#city-matches-for-search) below |

### City matches for search

When you send `search`, the response gains a top-level `cityMatches` array, between `countries` and `meta`. It isn't returned at all when `search` is omitted.

`cityMatches` lists the cities whose **name contains the search term**. Cities that only appear in `countries` because their country matched (for example, every Kenyan city for `search=KE` or `search=Kenya`) are left out. Entries are ordered:

1. Exact name match first
2. Then names that start with the term
3. Then by monitor count, highest first

**Example — searching for a city**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage?search=Nairobi&token={SECRET_TOKEN}"
```

```json
{
  "success": true,
  "message": "Network coverage data retrieved successfully",
  "countries": [
    {
      "id": "kenya",
      "country": "Kenya",
      "iso2": "KE",
      "stats": { "total": 77, "Reference": 3, "LCS": 74, "Inactive": 0, "active": 57, "inactive": 20 },
      "monitors": [
        {
          "id": "67a1c2d3e4f5a6b7c8d9e0f1",
          "name": "Nairobi CBD",
          "city": "Nairobi",
          "country": "Kenya",
          "countryId": "kenya",
          "iso2": "KE",
          "latitude": -1.2864,
          "longitude": 36.8172,
          "type": "LCS",
          "status": "active",
          "network": "airqo",
          "operator": "AirQo",
          "manufacturer": "AirQo"
        }
      ]
    }
  ],
  "cityMatches": [
    {
      "city": "Nairobi",
      "country": "Kenya",
      "countryId": "kenya",
      "iso2": "KE",
      "total": 77,
      "active": 57,
      "inactive": 20,
      "center": { "latitude": -1.27, "longitude": 36.85 }
    }
  ],
  "meta": {
    "totalCountries": 30,
    "monitoredCountries": 1,
    "totalMonitors": 77,
    "totalPopulationReached": 4400000,
    "citiesWithPopulationData": 1,
    "availableNetworks": ["airqo"],
    "generatedAt": "2025-09-28T09:00:00.000Z"
  }
}
```

*(Only one monitor is shown here, with a few of its fields. The full response lists every matched monitor, with the complete set of fields shown in the first example.)*

| Field | Description |
|-------|-------------|
| `city`, `country`, `iso2` | The matched city and its country |
| `countryId` | The country slug — the same value as `countries[].id`, usable as `{countryId}` below |
| `total`, `active`, `inactive` | Monitor counts in that city |
| `center` | The average position of the city's monitors, for zooming the map to the city. `null` if none of its monitors have coordinates. |

:::tip Open the city, not just its country
`cityMatches` lets a search box jump straight to a city. If the first entry is an exact match for what the user typed, zoom the map to its `center` and show that city's monitors (filter the country's `monitors[]` on `city`), instead of only opening the whole country. If `center` is `null`, fall back to opening the country by `countryId`.
:::

---

## Get monitors for a single country

```http
GET /api/v2/devices/network-coverage/countries/{countryId}/monitors?token={SECRET_TOKEN}
```

Returns one country's monitors. Use this when a user selects a country instead of re-filtering the full summary client-side — it's the same shape, scoped server-side.

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `countryId` | The `id` value from a country in the summary response (e.g. `uganda`) |

**Query parameters**

Same as the summary endpoint, minus `search`: `token`, `activeOnly`, `types`, `network`.

**Example**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage/countries/uganda/monitors?token={SECRET_TOKEN}"
```

**Example response**

Each entry in `monitors[]` is a full monitor object — the same shape returned by [Monitor Details](./monitor-details.md), and the same shape used in the summary endpoint above:

```json
{
  "success": true,
  "message": "Successfully retrieved monitors for Uganda",
  "countryId": "uganda",
  "country": "Uganda",
  "iso2": "UG",
  "monitors": [
    {
      "id": "64f7b3e8c9d25a0013f2d456",
      "name": "Kampala Road",
      "city": "Kampala",
      "country": "Uganda",
      "countryId": "uganda",
      "iso2": "UG",
      "latitude": 0.3476,
      "longitude": 32.5825,
      "type": "LCS",
      "status": "active",
      "lastActive": "2025-09-28T08:45:00.000Z",
      "network": "airqo",
      "operator": "AirQo",
      "equipment": "AirQo BAM Node",
      "manufacturer": "AirQo",
      "pollutants": ["PM2.5", "PM10"],
      "resolution": "Hourly",
      "transmission": "GSM",
      "site": "Kampala Road, Kampala",
      "landUse": "Roadside",
      "deployed": "2020-12-01",
      "calibrationLastDate": "2025-06-01",
      "calibrationMethod": "Field co-location",
      "uptime30d": "96%",
      "publicData": "Yes",
      "organisation": "AirQo",
      "coLocation": "Not available",
      "coLocationNote": "",
      "viewDataUrl": "https://airqo.net/explore-data"
    }
  ]
}
```

---

## Next steps

- [View a single monitor's full profile →](./monitor-details.md)
- [Pull aggregate impact statistics →](./impact-statistics.md)
