import { signOut } from 'next-auth/react';
import { resetStore } from '@/lib/store/services/account/LoginSlice';

const LogoutUser = async (dispatch, router) => {
  // Determine the appropriate redirect URL based on current route
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname : '';
  let redirectUrl = '/user/login'; // Default for individual users

  // Check if user is on an organization route
  if (currentPath.startsWith('/org/')) {
    const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
    const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
    redirectUrl = `/org/${orgSlug}/login`;
  }

  try {
    // Dispatch the RESET_APP action to clear the Redux store
    dispatch(resetStore());

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // Purge the persisted Redux state
    try {
      if (
        typeof window !== 'undefined' &&
        window.__NEXT_REDUX_STORE__ &&
        window.__NEXT_REDUX_STORE__.__persistor
      ) {
        await window.__NEXT_REDUX_STORE__.__persistor.purge();
      }
    } catch {
      // Ignore purge errors to prevent blocking logout
    }

    // Use NextAuth signOut with redirect disabled
    await signOut({
      redirect: false,
      callbackUrl: redirectUrl,
    });

    // Navigate to the appropriate login page
    router.push(redirectUrl);
  } catch {
    // If anything fails, still attempt to redirect
    try {
      router.push(redirectUrl);
    } catch {
      // Fallback to window location if router fails
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  }
};

export default LogoutUser;
