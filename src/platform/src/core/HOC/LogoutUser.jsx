import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { clearAllGroupData } from '@/lib/store/services/groups';
import logger from '@/lib/logger';

// Global logout state to manage overlay
// This allows components to show logout overlay without tight coupling
let globalLogoutState = {
  setIsLoggingOut: null,
  setLogoutMessage: null,
};

// Global logout progress tracking to prevent setup modals during logout
let isGlobalLogoutInProgress = false;

// Function to get logout progress state
export const getLogoutProgress = () => isGlobalLogoutInProgress;

// Function to set the global logout context handlers
export const setLogoutContext = (setIsLoggingOut, setLogoutMessage) => {
  globalLogoutState.setIsLoggingOut = setIsLoggingOut;
  globalLogoutState.setLogoutMessage = setLogoutMessage;
};

// Function to trigger logout overlay
const triggerLogoutOverlay = (message = 'Logging out...') => {
  if (globalLogoutState.setIsLoggingOut) {
    globalLogoutState.setIsLoggingOut(true);
  }
  if (globalLogoutState.setLogoutMessage) {
    globalLogoutState.setLogoutMessage(message);
  }
};

// Function to hide logout overlay
const hideLogoutOverlay = () => {
  if (globalLogoutState.setIsLoggingOut) {
    globalLogoutState.setIsLoggingOut(false);
  }
};

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
    dispatch({ type: 'LOGOUT_USER' }); // Additional logout action for any slices that specifically listen for logout

    // Also dispatch specific slice resets for critical slices
    dispatch(resetStore());
    dispatch(clearAllGroupData());

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
 * Enhanced logout utility with aggressive session termination
 * Forces complete logout by clearing everything and doing a hard redirect
 */
const LogoutUser = async (dispatch, router, _showImmediateRedirect = true) => {
  // Set global logout state immediately to prevent setup modals
  isGlobalLogoutInProgress = true;

  // Determine redirect URL based on current route and Redux state
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname : '';

  let redirectUrl = '/user/login'; // Default fallback

  // Enhanced context-aware redirect logic
  if (currentPath.startsWith('/org/')) {
    const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
    if (orgSlugMatch && orgSlugMatch[1]) {
      const orgSlug = orgSlugMatch[1];
      // If orgSlug is 'airqo', redirect to user login instead
      if (orgSlug === 'airqo') {
        redirectUrl = '/user/login';
      } else {
        redirectUrl = `/org/${orgSlug}/login`;
      }
    }
  } else if (
    currentPath.startsWith('/user/') ||
    currentPath.startsWith('/admin/')
  ) {
    redirectUrl = '/user/login';
  } else if (currentPath.startsWith('/create-organization')) {
    redirectUrl = '/user/login';
  } else {
    // Fallback: try to determine from Redux state if available
    try {
      const store =
        typeof window !== 'undefined' && window.__NEXT_REDUX_STORE__;
      if (store) {
        const state = store.getState();
        const activeGroup = state?.groups?.activeGroup;

        // If we have an active group and it's not AirQo, try to redirect to org login
        if (
          activeGroup &&
          activeGroup.grp_title &&
          !activeGroup.grp_title.toLowerCase().includes('airqo')
        ) {
          const orgSlug =
            activeGroup.organization_slug ||
            activeGroup.grp_title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
          if (orgSlug) {
            redirectUrl = `/org/${orgSlug}/login`;
          }
        }
      }
    } catch (error) {
      logger.debug('Could not determine context from Redux state:', error);
      // Keep default fallback
    }
  }

  try {
    logger.info(
      'Starting aggressive logout process with redirect:',
      redirectUrl,
    );

    // Set global logout state immediately to prevent setup modals
    triggerLogoutOverlay('Logging you out...');

    // Step 1: Immediately clear all authentication data
    clearTokenCache();
    clearSessionCache();
    resetAllReduxSlices(dispatch);

    // Step 2: Clear storage
    if (typeof window !== 'undefined') {
      // Preserve user preferences
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

      // Clear all storage
      localStorage.clear();
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }

      // Restore preserved settings
      Object.entries(preservedSettings).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
    }

    // Step 3: Clear auth headers and cookies
    clearAxiosAuthHeaders();
    clearAuthCookies();

    // Step 4: Purge Redux persistor
    try {
      if (
        typeof window !== 'undefined' &&
        window.__NEXT_REDUX_STORE__ &&
        window.__NEXT_REDUX_STORE__.__persistor
      ) {
        await window.__NEXT_REDUX_STORE__.__persistor.purge();
      }
    } catch (error) {
      logger.warn('Failed to purge Redux persistor:', error);
    }

    // Step 5: Use NextAuth signOut WITHOUT redirect to avoid navigation issues
    await signOut({ redirect: false });

    logger.debug('Aggressive logout completed, redirecting to:', redirectUrl);

    // Step 6: Force hard redirect after a short delay to ensure cleanup completes
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }, 100);
  } catch (error) {
    logger.error('Logout error:', error);

    // Emergency fallback - force hard redirect
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  } finally {
    // Cleanup and reset logout state
    hideLogoutOverlay();
    // Reset global logout state after a delay to ensure all components have time to detect it
    setTimeout(() => {
      isGlobalLogoutInProgress = false;
    }, 2000);
  }
};

export default LogoutUser;
