# Nexus UX Feedback Review — Implemented Changes & Backend Support Requirements

**Source:** Internal UX/UI Feedback Survey (13 responses, Aug 2026)
**Date:** Aug 2026
**Scope:** Review of survey feedback against available endpoints; items implemented this round; items needing backend support.

## Executive Summary

The survey surfaced three cross-cutting themes:

1. **Data availability is communicated too late** — users discover empty exports / missing readings only after completing a full flow.
2. **The Home page serves new users well but is redundant for returning users** — the onboarding checklist dominates the viewport.
3. **The Map's search/selection interaction is not intuitive** — selecting a location does not reliably center/zoom/open details.

This round we implemented the highest-impact items that are possible with existing endpoints, and we built a reusable **AI Assistant module** that directly addresses the "help users understand data" and "recommend suitable settings and charts" feedback.

## What Was Implemented This Round

### Recent Readings — new POST endpoint support

- `AnalyticsService.getRecentReadings()` now uses the new `POST /devices/readings/recent` endpoint (body `{ site_ids: [...] }`) for lists of more than 10 site IDs, replacing N parallel GET requests with a single request. Lists of ≤10 still use GET. This reduces request storms and aligns with the staging notes.
- Files: `src/shared/services/analyticsService.ts`, `src/shared/types/api.ts`, new tests.

### Data Export

- **Data availability check — REMOVED** — the `DataAvailabilityBanner` and `useDataAvailabilityCheck` hook (which used `getRecentReadings` per-site, creating N+1 request storms) have been deleted. The backend lacks a date-range-aware bulk availability endpoint; when one ships, the banner should be reimplemented using it.
- **Tab selection persistence** — switching between Sites/Devices/Countries/Cities no longer clears the selection; the confirmation dialog was removed.
- Files: `src/modules/data-download/` (hook + banner deleted, edits to page/header).

### Data Visualizer

- **PM2.5 prioritized over humidity** — auto-detection of the default measurement now ranks air-quality pollutants (PM2.5 → PM10 → NO₂ → O₃ → SO₂ → CO → AQI) above environmental variables.
- File: `src/modules/data-visualizer/utils/dataProfiling.ts`.

### Home page

- **Collapsible onboarding checklist** — returning users can collapse the checklist; the collapsed state persists in localStorage. The progress bar stays visible.
- File: `src/modules/user-checklist/Checklist.tsx`.

### Map

- **Auto-center/zoom on location selection** — selecting a monitored location from the sidebar list now flies the map to it (zoom 12) and opens the Location Details panel.
- File: `src/modules/airqo-map/MapPage.tsx`.

### AI Assistant module (new)

- A reusable, provider-agnostic AI assistant foundation: server-side streaming route (`/api/ai/assistant`) with session guard, rate limiting, and zod validation; OpenAI-compatible + mock providers; a client streaming hook; a floating assistant panel mounted in the main and map layouts; feature-aware context for the six most-used sidebar features; and inline AI Insights cards on the Analytics and Rankings pages.
- See `docs/AI_ASSISTANT.md` for full details.

## Feedback by Feature — Status

Legend: ✅ Implemented this round · 🟡 Implementable now with existing endpoints (recommended next) · 🔴 Needs backend support

### Home

| Feedback                                                                  | Status                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Checklist takes too much space / annoying for returning users             | ✅ Implemented (collapsible)                                                   |
| Show latest readings snapshot of favorite locations                       | 🟡 Implementable now (recent-readings endpoint + favorites) — recommended next |
| Show recent activity / previous downloads                                 | 🔴 Needs backend (download/activity history not tracked)                       |
| Show alerts                                                               | 🔴 Needs backend (alert system)                                                |
| Consistent terminology ("Download Data" vs "Visualization & Data Export") | 🟡 Implementable now (copy)                                                    |

### Map

