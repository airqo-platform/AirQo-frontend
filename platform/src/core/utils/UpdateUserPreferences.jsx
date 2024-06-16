import { completeTask } from '@/lib/store/services/checklists/CheckList';
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';

// Define your function
const UpdateUserPreferences = async (
  userId,
  selectedLocations,
  chartData,
  dispatch,
  toggleCustomise = () => {},
) => {
  const data = {
    user_id: userId,
    selected_sites: selectedLocations,
    startDate: chartData.chartDataRange.startDate,
    endDate: chartData.chartDataRange.endDate,
    chartType: chartData.chartType,
    pollutant: chartData.pollutionType,
    frequency: chartData.timeFrame,
    period: {
      label: chartData.chartDataRange.label,
    },
  };
  try {
    const response = await dispatch(replaceUserPreferences(data));
    if (response.payload && response.payload.success) {
      dispatch(getIndividualUserPreferences(userId));
      toggleCustomise();
      dispatch(completeTask(2));
    } else {
      throw new Error('Error updating user preferences');
    }
  } catch (error) {
    console.error(`Error updating user preferences: ${error}`);
  }
};

// Now you can call updateUserPreferences from other functions

export default UpdateUserPreferences;
