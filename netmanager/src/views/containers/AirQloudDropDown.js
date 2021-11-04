import React from "react";
import { useAirQloudsData } from "utils/customHooks/AirQloudsHooks";

// styles
import "assets/css/dropdown.css";

const AirQloudDropDown = () => {
  const airqlouds = Object.values(useAirQloudsData());
  airqlouds.sort((a, b) => {
    if (a.long_name < b.long_name) return -1;
    if (a.long_name > b.long_name) return 1;
    return 0;
  });

  console.log(airqlouds);
  return (
    <label className="dropdown">
      <div className="dd-button">Dropdown</div>

      <input type="checkbox" className="dd-input" id="test" />

      <ul className="dd-menu">
        <li>
          <a href="http://rane.io">Link to Rane.io</a>
        </li>
        <li className="divider" />
        {airqlouds.map((airqloud, key) => (
          <li key={key}>
            {airqloud.long_name} <span>{airqloud.sites.length} sites</span>
          </li>
        ))}
      </ul>
    </label>
  );
};

export default AirQloudDropDown;