| Feedback                                                | Status                                               |
| ------------------------------------------------------- | ---------------------------------------------------- |
| Search/selection should auto-center, zoom, open details | ✅ Implemented                                       |
| Heatmap view (currently disabled)                       | 🔴 Needs backend data aggregation / product decision |
| More pollutants (NO₂, CO, temp/humidity)                | 🔴 Depends on backend sensor data availability       |
| Map style switcher                                      | 🟡 Implementable now (Mapbox styles)                 |
| Highlight favorites on map                              | 🟡 Implementable now (favorites + map)               |
| Location Details panel discoverability                  | 🟡 Implementable now (frontend)                      |
| Emoji/cluster clarity at wide zoom                      | 🟡 Implementable now (frontend)                      |

### Favorites

| Feedback                             | Status                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| 4-favorite limit too small           | 🟡/🔴 Depends on whether limit is client- or server-enforced (needs verification) |
| "Manage Favorites" button prominence | 🟡 Implementable now (styling)                                                    |
| Reorder / tag favorites              | 🔴 Needs backend persistence                                                      |
| Better "No Data" messaging           | 🟡 Implementable now (copy)                                                       |
| Add favorites from the map           | 🟡 Implementable now (frontend)                                                   |
| Merge favorites with data export     | 🔴 Product decision + backend                                                     |

### Data Export

| Feedback                                            | Status                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab switch clears selection                         | ✅ Implemented (persistence)                                                                                                                                                                                                                                                                                                     |
| Data availability not checked early                 | ❌ Removed — recent-readings-based availability check (DataAvailabilityBanner, useDataAvailabilityCheck) was deleted to eliminate N+1 per-site API calls on every selection change. The backend lacks a date-range-aware availability endpoint; a future implementation should use a single bulk endpoint when one is available. |
| Conflicting preview messages                        | 🟡 Partially addressed; recommend aligning preview copy with availability result                                                                                                                                                                                                                                                 |
| 90-day date range limit                             | 🔴 Backend limit                                                                                                                                                                                                                                                                                                                 |
| Device category mismatch → empty exports            | 🟡 Implementable now (frontend validation)                                                                                                                                                                                                                                                                                       |
| "Data available / Partial / No readings" indicators | ❌ Removed — same reason as above; will be reimplemented when a proper availability endpoint is available                                                                                                                                                                                                                        |

### Data Visualizer

| Feedback                                            | Status                                                     |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Defaults to humidity instead of PM2.5               | ✅ Implemented                                             |
| WHO/NEMA reference lines discoverability            | 🟡 Implementable now (frontend)                            |
| Guided templates ("Compare cities", "PM2.5 trends") | 🟡 Implementable now (frontend) — AI module can power this |
| Sample dataset / demo                               | 🟡 Implementable now (frontend)                            |
| Recommended charts based on data                    | 🟡 Implementable now — AI module can power this            |
| Large data handling                                 | 🔴 Backend/performance                                     |

### Profile & Account

| Feedback                     | Status                                  |
| ---------------------------- | --------------------------------------- |
| 2FA                          | 🔴 Needs backend (auth)                 |
| QR code scanner              | 🔴 Needs backend                        |
| Manage / leave organizations | 🟡/🔴 Depends on existing org endpoints |

## Backend Support Requirements

### High priority

1. **Date-range-aware data availability endpoint** — the current availability check uses `GET /devices/readings/recent` (latest reading per site) as a proxy. A backend endpoint that returns, per site, whether measurement data exists within a given date range (and the record count / latest reading date) would make the Data Export availability check precise. Suggested: extend `GET /devices/measurements` or add `GET /devices/readings/availability?site_ids=...&start=...&end=...`.
2. **Download/activity history** — to power "recent activity / previous downloads" on the Home page, the backend needs to record and expose a user's download history.
3. **Favorites expansion** — verify whether the 4-favorite cap is server-enforced; if so, raise it and support reordering/tagging (persistence).

### Medium priority

4. **Alert system** — a user-facing alert/notification feed (spike alerts, AQI category changes) for the Home page and Map.
5. **Additional pollutants** — expose NO₂, CO, O₃, temperature/humidity where sensor data exists, in map readings and export endpoints.
6. **Heatmap data** — aggregated grid data to enable a stable heatmap view on the Map.
7. **2FA / QR code** — authentication enhancements.

### Low priority / product decisions

8. **Merge Favorites with Data Export** — product decision; would consolidate two overlapping features.
9. **90-day export limit** — product/backend decision on extending the range.
