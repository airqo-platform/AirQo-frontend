# Network Coverage API

**Service:** `device-registry`
**Base path:** `/api/v2/devices/network-coverage`
**Content-Type:** `application/json` (except CSV export)
**Timestamp format:** ISO 8601 UTC
**Coordinates:** Decimal degrees — `latitude`, `longitude` (approximate, within 0.5 km radius for privacy)

---

## Enumerations

```
MonitorType   : "Reference" | "LCS" | "Inactive"
MonitorStatus : "active" | "inactive"
YesNo         : "Yes" | "No"
```

---

## Data Sources

The API unions two data sources at query time — no manual sync is required.

| Source | Description |
|---|---|
| **AirQo pipeline sites** | Sites from the internal `Site` collection that have at least one device with `isActive: true`. Automatically included whenever a device is deployed via the standard activity pipeline. |
| **Standalone registry entries** | External monitors contributed by open data contributors (Wikipedia-style). All fields, including location and status, live in the `NetworkCoverageRegistry` collection. |

---

## Common Query Parameters

The following parameter is accepted by every endpoint.

| Param | Type | Required | Description |
|---|---|---|---|
| `tenant` | string | No | Tenant identifier. Defaults to `airqo`. |

---

## Endpoints

### 1. Primary Page Payload

```
GET /api/v2/devices/network-coverage
```

Returns all countries and their monitor points. This is the main endpoint — it drives the map nodes, sidebar country list, sidebar monitor list, and choropleth country shading (`country.monitors.length`).

#### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `search` | string | No | Filter by country name, city, monitor name, or network. |
| `activeOnly` | `true` \| `false` | No | When `true`, returns only monitors where `status = active`. |
| `types` | CSV string | No | Filter by monitor type. Allowed values: `Reference`, `LCS`, `Inactive`. |

#### Example Request

```
GET /api/v2/devices/network-coverage?activeOnly=true&types=Reference,LCS
```

#### Example Response

```json
{
  "success": true,
  "message": "Network coverage data retrieved successfully",
  "countries": [
    {
      "id": "uganda",
      "country": "Uganda",
      "iso2": "UG",
      "monitors": [
        {
          "id": "64a1f2c3e4b5d6f7a8b9c0d1",
          "name": "Kampala KCCA Node",
          "city": "Kampala",
          "country": "Uganda",
          "iso2": "UG",
          "latitude": 0.3136,
          "longitude": 32.5811,
          "type": "LCS",
          "status": "active",
          "lastActive": "2026-03-23T08:14:00Z",
          "network": "airqo",
          "operator": "AirQo",
          "equipment": "AirQo v3",
          "manufacturer": "AirQo",
          "pollutants": ["PM2.5", "PM10"],
          "resolution": "Hourly",
          "transmission": "GSM",
          "site": "Nakawa Division offices",
          "landUse": "Urban",
          "deployed": "Jan 2021",
          "calibrationLastDate": "Mar 2025",
          "calibrationMethod": "Field co-location",
          "uptime30d": "91%",
          "publicData": "Yes",
          "organisation": "AirQo — Makerere University",
          "coLocation": "Yes",
          "coLocationNote": "Co-located with KCCA reference monitor",
          "viewDataUrl": "https://analytics.airqo.net"
        }
      ]
    }
  ],
  "meta": {
    "totalCountries": 8,
    "monitoredCountries": 8,
    "generatedAt": "2026-03-23T09:00:00Z"
  }
}
```

---

### 2. Single Monitor Detail

```
GET /api/v2/devices/network-coverage/monitors/:monitorId
```

Returns the full detail record for one monitor. Used when the map node or sidebar item is clicked and full metadata is needed for the detail panel.

`monitorId` is either a Site `_id` (AirQo pipeline monitor) or a registry `_id` (standalone external entry). The API checks both automatically.

#### Path Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `monitorId` | ObjectId string | Yes | The monitor identifier. |

#### Example Request

```
GET /api/v2/devices/network-coverage/monitors/64a1f2c3e4b5d6f7a8b9c0d1
```

#### Example Response

```json
{
  "success": true,
  "message": "Monitor retrieved successfully",
  "monitor": {
    "id": "64a1f2c3e4b5d6f7a8b9c0d1",
    "name": "Kampala KCCA Node",
    "city": "Kampala",
    "country": "Uganda",
    "iso2": "UG",
    "latitude": 0.3136,
    "longitude": 32.5811,
    "type": "LCS",
    "status": "active",
    "lastActive": "2026-03-23T08:14:00Z",
    "network": "airqo",
    "operator": "AirQo",
    "equipment": "AirQo v3",
    "manufacturer": "AirQo",
    "pollutants": ["PM2.5", "PM10"],
    "resolution": "Hourly",
    "transmission": "GSM",
    "site": "Nakawa Division offices",
    "landUse": "Urban",
    "deployed": "Jan 2021",
    "calibrationLastDate": "Mar 2025",
    "calibrationMethod": "Field co-location",
    "uptime30d": "91%",
    "publicData": "Yes",
    "organisation": "AirQo — Makerere University",
    "coLocation": "Yes",
    "coLocationNote": "Co-located with KCCA reference monitor",
    "viewDataUrl": "https://analytics.airqo.net"
  }
}
```

