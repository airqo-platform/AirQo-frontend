// Browser-ish globals the app's config and auth modules read at import time
if (globalThis.window === undefined) {
  const location = { hostname: "localhost", href: "http://localhost:3000/", protocol: "http:", origin: "http://localhost:3000" }
  const storage = () => {
    const store = new Map()
    return {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => void store.set(key, String(value)),
      removeItem: (key) => void store.delete(key),
      clear: () => store.clear(),
    }
  }
  globalThis.window = { location, localStorage: storage(), sessionStorage: storage(), addEventListener: () => {}, removeEventListener: () => {} }
  globalThis.location = location
  globalThis.localStorage = globalThis.window.localStorage
  globalThis.sessionStorage = globalThis.window.sessionStorage
}
if (globalThis.navigator === undefined) {
  globalThis.navigator = { onLine: true, userAgent: "node" }
}
// The auth service subscribes to storage events at import time
if (typeof globalThis.addEventListener !== "function") {
  globalThis.addEventListener = () => {}
  globalThis.removeEventListener = () => {}
}
