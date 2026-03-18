# Network Coverage API Contract (Backend Required Fields)

This document defines the backend payload contract needed for the current and enhanced Network Coverage experience.

## Scope

This contract supports:

- map rendering (monitor nodes and choropleth coverage)
- country selection from sidebar
- monitor selection from map node or sidebar item
- full monitor detail panel rendering
- header export actions
- View data action on monitor details

## Base

- Base URL example: `https://api.airqo.net/v2`
- Content type: `application/json` (except file exports)
- Timestamp format: ISO 8601 UTC
- Coordinates: decimal degrees (`latitude`, `longitude`)

## Enumerations

```ts
type MonitorType = 'Reference' | 'LCS' | 'Inactive';
type MonitorStatus = 'active' | 'inactive';
type YesNo = 'Yes' | 'No';
```

## 1) Coverage + Monitor List (Primary Page Payload)

`GET /network-coverage`

Returns all countries and monitor points used for:

- left sidebar country list and monitor list
- map monitor nodes
- choropleth monitor count per country (computed as `country.monitors.length`)

### Query parameters (optional)

- `search` (string): search by country/city/station/network
- `activeOnly` (boolean query string): filter to active monitors only when set to the string `"true"`.

  Notes: Query parameters are serialized as strings. The backend MUST accept the following case-insensitive string values for `activeOnly`:
  - `true` — return only active monitors
  - `false` — return active and inactive monitors (no filtering)

  If `activeOnly` is omitted, the service SHOULD return both active and inactive monitors (i.e., do not filter by activity). Treat unknown values as `false` (no filtering).

- `types` (csv): one or more values from `Reference,LCS,Inactive`

### Response shape

```ts
type NetworkCoverageResponse = {
  countries: CountryCoverage[];
  meta?: {
    totalCountries?: number;
    monitoredCountries?: number;
    generatedAt?: string;
  };
};

type CountryCoverage = {
  id: string; // slug, e.g. "uganda"
  country: string; // e.g. "Uganda"
  iso2: string; // ISO 3166-1 alpha-2, e.g. "UG"
  monitors: MonitorListItem[];
};

type MonitorListItem = {
  id: string;
  name: string;
  city: string;
  country: string;
  iso2: string;
  latitude: number;
  longitude: number;
  type: MonitorType;
  status: MonitorStatus;
  lastActive: string;

  // Required because the details panel and monitor cards rely on these values.
  network: string;
  operator: string;
  equipment: string;
  manufacturer: string;
  pollutants: string[];
  resolution: string;
  transmission: string;
  site: string;
  landUse: string;
  deployed: string;
  calibrationLastDate: string;
  calibrationMethod: string;
  uptime30d: string;
  publicData: YesNo;
  organisation: string;
  coLocation: string;
  coLocationNote: string;

  // Required for View data action.
  viewDataUrl?: string;
};
```

### Minimal response example

```json
{
  "countries": [
    {
      "id": "egypt",
      "country": "Egypt",
      "iso2": "EG",
      "monitors": [
        {
          "id": "eg-cairo-ref-01",
          "name": "Cairo Reference Node",
          "city": "Cairo",
          "country": "Egypt",
          "iso2": "EG",
          "latitude": 30.0444,
          "longitude": 31.2357,
          "type": "Reference",
          "status": "active",
          "lastActive": "2026-03-18T10:21:00Z",
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
      ]
    }
  ],
  "meta": {
    "totalCountries": 54,
    "monitoredCountries": 7,
    "generatedAt": "2026-03-18T10:21:00Z"
  }
}
```

## 2) Monitor Detail (Optional if full fields already in list)

`GET /network-coverage/monitors/{monitorId}`

Use this when monitor details are fetched on demand instead of being embedded in the list payload.

### Response shape

```ts
type MonitorDetailResponse = MonitorListItem;
```

## 3) Country Monitor List (Optional convenience endpoint)

`GET /network-coverage/countries/{countryId}/monitors`

Useful if countries are loaded first and monitor list is loaded per selected country.

### Query parameters (optional)

- `activeOnly` (boolean query string)

  Notes: Accept the case-insensitive strings `"true"` or `"false"`. When `"true"`, return only active monitors. When omitted or any other value, return both active and inactive monitors.

- `types` (csv)

### Response shape

```ts
type CountryMonitorsResponse = {
  countryId: string;
  country: string;
  iso2: string;
  monitors: MonitorListItem[];
};
```

## 4) Export Endpoints (Header action)

The page currently supports CSV/PDF exports from the header. If export should be server-generated:

- `GET /network-coverage/export.csv`
- `GET /network-coverage/export.pdf`

### Query parameters (optional)

- `countryId` (string)
- `activeOnly` (boolean query string)

  Notes: Accept the case-insensitive strings `"true"` or `"false"`. When `"true"`, return only active monitors. When omitted or any other value, return both active and inactive monitors.

- `types` (csv)
- `search` (string)

### CSV header

```csv
Country,City,Monitor Name,Type,Status,Latitude,Longitude,Last Active
```

## Interaction Requirements for Backend

- When user clicks a map node or a monitor item from sidebar, the selected monitor record must contain all detail fields required by the detail panel.
- `id` must be globally unique and stable across requests.
- `iso2` must be valid ISO alpha-2 code so map-country selection works correctly.
- `latitude` and `longitude` must always be numeric (not strings).
- `pollutants` must be a non-null array (empty array if unknown).
- `publicData` must be either `Yes` or `No`.
- `viewDataUrl` should be returned when available to make the View data button resolve to monitor-specific data.

## Error envelope

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Recommended common codes:

- `BAD_REQUEST`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `INTERNAL_ERROR`
