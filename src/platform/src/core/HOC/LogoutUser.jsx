import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { clearActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';

/**
 * Clear token cache from secureApiProxyClient
 * This ensures cached JWT tokens are cleared during logout
 */
const clearTokenCache = () => {
  try {
    // Access the token cache variables from secureApiProxyClient
    if (typeof window !== 'undefined') {
      // Reset token cache by setting it to null and expiry to 0
      // This matches the cache structure in secureApiProxyClient.js
      window.__tokenCache = null;
      window.__tokenCacheExpiry = 0;

      logger.debug('Token cache cleared successfully');
    }
  } catch (error) {
    logger.warn('Failed to clear token cache:', error);
  }
};

/**
 * Clear session cache from proxyClient
 * This ensures cached NextAuth sessions are cleared during logout
 */
const clearSessionCache = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear session cache used by proxyClient
      window.__sessionCache = new Map();

      logger.debug('Session cache cleared successfully');
    }
  } catch (error) {
    logger.warn('Failed to clear session cache:', error);
  }
};

/**
 * Clear all authentication-related cookies
 * This ensures NextAuth and other auth cookies are completely removed
 */
const clearAuthCookies = () => {
  try {
    if (typeof window !== 'undefined' && document) {
      // Get all cookies
      const cookies = document.cookie.split(';');

      // Find and clear NextAuth and authentication-related cookies
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
        const cookieName = cookie.split('=')[0].trim();

        // Check if cookie matches any auth patterns
        const isAuthCookie = authCookiePatterns.some((pattern) =>
          cookieName.toLowerCase().includes(pattern.toLowerCase()),
        );

        if (isAuthCookie) {
          // Clear cookie by setting it to expire in the past
          const cookieString = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
          document.cookie = cookieString;

          // Also try clearing with just domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

          // And try clearing without domain
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

          logger.debug(`Cleared auth cookie: ${cookieName}`);
        }
      });
    }
  } catch (error) {
    logger.warn('Failed to clear auth cookies:', error);
  }
};

/**
 * Reset all Redux slices to their initial state
 * This ensures complete state cleanup beyond just the login slice
 */
const resetAllReduxSlices = (dispatch) => {
  try {
    // Dispatch the global reset action that triggers all slices to reset
    dispatch({ type: 'RESET_APP' });

    // Also dispatch specific slice resets for critical slices
    dispatch(resetStore());
    dispatch(clearActiveGroup());

    logger.debug('All Redux slices reset successfully');
  } catch (error) {
    logger.warn('Failed to reset Redux slices:', error);
  }
};

/**
 * Clear axios default headers and interceptors
 * This ensures no cached auth headers remain in axios instances
 */
const clearAxiosAuthHeaders = () => {
  try {
    if (typeof window !== 'undefined') {
      // Clear any axios default auth headers
      const axios = window.axios;
      if (axios && axios.defaults && axios.defaults.headers) {
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers['Authorization'];

        logger.debug('Axios auth headers cleared');
      }
    }
  } catch (error) {
    logger.warn('Failed to clear axios auth headers:', error);
  }
};

/**
 * Enhanced logout utility that handles both user and organization sessions
 * Automatically detects session type and redirects to appropriate login page
 * Includes comprehensive session and cache cleanup with immediate UI feedback
 */
