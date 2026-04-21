# Exposure Feature — API Spec

Two endpoints are affected. Both are already live on the backend.

---

## 1. User Preferences — `declared_places`

The existing preferences endpoints now carry a `declared_places` array. No new URLs.

---

### GET `/api/v2/users/preferences/:userId`

Returns the user's preferences including their declared places.

**Response `200`**
```json
{
  "success": true,
  "message": "preferences fetched successfully",
  "preferences": [
    {
      "_id": "...",
      "user_id": "673488e9bc47400013f52553",
      "selected_sites": [ "..." ],
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
          },
          "weekend_window": null
        }
      ]
    }
  ]
}
```

> `declared_places` is always an array — empty `[]` if the user has none yet.

---

### PATCH `/api/v2/users/preferences/replace`

Persists the user's full declared places list. The app sends the complete array every time (replace semantics — no partial updates).

**Request body**
```json
{
  "user_id": "673488e9bc47400013f52553",
  "selected_sites": [ "..." ],
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
      },
      "weekend_window": null
    }
  ]
}
```

> Send `declared_places: []` to clear all places. Omitting the field leaves the stored value untouched.

---

### DeclaredPlace schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `site_id` | string (ObjectId) | Yes | |
| `display_name` | string | Yes | |
| `location_name` | string | Yes | |
| `city` | string | Yes | |
| `type` | string | Yes | `home`, `work`, `school`, `gym`, `family`, `other` |
| `absent_on_weekdays` | boolean | Yes | |
| `absent_on_weekends` | boolean | Yes | |
| `weekday_window` | TimeWindow \| null | No | |
| `weekend_window` | TimeWindow \| null | No | |

### TimeWindow schema

| Field | Type | Range |
|---|---|---|
| `arrive_h` | integer | 0 – 23 |
| `arrive_m` | integer | 0 – 59 |
| `leave_h` | integer | 0 – 23 |
| `leave_m` | integer | 0 – 59 |

> Windows support overnight spans — if `leave_h < arrive_h` the window wraps past midnight (e.g. arrive 22:00, leave 06:00).

---

---

## 2. Hourly Readings — new endpoint

### GET `/api/v2/devices/readings/sites/:siteId/hourly`

Returns 24 hourly PM2.5 readings for a site on a given UTC calendar date.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `date` | `YYYY-MM-DD` | Yes | UTC calendar date |

**Response `200`**
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

**Error `400`** — missing or invalid params
```json
{
  "success": false,
  "message": "bad request errors",
  "errors": { "date": "date must be in YYYY-MM-DD format" }
}
```

**Notes**
- Always returns exactly **24 entries**, one per hour, ordered 0 → 23.
- `null` means no sensor data was recorded for that hour.
- Values are in **µg/m³**, rounded to 1 decimal place.
- Data is available for any date within the **last 14 days** (readings TTL).
- A date with no readings at all returns 24 nulls — not an error.

---

## Microservices

| Endpoint | Service |
|---|---|
| `GET /api/v2/users/preferences/:userId` | `auth-service` |
| `PATCH /api/v2/users/preferences/replace` | `auth-service` |
| `GET /api/v2/devices/readings/sites/:siteId/hourly` | `device-registry` 