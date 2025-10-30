import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser, setLoggingOut } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
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
      }

      // Redirect immediately to prevent empty state
      router.push('/user/login');

      // Sign out from NextAuth in the background (don't await)
      // This ensures the session is cleared on the server side
      signOut({ callbackUrl: '/user/login' });

      // Clear persisted Redux data in the background
      persistor.purge();
    } catch (error) {
      console.error('Logout error:', error);
      // Reset logging out state on error
      dispatch(setLoggingOut(false));
      // Fallback redirect
      router.push('/user/login');
    }
  };

  return logout;
};
