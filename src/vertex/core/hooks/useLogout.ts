import { signOut } from 'next-auth/react';
import { logout as clearUser, setLoggingOut } from '@/core/redux/slices/userSlice';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionData } from '../utils/sessionManager';
import { clearTokenCache } from '../utils/secureApiProxyClient';
import { setLastActiveModule } from '../utils/userPreferences';
import { rememberAccount } from '../utils/rememberedAccounts';
import logger from '@/lib/logger';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { persistor } from '../redux/store';
import { setBackendOAuthSignedOutFlag } from '../auth/oauth-session';

let sharedLogoutPromise: Promise<void> | null = null;
let sharedIsLoggingOut = false;

export const CROSS_TAB_LOGOUT_KEY = 'airqo:auth:cross-tab-logout';
export const CROSS_TAB_LOGIN_KEY = 'airqo:auth:cross-tab-login';

/**
 * A hook to provide a centralized logout function.
 * It handles clearing Redux state, local storage, React Query cache, and signing out from NextAuth.
 * @param callbackUrl - An optional URL to redirect to after logout. Defaults to '/login'.
 */
export const useLogout = (callbackUrl?: string) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);
  const userDetails = useAppSelector((state) => state.user.userDetails);

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
        // Save current module state before clearing session
        const email = userDetails?.email || userDetails?.userName;
        if (email && pathname) {
          const currentModule = pathname.startsWith('/admin/') ? 'admin' : 'devices';
          setLastActiveModule(currentModule, email);
        }

        if (email) {
          const displayName = `${userDetails?.firstName || ''} ${userDetails?.lastName || ''}`.trim() || userDetails?.userName || email;
          rememberAccount({
            email,
            displayName,
            profilePicture: userDetails?.profilePicture || '',
          });
        }
        
        dispatch(setLoggingOut(true));
        dispatch(clearUser());

        clearSessionData();
        clearTokenCache();
        queryClient.clear();
        await persistor.purge();

        setBackendOAuthSignedOutFlag();
        // Signal other tabs/apps that logout occurred (before signOut clears the cookie)
        try {
          localStorage.setItem(CROSS_TAB_LOGOUT_KEY, String(Date.now()));
          localStorage.removeItem(CROSS_TAB_LOGIN_KEY);
        } catch {
          // Ignore storage errors
        }

        await signOut({ redirect: false });
        window.location.href = callbackUrl || '/login';
      } catch (error) {
        logger.error('Logout error:', { error });
        dispatch(setLoggingOut(false));
        window.location.href = callbackUrl || '/login';
      } finally {
        sharedIsLoggingOut = false;
        sharedLogoutPromise = null;
      }
    };

    sharedLogoutPromise = runLogout();
    await sharedLogoutPromise;
  }, [isLoggingOut, dispatch, queryClient, pathname, userDetails, callbackUrl]);

  return logout;
};
