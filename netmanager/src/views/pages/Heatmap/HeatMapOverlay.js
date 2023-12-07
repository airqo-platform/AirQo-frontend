import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { circlePointPaint, heatMapPaint } from '../Map/paints';
import { getFirstDuration } from 'utils/dateTime';
import Filter from '../Dashboard/components/Map/Filter';
import MapPopup from '../Dashboard/components/Map/MapPopup';
import Divider from '@material-ui/core/Divider';
import { loadPM25HeatMapData, loadMapEventsData } from 'redux/MapData/operations';
import { usePM25HeatMapData, useEventsMapData } from 'redux/MapData/selectors';
import SettingsIcon from '@material-ui/icons/Settings';
import RichTooltip from '../../containers/RichToolTip';
import { MenuItem } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useInitScrollTop } from 'utils/customHooks';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useOrgData } from 'redux/Join/selectors';
import Indicator from '../Dashboard/components/Map/Indicator ';

// css
import 'assets/css/overlay-map.css';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import CircularLoader from '../../components/Loader/CircularLoader';
import { darkMapStyle, lightMapStyle, satelliteMapStyle, streetMapStyle } from '../Map/utils';
import MapIcon from '@material-ui/icons/Map';
import LightModeIcon from '@material-ui/icons/Highlight';
import SatelliteIcon from '@material-ui/icons/Satellite';
import DarkModeIcon from '@material-ui/icons/NightsStay';
import StreetModeIcon from '@material-ui/icons/Traffic';

// prettier-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

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

