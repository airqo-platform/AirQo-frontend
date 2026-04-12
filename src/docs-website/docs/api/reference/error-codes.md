---
sidebar_position: 2
sidebar_label: Error Codes
---

# Error Codes

All AirQo API endpoints return consistent error responses so you can handle failures programmatically.

---

## Error response format

```json
{
  "status": "error",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

For forecast endpoints, the shape uses `success: false`:

```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "Unauthorized"
}
```

---

## HTTP status codes

| Status | Meaning | Common causes |
|--------|---------|---------------|
| `200 OK` | Request succeeded | — |
| `400 Bad Request` | Invalid request | Missing required fields, bad date format, invalid parameter values |
| `401 Unauthorized` | Authentication failed | Missing, expired, or invalid token |
| `403 Forbidden` | Insufficient permissions | Accessing a feature not included in your tier (e.g. forecasts on Free) |
| `404 Not Found` | Resource not found | Invalid Cohort ID, Grid ID, Site ID, or Device ID — or no data for the requested range |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests in a short period |
| `500 Internal Server Error` | Server error | AirQo-side issue; retry after a short delay |

---

## Common errors and solutions

### Empty measurements array

**Symptom:** Response is `200 OK` with `"measurements": []` or `"data": []`.

**Most likely cause:** Your server's public IP is not whitelisted.

**Solution:** Log in to [analytics.airqo.net](https://analytics.airqo.net) → Account Settings → IP Whitelist. Add the public IP your server uses to make API requests.

---

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid authentication",
  "error": "Unauthorized"
}
```

**Causes:**
- Token is missing from the request
- Token has expired (tokens are valid for 7 months)
- Token was copied incorrectly

**Solution:** Generate a new token from Account Settings and update it in your application.

---

### 403 Forbidden — tier restriction

```json
{
  "success": false,
  "message": "Forecast access requires Premium Tier subscription",
  "error": "Forbidden",
  "upgrade_url": "https://analytics.airqo.net/account/subscription"
}
```

**Cause:** You are trying to access a feature (e.g. forecasts, historical data) not included in your current tier.

**Solution:** Upgrade your subscription at [analytics.airqo.net](https://analytics.airqo.net) → Account Settings → Subscription.

---

### 404 Not Found

```json
{
  "status": "error",
  "message": "No data found for the requested device(s) or time range",
  "code": "NOT_FOUND"
}
```

**Causes:**
- The ID you provided does not exist or is incorrect
- No measurements exist for the device in the requested date range
- The device was offline for the entire period

**Solution:** Verify the ID using the [metadata endpoints](./finding-ids). Try a shorter or more recent date range.

---

### 429 Too Many Requests

**Cause:** You have exceeded the rate limit for your tier.

**Solution:**
1. Implement exponential backoff — wait before retrying.
2. Cache responses to avoid repeating identical queries.
3. Upgrade to a higher tier for increased rate limits.

```python
import time
import requests

def request_with_retry(url, params, max_retries=3):
    for attempt in range(max_retries):
        response = requests.get(url, params=params)
        if response.status_code == 429:
            wait = 2 ** attempt  # 1s, 2s, 4s
            print(f"Rate limited. Retrying in {wait}s...")
            time.sleep(wait)
        else:
            return response
    raise Exception("Max retries exceeded")
```

---

## Support

If you consistently receive `500` errors or unexpected responses, contact [network@airqo.net](mailto:network@airqo.net) with:
- The endpoint you called
- The request body or query parameters (redact your token)
- The full response you received
- The timestamp of the request
