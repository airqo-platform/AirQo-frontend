---
sidebar_position: 1
sidebar_label: Forecast API
---

# Forecast API

Get hourly and daily air quality predictions for up to 7 days ahead, with health recommendations based on predicted pollution levels.

:::info Tier requirement
Forecasts require a **Premium Tier** subscription.
:::

---

## What you get

- **7-day hourly forecasts** — one prediction per hour for the next 168 hours
- **7-day daily forecasts** — one prediction per day for the next 7 days
- **Health tips** — contextual recommendations based on predicted PM2.5 levels
- **Forecast metadata** — model version, generation timestamp, and location details

Forecasts are available for any active monitoring site or device. They are regenerated every 6 hours (00:00, 06:00, 12:00, 18:00 UTC).

---

## Endpoints

### Hourly forecasts

#### By Device ID

```
GET https://api.airqo.net/api/v2/predict/hourly-forecast?device_id={DEVICE_ID}&token={SECRET_TOKEN}
```

#### By Site ID

```
GET https://api.airqo.net/api/v2/predict/hourly-forecast?site_id={SITE_ID}&token={SECRET_TOKEN}
```

### Daily forecasts

#### By Device ID

```
GET https://api.airqo.net/api/v2/predict/daily-forecast?device_id={DEVICE_ID}&token={SECRET_TOKEN}
```

#### By Site ID

```
GET https://api.airqo.net/api/v2/predict/daily-forecast?site_id={SITE_ID}&token={SECRET_TOKEN}
```

---

## Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `device_id` | string | Conditional | Device identifier (use either `device_id` or `site_id`) |
| `site_id` | string | Conditional | Site identifier (use either `site_id` or `device_id`) |
| `token` | string | Yes | Your SECRET TOKEN |

---

## Example requests

```bash
# Hourly forecast by site ID
curl -X GET \
  "https://api.airqo.net/api/v2/predict/hourly-forecast?site_id=64f7b3e8c9d25a0013f2d456&token=YOUR_SECRET_TOKEN"

# Daily forecast by device ID
curl -X GET \
  "https://api.airqo.net/api/v2/predict/daily-forecast?device_id=65c8d4a2f1b45c0012a3e789&token=YOUR_SECRET_TOKEN"
```

**JavaScript — hourly forecast:**

```js
async function getHourlyForecast(siteId, token) {
  const url = `https://api.airqo.net/api/v2/predict/hourly-forecast?site_id=${siteId}&token=${token}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.success) {
    console.log(`Retrieved ${data.forecasts.length} hourly forecasts`);

    // Show next 24 hours
    data.forecasts.slice(0, 24).forEach(forecast => {
      console.log(`${forecast.time}: PM2.5 = ${forecast.pm2_5} μg/m³`);
      console.log(`Tips: ${forecast.health_tips.join(' | ')}`);
    });
  }

  return data;
}

getHourlyForecast('64f7b3e8c9d25a0013f2d456', 'YOUR_SECRET_TOKEN');
```

**Python — daily forecast:**

```python
import requests
from datetime import datetime

def get_daily_forecast(device_id, token):
    response = requests.get(
        "https://api.airqo.net/api/v2/predict/daily-forecast",
        params={"device_id": device_id, "token": token}
    )
    data = response.json()

    if data['success']:
        for forecast in data['forecasts']:
            date = datetime.fromisoformat(forecast['time'].replace('+00:00', ''))
            print(f"\n{date.strftime('%Y-%m-%d')}: PM2.5 = {forecast['pm2_5']} μg/m³")
            for tip in forecast['health_tips']:
                print(f"  • {tip}")

    return data

get_daily_forecast('65c8d4a2f1b45c0012a3e789', 'YOUR_SECRET_TOKEN')
```

---

## Example response

```json
{
  "success": true,
  "message": "Forecasts retrieved successfully",
  "forecasts": [
    {
      "time": "2025-09-29T14:00:00+00:00",
      "pm2_5": 24.5,
      "health_tips": [
        "Air quality is acceptable for most people",
        "Unusually sensitive individuals should consider reducing prolonged outdoor exertion"
      ]
    },
    {
      "time": "2025-09-29T15:00:00+00:00",
      "pm2_5": 28.3,
      "health_tips": [
        "Air quality is acceptable for most people",
        "Consider reducing outdoor activities if you experience symptoms"
      ]
    }
  ],
  "forecast_metadata": {
    "model_version": "v2.3",
    "generated_at": "2025-09-29T12:00:00+00:00",
    "location": {
      "site_id": "64f7b3e8c9d25a0013f2d456",
      "device_id": "65c8d4a2f1b45c0012a3e789",
      "latitude": 0.3476,
      "longitude": 32.5825
    },
    "forecast_horizon_hours": 168
  }
}
```

---

## Response fields

### Forecast object

| Field | Description |
|-------|-------------|
| `time` | Forecast timestamp (ISO 8601 with timezone) |
| `pm2_5` | Predicted PM2.5 in μg/m³ |
| `health_tips` | Array of health recommendations for the predicted air quality level |

### `forecast_metadata` object

| Field | Description |
|-------|-------------|
| `model_version` | Version of the forecasting model |
| `generated_at` | When this forecast was created |
| `location.site_id` | Site the forecast applies to |
| `location.device_id` | Device the forecast applies to |
| `forecast_horizon_hours` | Total hours covered (168 = 7 days) |

---

## Error responses

### 401 Unauthorised — invalid token

```json
{
  "success": false,
  "message": "Invalid authentication",
  "error": "Unauthorized"
}
```

### 403 Forbidden — not on Premium Tier

```json
{
  "success": false,
  "message": "Forecast access requires Premium Tier subscription",
  "error": "Forbidden",
  "upgrade_url": "https://analytics.airqo.net/account/subscription"
}
```

### 404 Not Found — invalid ID

```json
{
  "success": false,
  "message": "Device or site not found",
  "error": "Not Found"
}
```

---

## Best practices

- **Cache forecast results** — forecasts update every 6 hours. Caching for 1–2 hours reduces API calls with minimal freshness trade-off.
- **Check `generated_at`** — use this to tell users how recent the forecast is.
- **Always display health tips** — they are the most user-actionable part of the forecast.
- **Prefer near-term data** — the first 48 hours are more accurate than days 4–7.
- **Implement graceful fallback** — if the forecast call fails, display the most recent historical reading instead.

---

## Forecast availability

| Detail | Value |
|--------|-------|
| Update frequency | Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC) |
| Hourly horizon | 168 hours (7 days) |
| Daily horizon | 7 days |
| Coverage | All active monitoring sites |
| Historical forecasts | Not available |
| Pollutants | PM2.5 (PM10 in future versions) |

---

## Upgrade to Premium

To unlock forecast access, log in to [analytics.airqo.net](https://analytics.airqo.net), go to **Account Settings → Subscription**, and select Premium Tier.
