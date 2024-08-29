// import { clearIndividualPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
// import { resetStore } from '@/lib/store/services/account/LoginSlice';
// import { resetChartStore } from '@/lib/store/services/charts/ChartSlice';

const LogoutUser = async (dispatch, router) => {
  try {
    // Dispatch actions
    // await Promise.all([
    //   dispatch(resetStore()),
    //   dispatch(resetChartStore()),
    //   dispatch(clearIndividualPreferences()),
    // ]);

    // Clear local storage
    localStorage.clear();

    // Navigate to login page
    await router.push('/account/login');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error; // Re-throw the error so it can be handled in the component
  }
};

export default LogoutUser;
