# Exposure Feature — Backend API Specification

**For:** Backend team  
**Feature:** My Places (Exposure tab)  
**Mobile app branch:** `research-app`

---

## Context

The Exposure tab lets users declare the locations they regularly spend time at — home, work, school, gym, etc. — so the app can show them a personalised air quality exposure summary per place.

Users already have **favourite locations** (`selected_sites`) saved in their preferences. These automatically appear in My Places. Users can then optionally enrich each location with a **place type** (home, work, etc.) and **time windows** (when they're usually there on weekdays vs weekends).

The enrichment data is stored as `declared_places` in the user's preferences document.

---

## What the backend needs to do

There are **two pieces of work**:

1. **Extend the existing preferences endpoints** to accept and return a `declared_places` array alongside the existing `selected_sites`.
2. **Create a new hourly readings endpoint** for a given site and date.

---

## Authentication

All endpoints use the existing auth pattern:

```
Authorization: JWT <token>
Content-Type: application/json
```

Return a fresh token in the `x-access-token` response header on every authenticated request.

---

## Standard Response Envelope

All responses follow the existing pattern:

```json
{
  "success": true,
  "message": "Human-readable status",
  "preferences": [ { ... } ]
}
```

or for the new hourly endpoint:

```json
{
  "success": true,
  "message": "...",
  "data": [ ... ]
}
```

---

## Part 1 — Extend Preferences Endpoints

### Data models

#### `DeclaredPlace`

This is the object the app sends and expects back inside `declared_places`.

```json
{
  "site_id": "6720f513c7f24000139463e9",
  "display_name": "Hakim's Home",
  "location_name": "Wandegeya",
  "city": "Kampala",
  "type": "home",
  "absent_on_weekdays": false,
  "absent_on_weekends": false,
  "weekday_window": {
    "arrive_h": 20,
    "arrive_m": 0,
    "leave_h": 7,
    "leave_m": 0
  },
  "weekend_window": {
    "arrive_h": 8,
    "arrive_m": 0,
    "leave_h": 22,
    "leave_m": 0
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `site_id` | string | **Yes** | AirQo site `_id` — links this declaration to a monitoring site |
| `display_name` | string | **Yes** | User-chosen label shown beside the type icon (e.g. "Hakim's Home") |
| `location_name` | string | **Yes** | Map/search name used as the card's main title (e.g. "Wandegeya") |
| `city` | string | **Yes** | City name |
| `type` | string | **Yes** | One of: `home` `work` `school` `gym` `family` `other` |
| `absent_on_weekdays` | boolean | **Yes** | `true` = user is not at this place Mon–Fri |
| `absent_on_weekends` | boolean | **Yes** | `true` = user is not at this place Sat–Sun |
| `weekday_window` | TimeWindow \| null | No | When the user is at this place Mon–Fri. Omitted when `absent_on_weekdays` is true or no window has been set |
| `weekend_window` | TimeWindow \| null | No | When the user is at this place Sat–Sun. Omitted when `absent_on_weekends` is true or no window has been set |

#### `TimeWindow`

```json
{
  "arrive_h": 8,
  "arrive_m": 30,
  "leave_h": 17,
  "leave_m": 0
}
```

| Field | Type | Range | Description |
|---|---|---|---|
| `arrive_h` | integer | 0–23 | Hour of arrival |
| `arrive_m` | integer | 0–59 | Minute of arrival |
| `leave_h` | integer | 0–23 | Hour of departure |
| `leave_m` | integer | 0–59 | Minute of departure |

> **Overnight windows are valid.** If `leave_h` < `arrive_h`, the window wraps past midnight (e.g. arrive 22:00, leave 06:00 = sleeping at home). The app handles this correctly on the display side.

---

### `GET /api/v2/users/preferences/:userId`

**No change to the request.** The response `preferences[0]` object should now include `declared_places` alongside the existing `selected_sites`.

**Current response (abbreviated):**
```json
{
  "success": true,
  "message": "preferences fetched successfully",
  "preferences": [
    {
      "_id": "...",
      "user_id": "673488e9bc47400013f52553",
      "selected_sites": [ ... ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Required response (add `declared_places`):**
```json
{
  "success": true,
  "message": "preferences fetched successfully",
  "preferences": [
    {
      "_id": "...",
      "user_id": "673488e9bc47400013f52553",
      "selected_sites": [
        {
          "_id": "6720f513c7f24000139463e9",
          "name": "KCCA Hall, Parliamentary Avenue",
          "search_name": "KCCA Hall, Parliamentary Avenue, Kampala"
        }
      ],
      "declared_places": [
        {
          "site_id": "6720f513c7f24000139463e9",
          "display_name": "My Office",
          "location_name": "KCCA Hall, Parliamentary Avenue",
          "city": "Kampala",
          "type": "work",
          "absent_on_weekdays": false,
          "absent_on_weekends": true,
          "weekday_window": {
            "arrive_h": 8,
            "arrive_m": 30,
            "leave_h": 17,
            "leave_m": 0
          }
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

- If the user has no declared places yet, return `"declared_places": []` (not null, not omitted).

---

### `PATCH /api/v2/users/preferences/replace`

**No change to the URL or auth.** The request body should now accept `declared_places` alongside `selected_sites`.

The app sends the **full array** of declared places on every save (replace semantics, same as `selected_sites`). Store and return the array as-is.

**Request body:**
```json
{
  "user_id": "673488e9bc47400013f52553",
  "selected_sites": [
    {
      "_id": "6720f513c7f24000139463e9",
      "name": "KCCA Hall, Parliamentary Avenue",
      "search_name": "KCCA Hall, Parliamentary Avenue, Kampala",
      "latitude": 0.3163,
      "longitude": 32.5822
    }
  ],
  "declared_places": [
    {
      "site_id": "6720f513c7f24000139463e9",
      "display_name": "My Office",
      "location_name": "KCCA Hall, Parliamentary Avenue",
      "city": "Kampala",
      "type": "work",
      "absent_on_weekdays": false,
      "absent_on_weekends": true,
      "weekday_window": {
        "arrive_h": 8,
        "arrive_m": 30,
        "leave_h": 17,
        "leave_m": 0
      }
    }
  ]
}
```

**Response `200`:** Same as the existing success response for this endpoint. No new fields required in the response body.

> **Important:** When the app patches declared places it re-sends the existing `selected_sites` unchanged. The backend must not wipe `selected_sites` when `declared_places` is present in the body.

---

## Part 2 — New Endpoint: Hourly Readings

### `GET /api/v2/devices/measurements/sites/:siteId/hourly`

Returns 24 hourly PM2.5 readings for a given site on a given date. The app uses this to power the hourly detail sheet that opens when a user taps a declared place card.

**Path parameter:**

| Param | Description |
|---|---|
| `siteId` | AirQo site `_id` |

**Query parameter:**

| Param | Type | Required | Description |
|---|---|---|---|
| `date` | string | **Yes** | Calendar date in `YYYY-MM-DD` format (local time) |

**Example request:**
```
GET /api/v2/devices/measurements/sites/6720f513c7f24000139463e9/hourly?date=2026-04-17
Authorization: JWT <token>
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Hourly readings fetched successfully",
  "data": [
    { "hour": 0,  "pm25": 18.4 },
    { "hour": 1,  "pm25": 15.1 },
    { "hour": 2,  "pm25": 12.8 },
    { "hour": 3,  "pm25": null },
    { "hour": 4,  "pm25": null },
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

#### Rules the app depends on

| Rule | Detail |
|---|---|
| **Always 24 entries** | The `data` array must contain exactly 24 objects, one per hour, in ascending order (0 → 23). No skipping hours. |
| **`null` for missing data** | If the sensor had no reading for a given hour (offline, gap in coverage), set `pm25` to `null` — do not omit the entry. The app renders null hours as empty/greyed bars in the chart. |
| **Units** | PM2.5 values are in **µg/m³**. |
| **Date interpretation** | Treat `date` as a calendar day in the site's local time zone. |

**Error responses:**

| Status | Condition |
|---|---|
| `400` | Missing or malformed `date` parameter |
| `404` | Site not found |
| `401` | Missing or invalid auth token |

---

## PM2.5 → Exposure Level mapping (for reference)

The app classifies readings into three levels. Sharing this so the backend can use the same thresholds in any server-side analytics.

| PM2.5 (µg/m³) | Level | Hex colour |
|---|---|---|
| < 12.0 | Low | `#34C759` |
| 12.0 – 35.4 | Moderate | `#E8A000` |
| ≥ 35.5 | High | `#F7453C` |

---

## Implementation priority

| Priority | Work item |
|---|---|
| P0 | Return `declared_places: []` from `GET /preferences/:userId` (even if empty) |
| P0 | Persist `declared_places` sent in `PATCH /preferences/replace` |
| P1 | `GET /devices/measurements/sites/:siteId/hourly?date=` |

---

## Notes for the mobile team once backend is ready

1. In `exposure_place_readings.dart`, replace the `_mockHourly` call in `hourlyForSite()` with an HTTP call to the new endpoint.
2. The `declared_places` field will start flowing automatically once the preferences endpoints return it — no other mobile changes needed.
