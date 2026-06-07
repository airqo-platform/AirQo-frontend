---
sidebar_position: 6
sidebar_label: Metadata API
---

# Metadata API

The Metadata API lets you browse the AirQo monitoring infrastructure — grids, cohorts, sites, devices, and geographic boundaries — so you can discover the right identifiers before querying measurement or forecast data.

All endpoints require your `token` query parameter. See [Authentication →](../getting-started/authentication.md).

---

## Grids

Grids are geographically-defined groupings of monitoring sites, typically aligned to a city or administrative district.

### List all grids

```
GET /api/v2/devices/metadata/grids?token={SECRET_TOKEN}
```

Returns all publicly visible grids.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | string | — | Required |
| `limit` | integer | 1000 | Max results per page (max: 2000) |
| `skip` | integer | 0 | Records to skip |

**Example response**

```json
{
  "success": true,
  "grids": [
    {
      "_id": "64b7ac8fd7249f0029feca80",
      "name": "nairobi_city",
      "long_name": "Nairobi City",
      "admin_level": "city",
      "visibility": true,
      "network": "airqo",
      "createdAt": "2023-07-19T10:25:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "skip": 0,
    "limit": 1000,
    "page": 1,
    "pages": 1
  }
}
```

---

### Grid summary with site details

```
GET /api/v2/devices/grids/summary?token={SECRET_TOKEN}
```

Returns grids with their constituent site details nested inside. This is the most useful endpoint for **discovering Grid IDs and the sites within them**.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `admin_level` | string | Filter by level: `country`, `province`, `city`, `district`, `subcounty`, `county`, `division`, `parish` |
| `id` | string | Filter by a specific Grid ID |

**Example — filter to city-level grids**

```bash
curl "https://api.airqo.net/api/v2/devices/grids/summary?admin_level=city&token=YOUR_SECRET_TOKEN"
```

**Example response**

```json
{
  "success": true,
  "grids": [
    {
      "_id": "64b7ac8fd7249f0029feca80",
      "name": "nairobi_city",
      "long_name": "Nairobi City",
      "admin_level": "city",
      "visibility": true,
      "network": "airqo",
      "numberOfSites": 12,
      "createdAt": "2023-07-19T10:25:00.000Z",
      "sites": [
        {
          "_id": "64f7b3e8c9d25a0013f2d456",
          "name": "nairobi_road",
          "long_name": "Nairobi Road, Nairobi",
          "latitude": -1.2921,
          "longitude": 36.8219,
          "data_provider": "airqo"
        }
      ]
    }
  ]
}
```

---

### Get a single grid

```
GET /api/v2/devices/metadata/grids/{GRID_ID}?token={SECRET_TOKEN}
```

Returns full details for one grid.

---

### Get all site and device IDs for a grid

```
GET /api/v2/devices/grids/{GRID_ID}/generate?token={SECRET_TOKEN}
```

Returns every site and device ID belonging to the grid. Use this to build a list of `site_id` or `device_id` values for measurement and forecast queries.

**Example response**

```json
{
  "success": true,
  "sites": [
    {
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "site_name": "Nairobi Road",
      "devices": [
        {
          "device_id": "65c8d4a2f1b45c0012a3e789",
          "device_name": "airqo_bx2847"
        }
      ]
    }
  ]
}
```

---

### List countries

```
GET /api/v2/devices/grids/countries?token={SECRET_TOKEN}
```

Returns all countries that have AirQo monitoring coverage. Useful for filtering the grid summary by country before drilling down to a city.

---

## Cohorts

Cohorts are organisationally-defined groups of devices, managed by the AirQo team on behalf of partner organisations.

### List all public cohorts

```
GET /api/v2/devices/metadata/cohorts?token={SECRET_TOKEN}
```

Returns all publicly visible cohorts.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | string | — | Required |
| `limit` | integer | 1000 | Max results per page (max: 2000) |
| `skip` | integer | 0 | Records to skip |

**Example response**

```json
{
  "success": true,
  "cohorts": [
    {
      "_id": "64b9c7d5e3f82b0014c5a123",
      "name": "partner_network",
      "long_name": "Partner Monitoring Network",
      "visibility": true,
      "network": "airqo",
      "createdAt": "2023-08-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "skip": 0,
    "limit": 1000,
    "page": 1,
    "pages": 1
  }
}
```

:::note Private Cohorts
Private cohorts do not appear in this list. If your organisation has a private Cohort, contact [support@airqo.net](mailto:support@airqo.net) to obtain your Cohort ID.
:::

---

### Get a single cohort

```
GET /api/v2/devices/metadata/cohorts/{COHORT_ID}?token={SECRET_TOKEN}
```

Returns full details for one cohort.

---

### Get all site and device IDs for a cohort

