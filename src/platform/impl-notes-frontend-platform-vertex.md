# Implementation Notes: Cohort Privacy Enforcement — Platform & Vertex

Hi team, device-registry has been updated with cohort access control. Most changes are fully server-side and transparent to the frontend. There is one **required change** and a few **optional improvements** described below.

---

## Context

Cohorts are now private by default to protect partner data. Any cohort that the backend team has not explicitly approved as publicly accessible will now return empty results from event and readings queries. The backend team will confirm which cohorts are publicly accessible before this goes live — coordinate with them before testing.

For publicly accessible cohorts, behaviour is completely unchanged. For private cohorts, device owners can still access their own data by passing `user_id` as described below.

---

## Required Change: Pass `user_id` on Cohort Queries

Whenever the frontend queries **events**, **measurements**, or **readings** using a `cohort_id` query parameter, append the authenticated user's ID as `user_id`:

**Before:**

```
GET /devices/events?cohort_id=<cohort_id>&...
GET /devices/readings?cohort_id=<cohort_id>&...
```

**After:**

```
GET /devices/events?cohort_id=<cohort_id>&user_id=<authenticated_user_id>&...
GET /devices/readings?cohort_id=<cohort_id>&user_id=<authenticated_user_id>&...
```

**When to send `user_id`:**

- Always send it when a `cohort_id` is in the request and the user is authenticated
- If the cohort is publicly accessible, the server ignores `user_id` — sending it does no harm
- If the cohort is private and `user_id` is omitted, the server returns empty results for all callers including device owners

**Where to source `user_id`:**
Use the authenticated user's `_id` from your auth context (the same database ID used for other authenticated requests). Do not use a username or email address.

> **Note:** Grid-based queries (`grid_id` parameter) do not support this bypass — private grids return empty results for all callers. No `user_id` is needed for grid queries.

---

## Handling Empty Results Gracefully

When a private cohort query returns no data, the response is still `success: true` with an empty dataset — it is not an error. Example:

```json
{
  "success": true,
  "message": "...",
  "data": []
}
```

Ensure your UI handles this state with a friendly message rather than a generic error screen.

Suggested message for this state:

> _"No data available. This cohort may be private or contain no deployed devices."_

---

## Optional: `includeSiteDevices` on Device Listings

`GET /devices` now accepts an optional `?includeSiteDevices=true` query parameter. When set, each device in the response will include a `site.devices` array with the name and ID of co-located devices at the same site.

This can be used to avoid a second round-trip when building device-at-site views. It defaults to `false` so existing device list calls are unchanged.

---

## Response Shape Change: Bulk Device Assignment

If either app calls the bulk device assignment endpoint and reads from the response, the shape of the returned cohort object has changed.

**Endpoint:** `POST /devices/cohorts/{cohort_id}/assign-devices`

**Response (new shape):**

```json
{
  "success": true,
  "updated_cohort": {
    "assigned": ["<device_id>", "..."],
    "already_assigned": ["<device_id>", "..."]
  }
}
```

Previously it returned the full cohort document. If you were reading cohort fields (e.g. a cohort name or description) from this response, fetch the cohort separately after assignment instead.

---

## Summary

| Change                                                 | Action required                      |
| ------------------------------------------------------ | ------------------------------------ |
| Pass `?user_id=` on `cohort_id` event/readings queries | **Required** for authenticated users |
| Handle empty private cohort state gracefully           | **Recommended**                      |
| `includeSiteDevices=true` on device listings           | Optional opt-in                      |
| Bulk device assign response shape                      | Check if consumed; update if so      |
