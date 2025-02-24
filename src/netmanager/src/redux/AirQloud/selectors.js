// take a slice of the application state and return some data based on that
import { useSelector } from 'react-redux';

export const _useAirqloudsData = () => {
  return useSelector((state) => state.airqloudRegistry.airqlouds);
};

export const useCurrentAirQloudData = () => {
  return useSelector((state) => state.airqloudRegistry.currentAirQloud);
};

export const useDashboardAirqloudsData = () => {
  return useSelector((state) => state.airqloudRegistry.dashboardAirQlouds);
};

export const useSelectedAirqloudData = () => {
  return useSelector((state) => state.airqloudRegistry.selectedAirqloud);
};

export const useAirqloudsSummaryData = () => {
  return useSelector((state) => state.airqloudRegistry.airqloudsSummary);
};
