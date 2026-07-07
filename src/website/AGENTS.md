# AGENTS.md - AirQo Website

## Stack

- Next.js 14 App Router (standalone output)
- React 18 + TypeScript 5.5
- Tailwind CSS 3 + shadcn/ui (new-york style)
- Redux Toolkit + Tanstack React Query
- Jest + Testing Library (jsdom)

## Commands

```bash
npm run dev          # dev server on localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier
npm run test         # Jest
```

Run from `src/website/`. No monorepo task runner; each app is independent.

## Project Structure

- `src/app/` - Next.js routes. Route groups `(main)` and `(main)/(about)` organize pages without affecting URLs.
- `src/views/` - Page components (actual UI logic). App pages are thin wrappers that delegate here.
- `src/components/` - Reusable components. `ui/` has shadcn primitives, `layouts/` has MainLayout/Navbar/Footer.
- `src/services/` - API client and hooks. `apiClient.ts` handles server vs client routing.
- `src/store/` - Redux slices.
- `src/config/` - Static config data (package listings, etc.).
- `src/lib/utils.ts` - `cn()` helper for Tailwind class merging.

## Path Aliases

Configured in `tsconfig.json`: `@/*` maps to `./src/*`. Also `@/components/*`, `@/utils/*`, `@/hooks/*`, `@/store/*`, `@/types/*`, `@/lib/*`, `@/services/*`, `@/context/*`, `@/views/*`, `@/config/*`.

## API Client

`src/services/apiClient.ts` - Server-side calls use `API_URL` env var directly with `API_TOKEN` query param. Client-side calls go through Next.js proxy at `/api/v2`. Do not hard-code backend URLs.

## Environment Variables

Copy `.env.sample` to `.env`. Server-side: `API_URL`, `API_TOKEN`, `OPENCAGE_API_KEY`, `SLACK_WEBHOOK_URL`, `SLACK_CHANNEL`, `GOOGLE_SITE_VERIFICATION`. Client-side: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`. Never commit `.env`.

When adding new env vars, update `.env.sample` and CI workflow YAML files in `.github/workflows/`.

## Linting

ESLint enforces: `simple-import-sort` (auto-sorted imports), `unused-imports` (warn on unused), `prettier` formatting errors. `@typescript-eslint/no-explicit-any` is off. Fix order: `npm run lint:fix && npm run format`.

## Testing

Jest with `ts-jest` and `jsdom`. Module aliases mirror tsconfig. CSS mocked via `identity-obj-proxy`. No test files exist yet; use `@testing-library/react` patterns when adding tests.

## Docker

```bash
docker compose up web          # dev (hot-reload, port 3000)
docker compose up --build web-prod  # production-like (port 8080)
```

Requires `.env` file in the website directory.

## Key Conventions

- Root `/` redirects to `/home`.
- Pages use the views pattern: `app/[route]/page.tsx` delegates to `views/[route]/[Name]Page.tsx`.
- MainLayout wraps most pages (navbar + footer). Exceptions: contact (no footer), partners (no footer), forum (custom layout).
- `cn()` from `@/lib/utils` for conditional Tailwind classes.
- Server-side API calls append `API_TOKEN` as query param automatically.
- `NEXT_PUBLIC_SITE_URL` is comma-separated; first entry is canonical base.
