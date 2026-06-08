# Frontend Integration Guide — API Security & Token Management

**Audience:** Analytics platform (airqo-frontend/src/platform)
**Status:** Ready for integration
**Date:** 2026-06-06

---

## Overview

This guide covers two categories of new work:

1. **New admin endpoints** — BlockedASN management and FlaggedToken monitoring. These need a new `/system/security` admin page.
2. **New token/client fields** — Resource binding, access schedules, origin enforcement, and auto-suspension. These should be surfaced in the existing `/modules/api-client` and `/system/clients` pages.

All endpoints require `Authorization: JWT <token>` and are restricted to the `airqo` tenant.

---

## Part 1 — New Admin Page: `/system/security`

Recommended as a two-tab page under the existing `/system` admin section, following the same layout pattern as `/system/clients` and `/system/feedback`.

---

### Tab 1 — ASN / CIDR Blocks

Allows admins to manage IP address ranges that are blocked at the API gateway level.

#### `GET /api/v2/tokens/blocked-asns`

Fetch the list of blocked IP ranges.

**Query params (all optional):**

| Param | Type | Description |
|---|---|---|
| `active` | `boolean` | Filter by active status |
| `skip` | `number` | Pagination offset |
| `limit` | `number` | Page size (default 100) |

**Response `200`:**
```json
{
  "message": "successfully retrieved blocked ASN entries",
  "blocked_asns": [
    {
      "_id": "64be9a04...",
      "provider": "Amazon Web Services",
      "asn": "AS16509",
      "cidr_ranges": ["52.0.0.0/8", "54.0.0.0/8"],
      "reason": "AWS data-center range",
      "active": true,
      "blockedAt": "2026-06-05T10:00:00.000Z",
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v2/tokens/blocked-asns`

Add or update a blocked IP range. Sending the same `provider` a second time merges the new `cidr_ranges` into the existing entry rather than creating a duplicate.

