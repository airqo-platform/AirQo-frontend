import '@testing-library/jest-dom';

// Service modules (apiClient etc.) read the API base URL at import time —
// provide a stable test value so importing the store/services never throws.
process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.airqo.test';

// jsdom does not implement scroll APIs. Shared list components call
// `scrollIntoView` to keep the keyboard-highlighted option in view, so a
// no-op stub is needed for any test that renders one. Some suites (API routes,
// rate limiting) run in the `node` environment where there is no DOM at all.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}
