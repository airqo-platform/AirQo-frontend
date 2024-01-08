import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { getFirstDuration } from 'utils/dateTime';
import Filter from '../Dashboard/components/Map/Filter';
import Indicator from '../Dashboard/components/Map/Indicator ';
import MapPopup from '../Dashboard/components/Map/MapPopup';
import Divider from '@material-ui/core/Divider';
import { loadMapEventsData } from 'redux/MapData/operations';
import { useEventsMapData } from 'redux/MapData/selectors';
import SettingsIcon from '@material-ui/icons/Settings';
import RichTooltip from '../../containers/RichToolTip';
import { MenuItem } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useInitScrollTop } from 'utils/customHooks';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useOrgData } from 'redux/Join/selectors';
import { useHistory, useLocation } from 'react-router-dom';
// css
import 'assets/css/overlay-map.css';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import CircularLoader from '../../components/Loader/CircularLoader';
import { darkMapStyle, lightMapStyle, satelliteMapStyle, streetMapStyle } from './utils';
import MapIcon from '@material-ui/icons/Map';
import LightModeIcon from '@material-ui/icons/Highlight';
import SatelliteIcon from '@material-ui/icons/Satellite';
import DarkModeIcon from '@material-ui/icons/NightsStay';
import StreetModeIcon from '@material-ui/icons/Traffic';

// prettier-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const markerDetailsPM2_5 = {
  0.0: ['marker-good', 'Good'],
  12.1: ['marker-moderate', 'Moderate'],
  35.5: ['marker-uhfsg', 'Unhealthy for sensitive groups'],
  55.5: ['marker-unhealthy', 'Unhealthy'],
  150.5: ['marker-v-unhealthy', 'VeryUnhealthy'],
  250.5: ['marker-hazardous', 'Hazardous'],
  500.5: ['marker-unknown', 'Invalid']
};

const markerDetailsPM10 = {
  0.0: ['marker-good', 'Good'],
  54.1: ['marker-moderate', 'Moderate'],
  154.1: ['marker-uhfsg', 'Unhealthy for sensitive groups'],
  254.1: ['marker-unhealthy', 'Unhealthy'],
  354.1: ['marker-v-unhealthy', 'VeryUnhealthy'],
  424.1: ['marker-hazardous', 'Hazardous'],
  604.1: ['marker-unknown', 'Invalid']
};

const markerDetailsNO2 = {
  0.0: ['marker-good', 'Good'],
  53.1: ['marker-moderate', 'Moderate'],
  100.1: ['marker-uhfsg', 'Unhealthy for sensitive groups'],
  360.1: ['marker-unhealthy', 'Unhealthy'],
  649.1: ['marker-v-unhealthy', 'VeryUnhealthy'],
  1249.1: ['marker-hazardous', 'Hazardous'],
  2049.1: ['marker-unknown', 'Invalid']
};

const markerDetailsMapper = {
  pm2_5: markerDetailsPM2_5,
  pm10: markerDetailsPM10,
  no2: markerDetailsNO2
};

const getMarkerDetail = (markerValue, markerKey) => {
  if (markerValue === null || markerValue === undefined) return ['marker-unknown', 'uncategorised'];

  const markerDetails = markerDetailsMapper[markerKey] || markerDetailsPM2_5;
  let keys = Object.keys(markerDetails);
  // in-place reverse sorting
  keys.sort((key1, key2) => -(key1 - key2));

  for (let i = 0; i < keys.length; i++) {
    if (markerValue >= keys[i]) {
      return markerDetails[keys[i]];
    }
  }
  return ['marker-unknown', 'uncategorised'];
};

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapControllerPosition = ({ className, children, position }) => {
  const positions = {
    topLeft: { top: 0, left: 0 },
    bottomLeft: { bottom: 0, left: 0 },
    topRight: { top: 0, right: 0 },
    bottomRight: { bottom: 0, right: 0 }
  };

  const style = {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'absolute',
    cursor: 'pointer',
    margin: '10px',
    padding: '10px',
    ...(positions[position] || positions.topLeft)
  };

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
};

