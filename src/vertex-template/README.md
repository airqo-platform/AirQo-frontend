# Vertex Template

`vertex-template` is a configurable IoT sensor dashboard starter app. It runs on **mock data out of the box** — no backend, no credentials, no env file required — and is the source template for the future `create-vertex-app` CLI.

It is domain-neutral by default: branding, labels, links, and feature flags come from [`vertex.config.ts`](./vertex.config.ts). AirQo's production app lives separately in `src/vertex`; this template ships no AirQo integration.

## Quick start

```bash
cd src/vertex-template
npm install
npm run dev
```

Open `http://localhost:3000`. You land on a working dashboard as a demo admin, backed by the mock adapter's fixtures (devices, sites, cohorts).

No `.env` file is needed for mock mode. If you want one, copy the example:

```bash
cp .env.example .env.local
```

## What v1 supports (and doesn't)

- **Data adapter: `mock` only.** The adapter registry (`core/adapters/index.ts`) and the config schema accept only `"mock"`. Real adapters — including an AirQo adapter — are future work and will be implemented against the adapter contract, not inside this template.
- **Auth provider: `none` only.** The app boots straight into the dashboard with a synthetic session (`core/auth/auth-mode.ts`). There is no login flow; NextAuth code paths exist but are inert when `auth.provider` is `"none"`.
- The mock adapter **fails loudly**: calling an unimplemented adapter method throws an error naming the method, rather than silently returning fake data. If a page errors this way, the method needs an implementation in `core/adapters/mock.ts`.

## Configuration

All customization goes through [`vertex.config.ts`](./vertex.config.ts), validated at startup by the zod schema in [`core/config/vertex-config.ts`](./core/config/vertex-config.ts) (fails fast with a readable error).

Use [`vertex.config.example.ts`](./vertex.config.example.ts) as the annotated reference for every key. Summary:

| Key | Purpose |
| --- | --- |
| `org.name`, `org.shortName`, `org.slug` | Branding used in the page title, topbar, footer, and metadata |
| `org.logo`, `org.primaryColor` | Logo path (under `public/`) and theme color |
| `org.supportEmail`, `org.websiteUrl` | Support/contact links |
| `api.adapter` | Data source; `"mock"` is the only valid value in v1 |
| `api.baseUrl`, `api.publicMeasurementsBaseUrl` | Reserved for real adapters; the public base also fills the copy-paste measurement API examples |
| `auth.provider` | `"none"` is the only valid value in v1 |
| `auth.systemGroupSlug` | Group title treated as the operator's own "system" organization — members get the internal/staff experience |
| `features.*` | Feature flags (device map, bulk deploy, site management, CSV export, reading history, user management, app launcher, network requests) |
| `map.defaultCenter`, `map.defaultZoom`, `map.tileProvider` | Map defaults; `"openstreetmap"` needs no token, `"mapbox"` requires `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` |
| `links.*` | Docs, privacy policy, cookie policy, and analytics URLs (empty string hides the link) |

## Access control

Access control is **permission-based only**. The frontend never compares role names; it checks granular permissions (`core/permissions/constants.ts`) carried by the user's role data via `usePermission` / `RouteGuard`. Roles are backend data — bundles of permissions — and are shown in the UI for information only. The admin panel requires the `SYSTEM_ADMIN` permission; `SUPER_ADMIN` overrides all checks.

## Environment variables

Mock mode needs none. All are optional:

- `NEXT_PUBLIC_ENV` — environment label: `development` (default) | `staging` | `production`.
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — only when `map.tileProvider` is `"mapbox"`.
- `NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED` — dev-only permission override matrix for testing denial states (see `core/hooks/usePermissions.ts`); never active in production builds.
- `NEXT_PUBLIC_DEV_API_PROXY_TARGET` — dev-only: proxy `/api/v2/*` to a real backend origin instead of the local API routes. Off unless set.

## Scripts

- `npm run dev` — start the dev server (`dev:inspect` adds the Node inspector).
- `npm run build` / `npm run start` — production build and serve.
- `npm run lint` — ESLint via Next.js.
- `npm run format` / `npm run format:check` — Prettier.
- `npm run check-size` — build plus bundle-size checks.

## Project layout

- `app/` — Next.js App Router pages (public: login/auth-error; authenticated: home, devices, sites, cohorts, admin).
- `core/adapters/` — adapter registry, mock adapter, and fixtures. This is where mock data lives.
- `core/config/` — config schema and the system-group helper.
- `core/permissions/` — permission constants and the permission service.
- `core/auth/` — auth-mode switch and the (inert in v1) NextAuth provider.
- `docs/` — template planning docs: adapter foundation, config contract, coupling audit.

## Contributing

Safe areas for contributors: UI copy, config schema additions, mock adapter fixtures and methods, and generic component work. The adapter contract and anything touching `core/adapters/types.ts` is maintainer-owned until the v1 contract stabilizes — see `docs/vertex-template-adapter-foundation.md`.
