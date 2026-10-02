---
sidebar_position: 2
sidebar_label: Error Codes
---

# Error Codes

Most AirQo API endpoints share one error response format; the Forecast API has one additional validation-specific shape. Match your error handling to the endpoint you are calling.

---

## Error response formats

### Devices, Analytics, and Metadata API

Used by: measurement endpoints (`/api/v2/devices/...`), Analytics API (`/api/v3/public/analytics/...`), and metadata endpoints (`/api/v2/devices/metadata/...`).

```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": {
    "message": "More specific detail, or a field-by-field validation breakdown"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | `false` on failure |
| `message` | string | Human-readable summary |
| `errors` | object | Additional detail — often `{ "message": "..." }`, or one entry per invalid field on a validation error |

### Forecast API

Used by: `/api/v2/predict/daily-forecasting/` and `/api/v2/predict/hourly-forecasting/`.

The validation error unique to this API — providing more than one of `site_id`, `grid_id`, or `cohort_id` — returns:

```json
{
  "success": false,
  "message": "Please specify only one of site_id, grid_id, or cohort_id.",
  "data": { "forecasts": [] }
}
```

Other error conditions on this API (no forecast available, an unresolved grid/cohort, or the service being temporarily unavailable) follow the same `{success, message}` shape with a `data` object appropriate to the failure.

---

## HTTP status codes

| Status | Meaning | Common causes |
|--------|---------|---------------|
| `200 OK` | Request succeeded | — |
| `400 Bad Request` | Invalid request | Missing required fields, bad date format, invalid parameter values |
| `401 Unauthorized` | Authentication failed | Missing, expired, invalid or suspended token; request from a blocked IP address; API client not yet approved |
| `403 Forbidden` | Insufficient permissions or access denied | Accessing a feature not included in your tier (e.g. forecasts on Free); request blocked by our security checks (see [Blocked Requests](./blocked-requests.md)) |
| `404 Not Found` | Resource not found | Invalid Cohort ID, Grid ID, Site ID, or Device ID — or no data for the requested range |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests in a short period |
| `500 Internal Server Error` | Server error | AirQo-side issue; retry after a short delay |

---

## Common errors and solutions

### Empty measurements array

**Symptom:** Response is `200 OK` with `"measurements": []` or `"data": []`.

**Possible causes:**
- No data exists for the requested device(s), site(s), or date range
- The device was offline for the entire period
- The ID you provided doesn't match an active resource

**Solution:** Verify the ID using the [Finding IDs guide](./finding-ids.md), and try a shorter or more recent date range. If the problem persists, contact [network@airqo.net](mailto:network@airqo.net).

---

### 400 Bad Request — conflicting forecast parameters

```json
{
  "success": false,
  "message": "Please specify only one of site_id, grid_id, or cohort_id.",
  "data": {
    "forecasts": []
  }
}
```

**Cause:** More than one of `site_id`, `grid_id`, or `cohort_id` was provided in a single forecast request.

**Solution:** Provide exactly one identifier per request.

---

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid authentication",
  "errors": { "message": "Token is missing, invalid, or expired" }
}
```

**Causes:**
- Token is missing from the request
- Token has expired (tokens are valid for 7 months)
- Token was copied incorrectly
- The request came from an IP address that is blocked for this token
- The token was automatically suspended after unusual activity
- The API client that owns the token is still awaiting approval

**Solution:** If the token is missing, expired or mistyped, generate a new token from Account Settings and update it in your application.

If the token is correct but still rejected, check the response for an `errors.code`:

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "message": "Requests from IP address 203.0.113.25 are blocked for this token. ...",
    "code": "IP_BLOCKED",
    "docs": "https://platform.airqo.net/docs/api/reference/blocked-requests/"
  }
}
```

| `errors.code` | Meaning |
|---|---|
| `IP_BLOCKED` | Your server's IP address is blocked and is not on the client's IP Addresses list |
| `TOKEN_SUSPENDED` | The token was suspended after unusual activity |
| `CLIENT_INACTIVE` | The API client is awaiting approval or has been deactivated |
| `TOKEN_EXPIRED` | The token has expired |

See [Troubleshooting blocked requests](./blocked-requests.md) for how to fix each one.

---

### 403 Forbidden — access denied

**Symptom:** A request with a valid token that previously worked now returns `403 Forbidden` or "Access Denied", often after you received a **Daily Security Alert Summary** email.

**Cause:** The request was stopped by our security checks. Usually your server's IP address is not on your API client's IP Addresses list, or it changes between runs.

**Solution:** Follow [Troubleshooting blocked requests](./blocked-requests.md).

---

### 403 Forbidden — tier restriction

```json
{
  "success": false,
  "message": "Forecast access requires Premium Tier subscription",
  "errors": { "message": "Upgrade your subscription to access this feature" }
}
```

**Cause:** You are trying to access a feature (e.g. forecasts, historical data) not included in your current tier.

**Solution:** Upgrade your subscription at [nexus.airqo.net](https://nexus.airqo.net) → Account Settings → Subscription.

---

### 404 Not Found

```json
{
  "success": false,
  "message": "No data found for the requested device(s) or time range",
  "errors": { "message": "Not found" }
}
```

**Causes:**
- The ID you provided does not exist or is incorrect
- No measurements exist for the device in the requested date range
- The device was offline for the entire period

**Solution:** Verify the ID using the [Finding IDs guide](./finding-ids.md). Try a shorter or more recent date range.

---

### 429 Too Many Requests

**Cause — GET endpoints** (measurements, metadata): you have exceeded the rate limit for your tier.

**Solution:** Implement exponential backoff, cache responses to avoid repeating identical queries, or upgrade to a higher tier for increased limits.

**Cause — `raw-data` and `data-download`:** these two endpoints enforce a fixed limit of 10 requests per minute per client, regardless of tier.

**Solution:** Pace your pagination loop with a short delay between requests — upgrading tiers doesn't raise this particular limit.

```python
import time
import requests

def request_with_retry(method, url, max_retries=3, **kwargs):
    for attempt in range(max_retries):
        response = requests.request(method, url, **kwargs)
        if response.status_code == 429:
            wait = 2 ** attempt  # 1s, 2s, 4s
            print(f"Rate limited. Retrying in {wait}s...")
            time.sleep(wait)
        else:
            return response
    raise Exception("Max retries exceeded")

# GET endpoint
request_with_retry("GET", url, params=params)

# POST endpoint (raw-data, data-download)
request_with_retry("POST", url, params={"token": token}, json=payload)
```

---

## Support

If you consistently receive `500` errors or unexpected responses, contact [network@airqo.net](mailto:network@airqo.net) with:
- The endpoint you called
- The request body or query parameters (redact your token)
- The full response you received
- The timestamp of the request
