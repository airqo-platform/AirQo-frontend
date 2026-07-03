# Vertex Template Coupling Audit

## Purpose

This audit maps the current Vertex app coupling that must be addressed before extracting a reusable `vertex-template` and publishing `create-vertex-app`.

The current app is a Next.js App Router project. Routes live in `app/`, feature UI in `components/features/`, layout in `components/layout/`, API services in `core/apis/`, React Query hooks in `core/hooks/`, auth/proxy routes in `app/api/`, and shared state/config in `core/`, `context`, and `lib`.

## Summary

V1 should not rewrite Vertex. It should isolate existing behavior behind configuration and adapters.

Primary coupling areas:

- AirQo branding in metadata, layout, login, errors, download, footer, topbar, title bar, app launcher, and support links.
- AirQo API access through `NEXT_PUBLIC_API_URL`, proxy routes, `secureApiProxyClient`, and `core/apis/*`.
- AirQo group/network assumptions in auth, Redux user state, permissions, hooks, and device/site filtering.
- Hardcoded public measurement endpoint examples.
- Map defaults and Mapbox-only assumptions.
- Optional AirQo/ops features that should be feature-flagged or excluded from v1 template defaults.

V1 adapter support should be `mock` and `airqo` only. Generic REST remains v2.

## Priority Legend

- `P0`: Required before template extraction.
- `P1`: Required before public v1 release, can follow adapter foundation.
- `P2`: Can remain in AirQo mode or be deferred if hidden by feature flags.
- `Keep`: Intentional dependency or acceptable package/library usage.

## Coupling Inventory

