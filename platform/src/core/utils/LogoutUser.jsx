import { clearIndividualPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { resetChartStore } from '@/lib/store/services/charts/ChartSlice';

// Define a new function for logging out
const LogoutUser = async (dispatch, router) => {
  localStorage.clear();
  dispatch(resetStore());
  dispatch(resetChartStore());
  dispatch(clearIndividualPreferences());
  router.push('/account/login');
};

export default LogoutUser;
