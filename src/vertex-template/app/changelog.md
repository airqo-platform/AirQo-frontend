# Vertex Template - Changelog

> **Note**: This changelog consolidates all improvements, features, and fixes to the Vertex template — the source template for the `create-vertex-app` CLI.

## Version 1.1.0
**Released:** July 4, 2026

### Template Stabilization — Mock-First, Domain-Neutral, Permission-Based

Overhauled the template from a lightly edited AirQo Vertex copy into a generic IoT device-management starter. A fresh clone now runs a full mock-data dashboard with zero environment variables and no backend; all branding, labels, links, and feature flags come from `vertex.config.ts`; and the new adapter contract replaces the AirQo HTTP client layer as the single integration point for any data source. Net effect: roughly 4,700 lines of AirQo-specific code removed.

<details>
<summary><strong>Credential-Free Mock Mode (4)</strong></summary>

- **`core/auth/auth-mode.ts`** [NEW]: `isAuthDisabled` flag and `createMockSession()` — with `auth.provider: "none"` the app boots straight into the dashboard with a synthetic session backing `useSession()`.
- **`middleware.ts`**: Skips NextAuth `withAuth` entirely in no-auth mode; keeps only the `/` → `/home` redirect.
- **`core/auth/authProvider.tsx`**: New `NoAuthBootstrap` branch hydrates the user store from `adapter.getCurrentUser()` and redirects auth routes to `/home`; token handoff, session refresh, and auto-logout are bypassed.
- **`core/adapters/mock-fixtures.ts`**: Fixed permission strings (dotted → underscore meant the demo admin had zero permissions); now derived from the RBAC constants so they cannot drift.

</details>

<details>
<summary><strong>Domain Neutrality (5)</strong></summary>

- **`core/config/system-group.ts`** [NEW]: All hardcoded `'airqo'` group/network checks (~20 call sites in hooks, auth, redux, permission service, and components) replaced with config-driven helpers keyed on `auth.systemGroupSlug`.
- **`vertex.config.ts`**: Shipped config is now the generic "Vertex Demo" — OpenStreetMap tiles (no token needed), operator-specific features off.
- **UI copy**: Brand strings, support email, docs/cookie/analytics links, measurement API examples, page titles, and metadata all read from `vertexConfig.org` / `vertexConfig.links` / `vertexConfig.api`.
- **`public/images/vertex_logo.svg`** [NEW]; the AirQo logo asset was removed.
- **`core/adapters/mock.ts`**: Unimplemented adapter methods now throw a descriptive error naming the method instead of silently returning fake successes.

</details>

<details>
<summary><strong>Permission-Based Access Control (4)</strong></summary>

- **`components/layout/accessConfig/route-guard.tsx`**: Removed `role`/`roles` props and `withRouteRole` — access decisions come exclusively from granular permissions; the frontend never compares role names.
- **`core/permissions/constants.ts`**: Removed the frontend `ROLES` catalog and `RoleName` type; roles are backend data (bundles of permissions). Legacy permission-string mappings kept as a documented data contract.
- **Admin panel** (`app/(authenticated)/admin/layout.tsx`, `components/layout/primary-sidebar.tsx`): Gated on the `SYSTEM_ADMIN` permission; `SUPER_ADMIN` overrides all checks.
- **`core/permissions/permissionService.ts`**: Fixed `isSuperAdmin` returning early and skipping group roles whenever the user had any network entry.

</details>

<details>
<summary><strong>Adapter Contract v1 (4)</strong></summary>

- **`core/apis/*`** [DELETED]: The AirQo HTTP client layer is gone from the template; the adapter is the single integration point between the UI and any data source.
- **`core/adapters/contracts/`** [NEW]: Hand-written capability interfaces — devices, sites, cohorts, manufacturers, users, organizations, access control (69 methods) — plus their request/response types, composed into `VertexAdapter` with no transport-layer imports.
- **Manufacturer rename**: The "network" entity is now `Manufacturer` (`getManufacturers`, `ManufacturerCreationRequest`, …) with deprecated `Network` aliases; wire-format `net_*` field names are unchanged pending the v2 DTO cleanup.
- **`core/services/feedback.ts`, `core/services/cloudinary.ts`** [MOVED from `core/apis`]: App services, not data-adapter concerns.

</details>

<details>
<summary><strong>Feature Removals (2)</strong></summary>

- **Shipping and grids**: Admin pages and all directly associated components, hooks, APIs, permissions, and the `features.shipping` config flag deleted (~3,000 lines). These are AirQo-operations surfaces that do not belong in the generic template.
- **`components/features/mini-map/mini-map.tsx`**: Polygon drawing kept as a generic capability — emits through a new `onPolygonChange` callback (exported `PolygonGeometry` type) instead of dispatching to the removed grids Redux slice.

</details>

<details>
<summary><strong>Hygiene, Docs & Fixes (5)</strong></summary>

- **`.env.example`**: Mock-mode variables only — no backend URLs, Slack channels, Cloudinary keys, or admin secrets; `.gitignore` tightened (`.env*` with `!.env.example`, editor folders).
- **`app/_docs`** [DELETED]: Copied internal docs removed; template planning docs live in `docs/`.
- **`README.md`**: Rewritten for the template — mock-first quick start, config reference table, access-control model, and an explicit "v1 supports the mock adapter and `none` auth only" statement.
- **`vertex.config.example.ts`**: Fully annotated per-key configuration reference, verified key-for-key against the zod schema.
- **`next.config.js`**: Merged and removed the dead `next.config.mjs`; dropped the React webpack alias that broke dev-mode SSR; the dev `/api/v2` proxy is now opt-in via `NEXT_PUBLIC_DEV_API_PROXY_TARGET`.

</details>

---

## Version 1.0.0
**Released:** June 2026

### Initial Release

Created the standalone boilerplate template for Vertex applications.

<details>
<summary><strong>Initial Scaffolding (3)</strong></summary>

- Created standalone boilerplate template for Vertex applications.
- Removed AirQo-specific branding, components, and hardcoded API dependencies.
- Added mock adapter for initial scaffolding.

</details>
