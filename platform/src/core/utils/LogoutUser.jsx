import { clearIndividualPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { resetChartStore } from '@/lib/store/services/charts/ChartSlice';
import { resetAllTasks } from '@/lib/store/services/checklists/CheckList';
import { resetChecklist } from '@/lib/store/services/checklists/CheckData';

// Define a new function for logging out
const LogoutUser = async (dispatch, router) => {
  localStorage.clear();
  dispatch(resetStore());
  dispatch(resetChartStore());
  dispatch(clearIndividualPreferences());
  dispatch(resetAllTasks());
  dispatch(resetChecklist());
  router.push('/account/login');
};

export default LogoutUser;
