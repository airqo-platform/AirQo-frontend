import React, { useRef, useState, useEffect } from 'react';
import ReloadIcon from '@material-ui/icons/Replay';
import { Tooltip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useAirQloudsData } from 'utils/customHooks/AirQloudsHooks';
import { useCurrentAirQloudData } from 'redux/AirQloud/selectors';
import { setCurrentAirQloudData } from 'redux/AirQloud/operations';
import { resetDefaultGraphData } from 'redux/Dashboard/operations';
import { refreshAirQloud } from 'redux/AirQloud/operations';

// styles
import 'assets/css/dropdown.css';
import { useDashboardAirqloudsData } from '../../redux/AirQloud/selectors';
import { isEmpty } from 'underscore';
import { fetchDashboardAirQloudsData } from '../../redux/AirQloud/operations';

const AirQloudDropDown = () => {
  const ref = useRef();
  const [show, setShow] = useState(false);
  const currentAirqQloud = useCurrentAirQloudData();
  const dispatch = useDispatch();
  const [hoveredAirqloud, setHoveredAirqloud] = useState(null);

  const airqlouds = Object.values(useDashboardAirqloudsData());

  const handleAirQloudHover = (airqloud) => () => {
    setHoveredAirqloud(airqloud);
  };

  const handleAirQloudLeave = () => {
    setHoveredAirqloud(null);
  };

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

  const handleAirQloudRefresh = (airQloud) => async (event) => {
    event.stopPropagation();
    const data = await dispatch(refreshAirQloud(airQloud.long_name, airQloud._id));
    if (data && data.refreshed_airqloud) setCurrentAirQloudData(data.refreshed_airqloud);
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (show && ref.current && !ref.current.contains(e.target)) setShow(false);
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [show]);

  useEffect(() => {
    if (isEmpty(airqlouds)) {
      dispatch(fetchDashboardAirQloudsData());
    }
  }, []);

  return (
    <label className="dropdown" onClick={toggleShow} ref={ref}>
      <div className="dd-button">{currentAirqQloud.long_name}</div>

      <ul className={`dd-menu ${(!show && 'dd-input') || ''}`}>
        <li className="selected">
          <div id="head" className="column">
            <span className="long">{currentAirqQloud.long_name} AirQloud</span>
            <span className="site">{currentAirqQloud.sites && currentAirqQloud.sites.length} sites</span>
          </div>
        </li>
        <li className="divider" />
        <div className="columns-container">
          <div className="column">
            {airqlouds.slice(0, Math.ceil(airqlouds.length / 2)).map((airqloud, key) => (
              <li
                key={key}
                onClick={handleAirQloudChange(airqloud)}
                onMouseEnter={handleAirQloudHover(airqloud)}
                onMouseLeave={handleAirQloudLeave}
                id="span"
              >
                <span className="long_name">{airqloud.long_name}</span>
                <span className="sites">{airqloud.sites.length} sites</span>
              </li>
            ))}
          </div>
          <div className="column right-column">
            <div className="site-names">
              {hoveredAirqloud &&
                hoveredAirqloud.sites.map((site, key) => (
                  <span key={key}>{site.name}</span>
                ))}
            </div>
            {hoveredAirqloud && <span>{hoveredAirqloud.sites.length} sites</span>}
          </div>
        </div>
      </ul>
      <Tooltip title="Refresh AirQloud">
        <div className="dd-reload" onClick={handleAirQloudRefresh(currentAirqQloud)}>
          <ReloadIcon />
        </div>
      </Tooltip>
    </label>
  );
};

export default AirQloudDropDown;
