# Network Coverage Registry — Frontend Integration Guide

> **For:** Frontend Engineers
> **PR Branch:** `nginx-registry`
> **Date:** April 2026

---

## Overview

The Network Coverage map now has two public write endpoints that allow external contributors to submit monitor metadata — similar to a Google Form. No AirQo account or API token is required to call these endpoints.

---

## Endpoints

### POST `/api/v2/devices/network-coverage/registry`
Create or update a monitor entry in the registry.

### DELETE `/api/v2/devices/network-coverage/registry/:registryId`
Remove a registry entry by its ID.

Both endpoints are live on **staging** and **production**. No `Authorization` header or `?token=` query param is needed.

---

## Request Body — POST

There are two shapes depending on the type of monitor being submitted.

### Shape A — Enrich an existing AirQo site
Use this when the monitor already exists in the AirQo pipeline. Pass `site_id` and any additional metadata fields.

```json
{
  "site_id": "64a1f3b2e4d5c6a7b8c9d0e1",
  "captchaToken": "<hcaptcha-token>",
  "type": "Reference",
  "network": "AirQo",
  "operator": "Makerere University",
  "equipment": "Clarity Node-S",
  "manufacturer": "Clarity Movement",
  "pollutants": ["PM2.5", "PM10"],
  "resolution": "Hourly",
  "transmission": "Cellular",
  "site": "Makerere University Main Gate",
  "landUse": "Urban",
  "deployed": "Jan 2022",
  "calibrationLastDate": "Mar 2024",
  "calibrationMethod": "Colocation",
  "uptime30d": "94%",
  "publicData": "Yes",
  "organisation": "Makerere University",
  "coLocation": "Yes",
  "coLocationNote": "Co-located with BAM reference monitor",
  "viewDataUrl": "https://airqo.net/monitor/64a1f3b2e4d5c6a7b8c9d0e1"
}
```

### Shape B — Standalone external monitor
Use this for monitors that are not in the AirQo pipeline (e.g. contributed by a partner). Omit `site_id` and provide `name`, `country`, `latitude`, and `longitude` — all four are required.

```json
{
  "captchaToken": "<hcaptcha-token>",
  "name": "Manhica District Hospital",
  "country": "Mozambique",
  "latitude": -25.4013,
  "longitude": 32.8037,
  "city": "Manhica",
  "iso2": "MZ",
  "type": "LCS",
  "status": "active",
  "network": "IHRB",
  "operator": "ISGlobal",
  "equipment": "PurpleAir PA-II",
  "manufacturer": "PurpleAir",
  "pollutants": ["PM2.5"],
  "resolution": "2-minute",
  "transmission": "WiFi",
  "site": "Hospital rooftop",
  "landUse": "Peri-urban",
  "deployed": "Nov 2021",
  "uptime30d": "88%",
  "publicData": "Yes",
  "organisation": "ISGlobal Barcelona",
  "viewDataUrl": "https://map.purpleair.com/...",
  "lastActive": "2024-03-15T10:30:00Z"
}
```

### Field reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `site_id` | `string` (ObjectId) | Shape A only | Links to an AirQo pipeline site |
| `name` | `string` | Shape B only | Monitor display name |
| `country` | `string` | Shape B only | Full country name |
| `latitude` | `number` | Shape B only | Between −90 and 90 |
| `longitude` | `number` | Shape B only | Between −180 and 180 |
| `captchaToken` | `string` | Optional now, required later | hCaptcha token from the widget |
| `city` | `string` | Optional | |
| `iso2` | `string` | Optional | 2-character ISO 3166-1 code, e.g. `"UG"` |
| `type` | `string` | Optional | `"Reference"`, `"LCS"`, or `"Inactive"` |
| `status` | `string` | Optional | `"active"` or `"inactive"` |
| `network` | `string` | Optional | |
| `operator` | `string` | Optional | |
| `equipment` | `string` | Optional | |
| `manufacturer` | `string` | Optional | |
| `pollutants` | `string[]` | Optional | e.g. `["PM2.5", "PM10", "NO2"]` |
| `resolution` | `string` | Optional | e.g. `"Hourly"`, `"2-minute"` |
| `transmission` | `string` | Optional | e.g. `"Cellular"`, `"WiFi"` |
| `site` | `string` | Optional | Human-readable site description |
| `landUse` | `string` | Optional | e.g. `"Urban"`, `"Rural"` |
| `deployed` | `string` | Optional | Human-readable date, e.g. `"Jan 2022"` |
| `calibrationLastDate` | `string` | Optional | |
| `calibrationMethod` | `string` | Optional | |
| `uptime30d` | `string` | Optional | e.g. `"96%"` |
| `publicData` | `string` | Optional | `"Yes"` or `"No"` |
| `organisation` | `string` | Optional | |
| `coLocation` | `string` | Optional | |
| `coLocationNote` | `string` | Optional | |
| `viewDataUrl` | `string` (URL) | Optional | Deep-link to an external data portal |
| `lastActive` | `string` (ISO 8601) | Optional | e.g. `"2024-03-15T10:30:00Z"` |

