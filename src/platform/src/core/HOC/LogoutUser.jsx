import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { clearAllGroupData } from '@/lib/store/services/groups';
import { setGlobalLogoutState } from '@/app/providers/OrganizationLoadingProvider';
import {
  getContextualLoginPath,
  isAirQoGroup,
} from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

// Global logout state to manage overlay
// This allows components to show logout overlay without tight coupling
let globalLogoutState = {
  setIsLoggingOut: null,
  setLogoutMessage: null,
};

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
 * Enhanced logout utility with unified session management
 * Uses path-based context detection for appropriate redirects
 * Includes comprehensive session and cache cleanup with immediate UI feedback
 */
const LogoutUser = async (dispatch, router, _showImmediateRedirect = true) => {
  try {
    logger.info('Starting comprehensive logout process');

    // Set global logout state to prevent organization switching modal
    setGlobalLogoutState(true);

    // Trigger logout overlay at the start
    triggerLogoutOverlay('Logging you out...');

    // Determine redirect URL based on current context and active group
    let redirectUrl = '/user/login'; // Default for individual users
    let activeGroup = null;

    // Check current route for context detection
    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : '';

    // Try to get active group from Redux or localStorage
    try {
      // Try to get Redux state first
      if (typeof window !== 'undefined' && window.__NEXT_REDUX_STORE__) {
        const reduxState = window.__NEXT_REDUX_STORE__.getState();
        activeGroup =
          reduxState?.groups?.activeGroup ||
          reduxState?.activeGroup?.activeGroup;
      }

      // Fallback to localStorage
      if (!activeGroup) {
        const storedSession = localStorage.getItem('loggedUser');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          activeGroup = sessionData.activeGroup;
        }
      }
    } catch (error) {
      logger.debug('Could not get active group for logout redirect:', error);
    }

    // Use enhanced routing logic that respects AirQo group rules
    redirectUrl = getContextualLoginPath(currentPath, null, activeGroup);

    logger.info('Logout redirect determined:', {
      currentPath,
      activeGroupName: activeGroup?.grp_name || activeGroup?.grp_title,
      isAirQo: isAirQoGroup(activeGroup),
      redirectUrl,
    });

    // Step 1: Clear all authentication data FIRST before any redirects
    // This prevents the auth HOC from detecting a session during redirect

    // Clear token and session caches immediately
    clearTokenCache();
    clearSessionCache();

    // Reset all Redux slices to initial state immediately
    resetAllReduxSlices(dispatch);

    // Step 2: Clear localStorage but preserve theme and location settings
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

    // Step 8: Use NextAuth signOut with immediate redirect to clear session
    // This ensures the session is completely cleared before any navigation
    await signOut({
      redirect: true,
      callbackUrl: redirectUrl,
    });

    logger.debug('NextAuth signOut completed with redirect');
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
    } finally {
      // Clear global logout state even in error cases
      setGlobalLogoutState(false);
    }
  } finally {
    // Hide logout overlay at the end of the process
    hideLogoutOverlay();

    // Clear global logout state
    setGlobalLogoutState(false);
  }
};

export default LogoutUser;
