const LogoutUser = async (dispatch, router) => {
  try {
    // Dispatch the RESET_APP action to clear the entire Redux store
    dispatch({ type: 'RESET_APP' });

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // Purge the persistor
    const store = router.store || window.__NEXT_REDUX_STORE__;
    if (store && store.__persistor) {
      await store.__persistor.purge();
    }

    // Navigate to login page
    await router.push('/account/login');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error; // Re-throw the error so it can be handled in the component
  }
};

export default LogoutUser;
