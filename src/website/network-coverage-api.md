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

| Source                          | Description                                                                                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AirQo pipeline sites**        | Sites from the internal `Site` collection that have at least one device with `isActive: true`. Automatically included whenever a device is deployed via the standard activity pipeline. |
| **Standalone registry entries** | External monitors contributed by open data contributors (Wikipedia-style). All fields, including location and status, live in the `NetworkCoverageRegistry` collection.                 |

---

## Common Query Parameters

The following parameter is accepted by every endpoint.

| Param    | Type   | Required | Description                             |
| -------- | ------ | -------- | --------------------------------------- |
| `tenant` | string | No       | Tenant identifier. Defaults to `airqo`. |

---

## Endpoints

### 1. Primary Page Payload

```
GET /api/v2/devices/network-coverage
```

Returns all countries and their monitor points. This is the main endpoint — it drives the map nodes, sidebar country list, sidebar monitor list, and choropleth country shading (`country.monitors.length`).

#### Query Parameters

| Param        | Type              | Required | Description                                                             |
| ------------ | ----------------- | -------- | ----------------------------------------------------------------------- |
| `search`     | string            | No       | Filter by country name, city, monitor name, or network.                 |
| `activeOnly` | `true` \| `false` | No       | When `true`, returns only monitors where `status = active`.             |
| `types`      | CSV string        | No       | Filter by monitor type. Allowed values: `Reference`, `LCS`, `Inactive`. |

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

| Param       | Type            | Required | Description             |
| ----------- | --------------- | -------- | ----------------------- |
| `monitorId` | ObjectId string | Yes      | The monitor identifier. |

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

| Country name                     | `countryId`                        |
| -------------------------------- | ---------------------------------- |
| Uganda                           | `uganda`                           |
| South Africa                     | `south-africa`                     |
| Democratic Republic of the Congo | `democratic-republic-of-the-congo` |
| Côte d'Ivoire                    | `cote-divoire`                     |

#### Path Parameters

| Param       | Type   | Required | Description                   |
| ----------- | ------ | -------- | ----------------------------- |
| `countryId` | string | Yes      | URL slug of the country name. |

#### Query Parameters

| Param        | Type              | Required | Description                     |
| ------------ | ----------------- | -------- | ------------------------------- |
| `activeOnly` | `true` \| `false` | No       | Active monitors only.           |
| `types`      | CSV string        | No       | `Reference`, `LCS`, `Inactive`. |

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

| Param        | Type              | Required | Description                                        |
| ------------ | ----------------- | -------- | -------------------------------------------------- |
| `countryId`  | string            | No       | Slug — limits export to one country.               |
| `activeOnly` | `true` \| `false` | No       | Active monitors only.                              |
| `types`      | CSV string        | No       | `Reference`, `LCS`, `Inactive`.                    |
| `search`     | string            | No       | Filter by country, city, monitor name, or network. |

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

### 5. Frontend PDF Export

The website generates PDF downloads on the client from the same filtered monitor data used for the map and sidebar. This keeps the export layout consistent without depending on a backend PDF endpoint.

The current implementation uses a table-based PDF renderer so the report stays readable across multiple pages.

#### Output Format

- `jsPDF` for document generation
- `jspdf-autotable` for the tabular layout

#### Included Columns

```
Country, City, Monitor, Type, Status, Network, Operator, Coordinates, Uptime (30d), Last Active, Public Data
```

---

## Read-Only Contract

The current frontend uses this API in read-only mode only. The supported interactions are summary/list loading, country monitor loading, individual monitor detail loading, and CSV download. No create, update, or delete operations are used by the website.

---

## MonitorListItem Schema

Every monitor object returned across all endpoints shares this shape.

| Field                 | Type            | Description                                                                                             |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `id`                  | string          | Globally unique, stable identifier. Site `_id` for AirQo monitors; registry `_id` for external entries. |
| `name`                | string          | Display name of the monitor.                                                                            |
| `city`                | string          | City or town.                                                                                           |
| `country`             | string          | Full country name.                                                                                      |
| `iso2`                | string          | ISO 3166-1 alpha-2 country code.                                                                        |
| `latitude`            | number          | Approximate latitude (decimal degrees). Always numeric.                                                 |
| `longitude`           | number          | Approximate longitude (decimal degrees). Always numeric.                                                |
| `type`                | `MonitorType`   | `Reference`, `LCS`, or `Inactive`.                                                                      |
| `status`              | `MonitorStatus` | `active` — currently streaming data. `inactive` — deployed but not currently streaming.                 |
| `lastActive`          | ISO 8601 string | Last known activity timestamp. Empty string if unknown.                                                 |
| `network`             | string          | Network name.                                                                                           |
| `operator`            | string          | Organisation operating the monitor.                                                                     |
| `equipment`           | string          | Instrument model.                                                                                       |
| `manufacturer`        | string          | Instrument manufacturer.                                                                                |
| `pollutants`          | string[]        | Measured parameters. Empty array if unknown — never null.                                               |
| `resolution`          | string          | Measurement frequency.                                                                                  |
| `transmission`        | string          | Data transmission method.                                                                               |
| `site`                | string          | Human-readable site description.                                                                        |
| `landUse`             | string          | Land-use classification.                                                                                |
| `deployed`            | string          | Deployment date.                                                                                        |
| `calibrationLastDate` | string          | Date of most recent calibration.                                                                        |
| `calibrationMethod`   | string          | Calibration approach.                                                                                   |
| `uptime30d`           | string          | 30-day uptime percentage.                                                                               |
| `publicData`          | `YesNo`         | Whether data is publicly accessible.                                                                    |
| `organisation`        | string          | Institutional owner.                                                                                    |
| `coLocation`          | string          | Co-location status.                                                                                     |
| `coLocationNote`      | string          | Additional co-location context.                                                                         |
| `viewDataUrl`         | string          | Deep-link to a monitor-specific data portal. Empty string if not available.                             |

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

| HTTP Status                 | When                                                |
| --------------------------- | --------------------------------------------------- |
| `400 Bad Request`           | Validation errors in query params or request body.  |
| `404 Not Found`             | Monitor, country, or registry entry does not exist. |
| `500 Internal Server Error` | Unexpected server-side failure.                     |
| `501 Not Implemented`       | PDF export endpoint.                                |

---

## Implementation Notes

- **No sync job required.** AirQo pipeline sites appear automatically — the list endpoint queries `Device` for `isActive: true` at request time, so any site with a deployed device is included without any manual registry step.
- **Coordinates are approximate.** All coordinates use the `approximate_latitude` / `approximate_longitude` fields from the Site model (offset within 0.5 km) for privacy. External entries should also supply approximate coordinates.
- **`id` stability.** The `id` field for AirQo monitors is the Site MongoDB `_id`, which is immutable. For external entries it is the registry document `_id`, also immutable after creation.
- **`pollutants` is never null.** The field always returns an array (empty `[]` when unknown).
- **`publicData` is always `"Yes"` or `"No"`.** Never a boolean, never null.
- **ISO2 derivation.** When `iso2` is not explicitly set on a registry entry, the API derives it from the `country` name using a built-in lookup table covering all African countries and common global ones. Pass `iso2` explicitly in the body to override.
