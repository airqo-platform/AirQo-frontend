# Testing Guide

This guide defines the testing conventions for Vertex. Follow it when adding or updating automated tests.

## Test stack

- Vitest is the test runner for unit, hook, and component tests.
- React Testing Library is used for React components and hooks.
- `@testing-library/jest-dom` matchers are loaded globally from `vitest.setup.ts`.
- The default test environment is `jsdom`.
- Do not add Jest.
- Playwright is the runner for end-to-end tests (see [End-to-end tests](#end-to-end-tests)). Do not add Cypress or another e2e runner.

## Commands

Run the full unit/component suite once:

```bash
npm run test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:coverage
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

Run the e2e suite (requires `.env.e2e`, see [End-to-end tests](#end-to-end-tests)):

```bash
npm run test:e2e
```

Before opening a PR that adds or changes unit/component tests, run:

```bash
npm run test
npx tsc --noEmit
```

Before opening a PR that adds or changes e2e tests, additionally run:

```bash
npm run test:e2e
```

## File organization

Use co-located test files for unit, hook, and component tests.

```txt
core/utils/status.ts
core/utils/status.test.ts

core/hooks/useClipboard.ts
core/hooks/useClipboard.test.tsx

components/ui/Button.tsx
components/ui/Button.test.tsx
```

Use:

- `*.test.ts` for TypeScript utilities and non-JSX logic.
- `*.test.tsx` for React components, hooks, providers, and tests that render JSX.

Do not create `tests` folders under every feature or utility folder for unit tests. Co-location keeps tests close to the behavior they protect and makes future service/module migrations safer because source files and tests move together.

Use a shared root-level `test/` folder only for reusable test infrastructure when needed:

```txt
test/
  factories/
  mocks/
  utils/
```

End-to-end tests live separately under `e2e/`, not co-located with source — see [End-to-end tests](#end-to-end-tests) for layout, conventions, and when a behavior belongs there instead of in the Vitest/RTL suite above.

## Writing good tests

Test public behavior, not private implementation details.

Prefer assertions that describe what a user, caller, or consuming module observes:

- returned values
- rendered accessible UI
- emitted events
- storage updates
- error messages
- callback behavior

Avoid assertions that depend on:

- private helper functions
- internal state shape unless it is the public contract
- exact CSS classes, except where the class string is the actual utility output
- snapshots for utility tests

Use table-driven tests when a function has repeated input/output cases.

## Utility tests

Utility tests should be small, deterministic, and focused.

Cover:

- happy paths
- boundary values
- empty, nullish, or malformed inputs where supported
- error branches
- real regression cases

For date or time logic:

```ts
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});
```

For browser storage logic:

```ts
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
```

Use real `jsdom` storage or the shared setup fallback. Do not manually mock storage inside each test file unless a specific failure mode must be simulated.

## Hook and component tests

Use React Testing Library and test behavior through rendered output or hook results.

Prefer:

- `screen.getByRole`
- `screen.getByLabelText`
- `screen.getByText`
- `userEvent` for interactions

Avoid:

- querying by implementation-specific selectors
- testing React internals
- asserting on state setters directly

When hooks/components need providers, use shared render helpers rather than duplicating wrapper setup in every file.

Recommended future helpers:

```txt
test/utils/renderWithProviders.tsx
test/utils/renderHookWithProviders.tsx
test/factories/
test/mocks/
```

## End-to-end tests

Playwright drives e2e tests. They live under `e2e/`, separate from the co-located Vitest/RTL suite, because they exercise the whole system together (real routing, real auth, a real backend) rather than a single unit in isolation.

### What qualifies for e2e vs. unit/component tests

E2E tests are the most expensive tests in this repo to write, run, and debug — slowest to execute, most prone to flakiness, and the hardest to pin down on failure. Spend them deliberately. Everything that *can* be proven with a fast, deterministic Vitest/RTL test should be — e2e is for the remainder, where the risk lives in integration, not in a single component or function.

Write an e2e test when a behavior meets at least one of these:

- **It's a critical business journey.** If it breaks, a user cannot accomplish the core thing the product exists for — deploying a device, onboarding an AirQo device, importing an external device, recalling a device, switching the active organization.
- **The risk lives in the integration, not the component.** Auth wiring, cross-page navigation, a multi-step wizard that carries state across dialogs/pages, query-cache invalidation firing correctly across the whole app on a context switch — these can pass every unit test individually and still be broken once wired together in a real browser.
- **It proves access control against the real session.** A component test can assert that `RouteGuard` renders `children` or the forbidden state given a mocked permission; only an e2e test proves that check is actually wired to a real user's real session, route, and resource context.

Do not write an e2e test for:

- Component rendering, prop variations, or conditional UI states — cover with RTL.
- Form or schema validation logic — cover with RTL, or a plain unit test on the schema itself.
- Every CRUD screen or admin table — cover data-fetching/rendering with RTL and mocked API responses; reserve e2e for the one or two flows on that screen that carry real cross-system risk (see above), not the screen as a whole.
- Edge cases, boundary values, and error branches — these belong in unit tests, where they're cheap to enumerate. An e2e suite that tries to cover them too becomes slow and duplicates the unit suite it's supposed to complement.

When unsure, ask: *if this were broken, would a fast, mocked component test have caught it?* If yes, it's not an e2e test.

### File organization

```txt
e2e/
  setup/
    auth.setup.ts       # logs in once via the real login form, saves storageState
  tests/
    public/              # signed-out flows — "public" Playwright project, no auth required
      login.spec.ts
    <domain>/             # authenticated flows — "chromium" project, e.g. organization/, devices/
      workspace.spec.ts
  .auth/                 # gitignored; storageState written here by auth.setup.ts