const PollutantSelector = ({ className, onChange }) => {
  useInitScrollTop();
  const orgData = useOrgData();
  const [open, setOpen] = useState(false);
  let pollutant = localStorage.pollutant;
  const pollutantMapper = {
    pm2_5: (
      <span>
        PM<sub>2.5</sub>
      </span>
    ),
    pm10: (
      <span>
        PM<sub>10</sub>
      </span>
    ),
    no2: (
      <span>
        NO<sub>2</sub>
      </span>
    )
  };

  const onHandleClick = () => {
    setOpen(!open);
  };

  const handleMenuItemChange = (pollutant, state) => () => {
    localStorage.pollutant = pollutant;
    setOpen(!open);
    onChange(state);
    window.location.reload();
  };

  useEffect(() => {
    if (!localStorage.pollutant) {
      localStorage.pollutant = 'pm2_5';
    }
  }, []);

  return (
    <RichTooltip
      content={
        <div>
          <MenuItem
            onClick={handleMenuItemChange('pm2_5', {
              pm2_5: true,
              no2: false,
              pm10: false
            })}>
            PM<sub>2.5</sub>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleMenuItemChange('pm10', {
              pm2_5: false,
              no2: false,
              pm10: true
            })}>
            PM<sub>10</sub>
          </MenuItem>
          {orgData.name !== 'airqo' && (
            <MenuItem
              onClick={handleMenuItemChange('no2', {
                pm2_5: false,
                no2: true,
                pm10: false
              })}>
              NO<sub>2</sub>
            </MenuItem>
          )}
        </div>
      }
      open={open}
      placement="left"
      onClose={() => setOpen(false)}>
      <div style={{ padding: '5px' }}>
        <span className={className} onClick={onHandleClick}>
          {pollutantMapper[pollutant]}
        </span>
      </div>
    </RichTooltip>
  );
};

const MapStyleSelectorPlaceholder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHover = (isHovered) => {
    setIsHovered(isHovered);
  };

  return (
    <div
      ref={dropdownRef}
      className="map-style-placeholder"
      onClick={handleClick}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}>
      <div className={`map-icon-container${isHovered ? ' map-icon-hovered' : ''}`}>
        <MapIcon className="map-icon" />
      </div>
      {isOpen && <MapStyleSelector />}
    </div>
  );
};

