---
sidebar_position: 4
sidebar_label: Impact Statistics
---

# Impact Statistics

Returns the aggregate numbers behind an Africa Network Map — total monitors, breakdowns by type/status/manufacturer, and estimated population reached, across every network in the registry. Use it for a map's headline stats or for landscape reporting.

---

## Get impact summary

```http
GET /api/v2/devices/network-coverage/impact?token={SECRET_TOKEN}
```

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `tenant` | string | Optional. The organisation instance to query. Defaults to `airqo`. |
| `activeOnly` | boolean | Optional. Restrict all counts to active monitors. |
| `types` | string | Optional. Comma-separated: `Reference`, `LCS`. |
| `network` | string | Optional. Comma-separated network names. |

**Example**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage/impact?token={SECRET_TOKEN}"
```

**Example response**

```json
{
  "success": true,
  "message": "Impact summary retrieved successfully",
  "impact": {
    "totalMonitors": 1840,
    "byType": { "Reference": 62, "LCS": 1712, "Inactive": 66 },
    "byStatus": { "active": 1774, "inactive": 66 },
    "totalCities": 128,
    "totalCountries": 30,
    "totalPopulationReached": 84500000,
    "citiesWithPopulationData": 46,
    "byCountry": [
      {
        "country": "Uganda",
        "iso2": "UG",
        "population": 45700000,
        "total": 142,
        "Reference": 4,
        "LCS": 138,
        "active": 136,
        "inactive": 6
      }
    ],
    "byCity": [
      {
        "city": "Kampala",
        "country": "Uganda",
        "iso2": "UG",
        "population": 1680000,
        "total": 58,
        "Reference": 2,
        "LCS": 56,
        "active": 55,
        "inactive": 3
      }
    ],
    "bySensorManufacturer": [
      {
        "sensorManufacturer": "AirQo",
        "totalMonitors": 1600,
        "byType": { "Reference": 0, "LCS": 1560, "Inactive": 40 },
        "byStatus": { "active": 1560, "inactive": 40 },
        "totalCities": 90,
        "totalCountries": 22,
        "totalPopulationReached": 60000000,
        "citiesWithPopulationData": 38,
        "byCountry": [],
        "byCity": []
      }
    ],
    "generatedAt": "2025-09-28T09:00:00.000Z"
  }
}
```

**Response fields**

| Field | Description |
|-------|-------------|
| `totalMonitors`, `byType`, `byStatus` | Global counts across all matched monitors |
| `totalCities`, `totalCountries` | Distinct cities/countries with at least one monitor |
| `totalPopulationReached` | Sum of population figures (from [City Population Data](./city-population-data.md)) for every city with a monitor — `null` where population data isn't available for enough cities to compute a meaningful figure |
| `citiesWithPopulationData` | How many of `totalCities` have a known population — use this alongside `totalPopulationReached` to gauge coverage of the population estimate itself |
| `byCountry[]`, `byCity[]` | Per-country / per-city breakdowns with the same shape as the top-level counts, plus `population` |
| `bySensorManufacturer[]` | The same full breakdown, scoped to each manufacturer — lets you answer "how much of the network does manufacturer X cover?" |

:::note Monitor counts are sites, not devices
Every count here (`totalMonitors`, `byType`, `byCountry[].total`, and so on) counts **monitored sites**, the same points shown on the map. An AirQo site is counted only if it has at least one deployed device, and counts once however many devices are deployed there. Each community-registered entry counts once. So these totals aren't a device inventory and won't match a network's own device count, which includes undeployed devices. See [What a monitor count means →](./intro.md#what-a-monitor-count-means).
:::

:::note Population figures are estimates
`totalPopulationReached` reflects a monitor being present *somewhere* in a city, not real coverage radius or air-quality representativeness across that city's full population. Treat it as a headline number, not a scientific exposure estimate.
:::

---

## Next steps

- [See where population figures come from →](./city-population-data.md)
- [Export the underlying data →](./csv-export.md)
