import { signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/shared/store/userSlice';
import { persistor } from '@/shared/store';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    try {
      // Clear Redux store first
      dispatch(clearUser());

      // Clear persisted Redux data
      await persistor.purge();

      // Sign out from NextAuth with redirect
      await signOut({ callbackUrl: '/user/login' });

      // Clear any remaining application storage
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
      // Fallback redirect
      router.push('/user/login');
    }
  };

  return logout;
};
