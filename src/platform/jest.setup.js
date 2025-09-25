// Minimal Jest setup for tests: polyfill global.fetch to avoid next-auth errors
global.fetch =
  global.fetch || (() => Promise.resolve({ ok: true, json: async () => ({}) }));

// Optionally add other globals used by tests
global.matchMedia =
  global.matchMedia ||
  function () {
    return { matches: false, addListener: () => {}, removeListener: () => {} };
  };
