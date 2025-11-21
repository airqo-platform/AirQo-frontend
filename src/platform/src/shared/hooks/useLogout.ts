import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser, setLoggingOut } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectLoggingOut } from '@/shared/store/selectors';

export const useLogout = (callbackUrl?: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isLoggingOut = useSelector(selectLoggingOut);

  const logout = async () => {
    // Prevent multiple logout calls
    if (isLoggingOut) {
      return;
    }

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

        // Clear unauthorized tracking counters to prevent false positives
        localStorage.removeItem('unauthorized_count');
        localStorage.removeItem('last_unauthorized');
      }

      // Clear persisted Redux data
      await persistor.purge();

      // Sign out from NextAuth and redirect
      await signOut({ callbackUrl: callbackUrl || '/user/login' });
    } catch (error) {
      console.error('Logout error:', error);
      // Reset logging out state on error
      dispatch(setLoggingOut(false));
      // Fallback redirect
      router.push(callbackUrl || '/user/login');
    }
  };

  return logout;
};
