/**
 * Storage Utility Functions
 * Safe wrappers for localStorage/sessionStorage with error handling
 */

/**
 * Safely get item from localStorage
 */
export function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error reading from localStorage [${key}]:`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeLocalStorageItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage [${key}]:`, error);
  }
}

/**
 * Safely get item from sessionStorage
 */
export function getSessionStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error reading from sessionStorage [${key}]:`, error);
    return null;
  }
}

/**
 * Safely set item in sessionStorage
 */
export function setSessionStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to sessionStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Safely remove item from sessionStorage
 */
export function removeSessionStorageItem(key: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from sessionStorage [${key}]:`, error);
  }
}

/**
 * Check if an item exists in localStorage
 */
export function hasLocalStorageItem(key: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item with expiry (stores timestamp with data)
 */
export function getItemWithExpiry<T>(key: string): T | null {
  const item = getLocalStorageItem<{ value: T; expiry: number }>(key);
  if (!item) return null;

  const now = Date.now();
  if (now > item.expiry) {
    removeLocalStorageItem(key);
    return null;
  }

  return item.value;
}

/**
 * Set item with expiry (in milliseconds)
 */
export function setItemWithExpiry<T>(
  key: string,
  value: T,
  ttl: number,
): boolean {
  const now = Date.now();
  const item = {
    value,
    expiry: now + ttl,
  };
  return setLocalStorageItem(key, item);
}
