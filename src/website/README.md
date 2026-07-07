# Website

![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz) ![passing](https://img.shields.io/badge/passing-803%20%E2%80%94%20100%25-brightgreen?style=flat-square) ![failing](https://img.shields.io/badge/failing-1-brightgreen?style=flat-square) ![coverage](https://img.shields.io/badge/coverage-84%25-brightgreen?style=flat-square)

**Website** is the AirQo marketing and analytics application for air quality data visualization. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, Redux Toolkit, and TanStack React Query. The live website is at [airqo.net](https://airqo.net).

> **Note:** This is the frontend portion of the project. The backend is built with Django and maintained in the [airqo-api](https://github.com/airqo-platform/airqo-api) repository.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Running with Docker](#running-with-docker)
- [Contributing](#contributing)

---

## Getting Started

### Prerequisites

- **Node.js 20 (LTS)** or newer
- **npm** (comes with Node.js)

```bash
node -v  # verify Node.js
npm -v   # verify npm
```

### Installation

```bash
# Clone the repository
git clone https://github.com/airqo-platform/AirQo-frontend.git

# Navigate to the website folder
cd AirQo-frontend/src/website

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router routes
│   ├── (site)/             # Main public pages (home, about, careers, etc.)
│   ├── (content)/          # Blog content pages
│   ├── (products)/         # Product detail pages
│   ├── (solutions)/        # Solution/case-study pages
│   ├── (legal)/            # Legal and policy pages
│   ├── (programs)/         # Africa Clean Air Forum pages
│   ├── (developers)/       # Developer resources and packages
│   ├── (utility)/          # Data explorer, billboards
│   └── api/                # API proxy routes
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── layout/             # Navbar, Footer, MainLayout
│   ├── sections/           # Feature sections (AirQualityBillboard, etc.)
│   ├── cards/              # Card components
│   ├── dialogs/            # Modal dialogs
│   ├── feedback/           # EmptyState, ErrorState, LoadingState
│   ├── map/                # Map components (Mapbox GL)
│   ├── providers/          # AppProviders, QueryProvider, ReduxProvider
│   └── common/             # Shared components (AirQualityStatusIcon, etc.)
├── features/               # Page-level feature components
│   ├── home/               # Homepage sections
│   ├── about/              # About page
│   ├── blogs/              # Blog listing and detail
│   ├── careers/            # Job listings
│   ├── events/             # Events listing
│   ├── products/           # Product pages
│   ├── solutions/          # Solution pages (network-coverage, african-cities)
│   ├── clean-air-forum/    # Africa Clean Air Forum
│   ├── contact/            # Contact form
│   ├── faqs/               # FAQ pages
│   ├── legal/              # Legal pages (terms, privacy, cookies)
│   ├── partners/           # Partner pages
│   ├── press/              # Press page
│   ├── resources/          # Resource downloads
│   └── packages/           # Developer packages and icons
├── hooks/                  # Custom React hooks
│   ├── endpointsNew.ts     # TanStack Query hooks for API endpoints
│   ├── reduxHooks.ts       # Typed Redux hooks (useDispatch, useSelector)
│   ├── useResourceFilter.ts
│   └── useLockBodyScroll.ts
├── lib/                    # Utility functions and helpers
│   ├── utils/              # Utility modules (formatDate, slugify, airQuality, etc.)
│   ├── security/           # sanitizeHtml, safeExternalLink
│   ├── analytics/          # Google Analytics helpers
│   └── metadata/           # SEO metadata generation
├── queries/                # TanStack Query definitions
│   ├── query-keys.ts       # Query key factories
│   └── *.queries.ts        # Domain-specific query hooks
├── services/               # API service layer
│   ├── api/                # ApiClient, BaseApiService, error handling
│   ├── website/            # Website-specific API services (blogs, events, etc.)
│   └── external/           # External services (analytics, cloudinary, maps)
├── store/                  # Redux store
│   └── slices/             # Redux slices (country, modal, forum)
├── styles/                 # Global CSS (Tailwind theme, utilities)
├── types/                  # TypeScript type definitions
├── configs/                # Static configuration data
└── __mocks__/              # Jest mock files (setup, fileMock, mapbox-gl, recharts)
```

---

## Available Scripts

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start development server on localhost:3000 |
| `npm run build`         | Production build                           |
| `npm run start`         | Start production server                    |
| `npm run lint`          | Run ESLint                                 |
| `npm run lint:fix`      | Run ESLint with auto-fix                   |
| `npm run format`        | Format code with Prettier                  |
| `npm test`              | Run all Jest unit tests                    |
| `npm run test:watch`    | Run tests in watch mode                    |
| `npm run test:coverage` | Run tests with coverage report             |
| `npm run e2e`           | Run E2E tests with Selenium (headless)     |
| `npm run e2e:headed`    | Run E2E tests with browser visible         |

---

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values.

### Server-side Variables

| Variable                   | Description                              |
| -------------------------- | ---------------------------------------- |
| `API_URL`                  | AirQo platform API base URL              |
| `API_TOKEN`                | AirQo API authentication token           |
| `OPENCAGE_API_KEY`         | OpenCage geocoding API key               |
| `SLACK_WEBHOOK_URL`        | Slack webhook for error logging          |
| `SLACK_CHANNEL`            | Slack channel for notifications          |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification token |

### Client-side Variables

| Variable                          | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Comma-separated site URLs (first = canonical base) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`   | Google Analytics tracking ID                       |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token for maps                       |

> **Security:** Never commit `.env` files. They are in `.gitignore`.

---

## Testing

### Unit Tests (Jest)

816 tests across 36 test suites covering utilities, Redux, hooks, services, config, and security modules.

```bash
npm test                          # Run all tests
npm run test:watch                # Watch mode
npm run test:coverage             # Run with coverage report
npm test -- --testPathPattern=slugify  # Run specific test file
```

**Test categories:**

| Category     | Location                      | What it covers                                                     |
| ------------ | ----------------------------- | ------------------------------------------------------------------ |
| Utils        | `src/lib/utils/__tests__/`    | formatDate, slugify, airQuality, calendarUtils, storageUtils, etc. |
| Redux        | `src/store/slices/__tests__/` | countrySlice, modalSlice, forumSlice                               |
| Hooks        | `src/hooks/__tests__/`        | useResourceFilter, useLockBodyScroll                               |
| API Services | `src/services/api/__tests__/` | BaseApiService, api-routes                                         |
| Query Keys   | `src/queries/__tests__/`      | Query key factories, parameter normalization                       |
| Config       | `src/config/__tests__/`       | routes, navigation, packages, env, site config                     |
| Security     | `src/lib/security/__tests__/` | sanitizeHtml, safeExternalLink                                     |
| Lib          | `src/lib/__tests__/`          | siteUrl, environmentAwareUrl, logger                               |

**Mocking strategy:**

| Dependency     | Approach                                        |
| -------------- | ----------------------------------------------- |
| Next.js router | `jest.mock('next/navigation')`                  |
| API responses  | Mock `apiClient.request` via `jest.mock()`      |
| localStorage   | `Object.defineProperty` with mock functions     |
| DOMPurify      | Works in jsdom; server path tested separately   |
| Mapbox GL      | Manual mock in `src/__mocks__/mapbox-gl.ts`     |
| Recharts       | Stub components in `src/__mocks__/recharts.tsx` |
| CSS/SCSS       | `identity-obj-proxy`                            |
| Time           | `jest.useFakeTimers()`                          |

### E2E Tests (Selenium + Mocha)

End-to-end tests covering all website pages using Selenium WebDriver with Mocha/Chai and Page Object Model pattern.

```bash
# Start the dev server first
npm run dev

# In another terminal
npm run e2e        # headless mode
npm run e2e:headed # with browser visible
```

**E2E structure:**

```
e2e/
├── tests/
│   ├── navigation/              # Navbar, footer, page transitions
│   │   ├── navbar.test.ts
│   │   ├── footer.test.ts
│   │   └── page-transitions.test.ts
│   └── pages/                   # Page-specific tests
│       ├── home-page.test.ts
│       ├── products-page.test.ts
│       ├── solutions-page.test.ts
│       ├── blogs-page.test.ts
│       ├── legal-page.test.ts
│       ├── contact-page.test.ts
│       ├── about-page.test.ts
│       ├── careers-page.test.ts
│       └── events-page.test.ts
├── pages/                       # Page Object Model classes
│   ├── base.page.ts             # BasePage with common methods
│   ├── navbar.page.ts
│   ├── footer.page.ts
│   ├── home.page.ts
│   ├── products.page.ts
│   ├── solutions.page.ts
│   ├── blogs.page.ts
│   ├── legal.page.ts
│   ├── contact.page.ts
│   ├── about.page.ts
│   ├── careers.page.ts
│   └── events.page.ts
├── setup.ts                     # WebDriver setup/teardown
├── config.ts                    # Configuration (BASE_URL, BROWSER, HEADLESS)
├── tsconfig.json                # TypeScript config for E2E
└── .mocharc.yml                 # Mocha configuration
```

**Configuration:** Create `e2e/.env` (copy from `e2e/.env.example`):

```bash
BASE_URL=http://localhost:3000
BROWSER=chrome
HEADLESS=true
```

### Coverage

Coverage reports are uploaded to Codecov in CI with the `website` flag.

```bash
npm run test:coverage
# Open coverage/index.html in your browser to view the report
```

---

## Running with Docker

```bash
# Development (hot-reload, port 3000)
docker compose up web

# Production-like (port 8080)
docker compose up --build web-prod

# Stop and remove containers
docker compose down -v
```

Ensure you have a `.env` file in the website directory before building.

---

## Contributing

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the existing code style
4. Run `npm run lint:fix && npm run format` before committing
5. Run `npm test` to ensure all tests pass
6. Push and open a Pull Request against `staging`

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [AirQo API Repository](https://github.com/airqo-platform/airqo-api)
