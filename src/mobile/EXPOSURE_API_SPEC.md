# Exposure Feature — API Specification

## 1. Extend User Preferences

Add a `declared_places` array to the existing preferences document. No new endpoints needed — just extend the two that already exist.

---

### GET `/api/v2/users/preferences/:userId`

Include `declared_places` in the response alongside `selected_sites`. Return an empty array if the user has none yet.

```json
{
  "success": true,
  "message": "preferences fetched successfully",
  "preferences": [
    {
      "_id": "...",
      "user_id": "673488e9bc47400013f52553",
      "selected_sites": [ ... ],
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
  ]
}
```

---

### PATCH `/api/v2/users/preferences/replace`

Accept and persist `declared_places` from the request body. The app sends the full list every time (replace semantics).

```json
{
  "user_id": "673488e9bc47400013f52553",
  "selected_sites": [ ... ],
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

---

## 2. New Endpoint — Hourly Readings

### GET `/api/v2/devices/measurements/sites/:siteId/hourly`

Returns 24 hourly PM2.5 readings for a site on a given date.

**Query params:**

| Param | Type | Required |
|---|---|---|
| `date` | `YYYY-MM-DD` | Yes |

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

- Always return exactly **24 entries**, one per hour (0–23), in order.
- Use `null` for hours with no sensor data.
- Values are in **µg/m³**.

---

## Data Schema

### DeclaredPlace

| Field | Type | Required |
|---|---|---|
| `site_id` | string | Yes |
| `display_name` | string | Yes |
| `location_name` | string | Yes |
| `city` | string | Yes |
| `type` | `home` \| `work` \| `school` \| `gym` \| `family` \| `other` | Yes |
| `absent_on_weekdays` | boolean | Yes |
| `absent_on_weekends` | boolean | Yes |
| `weekday_window` | TimeWindow \| null | No |
| `weekend_window` | TimeWindow \| null | No |

### TimeWindow

| Field | Type | Range |
|---|---|---|
| `arrive_h` | integer | 0–23 |
| `arrive_m` | integer | 0–59 |
| `leave_h` | integer | 0–23 |
| `leave_m` | integer | 0–59 |

> Windows can be overnight — if `leave_h` < `arrive_h` the window wraps past midnight (e.g. arrive 22:00, leave 06:00).