---

### 3. Country Monitor List

```
GET /api/v2/devices/network-coverage/countries/:countryId/monitors
```

Returns all monitors for a specific country. Useful when countries are loaded first and monitors are fetched per selected country.

`countryId` is the URL-slug form of the country name — Unicode diacritics normalised and removed, lowercased, spaces replaced with hyphens, remaining special characters stripped.

| Country name | `countryId` |
|---|---|
| Uganda | `uganda` |
| South Africa | `south-africa` |
| Democratic Republic of the Congo | `democratic-republic-of-the-congo` |
| Côte d'Ivoire | `cote-divoire` |

#### Path Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `countryId` | string | Yes | URL slug of the country name. |

#### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `activeOnly` | `true` \| `false` | No | Active monitors only. |
| `types` | CSV string | No | `Reference`, `LCS`, `Inactive`. |

#### Example Request

```
GET /api/v2/devices/network-coverage/countries/kenya/monitors?activeOnly=true
```

#### Example Response

```json
{
  "success": true,
  "message": "Country monitors retrieved successfully",
  "countryId": "kenya",
  "country": "Kenya",
  "iso2": "KE",
  "monitors": [
    {
      "id": "64b2e3d4f5c6a7b8c9d0e1f2",
      "name": "Nairobi CBD Node",
      "city": "Nairobi",
      "country": "Kenya",
      "iso2": "KE",
      "latitude": -1.2864,
      "longitude": 36.8172,
      "type": "LCS",
      "status": "active",
      "lastActive": "2026-03-23T07:55:00Z",
      "network": "airqo",
      "operator": "AirQo",
      "equipment": "AirQo v3",
      "manufacturer": "AirQo",
      "pollutants": ["PM2.5", "PM10"],
      "resolution": "Hourly",
      "transmission": "GSM",
      "site": "Nairobi City Hall annex",
      "landUse": "Urban",
      "deployed": "Jun 2022",
      "calibrationLastDate": "Jan 2025",
      "calibrationMethod": "Field co-location",
      "uptime30d": "88%",
      "publicData": "Yes",
      "organisation": "AirQo — Makerere University",
      "coLocation": "Not available",
      "coLocationNote": "",
      "viewDataUrl": "https://analytics.airqo.net"
    }
  ]
}
```

---

### 4. CSV Export

```
GET /api/v2/devices/network-coverage/export.csv
```

Downloads a CSV file of all (filtered) monitors. Response `Content-Type` is `text/csv` with `Content-Disposition: attachment; filename="network-coverage.csv"`.

#### Query Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `countryId` | string | No | Slug — limits export to one country. |
| `activeOnly` | `true` \| `false` | No | Active monitors only. |
| `types` | CSV string | No | `Reference`, `LCS`, `Inactive`. |
| `search` | string | No | Filter by country, city, monitor name, or network. |

#### Example Request

```
GET /api/v2/devices/network-coverage/export.csv?countryId=nigeria&activeOnly=true
```

#### CSV Columns

```
Country, City, Monitor Name, Type, Status, Latitude, Longitude, Last Active
```

#### Example CSV Output

```csv
Country,City,Monitor Name,Type,Status,Latitude,Longitude,Last Active
"Nigeria","Lagos","Lagos Island Node","LCS","active",6.4550,3.3841,"2026-03-23T06:30:00Z"
"Nigeria","Abuja","Abuja FCT Node","LCS","active",9.0579,7.4951,"2026-03-23T07:10:00Z"
```

---

### 5. PDF Export

```
GET /api/v2/devices/network-coverage/export.pdf
```

Reserved endpoint. Returns `501 Not Implemented`. Use `export.csv` for data exports in the interim.

#### Response

```json
{
  "success": false,
  "message": "PDF export is not yet implemented",
  "errors": { "message": "Use export.csv for data exports" }
}
```

---

### 6. Upsert Registry Entry

```
POST /api/v2/devices/network-coverage/registry
```

Creates or updates extended metadata for a monitor. Accepts two distinct request shapes depending on whether `site_id` is provided.

---

#### Shape A — Enrich an AirQo pipeline site

Use when you want to add extended metadata (equipment, calibration details, public access flags, etc.) to a monitor that already exists in the AirQo data pipeline. The base fields (name, city, country, latitude, longitude, status, lastActive) are read live from the internal Site document; this body only needs to supply the metadata that the Site schema does not capture.

