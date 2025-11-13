import { signOut } from 'next-auth/react';
import { logout as clearUser, setLoggingOut } from '@/core/redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSessionData } from '../utils/sessionManager';
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
    // Prevent multiple logout calls
    if (isLoggingOut) {
      return;
    }

    try {
      logger.debug('[useLogout] Starting logout process...');
      // Set logging out state to show loading/prevent race conditions
      dispatch(setLoggingOut(true));

      // Clear Redux user state first
      dispatch(clearUser());

      // Clear local storage and session storage
      clearSessionData();

      // Clear the React Query cache
      queryClient.clear();

      // Sign out from NextAuth and redirect
      await signOut({ callbackUrl: callbackUrl || '/login' });
    } catch (error) {
      logger.error('Logout error:', { error });
      // Fallback redirect in case of an error with signOut
      router.push(callbackUrl || '/login');
    }
  }, [isLoggingOut, dispatch, queryClient, router, callbackUrl]);

  return logout;
};