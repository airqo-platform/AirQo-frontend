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
    const store = router.store || window.__NEXT_REDUX_STORE__;
    if (store?.__persistor) {
      await store.__persistor.purge();
    }

    // Redirect to the login page
    await router.push('/account/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Optional: Show a notification or feedback to the user
  }
};

export default LogoutUser;