```
GET /api/v2/devices/cohorts/{COHORT_ID}/generate?token={SECRET_TOKEN}
```

Returns every site and device ID belonging to the cohort. The structure matches the grid generate endpoint.

**Example response**

```json
{
  "success": true,
  "sites": [
    {
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "site_name": "Kampala Central",
      "devices": [
        {
          "device_id": "65c8d4a2f1b45c0012a3e789",
          "device_name": "airqo_bx2847"
        }
      ]
    }
  ]
}
```

---

## Sites

Sites are fixed physical locations where sensors are deployed.

### List all public sites

```
GET /api/v2/devices/metadata/sites?token={SECRET_TOKEN}
```

Returns all publicly visible monitoring sites.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | string | — | Required |
| `limit` | integer | 1000 | Max results per page (max: 2000) |
| `skip` | integer | 0 | Records to skip |

**Example response**

```json
{
  "success": true,
  "sites": [
    {
      "_id": "64f7b3e8c9d25a0013f2d456",
      "name": "kampala_road",
      "long_name": "Kampala Road, Kampala",
      "generated_name": "Kampala Road",
      "latitude": 0.3476,
      "longitude": 32.5825,
      "network": "airqo",
      "visibility": true,
      "online_status": "online"
    }
  ],
  "meta": {
    "total": 250,
    "skip": 0,
    "limit": 1000,
    "page": 1,
    "pages": 1
  }
}
```

---

### Get a single site

```
GET /api/v2/devices/metadata/sites/{SITE_ID}?token={SECRET_TOKEN}
```

Returns full details for one monitoring site, including coordinates, administrative context, and current online status.

---

## Devices

Devices are individual sensor units. Each device is deployed at a site.

### List all public devices

```
GET /api/v2/devices/metadata/devices?token={SECRET_TOKEN}
```

Returns all publicly visible devices.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | string | — | Required |
| `limit` | integer | 1000 | Max results per page (max: 2000) |
| `skip` | integer | 0 | Records to skip |

**Example response**

```json
{
  "success": true,
  "devices": [
    {
      "_id": "65c8d4a2f1b45c0012a3e789",
      "name": "airqo_bx2847",
      "category": "lowcost",
      "status": "deployed",
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "network": "airqo",
      "isOnline": true,
      "lastActive": "2025-09-28T08:45:00.000Z"
    }
  ],
  "meta": {
    "total": 850,
    "skip": 0,
    "limit": 1000,
    "page": 1,
    "pages": 1
  }
}
```

**Device categories**

| Category | Description |
|----------|-------------|
| `lowcost` | Low-cost optical particle sensors (the majority of AirQo devices) |
| `bam` | Beta Attenuation Monitor — reference-grade instruments |
| `gas` | Gas sensor units |

---

### Get a single device

```
GET /api/v2/devices/metadata/devices/{DEVICE_ID}?token={SECRET_TOKEN}
```

Returns full details for one device, including its deployment site and online status.

---

## Locations

The locations endpoint lets you browse administrative boundaries at different geographic levels — useful for understanding what areas AirQo covers before querying a grid.

### List locations

```
GET /api/v2/devices/locations?token={SECRET_TOKEN}
```

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `admin_level` | string | Filter by level: `country`, `province`, `state`, `district`, `county`, `subcounty`, `division`, `parish`, `village` |
| `name` | string | Filter by location name (partial match) |
| `limit` | integer | Max results per page |
| `skip` | integer | Records to skip |

**Example — list all countries**

```bash
curl "https://api.airqo.net/api/v2/devices/locations?admin_level=country&token=YOUR_SECRET_TOKEN"
```

---

## Pagination

All list endpoints support `limit` and `skip` parameters for pagination. The `meta` object in every response includes `total`, `page`, and `pages` to help you navigate large result sets.

**Example — page through all sites in blocks of 100**

```bash
# Page 1
curl "https://api.airqo.net/api/v2/devices/metadata/sites?limit=100&skip=0&token=YOUR_SECRET_TOKEN"

# Page 2
curl "https://api.airqo.net/api/v2/devices/metadata/sites?limit=100&skip=100&token=YOUR_SECRET_TOKEN"
```

---

## Common workflows

### Find a Grid ID for a city

1. Call the grid summary endpoint with `admin_level=city`
2. Locate your city by `long_name`
3. Copy the `_id` value — that is your Grid ID

### Find all Site IDs in your Grid

1. Call `GET /api/v2/devices/grids/{GRID_ID}/generate`
2. Collect the `site_id` from each entry in the `sites` array

### Find all Device IDs in your Cohort

1. Call `GET /api/v2/devices/cohorts/{COHORT_ID}/generate`
2. For each site, collect `device_id` values from the nested `devices` array

---

See also: [Finding IDs →](./finding-ids.md)
