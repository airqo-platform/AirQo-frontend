import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  const createStorage = (): Storage => {
    let store: Record<string, string> = {};

    return {
      get length() {
        return Object.keys(store).length;
      },
      clear: () => {
        store = {};
      },
      getItem: (key: string) => store[key] ?? null,
      key: (index: number) => Object.keys(store)[index] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
    };
  };

  const localStorageFallback = window.localStorage ?? createStorage();
  const sessionStorageFallback = window.sessionStorage ?? createStorage();

  Object.defineProperty(window, "localStorage", {
    value: localStorageFallback,
    configurable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageFallback,
    configurable: true,
  });

  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageFallback,
    configurable: true,
  });

  Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionStorageFallback,
    configurable: true,
  });
}
