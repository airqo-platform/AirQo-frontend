# Vertex (Web App)

[![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/branch/staging/graph/badge.svg?flag=vertex)](https://codecov.io/gh/airqo-platform/AirQo-frontend/flags/vertex)

`vertex` is the AirQo web application for Device and Network management.

## Quick start

1. Install dependencies:

```bash
cd src/vertex
npm install
```

2. Create local environment file:

```bash
copy .env.example .env
```

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev`: Start local development server.
- `npm run dev:inspect`: Start dev server with Node inspector enabled.
- `npm run build`: Build production bundle.
- `npm run start`: Start production server from built output.
- `npm run lint`: Run lint checks.
- `npm run format`: Format code with Prettier.
- `npm run format:check`: Check formatting.
- `npm run check-size`: Build and run bundle size checks.
- `npm run test`: Run the Vitest test suite once.
- `npm run test:watch`: Run Vitest in watch mode.
- `npm run test:coverage`: Generate Vitest coverage reports.

## Testing

Vertex uses Vitest and React Testing Library for unit, hook, and component tests. Follow the internal testing conventions in `app/_docs/internal/TESTING.md` when adding or updating tests.

The badge above reflects overall coverage from the latest `staging` run. The `check-vertex` job in `.github/workflows/safe-checks.yml` runs lint, typecheck, and `test:coverage` on every PR touching Vertex, then uploads results to Codecov under the `vertex` flag; patch coverage (coverage of new/changed lines) is reported on every PR. See `app/_docs/internal/TESTING.md` for coverage priorities by area and current scope.

## Environment variables

Use `src/vertex/.env.example` as the base. Common variables include:

- `NEXT_PUBLIC_API_URL`: Backend API base URL.
- `NEXT_PUBLIC_API_BASE_URL`: Public API origin used for measurement URL examples.
- `NEXT_PUBLIC_ANALYTICS_URL`: Analytics platform URL.
- `NEXT_PUBLIC_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL`: Optional Windows installer URL for Vertex Desktop downloads.
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox token for map features.
- `NEXT_PUBLIC_ENV`: App environment label (for example `development`).
- `NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED`: Enables mock permissions when needed.
- `ADMIN_SECRET`: Secret used by admin/protected server operations.
- `NEXT_PUBLIC_CLOUDINARY_NAME`: Cloudinary cloud name.
- `NEXT_PUBLIC_CLOUDINARY_PRESET`: Cloudinary upload preset.
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: HCaptcha site key needed for the new login flow.
- `SLACK_WEBHOOK_URL`: Slack webhook for server-side notifications.
- `NEXT_PUBLIC_SLACK_BOT_TOKEN`, `NEXT_PUBLIC_SLACK_CHANNEL`: Slack client configuration.

## Vertex configuration

Vertex has a typed app configuration surface in `vertex.config.ts`. This is the file that the future `create-vertex-app` CLI will generate or update for each scaffolded instance.

V1 supports two data adapters:

- `mock`: runs locally without API credentials and is the default for generated templates.
- `airqo`: uses the existing AirQo API, auth, and proxy behavior.

Generic REST backends are intentionally out of scope for v1.

Use `vertex.config.example.ts` as the template-facing reference. Keep validation and shared types in `core/config/vertex-config.ts` so contributors can add config-driven behavior without inventing new config shapes.

## Authentication and SSO

For normal app-local authentication, set:

```bash
NEXTAUTH_SECRET=<app-specific-secret>
NEXTAUTH_URL=http://localhost:3001
```

Notes:

- `NEXTAUTH_SECRET` should be unique to Vertex.
- `NEXTAUTH_URL` should match the local or production origin for Vertex.

## Related projects

- `src/vertex-desktop`: Electron wrapper that loads the hosted Vertex web app.
- Most feature and business logic remains in this web app; desktop-specific behavior stays in `src/vertex-desktop`.

## Deployment notes

- Staging and production deployment automation is configured in `.github/workflows/`.
- This app is deployed independently from desktop installer releases.