**Request body:**
```json
{
  "provider": "Amazon Web Services",
  "asn": "AS16509",
  "cidr_ranges": ["52.0.0.0/8", "54.0.0.0/8"],
  "reason": "AWS data-center range",
  "active": true
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `provider` | Yes | `string` | Human-readable name — acts as the unique key (e.g. "Cloudflare", "DigitalOcean") |
| `asn` | No | `string` | ASN in `AS12345` format. Required if `cidr_ranges` is omitted. |
| `cidr_ranges` | No | `string[]` | IPv4 CIDR notation e.g. `"192.0.2.0/24"`. Required if `asn` is omitted. |
| `reason` | No | `string` | Admin note — why this range is blocked |
| `active` | No | `boolean` | Defaults to `true` |

**Response `201` (new entry):**
```json
{
  "message": "ASN block created",
  "blocked_asn": { "_id": "64be9a04...", "provider": "Amazon Web Services", ... }
}
```

**Response `200` (existing provider updated):**
```json
{
  "message": "ASN block updated",
  "blocked_asn": { "_id": "64be9a04...", "provider": "Amazon Web Services", ... }
}
```

**Validation error `400`:**
```json
{
  "errors": { "message": "each CIDR range must be valid IPv4 CIDR notation (e.g. 192.0.2.0/24)" }
}
```

---

#### `DELETE /api/v2/tokens/blocked-asns/:id`

Remove a block entry by its MongoDB `_id`. Takes effect within 10 minutes (Redis cache TTL).

```
DELETE /api/v2/tokens/blocked-asns/64be9a04...
```

**Response `200`:**
```json
{
  "message": "successfully deleted blocked ASN",
  "deleted_asn": { "_id": "64be9a04...", "provider": "Amazon Web Services" }
}
```

**Not found `404`:**
```json
{ "message": "entry does not exist" }
```

---

### Tab 2 — Flagged Tokens

Shows tokens that triggered a honeypot route. Each hit means a token was used to probe undocumented endpoints — a strong signal of scraping or credential theft. The token is auto-suspended on hit.

#### `GET /api/v2/tokens/flagged-tokens`

**Query params (all optional):**

| Param | Type | Description |
|---|---|---|
| `resolved` | `boolean` | `false` to show only unresolved (recommended default view) |
| `skip` | `number` | Pagination offset |
| `limit` | `number` | Page size (default 100) |

**Response `200`:**
```json
{
  "message": "successfully retrieved flagged token entries",
  "flagged_tokens": [
    {
      "_id": "64ca6a59...",
      "token_suffix": "ab3f",
      "ip": "203.0.113.42",
      "user_agent": "python-requests/2.28.0",
      "honeypot_path": "/api/v2/tokens/export-all",
      "service": "auth-service",
      "action_taken": "suspended",
      "flagged_at": "2026-06-05T08:12:00.000Z",
      "resolved": false,
      "resolved_at": null,
      "resolution_note": null
    }
  ]
}
```

**Field reference:**

| Field | Description |
|---|---|
| `token_suffix` | Last 4 characters of the raw token (never the full token) |
| `honeypot_path` | The undocumented path that was hit |
| `service` | Which microservice caught the hit: `auth-service` or `device-registry` |
| `action_taken` | Always `suspended` — the token was blocked automatically |
| `resolved` | Whether an admin has reviewed and closed this alert |

---

#### `PUT /api/v2/tokens/flagged-tokens/:id/resolve`

Mark an alert as reviewed. Call this after an admin has investigated and taken action (e.g. notified the token owner, confirmed key rotation).

```
PUT /api/v2/tokens/flagged-tokens/64ca6a59.../resolve
```

**Request body:**
```json
{
  "note": "Investigated — automated scanner. Token owner notified and key rotated."
}
```

**Response `200`:**
```json
{
  "message": "successfully updated flagged token",
  "flagged_token": {
    "_id": "64ca6a59...",
    "resolved": true,
    "resolved_at": "2026-06-05T10:30:00.000Z",
    "resolution_note": "Investigated — automated scanner. Token owner notified and key rotated."
  }
}
```

---

## Part 2 — Enhancements to Existing Pages

The following new fields exist on tokens and clients. They should be surfaced in the existing `/modules/api-client` (user-facing) and `/system/clients` (admin-facing) pages.

These fields are returned on the existing token detail response and can be updated via `PATCH /api/v2/users/tokens/:token`.

---

### ⚠️ Auto-suspension banner — HIGHEST PRIORITY

**Field:** `request_pattern.auto_suspended` (`boolean`)

When `true`, the token has been automatically suspended by the security system (honeypot hit, anomaly detection, or error-rate spike). **Users are already receiving an automated email telling them to go to Settings › API to reinstate their token. The UI must honour this instruction.**

**Recommended UI:** Prominent warning banner on the token card:
> "This token has been automatically suspended due to suspicious activity. If this was not expected, you can reinstate it below or generate a new token."

Also expose:
- `request_pattern.suspension_reason` — detail message (e.g. `"User-Agent change detected"`)
- `request_pattern.suspended_at` — timestamp of suspension

**Reinstate button (calls PATCH endpoint):**
```
PATCH /api/v2/users/tokens/:token
Authorization: JWT <user_token>

{
  "request_pattern": {
    "auto_suspended": false
  }
}
```

**Response `200`:**
```json
{
  "message": "Successfully updated the token's metadata",
  "updated_token": { ... }
}
```

---

### Resource binding — Grid / Cohort lock

**Fields:** `allowed_grids: string[]`, `allowed_cohorts: string[]`

When non-empty, the token can only access the listed Grid or Cohort IDs. Empty arrays mean unrestricted access (the default for all existing tokens).

**Recommended UI:** In the token settings panel, a multi-select or tag input labelled "Restrict to Grids" and "Restrict to Cohorts". Show a pill/tag per bound ID. When empty, display "Unrestricted".

**Update via:**
```
PATCH /api/v2/users/tokens/:token
Authorization: JWT <user_token>

{
  "allowed_grids": ["64be9a04...", "61815b38..."],
  "allowed_cohorts": []
}
```

To remove the restriction, send empty arrays.

---

### Access schedule — time-window lock

**Field:** `access_schedule`

```json
{
  "enabled": false,
  "allowed_days": [],
  "allowed_hours_utc": { "start": 0, "end": 23 }
}
```

When `enabled: true`, requests outside the configured UTC window are rejected with `403`.

| Sub-field | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Toggle — defaults to `false` |
| `allowed_days` | `number[]` | 0 = Sunday … 6 = Saturday. Empty array = all days. |
| `allowed_hours_utc.start` | `number` | UTC hour 0–23. Supports overnight ranges (e.g. start=22, end=6). |
| `allowed_hours_utc.end` | `number` | UTC hour 0–23 |

**Recommended UI:** Toggle to enable, day-of-week checkboxes, and a time-range picker. Label clearly as **UTC** to avoid timezone confusion.

**Update via:**
```
PATCH /api/v2/users/tokens/:token
Authorization: JWT <user_token>

