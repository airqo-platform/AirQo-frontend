import React from 'react';
import { resetChartStore, setChartDataAtOnce } from '@/lib/store/services/charts/ChartSlice';

// Define your function
const SetChartDetails = async (dispatch, preferenceData) => {
  if (preferenceData && preferenceData.length > 0) {
    const { period, selected_sites, startDate, endDate, frequency, chartType, pollutant } =
      preferenceData[0];
    try {
      const chartSites = selected_sites?.length > 0 && selected_sites.map((site) => site['_id']);
      await dispatch(
        setChartDataAtOnce({
          chartSites: chartSites,
          chartDataRange: {
            startDate: startDate,
            endDate: endDate,
            label: period.label,
          },
          timeFrame: frequency,
          chartType: chartType,
          pollutionType: pollutant,
        }),
      );
    } catch (error) {
      console.error(`Error setting chart properties: ${error}`);
    }
  } else {
    dispatch(resetChartStore());
  }
};

export default SetChartDetails;