---

## DELETE Request

No request body. The registry entry ID goes in the URL path:

```
DELETE /api/v2/devices/network-coverage/registry/64a1f3b2e4d5c6a7b8c9d0e1
```

---

## Success Responses

**POST — Created (201)**
```json
{
  "success": true,
  "message": "Registry record created successfully",
  "registry": { ...registryDocument }
}
```

**POST — Updated (200)**
```json
{
  "success": true,
  "message": "Registry record updated successfully",
  "registry": { ...registryDocument }
}
```

**DELETE — Deleted (200)**
```json
{
  "success": true,
  "message": "Registry record deleted"
}
```

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400` | Validation failed (missing required field, bad ObjectId, invalid URL, etc.) |
| `404` | `site_id` not found in AirQo pipeline (Shape A) |
| `409` | A registry entry for that `site_id` already exists |
| `429` | Rate limit exceeded — max **20 requests per hour per IP** |
| `500` | Server error |

---

## Rate Limiting

Both endpoints are limited to **20 requests per hour per IP address**. A `429` response looks like:

```json
{
  "success": false,
  "message": "Too many requests — please try again later.",
  "errors": {
    "message": "Rate limit exceeded. Max 20 submissions per hour."
  }
}
```

Standard `RateLimit-*` headers are included in every response so the frontend can display a countdown if needed.

---

## CAPTCHA — Action Required Before Launch

The backend already has the CAPTCHA verification middleware wired in and ready. It is currently a **no-op** (silently skipped) because the secret key is not yet configured.

To activate CAPTCHA enforcement end-to-end, the following steps are needed:

### Backend (DevOps / Backend)
1. Sign up at [hcaptcha.com](https://www.hcaptcha.com) and create a site.
2. Add the secret key to the Kubernetes secret / environment:
   ```
   HCAPTCHA_SECRET_KEY=<your-secret-key>
   ```
3. Remove the no-op guard in `src/device-registry/middleware/captcha.middleware.js` (line 53):
   ```js
   // Remove this block to enforce CAPTCHA:
   if (!secret) {
     return next();
   }
   ```

### Frontend
1. Install the hCaptcha React package:
   ```bash
   npm install @hcaptcha/react-hcaptcha
   ```
2. Add the site key to your environment:
   ```
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=<your-site-key>
   ```
3. Render the widget in the submission form and pass the token in the POST body as `captchaToken`:
   ```tsx
   import HCaptcha from "@hcaptcha/react-hcaptcha";

   const [captchaToken, setCaptchaToken] = useState("");

   <HCaptcha
     sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
     onVerify={(token) => setCaptchaToken(token)}
   />

   // Include in POST body:
   body: JSON.stringify({ ...formData, captchaToken })
   ```

Until the secret key is set on the backend, the `captchaToken` field in the request body is accepted but ignored — so the form can be built and tested without blocking on CAPTCHA setup.

---

## Quick Fetch Example (Next.js)

```ts
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/v2/devices/network-coverage/registry`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Manhica District Hospital",
      country: "Mozambique",
      latitude: -25.4013,
      longitude: 32.8037,
      type: "LCS",
      pollutants: ["PM2.5"],
      captchaToken, // from hCaptcha widget
    }),
  }
);

const data = await response.json();

if (!data.success) {
  // handle error — check data.message and data.errors
}
```
