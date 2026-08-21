---
# Backend Support Request — Store Site/Device Display Names in Chart Configurations

- **Date:** 2026-08-21
- **Requester:** AirQo Nexus frontend team (`src/nexus`, Next.js 14)
- **Target service:** Auth service v2 (chart-configuration endpoints under `/users/preferences/charts`)
- **Status:** Awaiting backend decision
- **Priority:** Medium — not a bug, but removes a whole class of wasteful client-side API calls and a cross-browser data-loss workaround

## 1. Ask

When a user saves a chart configuration, allow the configuration to persist the **display names** of the selected sites and devices alongside their IDs, and return those names when the configuration is fetched. This lets the frontend render chart labels, tables and summaries without resolving names through additional API calls.

Concretely, the chart-config document should be able to store:

- `sites`: array of `{ site_id: string, name: string }`
- `devices`: array of `{ device_id: string, name: string }`

and the GET endpoints must return whatever was stored, round-trip, unchanged.

## 2. Why this is needed

The Nexus frontend currently resolves site/device display names client-side, with no server-side persistence:

1. When a chart config is saved, the frontend stores only ID arrays (`site_ids`, `device_ids`) — the backend schema accepts nothing else.
2. The frontend therefore keeps a **localStorage "sidecar"** (per browser) that snapshots names at save time so subsequent loads of the same browser don't need network calls.
3. On any fresh browser / device / incognito session, the sidecar is empty, so the frontend falls back to **fleet-wide name-resolution API calls**:
   - `GET /devices/sites/summary` — paginated, ~717 sites, up to 9 pages with 120ms delay between pages
   - (previously also `GET /devices/readings/recent` — removed after this analysis)
4. These calls fire on every analytics page load and every org-dashboard load until names are cached again.

The sidecar workaround is lossy: names saved on one browser are invisible to another, and the fleet-wide fallback is an expensive way to recover them. Persisting names in the chart config itself eliminates the fallback entirely and makes names consistent across all browsers and devices.

## 3. Current contract (verified empirically on 2026-08-21)

Endpoints (base: `https://staging-analytics.airqo.net/api/v2`):

| Method | Path | Notes |
|---|---|---|
| GET | `/users/preferences/charts` | list configs for the user's group |
| GET | `/users/preferences/charts/:chartId` | single config |
| POST | `/users/preferences/charts` | create (wrapped in `chartConfig` envelope) |
| PUT | `/users/preferences/charts/:chartId` | partial update (flat body) |
| POST | `/users/preferences/charts/:chartId/copy` | duplicate |
| DELETE | `/users/preferences/charts/:chartId` | delete |

Current document shape (relevant fields):

```json
{
  "site_ids": ["64a1...", "64b2..."],
  "device_ids": ["64c3..."],
  "locationColors": [{ "id": "64a1...", "color": "#123456" }]
}
```

Validation behaviour observed with a valid user JWT:

| Attempt | Payload | Result |
|---|---|---|
| POST create | `site_ids: [{ "site_id": "6a79...", "search_name": "Site A" }]` | **400** — `"site_ids must be an array of valid ObjectId strings"` |
| POST create | `site_ids: [{ "id": "6a79...", "name": "Site A" }]` | **400** — same message |
| POST create | `device_ids: [{ "device_id": "64c3...", "name": "Device X" }]` | **400** — `"device_ids must be an array of valid ObjectId strings"` |
| POST create | `site_ids: ["6a79..."]` + extra field `sites: [{ "site_id": "6a79...", "search_name": "Site A" }]` | **200** — but `sites` is **silently dropped**: absent from the saved document and from the GET round-trip |
| PUT update | `site_ids: [{ "site_id": "6a79...", "search_name": "Site A" }]` | **400** — same ObjectId message |
| GET single | round-trip of the config above | `site_ids: ["6a79..."]` only — no name fields exist |

Conclusions:

1. `site_ids` / `device_ids` are strictly validated as arrays of plain ObjectId strings on **both create and update** — object elements are rejected with a 400.
2. The service **whitelists persisted fields**: unknown top-level fields (e.g. `sites`) are accepted but silently discarded — they never reach the document and never come back.

## 4. Proposed change

### 4.1 Schema

Add two optional fields to the chart-config document:

```json
{
  "sites": [
    { "site_id": "6a79b6140185400014381382", "name": "Mukono Health Centre III" }
  ],
  "devices": [
    { "device_id": "64c3...", "name": "Aq_123456" }
  ]
}
```

- `sites.name` is the display name the client saved: the frontend will send `search_name` when available, falling back to `location_name`, then to the site's generated name.
- `devices.name` is the device display name.
- Both fields are **optional** (legacy configs without them must keep working) and **immutable from the backend's perspective** — the backend stores and returns them verbatim (see 4.3 for the refresh question).

### 4.2 Validation rules (suggested)

- `site_id` / `device_id`: must be valid ObjectId strings (same rule as today's array elements).
- `name`: non-empty trimmed string, max length ~200 chars.
- Duplicate IDs within the array: reject or last-wins (backend's call; frontend will dedupe anyway).
- If both `site_ids` and `sites` are sent, either derive `site_ids` from `sites` server-side or keep them in sync — the frontend will send both (ids for backward-compatible clients, objects for names).

### 4.3 Open question for the backend team: snapshot vs refresh

- **Option A — Snapshot (recommended):** store exactly what the client sent; return it verbatim. Zero backend cost, no coupling to the sites/devices registry. Names can go stale if a site is renamed later; acceptable for labels.
- **Option B — Server-side refresh:** resolve names from the sites/devices registry at read time and always return current names. Fresher, but adds read-time lookups and couples the config service to the registry.

The frontend only needs Option A to eliminate its fallback calls. Option B is a possible later enhancement.

## 5. Success criteria

1. `POST /users/preferences/charts` with `sites` / `devices` object arrays returns **200** and persists them.
2. `PUT /users/preferences/charts/:chartId` with the same fields returns **200** and persists them.
3. `GET /users/preferences/charts` and `GET /users/preferences/charts/:chartId` return the stored `sites` / `devices` arrays **unchanged** (round-trip preserved).
4. Invalid payloads (bad ObjectId, empty name, non-array) produce explicit 400 validation messages — no silent dropping.
5. Legacy configs without `sites` / `devices` continue to load and update normally.

## 6. Frontend follow-up once shipped

When this lands, the frontend will:

- Stop calling `GET /devices/sites/summary` for name resolution on the analytics page and org dashboard (removes the paginated fleet-wide fetch).
- Delete the localStorage sidecar mechanism (`siteNames` snapshot in `src/modules/analytics/utils/chartConfig.ts`).
- Save `sites` / `devices` name objects on every chart create/update and read names directly from the config response.

## 7. Frontend code references (for the implementer)

- Chart-config CRUD client: `src/shared/services/preferencesService.ts` (methods around lines 283-291).
- Config types: `src/shared/types/api.ts` — `CreateChartRequest`, `UpdateChartRequest`, `UserChartConfig` (~lines 2767-2842, currently `site_ids?: string[]`, `device_ids?: string[]`).
- Name-resolution gating: `src/modules/analytics/hooks/useChartManagement.ts` (~lines 181-191 — `missingSiteIds` + `useSiteNamesFallback`).
- Sidecar snapshot: `src/modules/analytics/utils/chartConfig.ts` (`ExplorerChartSidecar.siteNames`, ~line 74).
- Sites summary client: `src/modules/analytics/hooks/useSiteNamesFallback.ts` + `src/shared/services/siteSummary.ts` (paginated, 80/page).
---
