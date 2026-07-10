# e2e

Playwright end-to-end tests for Vertex. For what belongs here vs. in a unit/component
test, and for conventions, see [`../app/_docs/internal/TESTING.md`](../app/_docs/internal/TESTING.md).

## Setup

```bash
cp ../vertex/.env.e2e.example .env.e2e   # from src/vertex/, fill in E2E_USER_EMAIL/PASSWORD
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
  tests/
    public/               # signed-out tests (no .env.e2e required) — "public" project
    ...                   # everything else — authenticated, "chromium" project
  .auth/                  # gitignored storageState output
```
