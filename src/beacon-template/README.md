# Beacon Template

`beacon-template` is a configurable device-health monitoring dashboard for sensor networks. It runs on **its own mock backend out of the box**: no API, no credentials, no env file. It's the Beacon counterpart of `src/vertex-template`.

It's domain-neutral: branding, labels, links and feature flags come from [`beacon.config.ts`](./beacon.config.ts). AirQo's production app lives separately in `src/beacon`; this template ships no AirQo integration.

## Quick start

```bash
cd src/beacon-template
npm install
npm run dev
```

Open `http://localhost:3000`. The sign-in page opens the demo by itself and you land on Home as a demo admin. The demo has 36 devices from three made-up manufacturers at 14 sites in three areas, six cohorts, and three organisations to switch between.

## What v1 supports (and doesn't)

- **Data adapter: `mock` only.** The app serves a mock Beacon API and a mock platform API from its own route, `app/api/mock/[...path]` (see [Mock backend](#mock-backend)). The pages and services still make real HTTP requests, so pointing them at a real backend means implementing the same contract.
- **Auth provider: `none` only.** NextAuth stays in place with a single `demo` credentials provider that signs everyone in as the demo user (`lib/auth.ts`, `lib/mock/identity.ts`). The rest of the app reads the session as it would with a real provider.
- **The mock fails loudly.** A request the mock has no handler for returns `501` with a message naming the method and path, instead of quietly returning nothing.

## Configuration

Everything goes through [`beacon.config.ts`](./beacon.config.ts), checked at startup by the zod schema in [`lib/beacon-config.ts`](./lib/beacon-config.ts). A bad value stops the app with a message naming the key. [`beacon.config.example.ts`](./beacon.config.example.ts) annotates every key.

| Key | Purpose |
| --- | --- |
| `org.name`, `org.shortName`, `org.slug` | Page title, top bar, sign-in page, report headers, analytics app name |
| `org.logo`, `org.primaryColor` | Logo (under `public/`, also the favicon) and default theme colour |
| `org.supportEmail`, `org.websiteUrl` | Contact details on the sign-in page |
| `app.name`, `app.description` | Product name and description used in titles and copy |
| `api.adapter` | Data source; `"mock"` is the only value in v1 |
| `auth.provider` | `"none"` is the only value in v1 |
| `auth.systemGroupSlug` | Group title of the operator's own organisation. Its admins get the administrative panel, fleet-wide diagnostics and My Devices |
| `features.*` | Maintenance map, road routing (OSRM), reports, Device Data Analysis, product tours, feedback |
| `map.defaultCenter`, `map.defaultZoom`, `map.tileProvider` | Map defaults; the demo fleet is placed around the centre. `"openstreetmap"` needs no token |
| `links.*` | Docs, privacy and terms URLs, and two companion apps: `deviceManagementUrl` (where devices are added) and `organisationAccessUrl` (where people ask to join an organisation). An empty string hides whatever uses it |

## Access control

Access follows the active organisation and its role's permissions (`lib/navigation.ts`):

- The **system group** (`auth.systemGroupSlug`) is the operator's own organisation. Members who can maintain devices (`DEVICE_MAINTAIN` or an admin permission) get the **Administrative Panel**: the fleet overview, fleet-wide IoT diagnostics, device profiles, diagnostic templates, status codes, sensor manufacturers and Device Data Analysis. The system group also has **My Devices**, the user's personal devices.
- **Other organisations** see their own devices, sites, cohorts, network health, maintenance and reports.
- The demo user is an admin of the system group and of `riverside_city`, and a plain member of `lakeshore_university`, so switching organisations shows each experience.

## Mock backend

| File | What it holds |
| --- | --- |
| `app/api/mock/[...path]/route.ts` | The route: `/api/mock/beacon/*` and `/api/mock/platform/*` |
| `lib/mock/index.ts` | Strips each API's version prefix and dispatches |
| `lib/mock/router.ts` | A small method + path router; unknown routes return 501 |
| `lib/mock/fleet.ts` | The seeded fleet: sites, devices, cohorts, grids, and readings generated on demand |
| `lib/mock/identity.ts` | The demo user, their groups and permissions, and the demo access token |
| `lib/mock/beacon-api.ts` | Devices, cohorts, sites, grids, the maintenance map, manufacturers, sync actions |
| `lib/mock/diagnostics.ts` | Diagnoses, fleet health, device profiles, diagnostic templates, status codes |
| `lib/mock/platform-api.ts` | Users and groups, theme, feedback, personal devices, network status |

The fleet is generated from a seeded random generator, so it's identical on every request and restart, and timestamps are relative to now, so it always looks current. Each device has a health plan (healthy, degraded, offline, undeployed, recalled) that its readings, uptime, diagnoses and alerts all follow. Edits made in the UI (device profiles, status codes, templates, device config) are kept in memory until the server restarts.

`lib/config.js` turns `api.adapter` into the two base URLs the services use. The `/api/proxy/*` and `/api/auth/user` routes answer from the mock in-process.

## Environment variables

None are needed. All are optional; see [`.env.example`](./.env.example):

- `NEXT_PUBLIC_ENV`: `development` (default), `staging` or `production`. Used as the analytics environment.
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`: the demo sign-in falls back to a fixed secret and, without `NEXTAUTH_URL`, trusts the request's host. Set both before adding a real provider.
- `NEXT_PUBLIC_ENABLE_ROAD_ROUTING`, `NEXT_PUBLIC_OSRM_BASE_URL`: road routing on the maintenance map.
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`: product analytics, off without a key. See [`docs/ANALYTICS.md`](./docs/ANALYTICS.md).

## Scripts

- `npm run dev`: development server.
- `npm run build` / `npm run start`: production build and serve (`output: "standalone"`; the `Dockerfile` builds an image from it).
- `npm run lint`: ESLint via Next.js.
- `npm test`: the `node:test` suites under `tests/unit` (Node 20 or later), through a small loader (`tests/unit/register.mjs`) that transpiles TypeScript, resolves `@/` imports and stubs Next.js runtime modules.

## Project layout

- `app/`: App Router pages. `login` (demo sign-in), `dashboard/home`, `dashboard` (fleet overview), `devices`, `devices/[id]` (details, diagnostics, metadata, config, performance), `devices/my-devices`, `sites`, `analytics` (cohorts), `network-health`, `maintenance`, `reports`, `alerts`, `diagnostics` (fleet health, issues, bench simulator), `settings` (device profiles, diagnostic templates, status codes), `manufacturers`, `visualise` (Device Data Analysis).
- `app/api/`: NextAuth, the mock backend, the platform proxy, the user profile route, and `/api/ping` for connectivity checks.
- `components/`: feature UI (`diagnostics`, `maintenance`, `reports`, `analytics`, `home`, `tour`, `features/feedback`) and `ui` primitives.
- `services/`: HTTP clients for the Beacon and platform APIs.
- `lib/`: config, navigation and access rules, group context, reports, maintenance map logic, and `mock/`.
- `hooks/`, `types/`, `utils/`.

## What was left out of the template

Beacon's AirQo-specific or hardware-bench features aren't in the template: firmware management and flashing, the remote shell and WebRTC sessions, collocation, stock and inventory, device categories, user management, AI device analysis (OpenAI), Slack error alerts and Cloudinary screenshot uploads.
