# Vertex (Web App)

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

## Environment variables

Use `src/vertex/.env.example` as the base. Common variables include:

- `NEXT_PUBLIC_API_URL`: Backend API base URL.
- `NEXT_PUBLIC_ANALYTICS_URL`: Analytics platform URL.
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox token for map features.
- `NEXT_PUBLIC_ENV`: App environment label (for example `development`).
- `NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED`: Enables mock permissions when needed.
- `ADMIN_SECRET`: Secret used by admin/protected server operations.
- `NEXT_PUBLIC_CLOUDINARY_NAME`: Cloudinary cloud name.
- `NEXT_PUBLIC_CLOUDINARY_PRESET`: Cloudinary upload preset.
- `SLACK_WEBHOOK_URL`: Slack webhook for server-side notifications.
- `NEXT_PUBLIC_SLACK_BOT_TOKEN`, `NEXT_PUBLIC_SLACK_CHANNEL`: Slack client configuration.

## Authentication and SSO

For production/shared-session authentication across AirQo subdomains, set:

```bash
NEXTAUTH_SECRET=<shared-secret-used-by-all-apps>
NEXTAUTH_COOKIE_DOMAIN=.airqo.net
```

Notes:
- `NEXTAUTH_SECRET` should match the value used by the Analytics platform.
- `NEXTAUTH_COOKIE_DOMAIN=.airqo.net` allows a shared cookie across sibling subdomains (for example `analytics.airqo.net` and `vertex.airqo.net`).

## Related projects

- `src/vertex-desktop`: Electron wrapper that loads the hosted Vertex web app.
- Most feature and business logic remains in this web app; desktop-specific behavior stays in `src/vertex-desktop`.

## Deployment notes

- Staging and production deployment automation is configured in `.github/workflows/`.
- This app is deployed independently from desktop installer releases.
