// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const useUserPreferenceData = () => {
  return useSelector((state) => state.userPreference);
};

export const useUserPreferencePaginationData = () => {
  return useSelector((state) => state.userPreference.pagination || {});
};
