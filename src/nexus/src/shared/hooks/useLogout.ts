import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser, setLoggingOut } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useSelector } from 'react-redux';
import { selectLoggingOut } from '@/shared/store/selectors';
import { useCallback } from 'react';
import logger from '@/shared/lib/logger';
import { useSWRConfig } from 'swr';
import { useQueryClient } from '@tanstack/react-query';
import { setBackendOAuthSignedOutFlag } from '@/shared/lib/oauth-session';
import { clearCachedSessionAccessToken } from '@/shared/services/sessionAuthToken';

let sharedLogoutPromise: Promise<void> | null = null;
let sharedIsLoggingOut = false;
const ACCOUNT_DELETION_TTL_MS = 5 * 60 * 1000;
const OAUTH_SIGNED_OUT_FLAG = 'airqo:oauth-signed-out';
export const CROSS_TAB_LOGOUT_KEY = 'airqo:auth:cross-tab-logout';
export const CROSS_TAB_LOGIN_KEY = 'airqo:auth:cross-tab-login';

export const useLogout = (callbackUrl?: string) => {
  const dispatch = useDispatch();
  const isLoggingOut = useSelector(selectLoggingOut);
  const { cache, mutate } = useSWRConfig();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    if (sharedLogoutPromise) {
      await sharedLogoutPromise;
      return;
    }

    if (sharedIsLoggingOut || isLoggingOut) {
      return;
    }

    const runLogout = async () => {
      sharedIsLoggingOut = true;

      try {
        // Set logging out state to show loading
        dispatch(setLoggingOut(true));

        // Clear Redux store first
        dispatch(clearUser());

        // Clear in-memory request caches to prevent stale cross-account reads.
        await mutate(() => true, undefined, { revalidate: false });
        if (typeof (cache as Map<unknown, unknown>).clear === 'function') {
          (cache as Map<unknown, unknown>).clear();
        }
        queryClient.clear();

        // Clear any remaining application storage immediately
        if (typeof window !== 'undefined') {
          setBackendOAuthSignedOutFlag();
          clearCachedSessionAccessToken();
          const keysToRemove = new Set<string>();
          const accountDeleted =
            localStorage.getItem('account_deleted') === 'true';
          const deletionTimestamp = localStorage.getItem(
            'account_deleted_timestamp'
          );
          const deletionUserIdentifier = localStorage.getItem(
            'account_deleted_user_identifier'
          );
          const parsedTimestamp = deletionTimestamp
            ? Number.parseInt(deletionTimestamp, 10)
            : NaN;
          const keepDeletionSignal =
            accountDeleted &&
            Number.isFinite(parsedTimestamp) &&
            typeof deletionUserIdentifier === 'string' &&
            deletionUserIdentifier.trim().length > 0 &&
            Date.now() - parsedTimestamp <= ACCOUNT_DELETION_TTL_MS;

          const crossTabSignalKeys = keepDeletionSignal
            ? new Set([
                'account_deleted',
                'account_deleted_timestamp',
                'account_deleted_user_identifier',
              ])
            : new Set<string>();

          crossTabSignalKeys.add(OAUTH_SIGNED_OUT_FLAG);
          crossTabSignalKeys.add(CROSS_TAB_LOGOUT_KEY);
          crossTabSignalKeys.add(CROSS_TAB_LOGIN_KEY);

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              !key.startsWith('next-auth') &&
              key !== OAUTH_SIGNED_OUT_FLAG &&
              !crossTabSignalKeys.has(key)
            ) {
              keysToRemove.add(key);
            }

            if (
              key?.startsWith('airqo:swr-cache:') ||
              key?.startsWith('airqo:react-query:')
            ) {
              keysToRemove.add(key);
            }
          }
          for (const key of Array.from(keysToRemove)) {
            localStorage.removeItem(key);
          }

          // Clear sessionStorage
          sessionStorage.clear();

          // Clear in-memory auth event dedupe marker
          delete (
            window as Window & { __airqoUnauthorizedEventLastAt?: number }
          ).__airqoUnauthorizedEventLastAt;
        }

        // Clear persisted Redux data
        await persistor.purge();

        // Signal other tabs/apps that logout occurred (before signOut clears the cookie)
        try {
          localStorage.setItem(CROSS_TAB_LOGOUT_KEY, String(Date.now()));
          localStorage.removeItem(CROSS_TAB_LOGIN_KEY);
        } catch {
          // Ignore storage errors
        }

        // Sign out from NextAuth (clear cookie server-side) then force full page reload
        try {
          await signOut({ redirect: false });
        } catch (error) {
          logger.error('Logout error in useLogout', error);
          // First signOut failed — retry once before giving up on cookie clearing
          try {
            await signOut({ redirect: false });
          } catch {
            logger.error('Both signOut attempts failed during logout');
          }
        }
        // Always navigate to login even if signOut failed — the login page
        // will either present the sign-in form (cookie cleared) or redirect
        // to the dashboard (cookie still valid). Leaving the user stuck on a
        // page with cleared Redux/caches is worse than an extra redirect.
        window.location.href = callbackUrl || '/user/login';
      } finally {
        sharedIsLoggingOut = false;
        sharedLogoutPromise = null;
        // Reset Redux logging-out state so subsequent logout attempts are
        // not permanently blocked if navigation was interrupted.
        dispatch(setLoggingOut(false));
      }
    };

    sharedLogoutPromise = runLogout();
    await sharedLogoutPromise;
  }, [cache, callbackUrl, dispatch, isLoggingOut, mutate, queryClient]);

  return logout;
};
