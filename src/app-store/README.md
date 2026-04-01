# AirQo App Store (Frontend MVP)

This frontend-only MVP uses mock data and shared app contracts to validate the App Store UX before backend integration.

## Local Development

```bash
npm install
npm run dev
```

## Mock Roles

To simulate roles, set roles in localStorage:

```js
localStorage.setItem('airqo-mock-roles', 'USER,SUPER_ADMIN');
```

## Manifest Contract

See `packages/app-store-modules/src/index.ts` for the `AppManifest` schema and `AirQoAppProps` contract.
Internal app manifests live under `src/app-store-projects/apps/**/manifest.ts`.

## Mock App Runtime

- Internal apps render directly inside Analytics.
- External apps use a sandboxed iframe and postMessage bridge.

The mock external app is served from `src/app-store/public/mock-apps/hello-app.html`.
