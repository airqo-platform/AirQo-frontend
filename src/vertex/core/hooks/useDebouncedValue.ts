import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs`. Useful for
 * turning keystrokes into a single lookup once the user pauses typing.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
