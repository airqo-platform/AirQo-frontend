import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser, setLoggingOut } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectLoggingOut } from '@/shared/store/selectors';
import { useCallback } from 'react';
import logger from '@/shared/lib/logger';

let sharedLogoutPromise: Promise<void> | null = null;
let sharedIsLoggingOut = false;
const ACCOUNT_DELETION_TTL_MS = 5 * 60 * 1000;

export const useLogout = (callbackUrl?: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoggingOut = useSelector(selectLoggingOut);

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

        // Clear any remaining application storage immediately
        if (typeof window !== 'undefined') {
          const keysToRemove: string[] = [];
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

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              !key.startsWith('next-auth') &&
              !crossTabSignalKeys.has(key)
            ) {
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
      } finally {
        sharedIsLoggingOut = false;
        sharedLogoutPromise = null;
      }
    };

    sharedLogoutPromise = runLogout();
    await sharedLogoutPromise;
  }, [callbackUrl, dispatch, isLoggingOut, router]);

  return logout;
};