const MapSettings = ({
  showSensors,
  showHeatmap,
  showCalibratedValues,
  onSensorChange,
  onHeatmapChange,
  onCalibratedChange
}) => {
  const [open, setOpen] = useState(false);

  return (
    <RichTooltip
      content={
        <div>
          <MenuItem onClick={() => onSensorChange(!showSensors)}>
            <Checkbox checked={showSensors} color="default" /> Monitors
          </MenuItem>
          <MenuItem onClick={() => onHeatmapChange(!showHeatmap)}>
            <Checkbox checked={showHeatmap} color="default" /> Heatmap
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
  showHeatmap,
  showCalibratedValues,
  onSensorChange,
  onHeatmapChange,
  onCalibratedChange
}) => {
  return (
    <MapControllerPosition className={'custom-map-control'} position={'topRight'}>
      <MapSettings
        showSensors={showSensors}
        showHeatmap={showHeatmap}
        showCalibratedValues={showCalibratedValues}
        onSensorChange={onSensorChange}
        onHeatmapChange={onHeatmapChange}
        onCalibratedChange={onCalibratedChange}
      />
      <PollutantSelector
        className={className}
        onChange={onPollutantChange}
        showHeatMap={showHeatmap}
      />
      <MapStyleSelectorPlaceholder />
    </MapControllerPosition>
  );
};

export const OverlayMap = ({ center, zoom, heatMapData, monitoringSiteData }) => {
  const dispatch = useDispatch();
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState();
  const [showSensors, setShowSensors] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showCalibratedValues, setShowCalibratedValues] = useState(false);

  // Initialize showPollutant state with localStorage values
  const [showPollutant, setShowPollutant] = useState({
    pm2_5: localStorage.getItem('pollutant') === 'pm2_5',
    no2: localStorage.getItem('pollutant') === 'no2',
    pm10: localStorage.getItem('pollutant') === 'pm10'
  });

  const popup = new mapboxgl.Popup({
    closeButton: false,
    offset: 25
  });

  // Update showPollutant state when localStorage.pollutant changes
  useEffect(() => {
    const pollutant = localStorage.getItem('pollutant');
    setShowPollutant({
      pm2_5: pollutant === 'pm2_5',
      no2: pollutant === 'no2',
      pm10: pollutant === 'pm10'
    });
  }, [localStorage.getItem('pollutant')]);

  useEffect(() => {
    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: localStorage.getItem('mapStyle') || lightMapStyle,
      center,
      zoom,
      maxZoom: 20
    });

    // Add controls to the map
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    setMap(map);

    // Clean up on unmount
    return () => map.remove();
  }, []);

  // Update heatmap data when available
  useEffect(() => {
    if (map && heatMapData && heatMapData.type === 'FeatureCollection') {
      map.on('style.load', () => {
        if (map.getSource('heatmap-data')) {
          // Update heatmap data
          map.getSource('heatmap-data').setData(heatMapData);
        } else {
          // Add heatmap source and layers
          map.addSource('heatmap-data', {
            type: 'geojson',
            data: heatMapData
          });
          map.addLayer({
            id: 'sensor-heat',
            type: 'heatmap',
            source: 'heatmap-data',
            paint: heatMapPaint
          });
          map.addLayer({
            id: 'sensor-point',
            source: 'heatmap-data',
            type: 'circle',
            paint: circlePointPaint
          });
        }

        // Set visibility based on showHeatMap state
        const visibility = showHeatMap ? 'visible' : 'none';
        ['sensor-heat', 'sensor-point'].forEach((id) =>
          map.setLayoutProperty(id, 'visibility', visibility)
        );
      });
    }
  }, [map, heatMapData, showHeatMap]);

  useEffect(() => {
    if (map) {
      if (map.getSource('heatmap-data')) {
        try {
          // Check if data is a valid GeoJSON object
          if (
            heatMapData &&
            heatMapData.type === 'FeatureCollection' &&
            Array.isArray(heatMapData.features)
          ) {
            map.getSource('heatmap-data').setData(heatMapData);
          } else {
            console.error('Invalid GeoJSON object:', heatMapData);
          }
        } catch (error) {
          console.error('Error setting heatmap data:', error);
        }
      }
    }
  }, [map, heatMapData]);

  const toggleSensors = () => {
    try {
      const markers = document.getElementsByClassName('marker');
      for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = !showSensors ? 'visible' : 'hidden';
      }
      setShowSensors(!showSensors);
    } catch (err) {
      console.error('Error toggling sensors:', err);
    }
  };

  const toggleHeatMap = () => {
    setShowHeatMap(!showHeatMap);
    if (map) {
      try {
        map.setLayoutProperty('sensor-heat', 'visibility', showHeatMap ? 'none' : 'visible');
        map.setLayoutProperty('sensor-point', 'visibility', showHeatMap ? 'none' : 'visible');
      } catch (err) {
        console.error('Error toggling heatmap:', err);
      }
    } else {
      console.log('Map does not exist');
    }
  };

  return (
    <div className="overlay-map-container" ref={mapContainerRef}>
      {showSensors &&
        map &&
        monitoringSiteData.features.length > 0 &&
        monitoringSiteData.features.forEach((feature) => {
          const [seconds, duration] = getFirstDuration(feature.properties.time);
          let pollutantValue =
            (showPollutant.pm2_5 && feature.properties.pm2_5 && feature.properties.pm2_5.value) ||
            (showPollutant.pm10 && feature.properties.pm10 && feature.properties.pm10.value) ||
            (showPollutant.no2 && feature.properties.no2 && feature.properties.no2.value) ||
            null;

          if (showCalibratedValues) {
            pollutantValue =
              (showPollutant.pm2_5 &&
                feature.properties.pm2_5 &&
                feature.properties.pm2_5.calibratedValue &&
                feature.properties.pm2_5.calibratedValue) ||
              (showPollutant.pm10 &&
                feature.properties.pm10 &&
                feature.properties.pm10.calibratedValue &&
                feature.properties.pm10.calibratedValue) ||
              (showPollutant.no2 &&
                feature.properties.no2 &&
                feature.properties.no2.calibratedValue &&
                feature.properties.no2.calibratedValue) ||
              null;
          }
          let markerKey = '';
          for (const property in showPollutant) {
            if (showPollutant[property]) markerKey = property;
          }
          const [markerClass, desc] = getMarkerDetail(pollutantValue, markerKey);

          const el = document.createElement('div');
          el.className = `marker ${seconds >= MAX_OFFLINE_DURATION ? 'marker-grey' : markerClass}`;
          el.style.borderRadius = '50%';
          el.style.display = 'flex';
          el.style.justifyContent = 'center';
          el.style.alignItems = 'center';
          el.style.fontSize = '12px';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.padding = '10px';
          el.innerHTML = showPollutant.pm2_5
            ? Math.floor(feature.properties.pm2_5.value)
            : showPollutant.pm10
            ? Math.floor(feature.properties.pm10.value)
            : '--';

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
                  MapPopup(feature, showPollutant, pollutantValue, desc, duration, markerClass)
                )
              )
              .addTo(map);

            // Listen to the zoom event of the map
            map.on('zoom', function () {
              // Get the current zoom level of the map
              const zoom = map.getZoom();
              // Calculate the size based on the zoom level
              const size = (30 * zoom) / 10;
              // Set the size of the marker
              el.style.width = `${size}px`;
              el.style.height = `${size}px`;
            });
          }
        })}

      <Filter pollutants={showPollutant} />
      <Indicator />
      {map && (
        <CustomMapControl
          showSensors={showSensors}
          showHeatmap={showHeatMap}
          showCalibratedValues={showCalibratedValues}
          onSensorChange={toggleSensors}
          onHeatmapChange={toggleHeatMap}
          onCalibratedChange={setShowCalibratedValues}
          onPollutantChange={setShowPollutant}
          className={'pollutant-selector'}
        />
      )}
    </div>
  );
};

const HeatMapOverlay = () => {
  const dispatch = useDispatch();
  const heatMapData = usePM25HeatMapData();
  const monitoringSiteData = useEventsMapData();

  useEffect(() => {
    if (!heatMapData || (heatMapData && heatMapData.features)) dispatch(loadPM25HeatMapData());
  }, []);

  useEffect(() => {
    if (
      !monitoringSiteData ||
      (monitoringSiteData &&
        (!monitoringSiteData.features || monitoringSiteData.features.length === 0))
    ) {
      dispatch(loadMapEventsData()).catch((error) => {
        console.error('Failed to load Map Events Data:', error);
      });
    }
  }, [monitoringSiteData, dispatch]);

  if (!monitoringSiteData || (monitoringSiteData && !monitoringSiteData.features)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
        <CircularLoader loading={true} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <OverlayMap
        center={[22.5600613, 0.8341424]}
        zoom={2.4}
        heatMapData={heatMapData}
        monitoringSiteData={monitoringSiteData}
      />
    </ErrorBoundary>
  );
};

export default HeatMapOverlay;
