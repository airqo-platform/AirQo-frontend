// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const useActivitiesData = () => {
  return useSelector((state) => state.activitiesLogs.activities);
};

export const useActivitiesArrayData = () => {
  return useSelector((state) => Object.values(state.activitiesLogs.activities));
};

export const useActivitiesSummaryData = () => {
  return useSelector((state) => Object.values(state.activitiesLogs.activities));
};
