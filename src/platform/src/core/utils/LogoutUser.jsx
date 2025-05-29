import { resetStore } from '@/lib/store/services/account/LoginSlice';

const LogoutUser = async (dispatch, router) => {
  try {
    // Dispatch the RESET_APP action to clear the Redux store
    dispatch(resetStore());

    // Clear local storage to remove any persisted user data
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // Purge the persisted Redux state to reset the application state
    if (
      typeof window !== 'undefined' &&
      window.__NEXT_REDUX_STORE__?.__persistor
    ) {
      await window.__NEXT_REDUX_STORE__.__persistor.purge();
    }

    // Redirect to the login page using App Router navigation
    router.push('/account/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Optional: Show a notification or feedback to the user
  }
};

export default LogoutUser;
