import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser, setLoggingOut } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectLoggingOut } from '@/shared/store/selectors';
import { useCallback, useEffect, useRef } from 'react';
import logger from '@/shared/lib/logger';

export const useLogout = (callbackUrl?: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoggingOut = useSelector(selectLoggingOut);
  const isLoggingOutRef = useRef(isLoggingOut);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    isLoggingOutRef.current = isLoggingOut;
  }, [isLoggingOut]);

  const logout = useCallback(async () => {
    if (logoutPromiseRef.current) {
      await logoutPromiseRef.current;
      return;
    }

    if (isLoggingOutRef.current) {
      return;
    }

    const runLogout = async () => {
      try {
        // Set logging out state to show loading
        dispatch(setLoggingOut(true));

        // Clear Redux store first
        dispatch(clearUser());

        // Clear any remaining application storage immediately
        if (typeof window !== 'undefined') {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('next-auth')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Clear sessionStorage
          sessionStorage.clear();

          // Clear in-memory auth event dedupe marker
          delete (window as Window & { __airqoUnauthorizedEventLastAt?: number })
            .__airqoUnauthorizedEventLastAt;
        }

        // Clear persisted Redux data
        await persistor.purge();

        // Sign out from NextAuth and redirect
        await signOut({ callbackUrl: callbackUrl || '/user/login' });
      } catch (error) {
        logger.error('Logout error in useLogout', error);
        // Reset logging out state on error
        dispatch(setLoggingOut(false));
        // Fallback redirect
        router.push(callbackUrl || '/user/login');
      }
    };

    const pendingLogout = runLogout().finally(() => {
      logoutPromiseRef.current = null;
    });
    logoutPromiseRef.current = pendingLogout;
    await pendingLogout;
  }, [callbackUrl, dispatch, router]);

  return logout;
};
