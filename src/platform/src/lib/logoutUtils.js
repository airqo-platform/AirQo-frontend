/**
 * Comprehensive logout utility - Optimized for maintainability
 */

import { mutate } from 'swr';
import logger from '@/lib/logger';
import { STORAGE_KEY_PREFIX as TOUR_STORAGE_PREFIX } from '@/common/features/tours/utils/tourStorage';

// Keys/patterns to preserve during logout
const PRESERVE_KEYS = ['moreInsightsInfoBannerSeen', 'i'];
const PRESERVE_PREFIXES = ['user_tour_status_', TOUR_STORAGE_PREFIX].filter(
  Boolean,
);

// Patterns for keys to clear
const CLEAR_PATTERNS = [
  /^airqo/i,
  /^next-auth/i,
  /analytics/i,
  /session/i,
  /auth/i,
  /token/i,
  /login/i,
  /org/i,
  /persist:/,
  /user(?!_tour_status_)/i,
];

const shouldPreserve = (key) => {
  return (
    PRESERVE_KEYS.includes(key) ||
    PRESERVE_PREFIXES.some((prefix) =>
      key.toLowerCase().startsWith(prefix.toLowerCase()),
    )
  );
};

const shouldClear = (key) => {
  return (
    !shouldPreserve(key) && CLEAR_PATTERNS.some((pattern) => pattern.test(key))
  );
};

/**
 * Reset Redux store
 */
export const resetReduxStore = (dispatch) => {
  try {
    dispatch({ type: 'RESET_APP' });
    logger.debug('Redux store reset');
  } catch (error) {
    logger.error('Redux reset failed:', error);
  }
};

/**
 * Clear SWR cache
 */
export const clearSWRCache = () => {
  try {
    mutate(() => true, undefined, { revalidate: false });
    logger.debug('SWR cache cleared');
  } catch (error) {
    logger.error('SWR clear failed:', error);
  }
};

/**
 * Clear browser storage with key preservation
 */
export const clearBrowserStorage = () => {
  if (typeof window === 'undefined') return;

  [localStorage, sessionStorage].forEach((storage) => {
    try {
      // Backup preserved keys
      const backup = {};
      Object.keys(storage).forEach((key) => {
        if (shouldPreserve(key)) {
          backup[key] = storage.getItem(key);
        }
      });

      // Clear keys that should be cleared
      Object.keys(storage).forEach((key) => {
        if (shouldClear(key)) {
          storage.removeItem(key);
        }
      });

      // Restore preserved keys
      Object.entries(backup).forEach(([key, value]) => {
        storage.setItem(key, value);
      });

      logger.debug(`${storage.constructor.name} cleaned`);
    } catch (error) {
      logger.error(`${storage.constructor.name} cleanup failed:`, error);
    }
  });
};

/**
 * Clear IndexedDB databases
 */
export const clearIndexedDB = async () => {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  const dbNames = ['keyval-store', 'airqo-cache', 'user-data', 'redux-persist'];

  try {
    await Promise.allSettled(
      dbNames.map(
        (name) =>
          new Promise((resolve) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => {
              logger.debug(`Deleted IndexedDB database: ${name}`);
              resolve(name);
            };
            req.onerror = (e) => {
              logger.debug(`Failed to delete ${name}:`, e);
              // resolve with name to continue cleanup but log the error
              resolve(name);
            };
            req.onblocked = () => {
              logger.warn(
                `Database ${name} deletion blocked - connections still open`,
              );
              // don't resolve immediately; allow the timeout fallback below to continue
            };
            // Timeout fallback - ensure the promise resolves eventually
            setTimeout(() => {
              logger.debug(`Timeout while deleting ${name} - continuing`);
              resolve(name);
            }, 2000);
          }),
      ),
    );
    logger.debug('IndexedDB cleared');
  } catch (error) {
    logger.error('IndexedDB clear failed:', error);
  }
};

/**
 * Clear auth cookies
 */
export const clearAuthCookies = () => {
  if (typeof window === 'undefined') return;

  try {
    const authPatterns = ['next-auth', 'session', 'auth', 'token', 'csrf'];
    const cookies = document.cookie.split(';');

    cookies.forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (
        authPatterns.some((pattern) => name.toLowerCase().includes(pattern))
      ) {
        // Clear with various domain/path combinations
        ['/', '/api/auth'].forEach((path) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${window.location.hostname}`;
        });
      }
    });
    logger.debug('Auth cookies cleared');
  } catch (error) {
    logger.error('Cookie clear failed:', error);
  }
};

/**
 * Cancel pending requests
 */
export const cancelPendingRequests = () => {
  try {
    if (window.pendingRequests) {
      window.pendingRequests.forEach((controller) => {
        try {
          controller.abort();
        } catch {}
      });
      window.pendingRequests.clear();
    }
    logger.debug('Pending requests cancelled');
  } catch (error) {
    logger.error('Request cancel failed:', error);
  }
};

/**
 * Comprehensive logout - clears everything while preserving specified keys
 */
export const performComprehensiveLogout = async (dispatch) => {
  logger.info('Starting logout cleanup');

  try {
    cancelPendingRequests();

    if (dispatch) resetReduxStore(dispatch);

    clearSWRCache();
    clearBrowserStorage();
    clearAuthCookies();

    // Clear IndexedDB async (non-blocking)
    clearIndexedDB().catch((err) =>
      logger.debug('IndexedDB cleanup error:', err),
    );

    logger.info('Logout cleanup completed');
  } catch (error) {
    logger.error('Logout cleanup error:', error);
  }
};