`site_id` must match an existing AirQo Site `_id`. Submitting this shape a second time for the same `site_id` performs an update (upsert).

**Required fields:** `site_id`

**All other fields are optional.**

```json
{
  "site_id": "64a1f2c3e4b5d6f7a8b9c0d1",
  "type": "LCS",
  "operator": "AirQo",
  "equipment": "AirQo v3",
  "manufacturer": "AirQo",
  "pollutants": ["PM2.5", "PM10"],
  "resolution": "Hourly",
  "transmission": "GSM",
  "site": "Nakawa Division offices",
  "landUse": "Urban",
  "deployed": "Jan 2021",
  "calibrationLastDate": "Mar 2025",
  "calibrationMethod": "Field co-location",
  "uptime30d": "91%",
  "publicData": "Yes",
  "organisation": "AirQo — Makerere University",
  "coLocation": "Yes",
  "coLocationNote": "Co-located with KCCA reference monitor",
  "viewDataUrl": "https://analytics.airqo.net"
}
```

---

#### Shape B — Standalone external monitor

Use when adding a monitor that is **not** part of the AirQo data pipeline — for example, a government reference station, a third-party low-cost sensor network, or any sensor whose data does not flow through AirQo's system. This is the open-contribution path (Wikipedia-style).

**Required fields:** `name`, `country`, `latitude`, `longitude`

**All other fields are optional.** A minimal entry is valid.

```json
{
  "name": "Cairo Reference Node",
  "city": "Cairo",
  "country": "Egypt",
  "latitude": 30.044,
  "longitude": 31.235,
  "type": "Reference",
  "status": "active",
  "lastActive": "2026-03-20T10:00:00Z",
  "network": "Cairo AQ",
  "operator": "Government",
  "equipment": "AQM 65",
  "manufacturer": "Aeroqual",
  "pollutants": ["PM2.5", "PM10", "NO2"],
  "resolution": "Hourly",
  "transmission": "Fiber",
  "site": "Downtown Cairo municipality tower",
  "landUse": "Urban",
  "deployed": "Dec 2020",
  "calibrationLastDate": "Sep 2025",
  "calibrationMethod": "Annual lab calibration",
  "uptime30d": "96%",
  "publicData": "Yes",
  "organisation": "Egyptian Environmental Affairs Agency",
  "coLocation": "Not available",
  "coLocationNote": "Public agency restricted access site.",
  "viewDataUrl": "https://vertex.airqo.net"
}
```

#### Full Request Body Reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_id` | ObjectId string | Conditional | Required for Shape A. Omit for Shape B. |
| `name` | string | Shape B only | Monitor display name. |
| `city` | string | No | City or town name. |
| `country` | string | Shape B only | Full country name (e.g. `"Uganda"`, not `"UG"`). |
| `latitude` | number | Shape B only | Decimal degrees, -90 to 90. |
| `longitude` | number | Shape B only | Decimal degrees, -180 to 180. |
| `iso2` | string (2 chars) | No | ISO 3166-1 alpha-2 code. Derived automatically from `country` when absent. |
| `type` | `MonitorType` | No | `Reference`, `LCS`, or `Inactive`. Defaults to `LCS`. |
| `status` | `MonitorStatus` | No | `active` or `inactive`. Shape B only — AirQo sites derive status from live data. Defaults to `active`. |
| `lastActive` | ISO 8601 string | No | Shape B only. |
| `network` | string | No | Network name (e.g. `"airqo"`, `"Cairo AQ"`). |
| `operator` | string | No | Organisation operating the monitor. |
| `equipment` | string | No | Instrument model (e.g. `"AirQo v3"`, `"AQM 65"`). |
| `manufacturer` | string | No | Instrument manufacturer. |
| `pollutants` | string[] | No | e.g. `["PM2.5", "PM10", "NO2"]`. Defaults to `[]`. |
| `resolution` | string | No | Measurement frequency (e.g. `"Hourly"`, `"Daily"`). |
| `transmission` | string | No | Data transmission method (e.g. `"GSM"`, `"Fiber"`, `"WiFi"`). |
| `site` | string | No | Human-readable site description. |
| `landUse` | string | No | e.g. `"Urban"`, `"Rural"`, `"Industrial"`. |
| `deployed` | string | No | Deployment date in readable form (e.g. `"Dec 2020"`). |
| `calibrationLastDate` | string | No | e.g. `"Sep 2025"`. |
| `calibrationMethod` | string | No | e.g. `"Annual lab calibration"`. |
| `uptime30d` | string | No | 30-day uptime percentage (e.g. `"96%"`). |
| `publicData` | `YesNo` | No | `"Yes"` or `"No"`. Defaults to `"No"`. |
| `organisation` | string | No | Institutional owner / operating organisation. |
| `coLocation` | string | No | Defaults to `"Not available"`. |
| `coLocationNote` | string | No | Additional co-location context. |
| `viewDataUrl` | URL string | No | Deep-link to a data portal for this specific monitor. |