| Area | Files | Current coupling | Replacement | Priority |
|---|---|---|---|---|
| App metadata | `app/layout.tsx` | Hardcoded `AirQo Vertex`, AirQo description, `vertex.airqo.net`, AirQo image path | Read org/app metadata from `vertexConfig.org` and template defaults | P0 |
| Page title provider | `context/page-title-context.tsx` | `APP_TITLE = "AirQo Vertex"` | Use configured app/org title | P0 |
| Login branding | `app/login/page.tsx` | AirQo logo and copy about AirQo open data channels | Use configured logo, org name, support/value copy | P0 |
| Auth error page | `app/auth-error/page.tsx` | AirQo logo, `support@airqo.net`, AirQo copyright | Use config support email, logo, org name | P0 |
| Topbar | `components/layout/topbar.tsx` | AirQo logo, account labels | Use configured logo and neutral account labels | P0 |
| Primary sidebar | `components/layout/primary-sidebar.tsx` | AirQo logo, Vertex label, AirQo admin role names | Logo from config; admin visibility from config and permission mode | P1 |
| Desktop titlebar | `components/layout/desktop-titlebar.tsx` | AirQo logo fallback and `AirQo Vertex` text | Use config branding and generic fallback | P1 |
| Footer | `components/layout/Footer.tsx` | AirQo copyright and platform name | Config org name and app name | P1 |
| App launcher | `components/layout/AppDropdown.tsx` | AirQo ecosystem links, AirQo app store copy | Hide by default or make AirQo-mode-only feature | P2 |
| Download page | `app/download/page.tsx`, `components/features/download/*`, `core/constants/app-downloads.ts` | AirQo Vertex Desktop release URL/copy | Feature-flag desktop download; config-driven URL if enabled | P2 |
| Cookie banner | `components/features/auth/cookie-info-banner.tsx`, `lib/envConstants.ts` | AirQo cookie copy and default AirQo policy URL | Configurable policy URL and org name | P1 |
| Feedback | `components/features/feedback/*` | Event key `airqo:feedback:open`, "Send feedback to AirQo" | Configurable org name; event key can be generic | P1 |
| Public support links | `app/not-found.tsx`, `components/ui/permission-tooltip.tsx` | AirQo support/docs links | Configurable support and docs URLs | P1 |
| Theme color | `app/globals.css`, `tailwind.config.ts` | Primary blue is hardcoded in CSS variables | Inject/configure `org.primaryColor`; keep Tailwind variable pattern | P0 |
| API base URLs | `lib/envConstants.ts`, `core/urls.tsx`, `core/config/proxyConfig.ts` | Requires `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_TOKEN`; Analytics default is AirQo | Move API base URL/token requirements behind adapter mode | P0 |
| Axios/proxy client | `core/utils/secureApiProxyClient.ts`, `core/utils/proxyClient.ts`, `core/apis/axiosConfig.ts` | AirQo proxy behavior and auth headers | Keep for AirQo adapter; mock adapter bypasses it | P0 |
| Dynamic proxy route | `app/api/[...path]/route.ts` | Proxies to configured AirQo-style backend path | Keep AirQo-mode only; avoid requiring in mock mode | P1 |
| Devices service | `core/apis/devices.ts` | Direct AirQo endpoint paths | Wrap via AirQo adapter; do not rewrite endpoints in v1 | P0 |
| Sites service | `core/apis/sites.ts` | Direct AirQo endpoint paths | Wrap via AirQo adapter | P0 |
| Cohorts service | `core/apis/cohorts.ts` | Direct AirQo endpoint paths | Wrap needed methods via adapter | P0 |
| Networks service | `core/apis/networks.ts`, `core/services/network-service.ts` | AirQo users/networks endpoints and `ADMIN_SECRET` flows | AirQo adapter or AirQo-mode-only admin feature | P1 |
| Grids service | `core/apis/grids.ts` | Direct backend paths | Include only if grid feature remains enabled; otherwise flag | P2 |
| Users/auth service | `core/apis/users.ts`, `app/api/auth/[...nextauth]/*` | AirQo login/profile/session shape | Keep for AirQo mode; mock/no-auth path needed for template evaluation | P0 |
| Cloudinary | `core/apis/cloudinary.ts`, `app/api/cloudinary/upload/route.ts` | Requires Cloudinary env vars | Feature-flag uploads or make optional config | P2 |
| Slack logging | `app/api/log-to-slack/route.ts`, `lib/logger.ts` | Slack webhook route | Keep optional; disabled when env missing | P2 |
| Mapbox | `components/features/mini-map/mini-map.tsx`, `components/features/location-autocomplete/LocationAutocomplete.tsx` | Mapbox token, Mapbox geocoding, Kampala default center | Config map provider, default center/zoom, optional Mapbox token | P1 |
| Measurement examples | `components/features/devices/device-measurements-api-card.tsx`, `components/features/sites/site-measurements-api-card.tsx`, `components/features/cohorts/cohort-measurements-api-card.tsx`, `components/features/grids/grid-measurements-api-card.tsx` | Hardcoded `https://api.airqo.net/api/v2/...` examples | Build URLs from config/API docs base; hide in mock mode if misleading | P1 |
| Auth default org | `core/auth/authProvider.tsx` | Prefers group named `airqo` as default organization | Adapter/config-defined system group or AirQo-mode-only logic | P0 |
| Redux user context | `core/redux/slices/userSlice.ts` | Treats `airqo` group as personal/elevated context | Abstract into configured system group or mock local context | P0 |
| Permissions | `core/permissions/*`, `core/hooks/usePermissions.ts` | AirQo RBAC names and AirQo group fallback | Keep AirQo mode; add simple mock/no-auth permissions for v1 evaluation | P0 |
| Device hooks | `core/hooks/useDevices.ts` | Imports `devices` API directly and checks `airqo` group | Route through adapter-backed hook layer | P0 |
| Site hooks | `core/hooks/useSites.ts` | Imports `sites` API directly and checks `airqo` group | Route through adapter-backed hook layer | P0 |
| Network hooks | `core/hooks/useNetworks.ts` | Sorts `airqo` network first; imports APIs directly | Adapter-backed data and config-defined preferred network | P1 |
| User context hook | `core/hooks/useUserContext.ts` | AirQo-specific personal/org scope comments and assumptions | Configurable auth/permission mode | P1 |
| Device claim/import | `components/features/claim/*`, `components/features/devices/import-device-modal.tsx` | Claim AirQo Device copy, reserved `airqo` cohort, AirQo device placeholders | Configurable device vocabulary; reserved names AirQo-mode only | P1 |
| Device deploy | `components/features/devices/deploy-device-component.tsx` | Direct fetch to `/api/v2/devices/my-devices?claim_status=claimed`; default network `airqo` | Move data call into hook/adapter; default network from config/current context | P0 |
| Device create/admin | `components/features/devices/create-device-modal.tsx`, `app/(authenticated)/admin/networks/[id]/page.tsx` | "Add AirQo Device" copy and AirQo network branch | Configurable copy; AirQo branch only in AirQo mode | P1 |
| Public visibility copy | `components/features/home/network-visibility-card.tsx`, `components/features/cohorts/cohort-detail-card.tsx` | "AirQo Map" copy | Configurable public map/product name | P1 |
| Empty states | `components/features/home/HomeEmptyState.tsx`, `components/features/cohorts/cohorts-empty-state.tsx` | AirQo device copy | Configurable device terminology | P1 |
| Shipping labels | `components/features/shipping/*` | AirQo Air Quality Monitor label text | AirQo-mode only or config-driven label brand | P2 |
| Network request flows | `components/features/networks/*`, `app/api/network/route.ts`, `app/api/devices/network-creation-requests/*` | AirQo backend admin-secret network creation | AirQo-mode admin feature; not required for mock default | P2 |
| Query/cache keys | `core/providers/query-provider.tsx`, `core/utils/clientCache.ts` | `airqo:vertex:*` storage keys | Generic `vertex:*` or config namespace to avoid cross-instance collisions | P1 |
| Internal docs/changelog | `app/changelog.md`, `app/_docs/internal/*`, `app/_docs/deprecated/*` | AirQo internal history and architecture | Exclude or heavily sanitize from `vertex-template` | P2 |

