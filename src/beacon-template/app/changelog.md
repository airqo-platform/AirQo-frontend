# Beacon Template - Changelog

> The Beacon template is a domain-neutral copy of `src/beacon`, the device health monitoring app, in the same way `src/vertex-template` is a copy of `src/vertex`.

## Version 1.0.0

### Mock-first, domain-neutral device health dashboard

A fresh clone runs the full dashboard with no backend, no credentials and no env file. Branding, labels, links and feature flags come from `beacon.config.ts`.

- **Config**: `beacon.config.ts`, checked at startup by the zod schema in `lib/beacon-config.ts`, with every key annotated in `beacon.config.example.ts`. Organisation name, logo and primary colour; product name; the system group; feature flags for the maintenance map, road routing, reports, Device Data Analysis, product tours and feedback; map defaults; links to companion apps.
- **Mock backend**: `app/api/mock/[...path]` serves a mock Beacon API and platform API from a seeded fleet (`lib/mock/`). Unknown requests return 501 naming the method and path. `lib/config.js` points both API base URLs at it, and the platform proxy and user profile routes answer from it in-process.
- **Demo sign-in**: NextAuth with one `demo` credentials provider (`auth.provider: "none"`). The sign-in page opens the demo by itself.
- **System group**: every hardcoded `airqo` group check now reads `auth.systemGroupSlug`.
- **Branding**: the AirQo logo, names, colours, links to other AirQo apps, the apps launcher and AirQo LoRaWAN gateways are gone; reports, map exports and the theme use the configured organisation.
- **Left out**: firmware management and flashing, the remote shell and WebRTC sessions, collocation, stock, device categories, user management, AI device analysis (OpenAI), Slack alerts and Cloudinary uploads, with their dependencies (Prisma, Postgres, three.js, xterm, JWT libraries).