#### Example Response

```json
{
  "success": true,
  "message": "Registry record saved successfully",
  "registry": {
    "_id": "64c3d4e5f6a7b8c9d0e1f2a3",
    "site_id": null,
    "name": "Cairo Reference Node",
    "city": "Cairo",
    "country": "Egypt",
    "latitude": 30.044,
    "longitude": 31.235,
    "type": "Reference",
    "status": "active",
    "createdAt": "2026-03-23T09:15:00Z",
    "updatedAt": "2026-03-23T09:15:00Z"
  }
}
```

---

### 7. Delete Registry Entry

```
DELETE /api/v2/devices/network-coverage/registry/:registryId
```

Removes a registry entry by its document `_id`. Works for both Shape A (AirQo-site enrichment) and Shape B (standalone external) entries. Does **not** affect the underlying `Site` or `Device` documents.

#### Path Parameters

| Param | Type | Required | Description |
|---|---|---|---|
| `registryId` | ObjectId string | Yes | The registry document `_id`. |

#### Example Request

```
DELETE /api/v2/devices/network-coverage/registry/64c3d4e5f6a7b8c9d0e1f2a3
```

#### Example Response

```json
{
  "success": true,
  "message": "Registry record deleted"
}
```

---

## MonitorListItem Schema

Every monitor object returned across all endpoints shares this shape.

| Field | Type | Description |
|---|---|---|
| `id` | string | Globally unique, stable identifier. Site `_id` for AirQo monitors; registry `_id` for external entries. |
| `name` | string | Display name of the monitor. |
| `city` | string | City or town. |
| `country` | string | Full country name. |
| `iso2` | string | ISO 3166-1 alpha-2 country code. |
| `latitude` | number | Approximate latitude (decimal degrees). Always numeric. |
| `longitude` | number | Approximate longitude (decimal degrees). Always numeric. |
| `type` | `MonitorType` | `Reference`, `LCS`, or `Inactive`. |
| `status` | `MonitorStatus` | `active` — currently streaming data. `inactive` — deployed but not currently streaming. |
| `lastActive` | ISO 8601 string | Last known activity timestamp. Empty string if unknown. |
| `network` | string | Network name. |
| `operator` | string | Organisation operating the monitor. |
| `equipment` | string | Instrument model. |
| `manufacturer` | string | Instrument manufacturer. |
| `pollutants` | string[] | Measured parameters. Empty array if unknown — never null. |
| `resolution` | string | Measurement frequency. |
| `transmission` | string | Data transmission method. |
| `site` | string | Human-readable site description. |
| `landUse` | string | Land-use classification. |
| `deployed` | string | Deployment date. |
| `calibrationLastDate` | string | Date of most recent calibration. |
| `calibrationMethod` | string | Calibration approach. |
| `uptime30d` | string | 30-day uptime percentage. |
| `publicData` | `YesNo` | Whether data is publicly accessible. |
| `organisation` | string | Institutional owner. |
| `coLocation` | string | Co-location status. |
| `coLocationNote` | string | Additional co-location context. |
| `viewDataUrl` | string | Deep-link to a monitor-specific data portal. Empty string if not available. |

---

## Error Envelope

All error responses use this shape.

```json
{
  "success": false,
  "message": "Human-readable description of the error",
  "errors": {
    "message": "Detailed error information"
  }
}
```

| HTTP Status | When |
|---|---|
| `400 Bad Request` | Validation errors in query params or request body. |
| `404 Not Found` | Monitor, country, or registry entry does not exist. |
| `500 Internal Server Error` | Unexpected server-side failure. |
| `501 Not Implemented` | PDF export endpoint. |

---

## Implementation Notes

- **No sync job required.** AirQo pipeline sites appear automatically — the list endpoint queries `Device` for `isActive: true` at request time, so any site with a deployed device is included without any manual registry step.
- **Coordinates are approximate.** All coordinates use the `approximate_latitude` / `approximate_longitude` fields from the Site model (offset within 0.5 km) for privacy. External entries should also supply approximate coordinates.
- **`id` stability.** The `id` field for AirQo monitors is the Site MongoDB `_id`, which is immutable. For external entries it is the registry document `_id`, also immutable after creation.
- **`pollutants` is never null.** The field always returns an array (empty `[]` when unknown).
- **`publicData` is always `"Yes"` or `"No"`.** Never a boolean, never null.
- **ISO2 derivation.** When `iso2` is not explicitly set on a registry entry, the API derives it from the `country` name using a built-in lookup table covering all African countries and common global ones. Pass `iso2` explicitly in the body to override.
