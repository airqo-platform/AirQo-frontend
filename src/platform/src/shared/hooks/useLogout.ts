import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';

export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      // Clear Redux store first
      dispatch(clearUser());

      // Clear persisted Redux data
      await persistor.purge();

      // Sign out from NextAuth (this will clear its own session data)
      await signOut({ callbackUrl: '/user/login' });

      // After NextAuth signout, clear any remaining application storage
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
    } catch (error) {
      console.error('Logout error:', error);
      await signOut({ callbackUrl: '/user/login' });
    }
  };

  return logout;
};
