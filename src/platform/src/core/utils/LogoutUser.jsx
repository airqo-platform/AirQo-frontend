import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';

const LogoutUser = async (dispatch, router) => {
  try {
    // Start redirect immediately for better UX (optimistic redirect)
    const redirectPromise = router.push('/account/login');

    // Perform cleanup operations in parallel for better performance
    const cleanupOperations = [
      // Dispatch the RESET_APP action to clear the Redux store
      dispatch(resetStore()),

      // Clear local storage
      new Promise((resolve) => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        resolve();
      }),

      // Purge the persisted Redux state
      new Promise((resolve) => {
        (async () => {
          try {
            if (
              typeof window !== 'undefined' &&
              window.__NEXT_REDUX_STORE__?.__persistor
            ) {
              await window.__NEXT_REDUX_STORE__.__persistor.purge();
            }
          } catch {
            // Ignore purge errors to prevent blocking logout
          }
          resolve();
        })();
      }),

      // Use NextAuth signOut (non-blocking)
      signOut({
        redirect: false,
        callbackUrl: '/account/login',
      }),
    ];

    // Execute all cleanup operations in parallel
    await Promise.allSettled(cleanupOperations);

    // Ensure redirect completes
    await redirectPromise;
  } catch {
    // If anything fails, still attempt to redirect
    try {
      router.push('/account/login');
    } catch {
      // Fallback to window location if router fails
      if (typeof window !== 'undefined') {
        window.location.href = '/account/login';
      }
    }
  }
};

export default LogoutUser;
