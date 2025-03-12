import {
  resetChartStore,
  setChartDataAtOnce,
} from '@/lib/store/services/charts/ChartSlice';

const setChartDetails = async (dispatch, preferenceData) => {
  if (!preferenceData?.length) {
    return dispatch(resetChartStore());
  }

  const { selected_sites = [] } = preferenceData[0];

  const chartSites = selected_sites.map((site) => site?._id).filter(Boolean);

  try {
    await dispatch(
      setChartDataAtOnce({
        chartSites,
      }),
    );
  } catch (error) {
    console.error('Error setting chart properties:', error);
  }
};

export default setChartDetails;
