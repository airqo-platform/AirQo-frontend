# Testing Guide

This guide defines the testing conventions for Vertex. Follow it when adding or updating automated tests.

## Test stack

- Vitest is the test runner.
- React Testing Library is used for React components and hooks.
- `@testing-library/jest-dom` matchers are loaded globally from `vitest.setup.ts`.
- The default test environment is `jsdom`.
- Do not add Jest.

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

Before opening a PR that adds or changes tests, run:

```bash
npm run test
npx tsc --noEmit
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

End-to-end tests should live separately under an `e2e/` folder when Playwright is introduced.

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

## Deferred test areas

Proxy and network-heavy utilities should be tested in a later integration-style pass with explicit mocks for axios, NextAuth, environment config, and Next.js request/response objects.

Examples:

- `core/utils/proxyClient.ts`
- `core/utils/secureApiProxyClient.ts`
- `core/utils/platform.ts`

## PR checklist

When adding or changing tests, confirm:

- Tests are co-located with the source file.
- Test names describe behavior.
- Tests are deterministic and do not leak timers or storage state.
- No snapshots were added for utilities.
- `npm run test` passes.
- `npx tsc --noEmit` passes.