```

Group specs by domain/journey (`e2e/tests/devices/`, `e2e/tests/organization/`), not by page or component.

### Auth pattern

Playwright's `setup` project runs `e2e/setup/auth.setup.ts` once, logs in through the real two-step login form, and persists cookies + `localStorage` to `e2e/.auth/user.json`. The `chromium` project depends on `setup` and reuses that `storageState`, so individual specs never log in themselves. Tests that must run signed out belong in `e2e/tests/public/` (the `public` project — no `storageState`, no dependency on `setup`).

Local setup:

```bash
cp .env.e2e.example .env.e2e   # fill in E2E_USER_EMAIL / E2E_USER_PASSWORD
npx playwright install chromium
npm run test:e2e
```

`NEXT_PUBLIC_HCAPTCHA_SITE_KEY` must be unset for the target environment while running e2e — the auth setup script cannot solve a captcha, and the login form only renders one when a site key is present (`isHCaptchaEnabled()` in `lib/envConstants.ts`).

### CI status

E2e tests are not yet wired into `.github/workflows/vertex-ci.yml`. Run `npm run test:e2e` locally before opening a PR that adds or changes e2e tests. Wiring this into CI (and deciding whether it gates merges or runs informationally, consistent with how coverage is treated today) is tracked as follow-up work, not part of this initial setup.

## Mocking guidance

Mock at boundaries, not everywhere.

Good mock boundaries include:

- network clients
- NextAuth session state
- Next.js router/navigation APIs
- timers
- browser APIs not implemented by jsdom

Avoid mocking the function under test or its private helpers.

Keep mocks local to the test file unless they are reused across multiple domains. Shared mocks should live under `test/mocks/`.

## Coverage expectations

Coverage should be used as a quality signal, not as a substitute for useful assertions.

Prioritize meaningful coverage for:

- core utilities
- hooks
- shared UI components
- service/API boundary logic
- permission and access-control logic

Do not add low-value tests just to increase coverage numbers.

`.github/workflows/vertex-ci.yml` runs the suite with coverage on every PR and push to `staging` that touches Vertex, and uploads results to Codecov under the `vertex` flag (see root `codecov.yml`). Project and patch coverage checks are currently informational (visible on the PR, non-blocking) rather than an enforced gate, consistent with treating coverage as a signal rather than a target. The build/test status and coverage badges in this app's `README.md` reflect the latest `staging` run.

Vertex previously ran as a conditional job inside the shared `safe-checks.yml` (still used by the other frontend projects in this monorepo). It was split into its own workflow so it could push-trigger on `staging` independently — keeping Codecov's baseline fresh — without changing CI behavior for the other five projects.

Flaky-test-rate tracking is deferred: it needs a separate mechanism (for example Codecov Test Analytics or a retry-count script) beyond the coverage upload above, and isn't wired up yet.

## Deferred test areas

Proxy and network-heavy utilities should be tested in a later integration-style pass with explicit mocks for axios, NextAuth, environment config, and Next.js request/response objects.

Examples:

- `core/utils/proxyClient.ts`
- `core/utils/secureApiProxyClient.ts`
- `core/utils/platform.ts`

## PR checklist

When adding or changing unit/component tests, confirm:

- Tests are co-located with the source file.
- Test names describe behavior.
- Tests are deterministic and do not leak timers or storage state.
- No snapshots were added for utilities.
- `npm run test` passes.
- `npx tsc --noEmit` passes.

When adding or changing e2e tests, additionally confirm:

- The behavior actually qualifies for e2e per [What qualifies for e2e vs. unit/component tests](#what-qualifies-for-e2e-vs-unitcomponent-tests) — it wasn't something a component test could have caught.
- The spec lives under the right project (`e2e/tests/public/` for signed-out flows, elsewhere for authenticated ones) rather than working around the auth setup.
- Assertions target user-visible state (URL, accessible role/text, rendered data), not implementation details.
- Any test data created against a real/staging backend is either idempotent, cleaned up by the test, or scoped to a disposable test account — a test should not leave orphaned devices, invites, or org state behind on every run.
- `npm run test:e2e` passes.
