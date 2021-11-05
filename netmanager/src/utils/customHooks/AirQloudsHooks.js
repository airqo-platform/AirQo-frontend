import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { loadAirQloudsData } from "redux/AirQloud/operations";
import { _useAirqloudsData } from "redux/AirQloud/selectors";

export const useAirQloudsData = () => {
  const airqlouds = _useAirqloudsData();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isEmpty(airqlouds)) dispatch(loadAirQloudsData());
  }, []);
  return airqlouds;
};
