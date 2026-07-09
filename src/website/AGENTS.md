# AGENTS.md - AirQo Website

## Stack

- Next.js 14 App Router (standalone output)
- React 18 + TypeScript 5.5
- Tailwind CSS 3 + shadcn/ui (new-york style)
- Redux Toolkit + Tanstack React Query v5
- Jest 29 + Testing Library (jsdom)
- Framer Motion for animations

## Commands

```bash
npm run dev          # dev server on localhost:3000
npm run build        # production build
npm run start        # start production server
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier (write all files)
npm run test         # Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Jest with coverage report
npm run e2e          # E2E tests (headless, Mocha + Selenium)
npm run e2e:headed   # E2E tests with visible browser
```

Run from `src/website/`. No monorepo task runner; each app is independent.

**Validation**: After making changes, always run:

```bash
npm run lint && npm run format && npm run build
```

## Project Structure

```
src/
├── __mocks__/          # Jest mocks (fileMock, mapbox-gl, recharts)
├── app/                # Next.js App Router routes and layouts
│   ├── (site)/         # Main site pages (home, about, careers, contact, events, etc.)
│   ├── (products)/     # Product pages (8 routes)
│   ├── (solutions)/    # Solution pages (5 routes)
│   ├── (programs)/     # Program pages (africa-clean-air-forum, faces-of-clean-air)
│   ├── (content)/      # Content pages (blogs)
│   ├── (developers)/   # Developer pages (devcon, packages)
│   ├── (legal)/        # Legal pages (terms, privacy, cookies)
│   ├── (utility)/      # Utility pages (explore-data, billboard)
│   └── api/            # API routes (proxy, geocode, translate, log)
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui primitives (18 components)
│   ├── layout/         # Layout shells (MainLayout, Navbar, Footer, etc.)
│   ├── providers/      # Context providers (Redux, Query, ForumData)
│   ├── sections/       # Page sections (AirQualityBillboard, footer, etc.)
│   ├── feedback/       # Feedback components (EmptyState, ErrorState, LoadingState)
│   └── dialogs/        # Dialog components (EngagementDialog, LanguageModal)
├── config/             # Static configuration data
│   ├── cleanAirForumConfig.ts  # Clean Air Forum constants
│   ├── env.config.ts           # Environment variable validation
│   ├── navigation.config.ts    # Navigation structure
│   ├── packages.config.ts      # Package listings
│   ├── routes.config.ts        # Route definitions
│   ├── seo.config.ts           # SEO defaults
│   └── site.config.ts          # Site metadata
├── features/           # Feature modules (page-level UI logic)
│   ├── about/          # About page with components, hooks, services
│   ├── blogs/          # Blog listing and detail pages
│   ├── careers/        # Career listing and detail pages
│   ├── clean-air-forum/ # Africa Clean Air Forum (11 sub-features)
│   ├── clean-air-network/ # Clean Air Network
│   ├── contact/        # Contact form
│   ├── developers/     # Developer pages (DevCon)
│   ├── events/         # Event listing and detail
│   ├── explore-data/   # Data exploration
│   ├── faces-of-clean-air/ # Faces of Clean Air carousel page
│   ├── faqs/           # FAQ page
│   ├── home/           # Home page with deferred sections
│   ├── legal/          # Legal pages (TOS, Privacy, etc.)
│   ├── packages/       # Icon packages browser
│   ├── partners/       # Partners listing
│   ├── press/          # Press/media page
│   ├── products/       # Product marketing pages (8 products)
│   ├── resources/      # Resources page
│   └── solutions/      # Solution pages (5 solutions)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
│   ├── utils/          # Utility functions (cn, formatDate, slugify, etc.)
│   ├── security/       # Security utilities (sanitizeHtml, safeExternalLink)
│   ├── analytics/      # Analytics utilities
│   └── metadata/       # SEO metadata generation
├── queries/            # Tanstack React Query definitions
├── services/           # API client and service layer
│   ├── api/            # Core API layer (client, routes, base service)
│   ├── external/       # External integrations (analytics, cloudinary, maps, faces-of-clean-air)
│   └── website/        # Website business services (20 service files)
├── store/              # Redux Toolkit slices (country, forum, modal)
├── styles/             # CSS files (theme, typography, utilities)
└── types/              # TypeScript type definitions
```

## Path Aliases

Configured in `tsconfig.json`:

- `@/*` -> `./src/*`
- `@/components/*` -> `./src/components/*`
- `@/lib/*` -> `./src/lib/*`
- `@/hooks/*` -> `./src/hooks/*`
- `@/store/*` -> `./src/store/*`
- `@/types/*` -> `./src/types/*`
- `@/services/*` -> `./src/services/*`
- `@/features/*` -> `./src/features/*`
- `@/config/*` -> `./src/config/*`
- `@/queries/*` -> `./src/queries/*`
- `@/styles/*` -> `./src/styles/*`
- `@public/*` -> `./public/*`

## API Client

`src/services/api/api-client.ts` - Dual-mode API client:

