import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { clearAllGroupData } from '@/lib/store/services/groups';
import logger from '@/lib/logger';

let globalLogoutState = {
  setIsLoggingOut: null,
  setLogoutMessage: null,
};

let isGlobalLogoutInProgress = false;

export const getLogoutProgress = () => isGlobalLogoutInProgress;

export const setLogoutContext = (setIsLoggingOut, setLogoutMessage) => {
  globalLogoutState.setIsLoggingOut = setIsLoggingOut;
  globalLogoutState.setLogoutMessage = setLogoutMessage;
};

const triggerLogoutOverlay = (message = 'Logging out...') => {
  if (globalLogoutState.setIsLoggingOut) {
    globalLogoutState.setIsLoggingOut(true);
  }
  if (globalLogoutState.setLogoutMessage) {
    globalLogoutState.setLogoutMessage(message);
  }
};

const hideLogoutOverlay = () => {
  if (globalLogoutState.setIsLoggingOut) {
    globalLogoutState.setIsLoggingOut(false);
  }
};

const clearTokenCache = () => {
  try {
    if (typeof window !== 'undefined') {
      window.__tokenCache = null;
      window.__tokenCacheExpiry = 0;
      window.sessionStorage?.removeItem('nextauth.token');
      window.sessionStorage?.removeItem('access_token');
      window.sessionStorage?.removeItem('refresh_token');
      logger.debug('Token cache cleared');
    }
  } catch (error) {
    logger.warn('Failed to clear token cache:', error);
  }
};

const clearSessionCache = () => {
  try {
    if (typeof window !== 'undefined') {
      if (
        window.__sessionCache &&
        typeof window.__sessionCache.clear === 'function'
      ) {
        window.__sessionCache.clear();
      }
      window.sessionStorage?.removeItem('nextauth.session');
      window.sessionStorage?.removeItem('user_session');
      logger.debug('Session cache cleared');
    }
  } catch (error) {
    logger.warn('Failed to clear session cache:', error);
  }
};

const clearAuthCookies = () => {
  try {
    if (typeof window !== 'undefined' && document?.cookie) {
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
    }
  } catch (error) {
    logger.warn('Failed to clear auth cookies:', error);
  }
};

const resetAllReduxSlices = (dispatch) => {
  try {
    if (dispatch) {
      dispatch({ type: 'RESET_APP' });
      dispatch({ type: 'LOGOUT_USER' });
      dispatch(resetStore());
      dispatch(clearAllGroupData());
    }
    logger.debug('Redux slices reset');
  } catch (error) {
    logger.warn('Failed to reset Redux slices:', error);
  }
};

const clearAxiosAuthHeaders = () => {
  try {
    if (typeof window !== 'undefined') {
      const axios = window.axios;
      if (axios?.defaults?.headers) {
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers['Authorization'];
        logger.debug('Axios auth headers cleared');
      }
    }
  } catch (error) {
    logger.warn('Failed to clear axios auth headers:', error);
  }
};

const LogoutUser = async (dispatch) => {
  if (isGlobalLogoutInProgress) {
    logger.debug('Logout already in progress');
    return;
  }

  isGlobalLogoutInProgress = true;
  logger.info('Starting logout process');

  let redirectUrl = '/user/login';
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname : '';

  if (currentPath.startsWith('/org/')) {
    const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
    if (orgSlugMatch?.[1]) {
      redirectUrl =
        orgSlugMatch[1] === 'airqo'
          ? '/user/login'
          : `/org/${orgSlugMatch[1]}/login`;
    }
  } else if (
    currentPath.startsWith('/user/') ||
    currentPath.startsWith('/admin/') ||
    currentPath.startsWith('/create-organization')
  ) {
    redirectUrl = '/user/login';
  } else {
    try {
      const store =
        typeof window !== 'undefined' && window.__NEXT_REDUX_STORE__;
      if (store) {
        const state = store.getState();
        const activeGroup = state?.groups?.activeGroup;
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
          if (orgSlug) redirectUrl = `/org/${orgSlug}/login`;
        }
      }
    } catch (error) {
      logger.debug('Could not determine context from Redux state:', error);
    }
  }

  try {
    triggerLogoutOverlay('Logging you out...');

    clearTokenCache();
    clearSessionCache();
    resetAllReduxSlices(dispatch);

    if (typeof window !== 'undefined') {
      const preservedSettings = {};
      const settingsToPreserve = [
        'theme',
        'skin',
        'primaryColor',
        'layout',
        'semiDark',
        'userLocation',
        'language',
        'timezone',
      ];

      // Preserve explicit settings
      settingsToPreserve.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) preservedSettings[key] = value;
      });

      // Preserve all keys starting with 'user_tour_status_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_tour_status_')) {
          const value = localStorage.getItem(key);
          if (value !== null) preservedSettings[key] = value;
        }
      }

      localStorage.clear();
      if (window.sessionStorage) window.sessionStorage.clear();

      Object.entries(preservedSettings).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }

    clearAxiosAuthHeaders();
    clearAuthCookies();

    try {
      if (
        typeof window !== 'undefined' &&
        window.__NEXT_REDUX_STORE__?.__persistor?.purge
      ) {
        await window.__NEXT_REDUX_STORE__.__persistor.purge();
        logger.debug('Redux persistor purged');
      }
    } catch (error) {
      logger.warn('Failed to purge Redux persistor:', error);
    }

    logger.debug('Calling NextAuth signOut');
    await signOut({ redirect: false });
    logger.debug('NextAuth signOut completed');

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }, 100);
  } catch (error) {
    logger.error('Logout error:', error);
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  } finally {
    hideLogoutOverlay();
    setTimeout(() => {
      isGlobalLogoutInProgress = false;
      logger.debug('Global logout state reset');
    }, 2000);
  }
};

export default LogoutUser;
