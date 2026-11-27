# Beacon template

The Beacon template is a domain-neutral copy of this app that runs on its own mock backend with no credentials. It isn't kept as a separate codebase: it's **exported** from `src/beacon`, so every fix and feature in Beacon reaches the template on the next export.

```bash
cd src/beacon
npm run export:template                          # writes dist/beacon-template (gitignored)
npm run export:template -- --out ../../some/dir  # anywhere else
npm run export:template -- --skip-lock           # offline: leaves out package-lock.json
```

Then, in the output: `npm ci && npm test && npm run build`.

## How it works

Beacon and the template share almost all their code. They differ in three ways.

1. **Config.** `beacon.config.ts` holds AirQo's values (logo, the `airqo` system group, Vertex and Nexus links, LoRaWAN gateways, the Slack error route). The template's `beacon.config.ts` holds generic ones. The schema is shared: `lib/beacon-config.ts`.
2. **Integration files.** A handful of files are the seams between shared code and AirQo-only code. Beacon's versions use AirQo's platform; the template's versions, in `overlay/`, are generic or empty.

   | File | Beacon | Template |
   | --- | --- | --- |
   | `lib/integration/api-urls.js` | AirQo platform and beacon-api URLs by environment | `NEXT_PUBLIC_BEACON_API_URL`, `NEXT_PUBLIC_PLATFORM_API_URL` |
   | `lib/integration/public-env-keys.ts` | The platform API's `NEXT_PUBLIC_AIRQO_*` URLs, added to the settings the browser gets (`lib/public-env.ts`) | Empty |
   | `lib/integration/auth.ts` | Platform sign-in (password, social), or demo with `NEXT_PUBLIC_BEACON_MOCK` | Demo sign-in only |
   | `lib/integration/routes.ts` | Collocation, firmware, categories, stock and user pages | Empty |
   | `components/integration/index.tsx` | OAuth hand-off, AirQo apps launcher, Remote Shell and Files tabs | Empty |
   | `app/login/page.tsx` | Platform or demo sign-in, by `auth.provider` | Demo sign-in |

3. **Left out.** `manifest.json` lists the files the export doesn't copy: the AirQo-only pages and API routes, their services and components, AirQo images, internal docs and tests under `tests/unit/airqo/`. It also lists the dependencies only those files use.

`overlay/` also holds the template's own README, `.env.example`, Dockerfile, changelog, health route, `next.config.mjs` and annotated `beacon.config.example.ts`.

After copying, the export fails if any line still mentions AirQo (apart from the `@airqo/icons-react` package and the AirQo entry in the manufacturer label list), so AirQo wording can't leak into the template unnoticed.

## Working on Beacon

- **Shared code** reads `beacon.config.ts` instead of hardcoding AirQo: `isSystemGroup()` rather than `=== "airqo"`, `beaconConfig.org.*` and `brandTitle` for names, `APP_LINKS` for Vertex and Nexus, `beaconConfig.features.*` for optional features.
- **An AirQo-only page or feature** goes in its own files. Hook it in through an integration file (a route in `lib/integration/routes.ts`, a tab or button in `components/integration/index.tsx`) and add its files to `exclude` in `manifest.json`. Shared files must not import it directly, or the template won't build.
- **A new backend call** needs a handler in `lib/mock/` and a line in `tests/unit/mock/mock-backend.test.js`; the mock is the contract the template's "http" adapter expects.
- **Tests** that check AirQo's own values go in `tests/unit/airqo/`. Tests that depend on the system group read it from `beaconConfig`, so they pass under both configs.

Run Beacon on the mock backend, with the demo sign-in and no AirQo platform:

```bash
NEXT_PUBLIC_BEACON_MOCK=true npm run dev
```

## Checking an export

1. `npm run export:template`
2. In `dist/beacon-template`: `npm ci`, `npm test`, `npm run build`, `npx next lint`.
3. `npm start` and open it: it should sign in by itself and show the demo fleet.
