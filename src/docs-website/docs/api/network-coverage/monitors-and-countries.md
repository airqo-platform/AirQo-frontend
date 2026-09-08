---
sidebar_position: 2
sidebar_label: Monitors & Countries
---

# Monitors & Countries

These two endpoints power the map's country overview and the per-country drill-down list. Fetch the summary first to render the map, then fetch a single country's monitors when the user clicks into it.

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
| `tenant` | string | Optional. The organisation instance to query. Defaults to `airqo`. |
| `search` | string | Optional. Filters monitors by name, city, or country. |
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

Same as the summary endpoint, minus `search`: `token`, `tenant`, `activeOnly`, `types`, `network`.

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
