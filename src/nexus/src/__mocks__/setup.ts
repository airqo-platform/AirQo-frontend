import '@testing-library/jest-dom';

// Service modules (apiClient etc.) read the API base URL at import time —
// provide a stable test value so importing the store/services never throws.
process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.airqo.test';
