import { signOut } from 'next-auth/react';
import { logout as clearUser, setLoggingOut } from '@/core/redux/slices/userSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionData } from '../utils/sessionManager';
import { clearTokenCache } from '../utils/secureApiProxyClient';
import { setLastActiveModule } from '../utils/userPreferences';
import { rememberAccount } from '../utils/rememberedAccounts';
import logger from '@/lib/logger';
import { useAppSelector, useAppDispatch } from '../redux/hooks';

/**
 * A hook to provide a centralized logout function.
 * It handles clearing Redux state, local storage, React Query cache, and signing out from NextAuth.
 * @param callbackUrl - An optional URL to redirect to after logout. Defaults to '/login'.
 */
export const useLogout = (callbackUrl?: string) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

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

      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      logger.error('Logout error:', { error });
      router.push('/login');
    }
  }, [isLoggingOut, dispatch, queryClient, router, pathname, userDetails, callbackUrl]);

  return logout;
};
