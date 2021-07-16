// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const useFilterLocationData = () => {
  return useSelector((state) => state.dashboard.filterLocationData);
};

export const useUserDefaultGraphsData = () => {
  return useSelector((state) => state.dashboard.userDefaultGraphs);
};

export const useDashboardSitesData = () => {
  return useSelector((state) => state.dashboard.sitesData || []);
};
