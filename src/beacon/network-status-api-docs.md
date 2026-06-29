# AirQo API: Network Status Alert API Documentation

## Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [1. Create Network Status Alert](#1-create-network-status-alert)
  - [2. List Network Status Alerts](#2-list-network-status-alerts)
  - [3. Get Network Statistics](#3-get-network-statistics)
  - [4. Get Hourly Trends](#4-get-hourly-trends)
  - [5. Get Recent Alerts](#5-get-recent-alerts)
  - [6. Get Uptime Summary](#6-get-uptime-summary)
- [Device Status Categories](#device-status-categories)
- [Alert Status Levels](#alert-status-levels)
- [Severity Levels](#severity-levels)
- [Error Responses](#error-responses)

---

## Overview

The Network Status Alert API monitors and reports on the health of the AirQo device network. Each check categorizes every deployed device into one of four transmission states and generates an alert record capturing the overall network health at that point in time.

Checks run automatically every 2 hours (at minute 30) in production. A daily summary is published at 8:00 AM EAT. Alert records are retained for **90 days**.

---

## Base URL

```
https://api.airqo.net/api/v2/devices/network-status
```

---

## Authentication

All endpoints require standard API authentication headers.

```
Authorization: JWT <token>
```

---

## Endpoints

### 1. Create Network Status Alert

Creates a new network status alert record.

**`POST /`**

#### Request Body

```json
{
  "checked_at": "2025-05-11T10:30:00Z",
  "total_deployed_devices": 150,
  "operational_count": 60,
  "transmitting_count": 25,
  "data_available_count": 15,
  "not_transmitting_devices_count": 50,
  "not_transmitting_percentage": 33.33,
  "status": "OK",
  "message": "Network status OK. Operational: 60, Transmitting: 25, Data Available: 15, Not Transmitting: 50/150 (33.33%)",
  "threshold_exceeded": false,
  "threshold_value": 35
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `checked_at` | ISO 8601 datetime | Yes | When the check was performed |
| `total_deployed_devices` | integer | Yes | Total number of deployed active devices |
| `operational_count` | integer | No | Devices online and transmitting live data |
| `transmitting_count` | integer | No | Devices transmitting but feed not fresh |
| `data_available_count` | integer | No | Devices with fresh feed but not actively transmitting |
| `not_transmitting_devices_count` | integer | Yes | Devices with stale feed and not transmitting |
| `not_transmitting_percentage` | float | Yes | Percentage of not-transmitting devices (0–100) |
| `status` | string | Yes | `"OK"`, `"WARNING"`, or `"CRITICAL"` |
| `message` | string | Yes | Human-readable status summary |
| `threshold_exceeded` | boolean | Yes | Whether the warning threshold (35%) was exceeded |
| `threshold_value` | float | Yes | Threshold used for this check (default: 35) |

#### Response — `201 Created`

```json
{
  "success": true,
  "message": "Network status alert created",
  "alert": {
    "_id": "60a7c5b9f1b2c3d4e5f67890",
    "checked_at": "2025-05-11T10:30:00.000Z",
    "total_deployed_devices": 150,
    "operational_count": 60,
    "transmitting_count": 25,
    "data_available_count": 15,
    "not_transmitting_devices_count": 50,
    "not_transmitting_percentage": 33.33,
    "status": "OK",
    "severity": "LOW",
    "message": "Network status OK. Operational: 60, Transmitting: 25, Data Available: 15, Not Transmitting: 50/150 (33.33%)",
    "threshold_exceeded": false,
    "threshold_value": 35,
    "alert_type": "NETWORK_STATUS",
    "tenant": "airqo",
    "environment": "production",
    "day_of_week": 0,
    "hour_of_day": 10,
    "createdAt": "2025-05-11T10:30:00.000Z"
  }
}
```

**Status Codes:** `201` Created · `400` Invalid request · `500` Server error

---

### 2. List Network Status Alerts

Retrieves a paginated list of network status alerts with optional filtering.

**`GET /`**

#### Query Parameters

| Parameter | Type | Description | Default |
|---|---|---|---|
| `limit` | integer | Results per page | 100 |
| `skip` | integer | Results to skip | 0 |
| `start_date` | ISO 8601 datetime | Filter from date | — |
| `end_date` | ISO 8601 datetime | Filter to date | — |
| `status` | string | Filter by status (`OK`, `WARNING`, `CRITICAL`) | — |
| `threshold_exceeded` | string | Filter by threshold flag (`"true"` / `"false"`) | — |

#### Example Request

```
GET /api/v2/devices/network-status?limit=10&status=WARNING&threshold_exceeded=true
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "successfully retrieved the network status alerts",
  "alerts": [
    {
      "_id": "60a7c5b9f1b2c3d4e5f67890",
      "checked_at": "2025-05-11T10:30:00.000Z",
      "total_deployed_devices": 150,
      "operational_count": 55,
      "transmitting_count": 20,
      "data_available_count": 22,
      "not_transmitting_devices_count": 53,
      "not_transmitting_percentage": 35.33,
      "status": "WARNING",
      "severity": "MEDIUM",
      "message": "⚠️ More than 35% of deployed devices are not transmitting: 35.33% (53/150) | operational: 55, transmitting: 20, data_available: 22",
      "threshold_exceeded": true,
      "threshold_value": 35,
      "alert_type": "NETWORK_STATUS",
      "tenant": "airqo",
      "environment": "production",
      "day_of_week": 0,
      "hour_of_day": 10,
      "createdAt": "2025-05-11T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Network Statistics

Returns aggregated statistics over a date range, including per-category device averages.

**`GET /statistics`**

#### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `start_date` | ISO 8601 datetime | Start of aggregation window |
| `end_date` | ISO 8601 datetime | End of aggregation window |

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "successfully performed aggregation",
  "statistics": [
    {
      "_id": null,
      "totalAlerts": 360,
      "avg_operational_count": 62,
      "avg_transmitting_count": 24,
      "avg_data_available_count": 18,
      "avg_not_transmitting_percentage": 28.5,
      "max_not_transmitting_percentage": 65.0,
      "min_not_transmitting_percentage": 12.0,
      "warningCount": 45,
      "criticalCount": 12
    }
  ]
}
```

| Field | Description |
|---|---|
| `totalAlerts` | Total checks in the period |
| `avg_operational_count` | Average number of operational devices |
| `avg_transmitting_count` | Average number of transmitting devices |
| `avg_data_available_count` | Average number of data-available devices |
| `avg_not_transmitting_percentage` | Average not-transmitting percentage |
| `max_not_transmitting_percentage` | Peak not-transmitting percentage |
| `min_not_transmitting_percentage` | Lowest not-transmitting percentage |
| `warningCount` | Checks that reached WARNING status |
| `criticalCount` | Checks that reached CRITICAL status |

---

### 4. Get Hourly Trends

Analyzes not-transmitting patterns grouped by hour of day and day of week.

**`GET /trends/hourly`**

#### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `start_date` | ISO 8601 datetime | Start of analysis window |
| `end_date` | ISO 8601 datetime | End of analysis window |

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "successfully performed aggregation",
  "trends": [
    {
      "_id": {
        "hour": 2,
        "dayOfWeek": 1
      },
      "avg_not_transmitting_percentage": 35.5,
      "count": 4
    },
    {
      "_id": {
        "hour": 14,
        "dayOfWeek": 3
      },
      "avg_not_transmitting_percentage": 45.2,
      "count": 5
    }
  ]
}
```

| Field | Description |
|---|---|
| `hour` | Hour of day (0–23) |
| `dayOfWeek` | Day of week (0 = Sunday, 6 = Saturday) |
| `avg_not_transmitting_percentage` | Average not-transmitting % for this slot |
| `count` | Number of checks in this hour/day slot |

---

### 5. Get Recent Alerts

Returns threshold-exceeded alerts within a rolling time window. Returns a maximum of 50 records.

**`GET /recent`**

#### Query Parameters

| Parameter | Type | Description | Default | Range |
|---|---|---|---|---|
| `hours` | integer | Look-back window in hours | 24 | 1–168 |

#### Example Request

```
GET /api/v2/devices/network-status/recent?hours=6
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "successfully retrieved the network status alerts",
  "alerts": [
    {
      "_id": "60a7c5b9f1b2c3d4e5f67890",
      "checked_at": "2025-05-11T14:30:00.000Z",
      "total_deployed_devices": 150,
      "operational_count": 40,
      "transmitting_count": 18,
      "data_available_count": 12,
      "not_transmitting_devices_count": 80,
      "not_transmitting_percentage": 53.33,
      "status": "CRITICAL",
      "severity": "HIGH",
      "message": "🚨 CRITICAL: 53.33% of deployed devices are not transmitting (80/150) | operational: 40, transmitting: 18, data_available: 12",
      "threshold_exceeded": true,
      "threshold_value": 35,
      "alert_type": "NETWORK_STATUS",
      "tenant": "airqo",
      "environment": "production",
      "day_of_week": 0,
      "hour_of_day": 14,
      "createdAt": "2025-05-11T14:30:00.000Z"
    }
  ]
}
```

> **Note:** This endpoint only returns records where `threshold_exceeded = true`.

---

### 6. Get Uptime Summary

Provides daily aggregated summaries for the specified number of days.

**`GET /uptime-summary`**

#### Query Parameters

| Parameter | Type | Description | Default | Range |
|---|---|---|---|---|
| `days` | integer | Number of days to summarize | 7 | 1–90 |

#### Example Request

```
GET /api/v2/devices/network-status/uptime-summary?days=14
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "successfully performed aggregation",
  "summary": [
    {
      "_id": "2025-05-10",
      "avgOfflinePercentage": 25.5,
      "maxOfflinePercentage": 45.0,
      "minOfflinePercentage": 15.0,
      "totalChecks": 12,
      "alertsTriggered": 3
    },
    {
      "_id": "2025-05-11",
      "avgOfflinePercentage": 35.2,
      "maxOfflinePercentage": 53.33,
      "minOfflinePercentage": 22.0,
      "totalChecks": 12,
      "alertsTriggered": 5
    }
  ]
}
```

| Field | Description |
|---|---|
| `_id` | Date in `YYYY-MM-DD` format |
| `avgOfflinePercentage` | Daily average not-transmitting percentage |
| `maxOfflinePercentage` | Daily peak not-transmitting percentage |
| `minOfflinePercentage` | Daily minimum not-transmitting percentage |
| `totalChecks` | Number of checks performed that day |
| `alertsTriggered` | Number of threshold-exceeded checks |

---

## Device Status Categories

Each deployed device is classified into one of four mutually exclusive states during every check:

| Category | Online Feed | Transmitting | Description |
|---|---|---|---|
| `operational` | Yes | Yes | Device is online with a fresh feed and actively sending data |
| `transmitting` | No | Yes | Device is sending data but its feed timestamp is stale |
| `data_available` | Yes | No | Device feed is fresh but no active data transmission |
| `not_transmitting` | No | No | Device is fully offline — stale feed, no transmission |

> Alert thresholds are based on `not_transmitting_percentage` only. Devices in the `operational`, `transmitting`, or `data_available` states are considered contributing to the network.

---

## Alert Status Levels

| Status | Condition | Description |
|---|---|---|
| `OK` | not_transmitting % < 35% | Network is healthy |
| `WARNING` | 35% ≤ not_transmitting % < 50% | Network degradation detected |
| `CRITICAL` | not_transmitting % ≥ 50% | Severe network issues |

---

## Severity Levels

Severity is automatically derived from `not_transmitting_percentage` when an alert is created:

| Severity | Condition |
|---|---|
| `LOW` | not_transmitting % < 35% |
| `MEDIUM` | 35% ≤ not_transmitting % < 50% |
| `HIGH` | not_transmitting % ≥ 50% |

---

## Error Responses

All endpoints return a consistent error shape:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": "Validation error message"
  }
}
```

| Code | Meaning |
|---|---|
| `400` | Bad Request — invalid parameters or request body |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error |
