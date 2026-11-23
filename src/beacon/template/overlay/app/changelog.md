# Beacon Template - Changelog

> The Beacon template is exported from the Beacon app (`npm run export:template`), so it follows Beacon's fixes and features.

## Version 1.0.0

### Mock-first, domain-neutral device health dashboard

A fresh clone runs the full dashboard with no backend, no credentials and no env file. Branding, labels, links and feature flags come from `beacon.config.ts`.

- **Config**: `beacon.config.ts`, checked at startup by the zod schema in `lib/beacon-config.ts`, with every key annotated in `beacon.config.example.ts`. Organisation name, logo and primary colour; product name; the system group; feature flags for the maintenance map, road routing, reports, Device Data Analysis, product tours and feedback; map defaults; links to companion apps.
- **Mock backend**: `app/api/mock/[...path]` serves a mock Beacon API and platform API from a seeded fleet (`lib/mock/`). Unknown requests return 501 naming the method and path. `lib/config.js` points both API base URLs at it, and the platform proxy, user profile and personal devices routes answer from it in-process.
- **HTTP adapter**: `api.adapter: "http"` calls a real Beacon API and platform API at `NEXT_PUBLIC_BEACON_API_URL` and `NEXT_PUBLIC_PLATFORM_API_URL`.
- **Integration files**: `lib/integration/*` and `components/integration/index.tsx` are where extra pages, top-bar buttons, device tabs, sign-in providers and API URLs plug in.
- **Demo sign-in**: NextAuth with one `demo` credentials provider (`auth.provider: "none"`). The sign-in page opens the demo by itself.
- **System group**: group checks read `auth.systemGroupSlug`.
- **Branding**: names, logo, colours, companion-app links and LoRaWAN gateways come from config; reports, map exports and the theme use the configured organisation.
- **Not included**: firmware management and flashing, the remote shell, collocation, stock, device categories, user management and AI device analysis, with their dependencies.
