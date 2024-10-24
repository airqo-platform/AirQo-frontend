import {
  resetChartStore,
  setChartDataAtOnce,
} from '@/lib/store/services/charts/ChartSlice';

const setChartDetails = async (dispatch, preferenceData) => {
  if (!preferenceData?.length) {
    return dispatch(resetChartStore());
  }

  const {
    period,
    selected_sites = [],
    startDate,
    endDate,
    frequency,
    chartType,
    pollutant,
  } = preferenceData[0];

  const chartSites = selected_sites.map((site) => site?._id).filter(Boolean);

  try {
    await dispatch(
      setChartDataAtOnce({
        chartSites,
        chartDataRange: {
          startDate,
          endDate,
          label: period?.label,
        },
        timeFrame: frequency,
        chartType,
        pollutionType: pollutant,
      }),
    );
  } catch (error) {
    console.error('Error setting chart properties:', error);
  }
};

export default setChartDetails;
