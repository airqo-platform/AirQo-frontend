import { signOut } from 'next-auth/react';
import { logout as clearUser, setLoggingOut } from '@/core/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionData } from '../utils/sessionManager';
import { clearTokenCache } from '../utils/secureApiProxyClient';
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
  const queryClient = useQueryClient();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      logger.debug('[useLogout] Starting logout process...');
      
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
    } finally {
      dispatch(setLoggingOut(false));
    }
  }, [isLoggingOut, dispatch, queryClient, router, callbackUrl]);

  return logout;
};