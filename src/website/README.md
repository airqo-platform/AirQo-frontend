# Website

![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz&flag=website) ![passing](https://img.shields.io/badge/passing-327%20%E2%80%94%20100%25-brightgreen?style=flat-square) ![failing](https://img.shields.io/badge/failing-0-brightgreen?style=flat-square)

**Website** is the AirQo analytics application for air quality data visualization, built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

Welcome to the Website repository, part of the AirQo Frontend project. This website is built with [Next.js](https://nextjs.org) and was bootstrapped using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The live website can be found at [airqo.net](https://airqo.net)

> **Note:** This repository only contains the frontend portion of the project. The backend has been built with Django and is maintained in the [airqo-api](https://github.com/airqo-platform/airqo-api) repository. If you wish to use the database for the website, please contact the project admin to obtain the necessary database URL for the frontend configuration

This guide provides clear, step-by-step instructions to help you set up your local development environment, run the website, and contribute effectively. Additionally, it explains how to handle environment variables and update CI/CD workflows.

---

## Table of Contents

- [Website](#website)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Navigate to the Website Folder](#2-navigate-to-the-website-folder)
    - [3. Install Dependencies](#3-install-dependencies)
    - [4. Run the Development Server](#4-run-the-development-server)
  - [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [E2E Tests](#e2e-tests)
    - [Test Coverage](#test-coverage)
  - [Environment Variables \& Workflow Updates](#environment-variables--workflow-updates)
  - [Backend \& Database Integration](#backend--database-integration)
  - [Contributing](#contributing)
  - [Learn More](#learn-more)
  - [Deployment](#deployment)
  - [Running with Docker](#running-with-docker)
    - [Server-side Variables](#server-side-variables)
    - [Client-side Variables](#client-side-variables)

---

## Getting Started

Follow these steps to set up your local development environment for the website. These instructions are applicable on Windows, Mac, and Linux.

### 1. Clone the Repository

Clone the AirQo Frontend repository using the following command:

```bash
git clone https://github.com/airqo-platform/AirQo-frontend.git
```

_Tip for Mac/Linux:_  
If you encounter any permission issues with Git, ensure that Git is correctly installed on your system. You can install Git via [Homebrew](https://brew.sh) on Mac (`brew install git`) or use your package manager on Linux (e.g., `sudo apt-get install git` on Debian/Ubuntu).

### 2. Navigate to the Website Folder

After cloning the repository, navigate to the folder that contains the website application:

```bash
cd AirQo-frontend/src/website2
```

_Note:_  
The folder structure is consistent across all operating systems. Use your terminal (Mac/Linux) or Command Prompt/PowerShell (Windows) to run this command.

### 3. Install Dependencies

This project targets **Node.js 20 (LTS) or newer**. Ensure you have Node.js and npm installed on your system by running:

```bash
node -v
npm -v
```

If you need to install or update Node.js, download it from [nodejs.org](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm) (especially useful for Mac/Linux).

To install the required dependencies using **npm**, run:

```bash
npm install
```

_For Mac/Linux Users:_  
If you experience permission issues while installing packages globally, consider using a Node version manager like [nvm](https://github.com/nvm-sh/nvm).

### 4. Run the Development Server

Launch the development server with the following command:

```bash
npm run dev
```

Once the server starts, open [http://localhost:3000](http://localhost:3000) in your browser to view the website. The page will automatically reload as you make changes.

_Alternate Tips for Mac/Linux:_

- Use your terminal’s tab completion to quickly navigate directories.
- If you’re using a firewall or proxy, ensure your local ports are accessible.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (main)/             # Route group (doesn't affect URLs)
│   │   ├── (about)/        # About sub-pages
│   │   └── [route]/        # Dynamic route pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Root redirect to /home
│   └── api/                # API routes (proxy)
├── views/                  # Page components (actual UI logic)
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui primitives
│   └── layouts/            # MainLayout, Navbar, Footer
├── services/               # API client and hooks
│   └── apiClient.ts        # Server vs client routing
├── store/                  # Redux slices
├── configs/                # Static config data
├── lib/                    # Shared utilities
│   └── utils.ts            # cn() helper for Tailwind
└── __mocks__/              # Jest mock files
```

---

## Available Scripts

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start development server on localhost:3000 |
| `npm run build`         | Production build with standalone output    |
| `npm run start`         | Start production server                    |
| `npm run lint`          | Run ESLint                                 |
| `npm run lint:fix`      | Run ESLint with auto-fix                   |
| `npm run format`        | Format code with Prettier                  |
| `npm test`              | Run all Jest tests                         |
| `npm run test:watch`    | Run tests in watch mode                    |
| `npm run test:coverage` | Run tests with coverage report             |
| `npm run e2e`           | Run E2E tests (headless)                   |
| `npm run e2e:headed`    | Run E2E tests with browser visible         |

---

## Testing

This project uses **Jest** for unit testing and **Selenium WebDriver** for end-to-end (E2E) testing.

### Unit Tests

Unit tests are co-located with source files in `__tests__/` directories using the pattern `*.test.ts` or `*.test.tsx`.

**Run unit tests:**

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

**Run a specific test file:**

```bash
npm test -- src/lib/utils/__tests__/formatDate.test.ts
npm test -- --testNamePattern="should format date"
```

**Test suites and current counts:**

| Category          | Location                      | What it covers                                              |
| ----------------- | ----------------------------- | ----------------------------------------------------------- |
| Utility functions | `src/lib/utils/__tests__/`    | Date formatting, number parsing, string helpers, validation |
| Redux store       | `src/store/slices/__tests__/` | State transitions, reducers, action creators                |
| API services      | `src/services/api/__tests__/` | Request/response handling, error mapping                    |
| Query hooks       | `src/queries/__tests__/`      | Query key factories, cache invalidation                     |
| Config data       | `src/configs/__tests__/`      | Static data completeness, structure validation              |

**Mocking strategy:**

| What           | How                                 | Example                                     |
| -------------- | ----------------------------------- | ------------------------------------------- |
| Next.js router | `jest.mock('next/navigation')`      | Mock `useRouter`, `useSearchParams`         |
| API responses  | `jest.mock('@/services/apiClient')` | Return fixture data                         |
| Browser APIs   | `jest.fn().mockImplementation()`    | `window.matchMedia`, `IntersectionObserver` |
| Static assets  | `identity-obj-proxy`                | CSS modules, images                         |
| Time           | `jest.useFakeTimers()`              | Timer-dependent logic, polling              |
| Mapbox GL      | `jest.mock('mapbox-gl')`            | Map component rendering                     |
| Recharts       | `__mocks__/recharts.tsx`            | Chart component rendering                   |

**Writing tests:**

- Use `describe`/`it` blocks with descriptive names
- Test edge cases, boundary conditions, and error cases
- Mock external dependencies using `jest.mock()`
- Use `@testing-library/react` for component tests
- Use `jest.useFakeTimers()` for time-dependent logic

### E2E Tests

E2E tests use Selenium WebDriver with Mocha/Chai and follow the Page Object Model pattern.

**Run E2E tests:**

```bash
npm run e2e        # headless mode
npm run e2e:headed # with browser visible
```

**E2E structure:**

```
e2e/
├── tests/           # Test files
│   ├── navigation/  # Navigation tests
│   └── pages/       # Page-specific tests
├── pages/           # Page Object Model classes
│   ├── base.page.ts # Base page with common methods
│   └── home.page.ts # Home page object
├── setup.ts         # Driver setup/teardown
├── config.ts        # Configuration management
└── .mocharc.yml     # Mocha configuration
```

**Configuration:**

Create a `.env` file in the `e2e/` directory (copy from `.env.example`):

```bash
BASE_URL=http://localhost:3000
BROWSER=chrome
HEADLESS=true
```

### Test Coverage

Coverage reports are generated when running `npm run test:coverage` and uploaded to Codecov in CI.

**View HTML coverage report:**

```bash
npm run test:coverage
# Then open coverage/index.html in your browser
```

**Coverage configuration:**

- Provider: `v8`
- Output: `coverage/`
- Collects from: `src/**/*.{ts,tsx}`
- Excludes: `node_modules`, `__mocks__`, `__tests__`, `*.d.ts`

---

## Features & Special Routes

### Air Quality Billboard Display

The website includes a specialized billboard display system optimized for large screens and public displays:

#### Dynamic Billboard Routes

- **Cohort Display:**
  - `/billboard/cohort` - Randomly rotates through all cohorts (auto-refresh every 20s)
  - `/billboard/cohort/{name}` - Displays a specific cohort location
- **Grid Display:**
  - `/billboard/grid` - Randomly rotates through all grids (auto-refresh every 20s)
  - `/billboard/grid/{name}` - Displays a specific grid location

#### Billboard Features

- ✅ Clean, professional interface (no navigation controls)
- ✅ Large, readable PM2.5 values with color-coded indicators
- ✅ Air quality icons and 7-day forecasts
- ✅ QR codes for mobile access
- ✅ Optimized for 24/7 public display

**Examples:**

```text
/billboard/cohort/airqo_g5429
/billboard/grid/kampala_central
```

📖 **Complete Documentation:**

- [Air Quality Billboard Guide](docs/AIR_QUALITY_BILLBOARD.md) - Complete setup, usage, and technical documentation

---

## Environment Variables & Workflow Updates

When adding new environment variables to the project, ensure that the CI/CD workflows remain consistent across staging, production, and preview environments.

For example, if you add new variables, update your workflow YAML files as follows:

```bash
echo "  OPENCAGE_API_KEY: ${{ secrets.WEBSITE_OPENCAGE_API_KEY }}" >> .env.yaml
echo "  API_TOKEN: ${{ secrets.WEBSITE_API_TOKEN }}" >> .env.yaml
echo "  SLACK_WEBHOOK_URL: ${{ secrets.WEBSITE_SLACK_WEBHOOK_URL }}" >> .env.yaml
echo "  SLACK_CHANNEL: ${{ secrets.WEBSITE_SLACK_CHANNEL }}" >> .env.yaml
```

**Important Notes:**

- Verify that the secret names used in your workflows match those defined in your repository.
- If you add new environment variables, please contact the project admin to have them added to the GitHub secrets.
- Always update the workflow files whenever you introduce or modify environment variables.
- You can find the workflow files for the different environments in the `.github/workflows` folder.

---

## Backend & Database Integration

The backend for this project is built with Django and is maintained in the [airqo-api](https://github.com/airqo-platform/airqo-api) repository. If you wish to connect the website to a live database:

- **Database Access:**  
  You will need the database URL which is not publicly available.  
  **Action Required:** Contact the project admin to obtain the database URL for frontend integration.

- **Environment Variables:**  
  Once you receive the database URL, update your environment variables accordingly in the `.env.yaml` file and any other relevant configuration files.

---

## Contributing

We welcome contributions from the open source community. To help you get started, please follow these steps:

1. **Fork and Clone:**
   - Fork the repository on GitHub.
   - Clone your fork to your local machine:

     ```bash
     git clone https://github.com/your-username/AirQo-frontend.git
     ```

2. **Create a Branch:**
   - Create a feature or bug-fix branch:

     ```bash
     git checkout -b feature/your-feature-name
     ```

3. **Make Your Changes:**
   - Follow the coding standards and guidelines established in the project.
   - Update documentation as needed.
   - Test your changes locally to ensure everything works as expected.

4. **Commit and Push:**
   - Commit your changes with a clear commit message:

     ```bash
     git commit -m "Description of your changes"
     ```

   - Push your branch to your fork:

     ```bash
     git push origin feature/your-feature-name
     ```

5. **Open a Pull Request:**
   - Navigate to the main repository on GitHub and open a Pull Request against the `main` branch.
   - Provide a detailed description of your changes and reference any related issues.

---

## Learn More

To expand your knowledge about Next.js and modern web development, consider exploring these resources:

- **[Next.js Documentation](https://nextjs.org/docs)** – Learn about Next.js features and APIs.
- **[Learn Next.js](https://nextjs.org/learn)** – An interactive tutorial for building Next.js applications.
- **[Next.js GitHub Repository](https://github.com/vercel/next.js)** – Explore and contribute to the core Next.js codebase.

---

## Deployment

The simplest way to deploy the website is via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For more detailed deployment instructions, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Running with Docker

This repository includes a `docker-compose.yml` that provides two services:

- `web` - development service which bind-mounts the source and runs `npm run dev` with hot-reload on port 3000 (uses Node 20 image).
- `web-prod` - production-like service that builds the standalone Next.js app using the provided `Dockerfile` (Node 20) and serves it on port 8080.

Usage (run these from the website folder: `d:/projects/AirQo-frontend/src/website2`):

- Start dev (hot-reload, port 3000):

```bash
docker compose up web
# or detached
docker compose up -d web
```

- Build and run production-like container (port 8080):

```bash
docker compose up --build web-prod
# or detached
docker compose up -d --build web-prod
```

- Stop and remove containers (and anonymous volumes):

```bash
docker compose down -v
```

- Clean/rebuild the production image:

```bash
docker compose build --no-cache web-prod
```

Environment variables and build args

**SECURITY UPDATE:** The project has been refactored to use server-side environment variables for sensitive data, improving security by not exposing credentials to the client.

### Server-side Variables

- API_URL (AirQo platform API base URL)
- API_TOKEN (AirQo API authentication token)
- OPENCAGE_API_KEY (OpenCage geocoding API key)
- SLACK_WEBHOOK_URL (Slack webhook for logging)
- SLACK_CHANNEL (Slack channel for notifications)
- GOOGLE_SITE_VERIFICATION (Google Search Console verification token)

### Client-side Variables

- NEXT_PUBLIC_SITE_URL (comma-separated site URLs; the first entry is the canonical base)
- NEXT_PUBLIC_GA_MEASUREMENT_ID (Google Analytics tracking ID)
- NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (Mapbox access token)

How to provide them:

- Preferred: use the `.env` file in the project root. The `web` and `web-prod` services load `.env` via `env_file` in `docker-compose.yml`.

```bash
# Edit .env and fill in the values (do NOT commit secrets)
# The .env file is already in .gitignore
```

- Alternative: pass build args on the command line during build:

```bash
docker compose build --build-arg API_URL="https://api.example.com" web-prod
```

Notes and safety

- The Dockerfile uses Node 20 (LTS) and is optimized for production with minimal layers
- Do NOT commit files that contain secrets (`.env` is already in `.gitignore`)
- Docker Compose (v2) prefers the `docker compose` subcommand (without a hyphen)
- Do NOT commit files that contain secrets (for example `.env`, `.env.compose`). The repository now also includes `.env` in `.gitignore` for extra safety.
- Docker Compose (v2) prefers the `docker compose` subcommand (without a hyphen). Depending on your setup you may still have `docker-compose` available; both may work but `docker compose` is the recommended form for Compose v2.

Troubleshooting

- If the browser cannot reach the site but `curl` shows responses, try `http://127.0.0.1:8080` instead of `http://localhost:8080` (IPv4 vs IPv6 / proxy differences can cause issues).
- If a build inside Docker fails, first ensure the app builds locally with `npm ci` and `npm run build` and check the logs:

```bash
docker compose logs web-prod --tail 200
```

If you need to debug the build environment, you can run an interactive build container and inspect environment variables before running `npm run build`.

Thank you for your interest in contributing to our website. Your support and contributions are vital to the ongoing success and improvement of the project!

---