## Direct API Call Notes

Most backend access is already centralized, which is good for adapter extraction:

- `core/apis/devices.ts`
- `core/apis/sites.ts`
- `core/apis/cohorts.ts`
- `core/apis/grids.ts`
- `core/apis/networks.ts`
- `core/apis/users.ts`
- `core/apis/roles.ts`
- `core/apis/permissions.ts`
- `core/apis/organizations.ts`

The main component-level exceptions found are:

- `components/features/devices/deploy-device-component.tsx`: direct `fetch("/api/v2/devices/my-devices?claim_status=claimed")`
- `components/features/networks/create-network-form.tsx`: posts to `/api/network`
- `components/features/networks/network-request-dialog.tsx`: posts to `/api/devices/network-creation-requests`
- `components/features/mini-map/mini-map.tsx`: fetches Mapbox reverse geocoding
- `components/features/location-autocomplete/LocationAutocomplete.tsx`: fetches Mapbox suggestions
- Measurement API card components hardcode public AirQo API examples.

## Recommended Migration Order

1. Add typed config and defaults.
2. Add adapter interface and mock adapter.
3. Add AirQo adapter wrapping existing `core/apis`.
4. Refactor `core/hooks` to use adapter-backed access.
5. Remove component-level direct backend calls or move them behind hooks/adapters.
6. Config-drive branding, metadata, theme, map defaults, support links, and feature flags.
7. Hide or AirQo-mode-gate admin/network/shipping/download/app-launcher features.
8. Sanitize docs and extract template.

## Out of Scope For V1

- Generic REST adapter.
- Production deploy wizard.
- Plugin system.
- Managed hosting.
- Template upgrade command.
- Admin UI for config.
- Replacing `@airqo/icons-react` solely because of package name; icon imports can stay unless brand/legal review requires removal.

## Open Questions For Maintainers

- Should `@airqo/icons-react` remain a public dependency in the generic template?
- Should desktop download and shipping workflows ship disabled by default or be excluded from template v1?
- What is the approved default mock organization name, logo, and primary color?
- Should mock mode use `auth.provider = "none"` with a synthetic local user, or keep NextAuth with seeded credentials?
- Should public measurement API cards appear in mock mode, or only in AirQo mode?

## Contributor Guidance

This audit is documentation only. Follow-up implementation tasks should avoid broad file ownership conflicts:

- Core maintainers should own config, adapter contracts, auth, and hook refactors.
- Open-source contributors can safely work on branding copy, measurement cards, docs, fixture data, and feature-flagged UI after the config contract lands.
- PRs should touch narrow areas and avoid project-wide formatting.
