# Backend Report: AirQo Nexus Frontend -- Staging Observations

**Date:** 2026-08-22
**Scope:** Browser-level end-to-end observations of the AirQo Nexus frontend against staging-analytics.airqo.net
**Audience:** AirQo backend engineering team
**Prepared by:** Frontend engineering (Nexus app)

---

This document contains verified, standalone findings from production-traffic
observation of the Nexus frontend against the staging analytics backend. Each
finding includes the exact endpoint, HTTP method, observed behavior, and a
concrete ask. Nothing here depends on prior reports or external references.

All evidence was collected on 2026-08-22 using browser network inspection,
API-level probing with a valid user JWT, and frontend source code review.

---

## 1. CRITICAL -- Chart Data Endpoint Performance

**Severity: CRITICAL**

The D3 chart data endpoint is the single largest user-facing latency bottleneck
on the analytics page.

| Endpoint                                                                | Method | Observed                                              | Impact                                                                         |
| ----------------------------------------------------------------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| POST /analytics/dashboard/chart/d3/data (proxied via BFF /api/data/...) | POST   | 6,753 ms and 6,660 ms for two charts on one page load | Users wait approximately 7 s for the analytics dashboard to become interactive |

**Evidence:** Measured via browser Resource Timing API during a standard
analytics page load on 2026-08-22. Two independent chart requests both exceeded
6.5 seconds, with per-request latency of approximately 6.7 s. Users wait
approximately 7 s for the analytics dashboard to become interactive.

**Ask:**

- Investigate server-side query optimization for this endpoint. Common causes
  include full-table scans on high-cardinality time-series data, missing indexes
  on the date and site columns, or unnecessary aggregation over unbounded date
  ranges.
- Add response caching keyed on site plus pollutant plus date range plus
  granularity with a reasonable TTL. Chart data for recent ranges changes
  infrequently and repeat views within minutes should hit cache.
- Consider a result cap (for example, max 1,000 data points per series) with
  downsampling for long date ranges. Sending tens of thousands of points to a
  Recharts client is wasteful because the renderer downsamples visually anyway.
- If feasible, support a batch endpoint that accepts multiple chart
  configurations in one request to amortize the per-request overhead across all
  charts on a page.

---

## 2. HIGH -- Chart Data Response Shape Lacks IDs

**Severity: HIGH**

Each entry in the D3 chart data response includes site_name and
device_name but does not include site_id or device_id.

| Endpoint                                | Method | Status | Missing fields     | Client workaround                                            |
| --------------------------------------- | ------ | ------ | ------------------ | ------------------------------------------------------------ |
| POST /analytics/dashboard/chart/d3/data | POST   | 200    | site_id, device_id | Reverse-match site_name against a pre-fetched name-to-id map |

**Evidence:** On 2026-08-22, the response payload for this endpoint was
captured. Each data point contains site_name (string) and device_name
(string) alongside the numeric readings. No site_id or device_id field is
present anywhere in the entry.

**What the frontend must do as a result:** Before rendering multi-site charts,
the frontend builds a name-to-id map from a separate
GET /devices/sites/summary call. Each data point's site_name is
reverse-matched against this map to determine which chart series it belongs to.
This approach is fragile for several reasons:

- Name collisions (two sites sharing the same display name) cause the first
  match to win, silently misattributing data to the wrong series.
- The fleet summary call fetches all approximately 717 sites to build this map,
  adding latency and transferring unnecessary bandwidth.
- Any name mismatch (trailing whitespace, case difference, backend rename)
  breaks the match silently. Data disappears from the chart with no error
  message.

**Ask:** Include site_id and device_id as first-class fields in each D3
chart data entry. This eliminates the reverse-match logic, the fleet summary
call for chart rendering, and the fragility of name-based matching.

---

## 3. HIGH -- Chart Config Sites/Devices Body Asymmetry

**Severity: HIGH**

The POST (create) and PUT (update) endpoints for chart configurations accept
sites and devices arrays at different positions in the request body. The
POST endpoint silently drops data when the arrays are placed at the wrong level.

