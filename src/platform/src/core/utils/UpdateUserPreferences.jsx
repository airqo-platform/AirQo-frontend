import { completeTask } from '@/lib/store/services/checklists/CheckList';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';

const updateUserPreferences = async (
  userId,
  selectedLocations,
  chartData,
  dispatch,
  toggleCustomise = () => {},
) => {
  if (!userId || !selectedLocations || !chartData) {
    console.error('Missing required data for updating user preferences');
    return;
  }

  const data = {
    user_id: userId,
    selected_sites: selectedLocations,
    startDate: chartData?.chartDataRange?.startDate,
    endDate: chartData?.chartDataRange?.endDate,
    chartType: chartData?.chartType,
    pollutant: chartData?.pollutionType,
    frequency: chartData?.timeFrame,
    period: {
      label: chartData?.chartDataRange?.label,
    },
  };

  try {
    const response = await dispatch(replaceUserPreferences(data));

    if (response?.payload?.success) {
      await dispatch(getIndividualUserPreferences(userId));
      toggleCustomise();
      await dispatch(completeTask(2));
    } else {
      throw new Error('Failed to update user preferences');
    }
  } catch (error) {
    console.error('Error updating user preferences:', error.message || error);
  }
};

export default updateUserPreferences;
