# e2e

Playwright end-to-end tests for Vertex. For what belongs here vs. in a unit/component
test, and for conventions, see [`../app/_docs/internal/TESTING.md`](../app/_docs/internal/TESTING.md).

## Setup

```bash
cp .env.e2e.example .env.e2e             # from src/vertex/, fill in E2E_USER_EMAIL/PASSWORD
npx playwright install chromium          # one-time browser download
```

## Run

```bash
npm run test:e2e            # headless, all projects
npm run test:e2e:ui         # interactive UI mode
npm run test:e2e:headed     # headed browser
npm run test:e2e:report     # open the last HTML report
```

## Layout

```txt
e2e/
  setup/auth.setup.ts     # logs in once, saves storageState for the chromium project
  support/                # shared helpers: env guard, route-interception mocks
  tests/
    public/               # signed-out tests (no .env.e2e required) — "public" project
    devices/              # device flows (import wizard, ...) — "chromium" project
    ...                   # everything else — authenticated, "chromium" project
  .auth/                  # gitignored storageState output
```

Mutation-heavy specs use **hybrid interception**: real auth, navigation, and
data GETs, with write endpoints intercepted via `page.route()` (see
`support/device-mocks.ts`) so runs are deterministic and never write to the
backend. `support/env-guard.ts` additionally refuses to run mutation specs
when `NEXT_PUBLIC_API_URL` does not look like staging/localhost.
