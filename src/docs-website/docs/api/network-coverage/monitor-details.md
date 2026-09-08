---
sidebar_position: 3
sidebar_label: Monitor Details
---

# Monitor Details

Fetches the full profile for one monitor — this is what fills the detail panel when a user clicks a pin on the map.

---

## Get a single monitor

```http
GET /api/v2/devices/network-coverage/monitors/{monitorId}?token={SECRET_TOKEN}
```

**Path parameters**

| Parameter | Description |
|-----------|-------------|
| `monitorId` | The `id` of a monitor, from the summary or country-monitors response |

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `tenant` | string | Optional. Defaults to `airqo`. |

**Example**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage/monitors/66f4a2b3c4d5e6f7a8b9c0d2?token={SECRET_TOKEN}"
```

**Example response**

```json
{
  "success": true,
  "message": "Successfully retrieved monitor",
  "monitor": {
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
    "calibrationLastDate": "",
    "calibrationMethod": "",
    "uptime30d": "",
    "publicData": "Yes",
    "organisation": "US Department of State",
    "coLocation": "Not available",
    "coLocationNote": "",
    "viewDataUrl": "https://airnow.gov"
  }
}
```

This particular monitor happens to be a reference instrument contributed by another operator, not an AirQo device — the shape of the response is identical either way, which is the point: your client code doesn't need to special-case who runs a monitor.

**Monitor fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Monitor identifier |
| `name` | string | Monitor / site name |
| `city`, `country`, `countryId`, `iso2` | string | Location context — `countryId` matches the `id` used in [Monitors & Countries](./monitors-and-countries.md) |
| `latitude`, `longitude` | number | Coordinates used to place the pin |
| `type` | `Reference` \| `LCS` \| `Inactive` | Hardware category |
| `status` | `active` \| `inactive` | Current operational status |
| `lastActive` | string (ISO date) | Last time the monitor reported data |
| `network` | string | The operating network — matches a value in `meta.availableNetworks` from the summary endpoint |
| `operator`, `organisation` | string | Who runs the monitor |
| `equipment`, `manufacturer` | string | Hardware details |
| `pollutants` | string[] | Pollutants measured, e.g. `["PM2.5", "PM10"]` |
| `resolution` | string | Sampling/reporting frequency, e.g. `"Hourly"` |
| `transmission` | string | How data reaches the server, e.g. `"GSM"` |
| `site`, `landUse` | string | Physical site description |
| `deployed` | string | Deployment date |
| `calibrationLastDate`, `calibrationMethod` | string | Calibration history |
| `uptime30d` | string | Rolling 30-day uptime, e.g. `"96%"` |
| `publicData` | `Yes` \| `No` | Whether this monitor's readings are publicly viewable |
| `coLocation`, `coLocationNote` | string | Co-location details, if any |
| `viewDataUrl` | string | Link to view this monitor's live data, when `publicData` is `Yes` |

:::note Coordinate approximation
Like the rest of the API, coordinates for AirQo-owned sites are subject to the [~0.5 km privacy approximation](../../data-access/researchers-guide/location-approximation.md). Monitors contributed by other operators via the [community registry](./community-registry.md) are not adjusted.
:::

---

## Next steps

- [Back to country monitor lists →](./monitors-and-countries.md)
- [Pull aggregate impact statistics →](./impact-statistics.md)
