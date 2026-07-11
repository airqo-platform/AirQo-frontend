# Platform (AirQo Nexus)

![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz) ![passing](https://img.shields.io/badge/passing-926%20%E2%80%94%20100%25-brightgreen?style=flat-square) ![failing](https://img.shields.io/badge/failing-0-brightgreen?style=flat-square)

**Platform** is the AirQo analytics application for air quality monitoring, data visualization, device management, and analytics. Built with Next.js 14 (App Router), React 18, and TypeScript.

## Tech Stack

| Layer     | Technology                             |
| --------- | -------------------------------------- |
| Framework | Next.js 14 (App Router)                |
| UI        | React 18, Tailwind CSS, Flowbite React |
| State     | Redux Toolkit, TanStack Query, SWR     |
| Forms     | React Hook Form, Zod validation        |
| Maps      | Mapbox GL, React Map GL                |
| Auth      | NextAuth.js                            |
| Charts    | Recharts                               |
| Testing   | Jest, React Testing Library            |
| E2E       | Playwright                             |

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 1.x
- A `.env.local` file (copy from `.env.example`)

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```bash
cp .env.example .env.local
```

Required variables:

| Variable                   | Description                            |
| -------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL                   |
| `NEXTAUTH_SECRET`          | NextAuth session secret                |
| `NEXTAUTH_URL`             | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL access token                 |

See `.env.example` for the full list.

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `yarn dev`           | Start development server     |
| `yarn build`         | Production build             |
| `yarn start`         | Start production server      |
| `yarn lint`          | Run ESLint                   |
| `yarn format`        | Format with Prettier         |
| `yarn test`          | Run unit tests               |
| `yarn test:coverage` | Run unit tests with coverage |
| `yarn test:e2e`      | Run Playwright e2e tests     |

## Project Structure

```
src/
  app/                    # Next.js App Router pages and layouts
  modules/                # Feature modules
    airqo-map/            # Interactive air quality map
    analytics/            # Data analytics dashboard
    api-client/           # API client management
    billing/              # Subscription and billing
    data-download/        # Data export functionality
    data-visualizer/      # Data visualization workspace
    feedback/             # User feedback system
    location-insights/    # Location-based insights
    organization/         # Organization management
    themes/               # Theme customization
    user-checklist/       # Onboarding checklist
    user-profile/         # User profile management
  shared/                 # Shared infrastructure
    components/           # Reusable UI components
    hooks/                # Custom React hooks
    layouts/              # Page layouts
    lib/                  # Core utilities (auth, routing, logging)
    providers/            # Context providers
    services/             # API service layer
    store/                # Redux store and slices
    types/                # TypeScript type definitions
    utils/                # Utility functions
```

## Testing

### Unit Tests

The project uses **Jest** with **React Testing Library** for unit testing. Tests are co-located with source code in `__tests__/` directories.

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Run specific test file
yarn test -- --testPathPattern=userSlice

# Run tests for a specific module
yarn test -- --testPathPattern=modules/themes
```

#### Writing Tests

Place tests in `__tests__/` directories next to the code they test:

```
src/shared/utils/
  arrays.ts
  __tests__/
    arrays.test.ts
```

Test categories by priority:

1. **Redux slices** — Pure reducer functions, fastest to write
2. **Utility functions** — Pure input/output, no setup needed
3. **Zod schemas** — Validation logic with `safeParse()`
4. **Custom hooks** — Using `renderHook` with providers
5. **API services** — Mocked axios/client layer

### End-to-End Tests

E2E tests use **Playwright** and live in the `e2e/` directory:

```bash
yarn test:e2e           # Run all e2e tests
yarn test:e2e:auth      # Auth tests only
yarn test:e2e:org       # Organization tests only
yarn test:e2e:admin     # Admin tests only
yarn test:e2e:data      # Data flow tests only
```

## CI/CD

### GitHub Actions

| Workflow           | Trigger                      | Description                                   |
| ------------------ | ---------------------------- | --------------------------------------------- |
| `platform-ci`      | PR/push to `src/platform/**` | Lint, type check, unit tests, coverage upload |
| `platform-codecov` | Reusable workflow            | Coverage upload for other pipelines           |

### Coverage

Unit test coverage is uploaded to Codecov with the `platform` flag on every CI run. View the [Codecov dashboard](https://codecov.io/gh/airqo-platform/AirQo-frontend/flags/) for detailed per-file coverage and PR diffs.

## Architecture

### Module Pattern

Each feature module under `src/modules/` follows a consistent structure:

```
module-name/
  index.ts              # Public API exports
  components/           # React components
  hooks/                # Module-specific hooks
  services/             # API service classes
  store/                # Redux slices (if applicable)
  types/                # TypeScript types
  utils/                # Pure utility functions
  __tests__/            # Unit tests
```

### Shared Layer

The `src/shared/` directory provides cross-cutting concerns:

- **`services/apiClient.ts`** — Axios-based API client with auth interceptors, token refresh, and error handling
- **`store/`** — Redux Toolkit store with persistence
- **`hooks/`** — Custom hooks for auth, RBAC, data fetching
- **`utils/`** — Pure utility functions (air quality, dates, arrays)
- **`lib/`** — Core infrastructure (auth, routing, logging)

### Data Flow

```
User Action → Component → Hook/Service → API Client → Backend
                                    ↓
                            Redux/SWR Cache → UI Update
```

## Contributing

1. Create a feature branch from `staging`
2. Write tests for new functionality
3. Ensure `yarn lint`, `yarn test`, and `yarn build` pass
4. Submit a PR to `staging`

### Code Quality

- **Linting**: ESLint with `next/core-web-vitals` and `next/typescript`
- **Formatting**: Prettier with single quotes, trailing commas
- **Types**: Strict TypeScript with `noEmit`
- **Tests**: Jest with coverage uploaded to Codecov on every CI run
