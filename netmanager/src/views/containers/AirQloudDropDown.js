import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAirQloudsData } from "utils/customHooks/AirQloudsHooks";
import { useCurrentAirQloudData } from "redux/AirQloud/selectors";
import { setCurrentAirQloudData } from "redux/AirQloud/operations";
import { resetDefaultGraphData } from "redux/Dashboard/operations";

// styles
import "assets/css/dropdown.css";

const AirQloudDropDown = () => {
  const ref = useRef();
  const [show, setShow] = useState(false);
  const currentAirqQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();

  const airqlouds = Object.values(useAirQloudsData());

  airqlouds.sort((a, b) => {
    if (a.long_name < b.long_name) return -1;
    if (a.long_name > b.long_name) return 1;
    return 0;
  });

  const toggleShow = () => setShow(!show);

  const handleAirQloudChange = (airqloud) => async () => {
    toggleShow();
    await dispatch(setCurrentAirQloudData(airqloud));
    dispatch(resetDefaultGraphData());
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target))
        setShow(false);
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [show]);

  return (
    <label className="dropdown" onClick={toggleShow} ref={ref}>
      <div className="dd-button">{currentAirqQloud.long_name}</div>

      <ul className={`dd-menu ${(!show && "dd-input") || ""}`}>
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