| Endpoint                            | Method | Status | Correct body position                    | Wrong position result              |
| ----------------------------------- | ------ | ------ | ---------------------------------------- | ---------------------------------- |
| /users/preferences/charts           | POST   | 200    | sites/devices inside chartConfig wrapper | Silently dropped: sites: [] stored |
| /users/preferences/charts           | PUT    | 200    | sites/devices at top level               | 400 if stale entry present         |
| /users/preferences/charts/{id}/copy | POST   | 200    | N/A (preserves from source)              | N/A                                |

**Evidence (POST asymmetry):** On 2026-08-22, a POST to
/users/preferences/charts with sites at the top level returned HTTP 200.
The resulting GET showed sites: []. The same POST with sites inside the
chartConfig object returned HTTP 200 with sites correctly populated on GET
round-trip.

**Evidence (PUT stale entry):** A PUT request with site_ids containing
sites A and B, but sites containing an entry for site C (which is not in
site_ids), returned HTTP 400 with the message: "sites[].site_id ... is not
in this chart's site_ids". This is strict validation, which is good in
principle, but the error message does not tell the caller what to do about it.

**What is good:** Validation is now strict. Non-empty names, 200-character max
length, and consistency between site_ids and sites arrays are all enforced
on both POST and PUT. The copy endpoint correctly preserves sites from the
source configuration. These are solid behaviors worth keeping.

**Ask:**

- Align the body shape between POST and PUT. Both should accept sites and
  devices at the same structural level. The current asymmetry is a
  maintenance trap for every frontend consumer.
- When a PUT includes a stale sites entry not matching site_ids, either
  auto-prune the stale entry and succeed, or return HTTP 422 with a field-level
  error indicating which entry is stale and what site_ids are expected. A
  bare HTTP 400 with a message buried in the response body is hard to act on
  programmatically.

---

## 4. MEDIUM -- Fleet Sites Summary Ignores Multi-ID Filter

**Severity: MEDIUM**

The sites summary endpoint does not support filtering by multiple site IDs,
forcing clients to fetch the entire fleet.

| Endpoint                   | Method | Param    | Observed                                              | Consequence                                                                                               |
| -------------------------- | ------ | -------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| GET /devices/sites/summary | GET    | site_ids | Only the first site_id is used; remaining are ignored | Client must paginate through the full approximately 717-site fleet (9 pages at approximately 120 ms each) |

**Evidence:** On 2026-08-22, a GET to
/devices/sites/summary?site_ids=ID1&site_ids=ID2 returned results for only
ID1. Passing both IDs as a comma-separated string had the same result. Only
a single-ID request returned the expected single site.

**Why this matters:** The frontend uses this endpoint to resolve display names
for chart site IDs. When a user has three charts with six unique site IDs, the
client cannot request just those six sites. It must fetch all approximately 717
sites across nine paginated calls, adding approximately 1 second of latency and
transferring unnecessary data.

**Ask:** Accept site_ids as a comma-separated list (for example,
?site_ids=ID1,ID2,ID3) or as an array parameter (for example,
?site_ids=ID1&site_ids=ID2). Return only the requested sites. This is a
small backend change with significant client-side performance impact.

---

## 5. MEDIUM / LOW -- Slow Endpoints and Probe Concerns

**Severity: MEDIUM / LOW**

Several endpoints have unexpectedly slow response times or have specific
reliability requirements due to their role in the application's health
monitoring.

### 5a. Maintenances endpoint: health probe must stay cheap

| Endpoint                          | Method | Observed behavior  |
| --------------------------------- | ------ | ------------------ |
| GET /users/maintenances/analytics | GET    | Healthy (HTTP 200) |

This endpoint serves as the app's backend-outage health probe. During an
outage, many clients poll this endpoint simultaneously to detect recovery.

**Ask:** Keep this endpoint cheap, cacheable, and side-effect-free. If it
becomes expensive (for example, if it starts querying large tables), the outage
overlay will trigger false positives or add unnecessary load during actual
outages when many clients are polling it simultaneously.

### 5b. Theme preferences endpoint slow response

| Endpoint                                          | Method | Observed response time |
| ------------------------------------------------- | ------ | ---------------------- |
| GET /users/preferences/theme/user/{id}/group/{id} | GET    | Approximately 1,058 ms |

**Ask:** This endpoint takes over 1 second per request. Add server-side caching
(user plus group scoped, TTL of at least 5 minutes) or optimize the query.

### 5c. Auth session endpoint slow on profile page

