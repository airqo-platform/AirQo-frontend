import { signOut } from 'next-auth/react';
import logger from '@/lib/logger';
import {
  clearBrowserStorage,
  clearSWRCache,
  resetReduxStore,
  clearIndexedDB,
  clearAuthCookies,
} from '@/lib/logoutUtils';
import persistor from '@/lib/store';

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
    // Perform critical cleanup first to prevent race conditions
    await resetReduxStore(dispatch);
    await clearBrowserStorage();
    clearAuthCookies();

    // Purge persisted state from redux-persist to ensure a clean slate
    if (persistor) {
      await persistor.purge();
      logger.info('Redux-persist storage purged.');
    }

    // Use new comprehensive logout utilities
    await clearSWRCache();
    await clearIndexedDB();

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
    setTimeout(() => {
      isGlobalLogoutInProgress = false;
      logger.debug('Global logout state reset');
    }, 2000);
  }
};

export default LogoutUser;