const LogoutUser = async (dispatch, router, showImmediateRedirect = true) => {
  try {
    logger.info('Starting comprehensive logout process');

    // Determine the appropriate redirect URL based on session type and current route
    let redirectUrl = '/user/login'; // Default for individual users

    // Try to get current session for accurate routing
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();

      if (session?.sessionType === 'organization' && session?.orgSlug) {
        // Use organization-specific login from session
        redirectUrl = `/org/${session.orgSlug}/login`;
        logger.info(`Using session-based org redirect: ${redirectUrl}`);
      } else if (session?.sessionType === 'user') {
        // Explicitly use user login
        redirectUrl = '/user/login';
        logger.info('Using session-based user redirect');
      }
    } catch (sessionError) {
      logger.warn(
        'Could not get session for redirect, falling back to URL-based detection:',
        sessionError,
      );
    }

    // Fallback: Check current route if session-based detection failed
    if (redirectUrl === '/user/login') {
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath.startsWith('/org/')) {
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
        redirectUrl = `/org/${orgSlug}/login`;
        logger.info(`Using URL-based org redirect: ${redirectUrl}`);
      }
    }

    // Step 1: Provide immediate visual feedback by redirecting first
    if (showImmediateRedirect && router && router.push) {
      logger.info(`Providing immediate redirect to: ${redirectUrl}`);
      router.push(redirectUrl);
    }

    // Step 2: Clear token and session caches in background
    clearTokenCache();
    clearSessionCache();

    // Step 3: Reset all Redux slices to initial state
    resetAllReduxSlices(dispatch);

    // Step 3: Clear localStorage but preserve theme and location settings
    if (typeof window !== 'undefined') {
      // Preserve user preferences that should survive logout
      const preservedSettings = {
        theme: localStorage.getItem('theme'),
        skin: localStorage.getItem('skin'),
        primaryColor: localStorage.getItem('primaryColor'),
        layout: localStorage.getItem('layout'),
        semiDark: localStorage.getItem('semiDark'),
        userLocation: localStorage.getItem('userLocation'),
        language: localStorage.getItem('language'),
        timezone: localStorage.getItem('timezone'),
      };

      // Clear all localStorage
      localStorage.clear();

      // Restore preserved settings
      Object.entries(preservedSettings).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      logger.debug('LocalStorage cleaned with preserved settings restored');
    }

    // Step 4: Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
      logger.debug('SessionStorage cleared');
    }

    // Step 5: Clear axios auth headers
    clearAxiosAuthHeaders();

    // Step 6: Purge the persisted Redux state
    try {
      if (
        typeof window !== 'undefined' &&
        window.__NEXT_REDUX_STORE__ &&
        window.__NEXT_REDUX_STORE__.__persistor
      ) {
        await window.__NEXT_REDUX_STORE__.__persistor.purge();
        logger.debug('Redux persistor purged');
      }
    } catch (error) {
      logger.warn('Failed to purge Redux persistor:', error);
      // Don't block logout if persistor purge fails
    }

    // Step 7: Clear authentication cookies
    clearAuthCookies();

    // Step 8: Use NextAuth signOut with appropriate redirect URL
    await signOut({
      redirect: false,
      callbackUrl: redirectUrl,
    });

    logger.debug('NextAuth signOut completed');

    // Step 9: Force a small delay to ensure all cleanup operations complete
    await new Promise((resolve) => setTimeout(resolve, 100)); // Step 10: Navigate to the appropriate login page (if not already redirected)
    if (!showImmediateRedirect && router && router.push) {
      logger.info(`Final redirect to: ${redirectUrl}`);
      router.push(redirectUrl);
    }
  } catch (error) {
    logger.error('Logout error:', error);

    // If anything fails, still attempt comprehensive cleanup and redirect
    try {
      // Emergency cleanup - try all cleanup operations again
      clearTokenCache();
      clearSessionCache();
      clearAuthCookies();

      if (typeof window !== 'undefined') {
        // Clear storages as fallback
        try {
          localStorage.clear();
        } catch {
          // Ignore storage clear errors
        }
        try {
          window.sessionStorage.clear();
        } catch {
          // Ignore storage clear errors
        }
      }

      // Attempt redirect with fallback chain
      if (router && router.push) {
        router.push('/user/login');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/user/login';
      }
    } catch (fallbackError) {
      logger.error('Fallback logout also failed:', fallbackError);
      // Last resort - force page reload to clear everything
      if (typeof window !== 'undefined') {
        window.location.href = '/user/login';
      }
    }
  }
};

export default LogoutUser;
