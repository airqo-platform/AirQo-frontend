// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const useUrlsData = () => {
  return useSelector((state) => state.urls);
};

export const useDeviceOverviewBackUrlsData = () => {
  return useSelector((state) => state.urls.deviceOverBackUrl);
};

export const useSiteBackUrl = () => {
  return useSelector((state) => state.urls.siteBackUrl);
};

