import React from "react";
import { useDispatch } from "react-redux";
import { useAirQloudsData } from "utils/customHooks/AirQloudsHooks";
import { useCurrentAirQloudData } from "redux/AirQloud/selectors";
import { setCurrentAirQloudData } from "redux/AirQloud/operations";
import { resetDefaultGraphData } from "redux/Dashboard/operations";

// styles
import "assets/css/dropdown.css";

const AirQloudDropDown = () => {
  const currentAirqQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();

  const airqlouds = Object.values(useAirQloudsData());

  airqlouds.sort((a, b) => {
    if (a.long_name < b.long_name) return -1;
    if (a.long_name > b.long_name) return 1;
    return 0;
  });

  const handleAirQloudChange = (airqloud) => async () => {
    await dispatch(setCurrentAirQloudData(airqloud));
    dispatch(resetDefaultGraphData());
  };

  return (
    <label className="dropdown">
      <div className="dd-button">{currentAirqQloud.long_name}</div>

      <input type="checkbox" className="dd-input" id="test" />

      <ul className="dd-menu">
        <li className="selected">
          {currentAirqQloud.long_name} AirQloud{" "}
          <span>
            {currentAirqQloud.sites && currentAirqQloud.sites.length} sites
          </span>
        </li>
        <li className="divider" />
        {airqlouds.map(
          (airqloud, key) =>
            currentAirqQloud._id !== airqloud._id && (
              <li key={key} onClick={handleAirQloudChange(airqloud)}>
                {airqloud.long_name} <span>{airqloud.sites.length} sites</span>
              </li>
            )
        )}
      </ul>
    </label>
  );
};

export default AirQloudDropDown;
