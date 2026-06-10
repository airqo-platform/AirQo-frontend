---
sidebar_position: 5
sidebar_label: Best Practices
---

# Best Practices

Follow these guidelines to build reliable, efficient integrations with the AirQo API.

---

## Authentication

- **Rotate tokens before they expire.** Tokens are valid for 7 months. Set a calendar reminder 2–3 weeks before expiry and update your token in all environments.
- **Never expose your token in client-side code.** Always proxy API calls through your own backend when building web or mobile apps.
- **Use environment variables** to store credentials — not hardcoded strings.

---

## IP whitelisting

- **Whitelist all egress IPs** your application uses. If you use load balancers or NAT gateways, whitelist those IPs too.
- **Use a static egress IP** where possible to avoid maintaining a changing whitelist.
- If you receive `200 OK` with empty `measurements`, check your whitelist first — this is the most common cause.

---

## Query design

- **Limit your date ranges.** For hourly data, query 7–30 days at a time. For raw data, use windows of 1–6 hours.
- **Request only the fields you need.** Specify `pollutants`, `metaDataFields`, and `weatherFields` explicitly instead of requesting everything.
- **Filter at the API level.** Use `device_names` or `sites` to narrow results rather than fetching everything and filtering locally.

---

## Caching

| Data type | Recommended cache duration |
|-----------|--------------------------|
| Recent hourly measurements | 30–60 minutes |
| Historical calibrated data | 24 hours (data does not change) |
| Heatmap images | 30–60 minutes |
| Forecasts | 1–3 hours (updated every 6 hours) |

---

## Error handling

- **Implement exponential backoff** for `429 Too Many Requests` and `500` responses.
- **Never retry immediately** — use increasing wait times (e.g. 1s, 2s, 4s, 8s).
- **Log the full response** when errors occur, including the request body and timestamp, to help with debugging.

```python
import time
import requests

def api_request_with_backoff(url, token, payload, max_retries=4):
    for attempt in range(max_retries):
        response = requests.post(
            f"{url}?token={token}",
            json=payload
        )
        if response.status_code in (429, 500):
            wait = 2 ** attempt
            time.sleep(wait)
            continue
        return response.json()
    raise Exception("Request failed after maximum retries")
```

---

## Large data exports

- **Use the cursor-based Analytics API** (v3) for bulk exports rather than looping through the GET measurement endpoints.
- **Process pages as you receive them** rather than loading everything into memory first.
- **Break quarterly or annual exports into monthly chunks** to stay within timeout limits.

---

## Development checklist

- [ ] Token stored in environment variable, not code
- [ ] Server IPs whitelisted
- [ ] Date ranges bounded (not open-ended)
- [ ] Only necessary fields requested
- [ ] Retry logic with exponential backoff implemented
- [ ] Caching in place for frequently accessed data
- [ ] Token expiry reminder set

---

## Getting help

| Contact | Purpose |
|---------|---------|
| [network@airqo.net](mailto:network@airqo.net) | Technical integration support |
| [support@airqo.net](mailto:support@airqo.net) | Account, billing, and access questions |
| [github.com/airqo-platform/code-samples](https://github.com/airqo-platform/code-samples) | Ready-to-use integration examples |