| Endpoint              | Method | Status | Observed response time       |
| --------------------- | ------ | ------ | ---------------------------- |
| GET /api/auth/session | GET    | 200    | Approximately 1,000-1,080 ms |

**Evidence:** On 2026-08-22, the auth session endpoint was observed taking
approximately 1 second on the profile page. This is the NextAuth session
fetch, which runs on every authenticated page.

**Ask:** This is a mild concern. If possible, ensure the session token
validation is cached for the duration of the JWT lifetime rather than hitting
the auth store on every request.

---

## 6. LOW / Suggestion -- Validation, Data Health, and Documentation

**Severity: LOW / Suggestion**

### 6a. Chart data endpoint: publish OpenAPI documentation

HTTP 422 responses from POST /analytics/dashboard/chart/d3/data are validation
errors. The valid request contract is currently undocumented.

**Observed contract (empirically verified on 2026-08-22):**

| Field         | Accepted format                          | Rejected format |
| ------------- | ---------------------------------------- | --------------- |
| startDateTime | YYYY-MM-DD or full ISO 8601              | N/A             |
| endDateTime   | YYYY-MM-DD or full ISO 8601              | N/A             |
| startDate     | N/A (rejected with 422 "Field required") | N/A             |
| endDate       | N/A (rejected with 422 "Field required") | N/A             |

**Ask:** Publish an OpenAPI spec or at minimum a documented request schema for
this endpoint. The field names startDateTime/endDateTime differ from the
obvious startDate/endDate, which is a source of confusion. Both YYYY-MM-DD and
full ISO 8601 are accepted for the datetime fields.

### 6b. Stale data for some valid site IDs

On 2026-08-22, six test site IDs returned empty data arrays from
POST /analytics/dashboard/chart/d3/data (HTTP 200 with data: []). These are
known staging sites that historically had readings.

**Ask:** Run a data-health check on the staging analytics database. Empty
responses for sites that previously had data may indicate a migration issue,
data archival, or pipeline failure. This is not blocking but is worth
investigating to ensure staging fidelity.

### 6c. Dedicated /health endpoint

The app currently uses GET /users/maintenances/analytics as its backend-outage
health probe. This endpoint works, but it is a maintenance-scheduling endpoint
being repurposed for health checking.

**Ask:** Consider adding a lightweight dedicated /health or /ping endpoint.
This avoids coupling health-check semantics with business-logic endpoints and
gives the ops team a clear target for uptime monitoring.

---

## 7. What Already Works Well

Not everything needs fixing. The following backend behaviors are solid and
should be preserved as-is.

### 401 handling and token refresh

The backend correctly returns HTTP 401 when a JWT expires, enabling clients to
detect expired tokens and initiate refresh. The refresh flow is stable and
predictable, with no spurious errors during normal operation.

### Rankings endpoints

All three rankings endpoints return HTTP 200 with well-structured data:

| Endpoint                           | Method | Status |
| ---------------------------------- | ------ | ------ |
| /devices/readings/rankings         | GET    | 200    |
| /devices/readings/rankings/history | GET    | 200    |
| /devices/readings/recent           | GET    | 200    |

Response shapes are clean, paginated where appropriate, and do not require any
client-side transformation beyond display formatting.

### Map endpoints

The map data endpoints return data in the expected shapes with no surprises:

| Endpoint                 | Method | Status |
| ------------------------ | ------ | ------ |
| /devices/grids/countries | GET    | 200    |
| /devices/readings/map    | GET    | 200    |

These endpoints are fast (sub-200 ms) and return compact payloads.

### Sites/devices round-trip on chart configs

Since the chart config sites/devices feature was deployed, the round-trip
works:

- POST with sites inside chartConfig: stored correctly, returned on GET.
- PUT with sites at top level: stored correctly, returned on GET.
- GET returns both site_ids (flat strings) and sites (objects with site_id
  and name).
- Copy preserves sites from the source configuration.

### Strict validation on chart config names

Non-empty names, 200-character maximum length, and consistency between site_ids
and sites arrays are enforced. Empty names and oversized names are rejected.
This prevents garbage data from entering the system.

### Copy endpoint

POST /users/preferences/charts/{id}/copy correctly duplicates a chart
configuration including its sites, devices, and title. The copy is independent
of the source (editing the copy does not affect the original).
