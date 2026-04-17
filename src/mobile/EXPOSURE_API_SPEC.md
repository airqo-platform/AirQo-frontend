# Exposure Feature — Backend API Specification

This document defines the backend changes needed to support the Exposure tab's **My Places** feature.

---

## Overview

My Places (declared places) should be stored and retrieved using the **existing user preferences endpoint** — the same one used for favourite locations (`selected_sites`). A new field `declared_places` should be added to the preferences object.

No new preferences endpoints are needed. The only new endpoint required is the hourly readings one.

---

## Existing Endpoints (already in use)

| Method | URL | Purpose |
|---|---|---|
| `GET` | `/api/v2/users/preferences/:userId` | Fetch preferences (add `declared_places` to response) |
| `PATCH` | `/api/v2/users/preferences/replace` | Save preferences (accept `declared_places` in body) |

### Auth

```
Authorization: JWT <token>
Content-Type: application/json
```

---

## Change 1 — Add `declared_places` to the Preferences Object

### GET `/api/v2/users/preferences/:userId`

The response `data` object should now include `declared_places` alongside the existing `selected_sites`:

```json
{
  "success": true,
  "message": "preferences fetched successfully",
  "data": {
    "_id": "...",
    "user_id": "...",
    "selected_sites": [ ... ],
    "declared_places": [
      {
        "site_id": "site_abc123",
        "display_name": "Hakim's Home",
        "location_name": "Wandegeya",
        "city": "Kampala",
        "type": "home",
        "absent_on_weekdays": false,
        "absent_on_weekends": false,
        "weekday_window": {
          "arrive_h": 20, "arrive_m": 0,
          "leave_h": 7,  "leave_m": 0
        },
        "weekend_window": {
          "arrive_h": 8,  "arrive_m": 0,
          "leave_h": 22, "leave_m": 0
        }
      }
    ]
  }
}
```

If the user has no declared places yet, return an empty array: `"declared_places": []`.

### PATCH `/api/v2/users/preferences/replace`

The request body should now accept `declared_places` alongside `selected_sites`:

```json
{
  "user_id": "user_xyz",
  "selected_sites": [ ... ],
  "declared_places": [
    {
      "site_id": "site_abc123",
      "display_name": "Hakim's Home",
      "location_name": "Wandegeya",
      "city": "Kampala",
      "type": "home",
      "absent_on_weekdays": false,
      "absent_on_weekends": false,
      "weekday_window": { "arrive_h": 20, "arrive_m": 0, "leave_h": 7, "leave_m": 0 },
      "weekend_window": { "arrive_h": 8,  "arrive_m": 0, "leave_h": 22, "leave_m": 0 }
    }
  ]
}
```

The mobile app sends the **full list** of declared places on every save (replace semantics, same as `selected_sites`). The backend should store the array as-is and return it on the next GET.

---

## `DeclaredPlace` Object Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_id` | string | Yes | AirQo site ID — links the place to an air quality monitoring site |
| `display_name` | string | Yes | User-chosen label shown next to the type icon (e.g. "Hakim's Home") |
| `location_name` | string | Yes | Map/search place name — main title on the card (e.g. "Wandegeya") |
| `city` | string | Yes | City name |
| `type` | string | Yes | One of: `home`, `work`, `school`, `gym`, `family`, `other` |
| `absent_on_weekdays` | boolean | Yes | User declares no time spent here Mon–Fri |
| `absent_on_weekends` | boolean | Yes | User declares no time spent here Sat–Sun |
| `weekday_window` | TimeWindow \| null | No | Mon–Fri arrival/departure. Omitted when `absent_on_weekdays` is true or no window was set |
| `weekend_window` | TimeWindow \| null | No | Sat–Sun arrival/departure. Omitted when `absent_on_weekends` is true or no window was set |

### TimeWindow Schema

| Field | Type | Description |
|---|---|---|
| `arrive_h` | integer (0–23) | Hour of arrival |
| `arrive_m` | integer (0–59) | Minute of arrival |
| `leave_h` | integer (0–23) | Hour of departure |
| `leave_m` | integer (0–59) | Minute of departure |

Supports overnight windows — if `leave` < `arrive`, the window wraps past midnight (e.g. arrive 22:00, leave 06:00).

---

## Change 2 — New Endpoint: Hourly Readings

```
GET /api/v2/devices/measurements/sites/:siteId/hourly
```

Returns 24 hourly PM2.5 readings for a site on a given date. Powers the hourly detail sheet that opens when a user taps a declared place card.

**Path param:** `siteId` — AirQo site ID.

**Query params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `date` | string `YYYY-MM-DD` | Yes | Calendar date for the readings |

**Response `200`:**
```json
{
  "success": true,
  "message": "Hourly readings fetched successfully",
  "data": [
    { "hour": 0,  "pm25": 18.4 },
    { "hour": 1,  "pm25": 15.1 },
    { "hour": 2,  "pm25": null },
    { "hour": 3,  "pm25": null },
    { "hour": 4,  "pm25": 12.0 },
    { "hour": 5,  "pm25": 22.7 },
    { "hour": 6,  "pm25": 55.3 },
    { "hour": 7,  "pm25": 61.2 },
    { "hour": 8,  "pm25": 48.9 },
    { "hour": 9,  "pm25": 35.0 },
    { "hour": 10, "pm25": 28.4 },
    { "hour": 11, "pm25": 24.1 },
    { "hour": 12, "pm25": 22.0 },
    { "hour": 13, "pm25": 19.5 },
    { "hour": 14, "pm25": 20.3 },
    { "hour": 15, "pm25": 23.7 },
    { "hour": 16, "pm25": 44.1 },
    { "hour": 17, "pm25": 52.8 },
    { "hour": 18, "pm25": 49.0 },
    { "hour": 19, "pm25": 38.2 },
    { "hour": 20, "pm25": 30.1 },
    { "hour": 21, "pm25": 25.0 },
    { "hour": 22, "pm25": 21.4 },
    { "hour": 23, "pm25": 19.8 }
  ]
}
```

**Rules:**
- `data` must contain **exactly 24 entries**, one per hour (0–23), in ascending order.
- `pm25` is `null` when the sensor had no data for that hour. The app renders null hours as empty/greyed bars.
- Values are in **µg/m³**.

| Error | Condition |
|---|---|
| `400` | Missing or invalid `date` param |
| `404` | Site not found |

---

## PM2.5 → Exposure Level (for reference)

| PM2.5 (µg/m³) | Level |
|---|---|
| < 12.0 | Low |
| 12.0 – 35.4 | Moderate |
| ≥ 35.5 | High |

---

## Summary of Backend Work

| Priority | Work |
|---|---|
| P0 | Add `declared_places` field to the preferences GET response |
| P0 | Accept and persist `declared_places` in the preferences PATCH body |
| P1 | New endpoint: `GET /api/v2/devices/measurements/sites/:siteId/hourly?date=YYYY-MM-DD` |