{
  "access_schedule": {
    "enabled": true,
    "allowed_days": [1, 2, 3, 4, 5],
    "allowed_hours_utc": { "start": 6, "end": 20 }
  }
}
```

---

### Origin enforcement — domain lock

**Fields on Client:** `enforce_origin: boolean`, `allowed_origins: string[]`

When `enforce_origin` is `true`, requests must carry an `Origin` header matching one of the values in `allowed_origins`. Relevant for browser-based integrations only.

**Recommended UI:** In the client settings form, a toggle for "Enforce origin restriction" and a list input for allowed origins (full URL with protocol, e.g. `https://app.airqo.net`).

**Update via:**
```
PUT /api/v2/users/clients/:clientId
Authorization: JWT <user_token>

{
  "enforce_origin": true,
  "allowed_origins": ["https://app.airqo.net", "https://platform.airqo.net"]
}
```

---

## Part 3 — PATCH endpoint reference

The new `PATCH /api/v2/users/tokens/:token` is the recommended way to update any token security field. It accepts the following fields (all optional):

| Field | Type | Notes |
|---|---|---|
| `allowed_grids` | `string[]` | Grid IDs this token may access. Empty = unrestricted. |
| `allowed_cohorts` | `string[]` | Cohort IDs this token may access. Empty = unrestricted. |
| `allowed_origins` | `string[]` | Allowed request origins for browser clients. |
| `access_schedule.enabled` | `boolean` | Toggle time-window enforcement |
| `access_schedule.allowed_days` | `number[]` (0–6) | Days of week (0=Sun, 6=Sat) |
| `access_schedule.allowed_hours_utc.start` | `number` (0–23) | Start hour UTC |
| `access_schedule.allowed_hours_utc.end` | `number` (0–23) | End hour UTC |
| `request_pattern.auto_suspended` | `boolean` | Set to `false` to reinstate a suspended token |

> **Note:** `tier` and `scopes` are intentionally not writable via this endpoint. Only admins can change these via internal tooling.

---

## Part 4 — Suggested service additions

### `adminService.ts`

```typescript
// Blocked ASN management
getBlockedASNs(params?: { active?: boolean; skip?: number; limit?: number })
createBlockedASN(payload: {
  provider: string
  asn?: string
  cidr_ranges?: string[]
  reason?: string
  active?: boolean
})
deleteBlockedASN(id: string)

// Flagged token monitoring
getFlaggedTokens(params?: { resolved?: boolean; skip?: number; limit?: number })
resolveFlaggedToken(id: string, note?: string)
```

### `clientService.ts`

```typescript
// Reinstate a suspended token
reinstateToken(token: string): Promise<void>
// calls PATCH /api/v2/users/tokens/:token with { request_pattern: { auto_suspended: false } }

// Update token security fields
updateTokenSecurity(token: string, payload: {
  allowed_grids?: string[]
  allowed_cohorts?: string[]
  allowed_origins?: string[]
  access_schedule?: {
    enabled: boolean
    allowed_days?: number[]
    allowed_hours_utc?: { start: number; end: number }
  }
  request_pattern?: {
    auto_suspended?: boolean
  }
}): Promise<void>
```

---

## Part 5 — Permissions

All five new admin endpoints (`/blocked-asns`, `/flagged-tokens`) are restricted to admin users. Apply the same RBAC gate already used on `/system/clients` — no new permissions need to be defined.

The token-level fields (resource binding, access schedule, auto-suspension) are viewable and writable by the token owner. `tier` and `scopes` changes require admin access and cannot be made via the PATCH endpoint.

---

## Part 6 — Error shapes

All endpoints return errors in the same shape as the rest of the platform:

```json
{
  "message": "human-readable message",
  "errors": { "message": "detail" }
}
```

HTTP status codes:

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Validation error |
| `401` | Unauthenticated / token suspended |
| `403` | Forbidden (insufficient scope, wrong origin, outside schedule, binding violation) |
| `404` | Not found |
| `429` | Rate limit exceeded |
| `500` | Server error |
