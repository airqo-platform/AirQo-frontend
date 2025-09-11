/**
 * Comprehensive logout utility
 *
 * This module provides functions to handle complete logout including:
 * - Redux store reset
 * - Cache clearing (SWR, React Query, etc.)
 * - Storage clearing (localStorage, sessionStorage, IndexedDB)
 * - NextAuth signout
 * - Navigation to login page
 */

import { mutate } from 'swr';
import logger from '@/lib/logger';
// Import tour storage prefix to avoid clearing user tour keys on logout
import { STORAGE_KEY_PREFIX as TOUR_STORAGE_PREFIX } from '@/common/features/tours/utils/tourStorage';

/**
 * Dispatch action to reset Redux store
 */
export const resetReduxStore = (dispatch) => {
  try {
    dispatch({ type: 'RESET_APP' });
    logger.debug('Redux store reset successfully');
  } catch (error) {
    logger.error('Failed to reset Redux store:', error);
  }
};

/**
 * Clear SWR cache completely
 */
export const clearSWRCache = () => {
  try {
    // Clear all SWR cache
    mutate(() => true, undefined, { revalidate: false });
    logger.debug('SWR cache cleared successfully');
  } catch (error) {
    logger.error('Failed to clear SWR cache:', error);
  }
};

/**
 * Clear browser storage (localStorage, sessionStorage)
 * Only clears AirQo-related items to avoid affecting other apps
 */
export const clearBrowserStorage = () => {
  if (typeof window === 'undefined') return;

  try {
    // Keys to always clear (critical auth/session data)
    const criticalKeys = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
    ];

    // Patterns to match for clearing
    const patterns = [
      /^airqo/i,
      /^next-auth/i,
      /analytics/i,
      /user/i,
      /group/i,
      /session/i,
      /auth/i,
      /token/i,
      /login/i,
      /organization/i,
      /org/i,
      /persist:/,
    ];

    // Clear localStorage (but preserve user tour keys)
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach((key) => {
      // preserve tour keys that start with the known prefix
      if (
        typeof TOUR_STORAGE_PREFIX === 'string' &&
        key.startsWith(TOUR_STORAGE_PREFIX)
      ) {
        logger.debug('Preserving tour localStorage key on logout:', key);
        return;
      }

      const shouldClear =
        criticalKeys.includes(key) ||
        patterns.some((pattern) => pattern.test(key));

      if (shouldClear) {
        try {
          localStorage.removeItem(key);
          logger.debug('Removed localStorage key:', key);
        } catch (error) {
          logger.debug('Failed to remove localStorage key:', key, error);
        }
      }
    });

    // Clear sessionStorage (also preserve tour keys if present there)
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach((key) => {
      if (
        typeof TOUR_STORAGE_PREFIX === 'string' &&
        key.startsWith(TOUR_STORAGE_PREFIX)
      ) {
        logger.debug('Preserving tour sessionStorage key on logout:', key);
        return;
      }

      const shouldClear =
        criticalKeys.includes(key) ||
        patterns.some((pattern) => pattern.test(key));

      if (shouldClear) {
        try {
          sessionStorage.removeItem(key);
          logger.debug('Removed sessionStorage key:', key);
        } catch (error) {
          logger.debug('Failed to remove sessionStorage key:', key, error);
        }
      }
    });

    logger.debug('Browser storage cleared successfully');
  } catch (error) {
    logger.error('Failed to clear browser storage:', error);
  }
};

/**
 * Clear IndexedDB databases (if any)
 */
export const clearIndexedDB = async () => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;

  try {
    // Common database names that might store auth/cache data
    const dbsToDelete = [
      'keyval-store',
      'airqo-cache',
      'user-data',
      'analytics-cache',
      'org-cache',
      'redux-persist',
    ];

    const clearPromises = dbsToDelete.map((dbName) => {
      return new Promise((resolve) => {
        try {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => {
            logger.debug('Deleted IndexedDB:', dbName);
            resolve();
          };
          deleteReq.onerror = () => {
            logger.debug('Failed to delete IndexedDB:', dbName);
            resolve(); // Don't fail the whole process
          };
          deleteReq.onblocked = () => {
            logger.debug('IndexedDB deletion blocked:', dbName);
            resolve(); // Don't fail the whole process
          };
        } catch (error) {
          logger.debug('Error deleting IndexedDB:', dbName, error);
          resolve(); // Don't fail the whole process
        }
      });
    });

    await Promise.allSettled(clearPromises);
    logger.debug('IndexedDB cleanup completed');
  } catch (error) {
    logger.error('Failed to clear IndexedDB:', error);
  }
};

/**
 * Cancel all pending requests (if using axios or fetch with AbortController)
 */
export const cancelPendingRequests = () => {
  try {
    // If we're using a global abort controller registry, cancel all
    if (typeof window !== 'undefined' && window.pendingRequests) {
      window.pendingRequests.forEach((controller) => {
        try {
          controller.abort();
        } catch (error) {
          logger.debug('Failed to abort request controller:', error);
        }
      });
      window.pendingRequests.clear();
    }

    logger.debug('Pending requests cancelled');
  } catch (error) {
    logger.error('Failed to cancel pending requests:', error);
  }
};

/**
 * Comprehensive logout function
 * Clears all possible caches and storage
 */
export const performComprehensiveLogout = async (dispatch) => {
  logger.info('Starting comprehensive logout process');

  try {
    // 1. Cancel any pending API requests
    cancelPendingRequests();

    // 2. Reset Redux store
    if (dispatch) {
      resetReduxStore(dispatch);
    }

    // 3. Clear SWR cache
    clearSWRCache();

    // 4. Clear browser storage
    clearBrowserStorage();

    // 5. Clear IndexedDB (async, don't wait)
    clearIndexedDB().catch((error) =>
      logger.debug('IndexedDB cleanup failed (non-critical):', error),
    );

    logger.info('Comprehensive logout completed successfully');
  } catch (error) {
    logger.error('Error during comprehensive logout:', error);
    // Continue with logout even if some cleanup fails
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = () => {
  if (typeof window === 'undefined' || !document?.cookie) return;

  try {
    const cookies = document.cookie.split(';');
    const authCookiePatterns = [
      'next-auth',
      'nextauth',
      '__Secure-next-auth',
      '__Host-next-auth',
      'csrf',
      'pkce',
      'state',
      'nonce',
      'access_token',
      'refresh_token',
      'session',
      'auth',
      'jwt',
      'token',
    ];

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const cookieName =
        eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (!cookieName) return;

      const isAuthCookie = authCookiePatterns.some((pattern) =>
        cookieName.toLowerCase().includes(pattern.toLowerCase()),
      );

      if (isAuthCookie) {
        const domainParts = window.location.hostname.split('.');
        const domainsToTry = [
          window.location.hostname,
          ...domainParts
            .map((_, i) => domainParts.slice(i).join('.'))
            .filter((d) => d.length > 0),
        ];
        const pathsToTry = ['/', '/api/auth'];

        domainsToTry.forEach((domain) => {
          pathsToTry.forEach((path) => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          });
        });
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
        logger.debug(`Cleared auth cookie: ${cookieName}`);
      }
    });

    logger.debug('Auth cookies cleared successfully');
  } catch (error) {
    logger.debug('Failed to clear auth cookies:', error);
  }
};