- **Server-side**: Direct backend API call using `API_URL` env var with `API_TOKEN` query param
- **Client-side**: Next.js proxy at `/api/v2` (hides backend from browser)

**Important**: API routes in `api-routes.ts` are defined differently for server vs client:

- `WEBSITE` routes use `/website/api/v2/...` prefix (server-side normalization handles client proxy)
- `USERS` routes use `users/selfies` format (no `/api/v2/` prefix, client proxy adds it)
- Never hard-code backend URLs; always use `API_ROUTES` constants

## Services Structure

### `src/services/api/` - Core API Layer

- `api-client.ts` - Fetch-based API client with server/client dual routing
- `api-routes.ts` - All API endpoint constants (WEBSITE, DEVICES, USERS, PREDICT, PAYMENTS)
- `base.ts` - `BaseApiService` class with CRUD methods and pagination transformer
- `api-error.ts` - Enhanced error types with status codes
- `api-response.ts` - Response type definitions

### `src/services/external/` - External Integrations

- `analytics.service.ts` - Analytics and grid data
- `cloudinary.service.ts` - Cloudinary image management
- `faces-of-clean-air.service.ts` - Faces of Clean Air API
- `maps.service.ts` - Map-related services

### `src/services/website/` - Website Business Services (20 files)

Services for blogs, careers, events, forum-events, grids, partners, press, publications, team, etc.

## Features Pattern

Pages use the **features pattern** (NOT views pattern):

1. **App pages are thin wrappers** that delegate to feature components:

   ```tsx
   // src/app/(site)/home/page.tsx
   import HomePage from '@/features/home/HomePage';

   const page = () => <HomePage />;
   export default page;
   ```

2. **Route groups** organize pages without affecting URLs. Each group can have its own `layout.tsx`.

3. **MainLayout** wraps most pages (navbar + footer). Exceptions: contact (custom layout), faces-of-clean-air (no layout wrapper).

## Environment Variables

Copy `.env.sample` to `.env`. Never commit `.env`.

### Server-side

| Variable                   | Purpose                               |
| -------------------------- | ------------------------------------- |
| `API_URL`                  | Backend API base URL                  |
| `API_TOKEN`                | Authentication token for API requests |
| `OPENCAGE_API_KEY`         | OpenCage geocoding API key            |
| `SLACK_WEBHOOK_URL`        | Slack notification webhook            |
| `SLACK_CHANNEL`            | Slack notification channel            |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification    |

### Client-side (NEXT*PUBLIC* prefix)

| Variable                               | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Comma-separated site URLs (first = canonical base) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`        | Google Analytics measurement ID                    |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`      | Mapbox GL access token                             |
| `NEXT_PUBLIC_CLEAN_AIR_FORUM_EVENT_ID` | Forum edition ID for faces-of-clean-air page       |

When adding new env vars, update `.env.sample` and CI workflow YAML files in `.github/workflows/`.

## Linting

ESLint enforces:

- `simple-import-sort` (auto-sorted imports) - **error**
- `unused-imports` (warn on unused)
- `prettier` formatting errors
- `@typescript-eslint/no-explicit-any` is **off**

Fix order: `npm run lint:fix && npm run format`

## Testing

### Unit Tests (Jest)

- Framework: Jest 29 with `ts-jest` preset (`js-with-ts-esm`)
- Environment: `jsdom`
- 36 test files across: `src/lib/utils/__tests__/`, `src/lib/security/__tests__/`, `src/store/slices/__tests__/`, `src/services/api/__tests__/`, `src/queries/__tests__/`, `src/hooks/__tests__/`, `src/config/__tests__/`
- Module aliases mirror tsconfig
- CSS mocked via `identity-obj-proxy`
- Test patterns: `src/**/__tests__/**/*.{ts,tsx}` and `src/**/*.{spec,test}.{ts,tsx}`

### E2E Tests (Mocha + Selenium)

- Framework: Mocha 11 with `selenium-webdriver` 4
- Config: `e2e/.mocharc.yml` (60s timeout)
- 9 page tests + 4 navigation tests

## Docker

```bash
docker compose up web          # dev (hot-reload, port 3000)
docker compose up --build web-prod  # production-like (port 8080)
```

Requires `.env` file in the website directory.

## Key Conventions

- Root `/` redirects to `/home` (via `next.config.mjs` redirect).
- Pages use the features pattern: `app/[route]/page.tsx` delegates to `features/[route]/[Name]Page.tsx`.
- MainLayout wraps most pages (navbar + footer). Exceptions: contact (custom layout), faces-of-clean-air (no layout wrapper).
- `cn()` from `@/lib/utils` for conditional Tailwind classes.
- Server-side API calls append `API_TOKEN` as query param automatically.
- `NEXT_PUBLIC_SITE_URL` is comma-separated; first entry is canonical base.
- FloatingMiniBillboard is suppressed on `/packages`, `/solutions/network-coverage`, and `/faces-of-clean-air` routes.
- Metadata is generated per-page using `METADATA_CONFIGS` from `@/lib/metadata`.
