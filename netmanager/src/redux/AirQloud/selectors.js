// take a slice of the application state and return some data based on that
import { useSelector } from "react-redux";

export const _useAirqloudsData = () => {
  return useSelector((state) => state.airqloudRegistry.airqlouds);
};