const MapStyleSelector = () => {
  const styleSet = [
    {
      name: 'light',
      icon: <LightModeIcon />,
      mapStyle: lightMapStyle
    },
    {
      name: 'dark',
      icon: <DarkModeIcon />,
      mapStyle: darkMapStyle
    },
    {
      name: 'street',
      icon: <StreetModeIcon />,
      mapStyle: streetMapStyle
    },
    {
      name: 'satellite',
      icon: <SatelliteIcon />,
      mapStyle: satelliteMapStyle
    }
  ];

  const [mapMode, setMapMode] = useState('');

  useEffect(() => {
    if (localStorage.mapMode) {
      setMapMode(localStorage.mapMode);
    } else {
      setMapMode('street');
    }
  }, []);

  return (
    <>
      <div className="map-style">
        <div className="map-style-cards">
          {styleSet.map((style) => {
            return (
              <div
                key={style.name}
                onClick={() => {
                  localStorage.mapStyle = style.mapStyle;
                  localStorage.mapMode = style.name;
                  window.location.reload();
                }}>
                <span>{style.icon}</span>
                <span>{style.name} map</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const MapSettings = ({ showSensors, showCalibratedValues, onSensorChange, onCalibratedChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <RichTooltip
      content={
        <div>
          <MenuItem onClick={() => onSensorChange(!showSensors)}>
            <Checkbox checked={showSensors} color="default" /> Monitors
          </MenuItem>
          <Divider />
          {showSensors ? (
            <MenuItem onClick={() => onCalibratedChange(!showCalibratedValues)}>
              <Checkbox checked={showCalibratedValues} color="default" /> Calibrated values
            </MenuItem>
          ) : (
            <MenuItem onClick={() => onCalibratedChange(!showCalibratedValues)} disabled>
              <Checkbox checked={showCalibratedValues} color="default" /> Calibrated values
            </MenuItem>
          )}
        </div>
      }
      open={open}
      placement="left"
      onClose={() => setOpen(false)}>
      <div style={{ padding: '5px' }}>
        <div className="map-settings" onClick={() => setOpen(!open)}>
          <SettingsIcon />
        </div>
      </div>
    </RichTooltip>
  );
};

const CustomMapControl = ({
  className,
  onPollutantChange,
  showSensors,
  showCalibratedValues,
  onSensorChange,
  onCalibratedChange
}) => {
  return (
    <MapControllerPosition className={'custom-map-control'} position={'topRight'}>
      <MapSettings
        showSensors={showSensors}
        showCalibratedValues={showCalibratedValues}
        onSensorChange={onSensorChange}
        onCalibratedChange={onCalibratedChange}
      />
      <PollutantSelector className={className} onChange={onPollutantChange} />
      <MapStyleSelectorPlaceholder />
    </MapControllerPosition>
  );
};

export const OverlayMap = ({ center, zoom, monitoringSiteData }) => {
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState();
  const [showSensors, setShowSensors] = useState(true);
  const [showCalibratedValues, setShowCalibratedValues] = useState(false);
  const [showPollutant, setShowPollutant] = useState({
    pm2_5: localStorage.pollutant === 'pm2_5',
    no2: localStorage.pollutant === 'no2',
    pm10: localStorage.pollutant === 'pm10'
  });
  const popup = new mapboxgl.Popup({
    closeButton: false,
    offset: 25
  });

  useEffect(() => {
    setShowPollutant({
      pm2_5: localStorage.pollutant === 'pm2_5',
      no2: localStorage.pollutant === 'no2',
      pm10: localStorage.pollutant === 'pm10'
    });
  }, [localStorage.pollutant]);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let centerFromUrl = center;
      try {
        centerFromUrl = urlParams.get('center') ? JSON.parse(urlParams.get('center')) : center;
      } catch (error) {
        console.error('Failed to parse center from URL:', error);
      }

      const zoomFromUrl = urlParams.get('zoom') || zoom;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: localStorage.mapStyle ? localStorage.mapStyle : streetMapStyle,
        center: centerFromUrl,
        zoom: zoomFromUrl,
        maxZoom: 20
      });

      try {
        map.addControl(
          new mapboxgl.FullscreenControl({
            container: mapContainerRef.current
          }),
          'bottom-right'
        );
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      } catch (error) {
        console.error('Failed to add controls to the map:', error);
      }

      map.on('moveend', function () {
        try {
          const newCenter = map.getCenter().wrap();
          const newZoom = map.getZoom();
          updateUrl(newCenter, newZoom);
        } catch (error) {
          console.error('Failed to update URL:', error);
        }
      });

      setMap(map);

      // clean up on unmount
      return () => map.remove();
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  function updateUrl(center, zoom) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('center', JSON.stringify([center.lng.toFixed(4), center.lat.toFixed(4)]));
    urlParams.set('zoom', zoom.toFixed(2));
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
  }

  const adjustMarkerSize = (zoom, el) => {
    const size = zoom <= 5 ? 30 : zoom <= 10 ? 35 : zoom <= 15 ? 35 : 30;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
  };

  const createMarker = (feature) => {
    try {
      const [seconds, duration] = getFirstDuration(feature.properties.time);
      let pollutantValue = null;
      let markerKey = '';

      for (const property in showPollutant) {
        if (showPollutant[property]) {
          markerKey = property;
          pollutantValue = feature.properties[property] && feature.properties[property].value;
          if (showCalibratedValues) {
            pollutantValue =
              feature.properties[property] && feature.properties[property].calibratedValue;
          }
          break;
        }
      }

      const [markerClass, desc] = getMarkerDetail(pollutantValue, markerKey);

      const el = document.createElement('div');
      el.className = `marker ${markerClass}`;
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.fontSize = '12px';
      el.style.padding = '8px';
      el.style.borderRadius = '50%';
      el.innerHTML = pollutantValue ? Math.floor(pollutantValue) : '--';

      if (
        feature.geometry.coordinates.length >= 2 &&
        feature.geometry.coordinates[0] &&
        feature.geometry.coordinates[1] &&
        pollutantValue !== null
      ) {
        const marker = new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              className: 'map-popup'
            }).setHTML(
              MapPopup(feature, showPollutant, pollutantValue, desc, duration, seconds, markerClass)
            )
          )
          .addTo(map);

        map.on('zoom', function () {
          adjustMarkerSize(map.getZoom(), el);
        });

        map.on('idle', function () {
          adjustMarkerSize(map.getZoom(), el);
        });

        adjustMarkerSize(map.getZoom(), el);
      }
    } catch (error) {
      console.error('Error creating marker:', error);
    }
  };

  const toggleSensors = () => {
    try {
      const markers = document.getElementsByClassName('marker');
      for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = !showSensors ? 'visible' : 'hidden';
      }
      setShowSensors(!showSensors);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  return (
    <div className="overlay-map-container" ref={mapContainerRef}>
      {showSensors &&
        map &&
        monitoringSiteData &&
        monitoringSiteData.features &&
        monitoringSiteData.features.length > 0 &&
        monitoringSiteData.features.forEach((feature) => {
          createMarker(feature);
        })}

      <Filter pollutants={showPollutant} />
      <Indicator />
      {map && (
        <CustomMapControl
          showSensors={showSensors}
          showCalibratedValues={showCalibratedValues}
          onSensorChange={toggleSensors}
          onCalibratedChange={setShowCalibratedValues}
          onPollutantChange={setShowPollutant}
          className={'pollutant-selector'}
        />
      )}
    </div>
  );
};

const getStoredData = () => {
  const storedData = localStorage.getItem('monitoringSiteData');
  const storedTimeStamp = localStorage.getItem('monitoringSiteDataTimeStamp');
  return { storedData, storedTimeStamp };
};

const MapContainer = () => {
  const dispatch = useDispatch();
  const apiData = useEventsMapData();
  const { storedData, storedTimeStamp } = useMemo(getStoredData, []);
  const currentTimeStamp = useMemo(() => new Date().getTime(), []);
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  const [monitoringSiteData, setMonitoringSiteData] = useState({});

  const updateLocalStorage = useCallback(
    (data) => {
      try {
        const dataCopy = { ...data };
        dataCopy.features = dataCopy.features.slice(0, 100);
        localStorage.setItem('monitoringSiteData', JSON.stringify(dataCopy));
        localStorage.setItem('monitoringSiteDataTimeStamp', currentTimeStamp.toString());
      } catch (error) {
        console.error('Error updating local storage:', error);
      }
    },
    [currentTimeStamp]
  );

  useEffect(() => {
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setMonitoringSiteData(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }

    if (isEmpty(apiData.features)) {
      try {
        dispatch(loadMapEventsData());
      } catch (error) {
        console.error('Error loading map events data:', error);
      }
    } else {
      setMonitoringSiteData(apiData);

      if (!storedTimeStamp || currentTimeStamp - storedTimeStamp >= oneDayInMilliseconds) {
        updateLocalStorage(apiData);
      }
    }
  }, [dispatch, apiData, storedData, storedTimeStamp, currentTimeStamp, updateLocalStorage]);

  return (
    <ErrorBoundary>
      <div className="map-new-container">
        <OverlayMap
          center={[22.5600613, 0.8341424]}
          zoom={window.innerWidth <= 768 ? 2.0 : window.innerWidth <= 1440 ? 2.4 : 2.4}
          monitoringSiteData={monitoringSiteData}
        />
        {monitoringSiteData && isEmpty(monitoringSiteData.features) && (
          <div className="map-circular-loader">
            <CircularLoader loading={true} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MapContainer;
