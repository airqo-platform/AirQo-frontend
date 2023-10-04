import React, { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { circlePointPaint, heatMapPaint } from './paints';
import { getFirstDuration } from 'utils/dateTime';
import Filter from '../Dashboard/components/Map/Filter';
import Divider from '@material-ui/core/Divider';
import { loadPM25HeatMapData, loadMapEventsData } from 'redux/MapData/operations';
import { usePM25HeatMapData, useEventsMapData } from 'redux/MapData/selectors';
import SettingsIcon from '@material-ui/icons/Settings';
import RichTooltip from '../../containers/RichToolTip';
import { MenuItem } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useInitScrollTop } from 'utils/customHooks';
import { ErrorBoundary } from '../../ErrorBoundary';
import { useDashboardSitesData } from 'redux/Dashboard/selectors';
import { loadSites } from 'redux/Dashboard/operations';
import { useOrgData } from 'redux/Join/selectors';

// css
import 'assets/css/overlay-map.css';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { ErrorEvent } from 'mapbox-gl';
import BoundaryAlert from '../../ErrorBoundary/Alert';
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

const PollutantSelector = ({ className, onChange, showHeatMap }) => {
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
      <div style={{ padding: '10px' }}>
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
      setMapMode('light');
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
      <div style={{ padding: '10px' }}>
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
  const sitesData = useDashboardSitesData();
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState();
  const [showSensors, setShowSensors] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
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
    if (isEmpty(sitesData)) {
      dispatch(loadSites());
    }
  }, [sitesData]);

  useEffect(() => {
    const addLayer = (id, type, paint, visibility) => {
      if (!map.getLayer(id)) {
        map.addLayer({
          id,
          type,
          source: 'heatmap-data',
          paint
        });
      }
      map.setLayoutProperty(id, 'visibility', visibility);
    };

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: localStorage.mapStyle || lightMapStyle,
      center,
      zoom,
      maxZoom: 20
    });

    map.addControl(
      new mapboxgl.FullscreenControl({ container: mapContainerRef.current }),
      'bottom-right'
    );
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    if (heatMapData && heatMapData.features && heatMapData.features.length > 0) {
      map.on('load', () => {
        try {
          if (!map.getSource('heatmap-data')) {
            map.addSource('heatmap-data', { type: 'geojson', data: heatMapData });
          }

          addLayer('sensor-heat', 'heatmap', heatMapPaint, showHeatMap ? 'visible' : 'none');
          addLayer('sensor-point', 'circle', circlePointPaint, showHeatMap ? 'visible' : 'none');
        } catch (err) {
          console.error('Error adding heatmap data:', err);
        }

        map.on('mousemove', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['sensor-point'] });
          map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';

          if (map.getZoom() < 9 || !features.length) {
            popup.remove();
            return;
          }

          const reducerFactory = (key) => (accumulator, feature) =>
            accumulator + parseFloat(feature.properties[key]);
          let average_predicted_value =
            features.reduce(reducerFactory('pm2_5'), 0) / features.length;
          let average_confidence_int =
            features.reduce(reducerFactory('interval'), 0) / features.length;

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<table class="popup-table">
              <tr>
                <td><b>Predicted AQI</b></td>
                <td>${average_predicted_value.toFixed(4)}</td>
              </tr>
              <tr>
                <td><b>Confidence Level</b></td>
                <td>± ${average_confidence_int.toFixed(4)}</td>
              </tr>
            </table>`
            )
            .addTo(map);
        });
      });
    } else {
      console.error('Heatmap data is empty or not in the correct format.');
    }

    setMap(map);

    return () => {
      ['sensor-heat', 'sensor-point'].forEach((layer) => {
        if (map.getLayer(layer)) map.removeLayer(layer);
      });
      if (map.getSource('heatmap-data')) map.removeSource('heatmap-data');
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (map && map.getSource('heatmap-data')) {
      map.getSource('heatmap-data').setData(heatMapData);
    }
  }, [map, heatMapData]);

  const toggleVisibility = (className, visibility) => {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.visibility = visibility;
    }
  };

  const toggleSensors = () => {
    try {
      toggleVisibility('marker', !showSensors ? 'visible' : 'hidden');
      setShowSensors(!showSensors);
    } catch (err) {
      console.error('Error toggling sensors:', err);
    }
  };

  const toggleHeatMap = () => {
    setShowHeatMap(!showHeatMap);
    try {
      const visibility = showHeatMap ? 'none' : 'visible';
      map.setLayoutProperty('sensor-heat', 'visibility', visibility);
      map.setLayoutProperty('sensor-point', 'visibility', visibility);
    } catch (err) {
      console.error('Heatmap Load error:', err);
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
          // el.innerText = (pollutantValue && pollutantValue.toFixed(0)) || "--";

          if (
            feature.geometry.coordinates.length >= 2 &&
            feature.geometry.coordinates[0] &&
            feature.geometry.coordinates[1]
          ) {
            new mapboxgl.Marker(el, { rotation: -45, scale: 0.4 })
              .setLngLat(feature.geometry.coordinates)
              .setPopup(
                new mapboxgl.Popup({
                  offset: 25,
                  className: 'map-popup'
                }).setHTML(
                  `<div class="popup-body">
                      <div>
                        <span class="popup-title">
                          <b>${
                            (sitesData[feature.properties.site_id] &&
                              sitesData[feature.properties.site_id].name) ||
                            (sitesData[feature.properties.site_id] &&
                              sitesData[feature.properties.site_id].description) ||
                            feature.properties.device ||
                            feature.properties._id
                          }</b>
                        </span>
                      </div>
                      <div class="${`popup-aqi ${markerClass}`}"> 
                        <span>
                        ${
                          (showPollutant.pm2_5 && 'PM<sub>2.5<sub>') ||
                          (showPollutant.pm10 && 'PM<sub>10<sub>')
                        }
                        </span> </hr>  
                        <div class="pollutant-info">
                          <div class="pollutant-info-row">
                          <div class="pollutant-number">${
                            (pollutantValue && pollutantValue.toFixed(2)) || '--'
                          }</div>
                          <div class="popup-measurement">µg/m<sup>3</sup></div>
                          </div> 
                          <div class="pollutant-desc">${desc}</div>
                        </div>
                      </div>
                      <span>Last Refreshed: <b>${duration}</b> ago</span>
                    </div>`
                )
              )
              .addTo(map);
          }
        })}
      <Filter pollutants={showPollutant} />
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

const heatMapData22 = {
  features: [
    {
      geometry: {
        coordinates: [32.618631636666706, 0.22563595188895785],
        type: 'Point'
      },
      properties: {
        interval: 31.683605603980006,
        latitude: 0.22563595188895785,
        longitude: 32.618631636666706,
        pm2_5: 50.86771178852291,
        variance: 261.3106164276742
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.22563595188895785],
        type: 'Point'
      },
      properties: {
        interval: 31.709583192282764,
        latitude: 0.22563595188895785,
        longitude: 32.62865916900004,
        pm2_5: 50.78282086496531,
        variance: 261.73929254172776
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 31.71048146105387,
        latitude: 0.23695258377784334,
        longitude: 32.618631636666706,
        pm2_5: 50.780017567389244,
        variance: 261.75412184814695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 31.711364176234948,
        latitude: 0.23695258377784334,
        longitude: 32.62865916900004,
        pm2_5: 50.77721654865024,
        variance: 261.7686947932625
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 31.712231274131923,
        latitude: 0.23695258377784334,
        longitude: 32.63868670133338,
        pm2_5: 50.774418083359556,
        variance: 261.78301030404805
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 31.713082692306138,
        latitude: 0.24826921566672885,
        longitude: 32.60860410433337,
        pm2_5: 50.77162244512739,
        variance: 261.7970673284692
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 31.713918369572013,
        latitude: 0.24826921566672885,
        longitude: 32.618631636666706,
        pm2_5: 50.7688299065418,
        variance: 261.81086483545323
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 31.71473824599521,
        latitude: 0.24826921566672885,
        longitude: 32.62865916900004,
        pm2_5: 50.76604073914374,
        variance: 261.82440181486663
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 31.70978093994499,
        latitude: 0.24826921566672885,
        longitude: 32.63868670133338,
        pm2_5: 50.7822304655477,
        variance: 261.74255707499447
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 31.71532458202064,
        latitude: 0.2595858475556143,
        longitude: 32.60860410433337,
        pm2_5: 50.7638457129477,
        variance: 261.8340830234597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 31.717093686561018,
        latitude: 0.2595858475556143,
        longitude: 32.618631636666706,
        pm2_5: 50.75827129879329,
        variance: 261.8632944403605
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 31.717955003334318,
        latitude: 0.2595858475556143,
        longitude: 32.62865916900004,
        pm2_5: 50.7554877453615,
        variance: 261.87751707453685
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 31.718800746543337,
        latitude: 0.2595858475556143,
        longitude: 32.63868670133338,
        pm2_5: 50.752706990938385,
        variance: 261.89148292350023
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64871423366671, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 31.719630855321387,
        latitude: 0.2595858475556143,
        longitude: 32.64871423366671,
        pm2_5: 50.74992930669329,
        variance: 261.90519096154117
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.721006473678273,
        latitude: 0.27090247944449986,
        longitude: 32.588549039666695,
        pm2_5: 50.74497472915202,
        variance: 261.9279080859899
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.72189269611702,
        latitude: 0.27090247944449986,
        longitude: 32.598576572000034,
        pm2_5: 50.74220164510569,
        variance: 261.9425437900777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.72276357706271,
        latitude: 0.27090247944449986,
        longitude: 32.60860410433337,
        pm2_5: 50.73943078912005,
        variance: 261.95692653223045
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.71621685833614,
        latitude: 0.27090247944449986,
        longitude: 32.618631636666706,
        pm2_5: 50.761057379046164,
        variance: 261.8488160675254
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.72361905349017,
        latitude: 0.27090247944449986,
        longitude: 32.62865916900004,
        pm2_5: 50.73666243290956,
        variance: 261.97105525066763
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.70897162440198,
        latitude: 0.27090247944449986,
        longitude: 32.63868670133338,
        pm2_5: 50.785030495581786,
        variance: 261.72919655277224
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64871423366671, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 31.707305155842082,
        latitude: 0.27090247944449986,
        longitude: 32.64871423366671,
        pm2_5: 50.790641303973004,
        variance: 261.7016868611229
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.684468225404437,
        latitude: 0.28221911133338534,
        longitude: 32.57852150733336,
        pm2_5: 50.864849368228505,
        variance: 261.3248455660828
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.68961833799215,
        latitude: 0.28221911133338534,
        longitude: 32.588549039666695,
        pm2_5: 50.84829887281076,
        variance: 261.4098059161829
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.69047569455765,
        latitude: 0.28221911133338534,
        longitude: 32.598576572000034,
        pm2_5: 50.8454498317544,
        variance: 261.4239508921671
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.69131683470056,
        latitude: 0.28221911133338534,
        longitude: 32.60860410433337,
        pm2_5: 50.842604280065956,
        variance: 261.43782869569327
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.694704619077733,
        latitude: 0.28221911133338534,
        longitude: 32.618631636666706,
        pm2_5: 50.83182003137321,
        variance: 261.49372680408874
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.695572700976914,
        latitude: 0.28221911133338534,
        longitude: 32.62865916900004,
        pm2_5: 50.82898148658895,
        variance: 261.5080510315788
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 31.696424729417025,
        latitude: 0.28221911133338534,
        longitude: 32.63868670133338,
        pm2_5: 50.82614612685507,
        variance: 261.5221107422947
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.708146343371652,
        latitude: 0.29353574322227083,
        longitude: 32.57852150733336,
        pm2_5: 50.787834199003804,
        variance: 261.71557281670994
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.697260643542528,
        latitude: 0.29353574322227083,
        longitude: 32.588549039666695,
        pm2_5: 50.82331422776897,
        variance: 261.53590491062846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.701468401050946,
        latitude: 0.29353574322227083,
        longitude: 32.598576572000034,
        pm2_5: 50.8097616365138,
        variance: 261.6053464136901
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.702315039388825,
        latitude: 0.29353574322227083,
        longitude: 32.60860410433337,
        pm2_5: 50.80694025665391,
        variance: 261.61931977734776
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.703145666728616,
        latitude: 0.29353574322227083,
        longitude: 32.618631636666706,
        pm2_5: 50.80412230816211,
        variance: 261.63302924974323
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 31.703960223782214,
        latitude: 0.29353574322227083,
        longitude: 32.62865916900004,
        pm2_5: 50.801308064228266,
        variance: 261.6464738315194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 31.70468676298898,
        latitude: 0.3048523751111563,
        longitude: 32.57852150733336,
        pm2_5: 50.799080293674,
        variance: 261.65846593587275
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 31.70557530351882,
        latitude: 0.3048523751111563,
        longitude: 32.588549039666695,
        pm2_5: 50.79626462579911,
        variance: 261.6731323737772
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 31.706448122057296,
        latitude: 0.3048523751111563,
        longitude: 32.598576572000034,
        pm2_5: 50.793451537563,
        variance: 261.68753970135117
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 31.70060581226579,
        latitude: 0.3048523751111563,
        longitude: 32.60860410433337,
        pm2_5: 50.81258617346866,
        variance: 261.59111017926375
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 31.724459063615623,
        latitude: 0.3048523751111563,
        longitude: 32.618631636666706,
        pm2_5: 50.7338968472069,
        variance: 261.98492890436887
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.7014512322409785,
        latitude: 3.8097799999991873,
        longitude: 9.629634444440146,
        pm2_5: 14.79243921637332,
        variance: 1.899687307417821
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.7006296309528572,
        latitude: 3.8097799999991873,
        longitude: 9.689693333328856,
        pm2_5: 14.792618347939166,
        variance: 1.8985319667796148
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.700640014871048,
        latitude: 3.8097799999991873,
        longitude: 9.749752222217568,
        pm2_5: 14.792590949649654,
        variance: 1.8985465665146535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.865219999998873],
        type: 'Point'
      },
      properties: {
        interval: 2.700596410458325,
        latitude: 3.865219999998873,
        longitude: 9.749752222217568,
        pm2_5: 14.792638163503273,
        variance: 1.8984852593139294
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.389398888885303, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.700578700488761,
        latitude: 3.920659999998558,
        longitude: 9.389398888885303,
        pm2_5: 14.792609322738867,
        variance: 1.8984603596245222
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.7006301667294963,
        latitude: 3.920659999998558,
        longitude: 9.449457777774013,
        pm2_5: 14.792549095888155,
        variance: 1.8985327200774123
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.7006991557132607,
        latitude: 3.920659999998558,
        longitude: 9.749752222217568,
        pm2_5: 14.792517926993595,
        variance: 1.8986297193019368
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.7007966822067333,
        latitude: 3.920659999998558,
        longitude: 9.809811111106278,
        pm2_5: 14.792486203520397,
        variance: 1.8987668467875096
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.7006176650308036,
        latitude: 3.9760999999982434,
        longitude: 9.449457777774013,
        pm2_5: 14.792628300201104,
        variance: 1.8985151428249765
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.7005986232439665,
        latitude: 3.9760999999982434,
        longitude: 9.509516666662725,
        pm2_5: 14.79259729062275,
        variance: 1.8984883704360698
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.7006107358885356,
        latitude: 3.9760999999982434,
        longitude: 9.689693333328856,
        pm2_5: 14.792565330383793,
        variance: 1.8985054005613335
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.7006539588807295,
        latitude: 3.9760999999982434,
        longitude: 9.749752222217568,
        pm2_5: 14.79253253474089,
        variance: 1.8985661718081417
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.7007281348687764,
        latitude: 3.9760999999982434,
        longitude: 9.809811111106278,
        pm2_5: 14.79249902196272,
        variance: 1.8986704650332626
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.7006459542566494,
        latitude: 4.0315399999979284,
        longitude: 9.449457777774013,
        pm2_5: 14.792644931261965,
        variance: 1.898554917285196
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.700832993821834,
        latitude: 4.0315399999979284,
        longitude: 9.509516666662725,
        pm2_5: 14.792464912904876,
        variance: 1.8988179041328124
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.569575555551435, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.7007096509659516,
        latitude: 4.0315399999979284,
        longitude: 9.569575555551435,
        pm2_5: 14.792615371669433,
        variance: 1.8986444759528922
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.700689336409579,
        latitude: 4.0315399999979284,
        longitude: 9.629634444440146,
        pm2_5: 14.792582288570554,
        variance: 1.8986159131081877
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.7007022583480396,
        latitude: 4.0315399999979284,
        longitude: 9.689693333328856,
        pm2_5: 14.792548191244283,
        variance: 1.8986340816967413
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.70093936860773,
        latitude: 4.0315399999979284,
        longitude: 9.749752222217568,
        pm2_5: 14.792441059155696,
        variance: 1.8989674804495849
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.701083560398714,
        latitude: 4.0315399999979284,
        longitude: 9.809811111106278,
        pm2_5: 14.792404164413954,
        variance: 1.899170241632703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.7008720782922655,
        latitude: 4.086979999997614,
        longitude: 9.509516666662725,
        pm2_5: 14.792599417642945,
        variance: 1.8988728611252554
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.569575555551435, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.7008505540215237,
        latitude: 4.086979999997614,
        longitude: 9.569575555551435,
        pm2_5: 14.792564362689728,
        variance: 1.8988425955743367
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.701268246867079,
        latitude: 4.086979999997614,
        longitude: 9.629634444440146,
        pm2_5: 14.792375621814863,
        variance: 1.8994299618732668
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.701454715496157,
        latitude: 4.086979999997614,
        longitude: 9.749752222217568,
        pm2_5: 14.792336134017138,
        variance: 1.8996922063401769
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.7010817679305386,
        latitude: 4.086979999997614,
        longitude: 9.809811111106278,
        pm2_5: 14.79254356807376,
        variance: 1.8991677210138391
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.7013822495254325,
        latitude: 4.1424199999972995,
        longitude: 9.689693333328856,
        pm2_5: 14.79251996863261,
        variance: 1.8995902899966381
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.70139734894367,
        latitude: 4.1424199999972995,
        longitude: 9.749752222217568,
        pm2_5: 14.792480113384546,
        variance: 1.8996115256351231
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.700968154041242,
        latitude: 4.1424199999972995,
        longitude: 9.809811111106278,
        pm2_5: 14.792430330571932,
        variance: 1.8990079573992489
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.197859999996985],
        type: 'Point'
      },
      properties: {
        interval: 2.7007661402414125,
        latitude: 4.197859999996985,
        longitude: 9.809811111106278,
        pm2_5: 14.792648582677069,
        variance: 1.898723902612062
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.411428663465713, 14.728895946454639],
        type: 'Point'
      },
      properties: {
        interval: 15.281478773291578,
        latitude: 14.728895946454639,
        longitude: -17.411428663465713,
        pm2_5: 33.4455824213177,
        variance: 60.788107428821604
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.728895946454639],
        type: 'Point'
      },
      properties: {
        interval: 15.269161317769631,
        latitude: 14.728895946454639,
        longitude: -17.397158940633137,
        pm2_5: 33.459374002085674,
        variance: 60.69015185028957
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.728895946454639],
        type: 'Point'
      },
      properties: {
        interval: 15.273642132525902,
        latitude: 14.728895946454639,
        longitude: -17.32581032647027,
        pm2_5: 33.45516057745645,
        variance: 60.72577675772345
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.411428663465713, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.278136892767396,
        latitude: 14.739530835077726,
        longitude: -17.411428663465713,
        pm2_5: 33.450925247689284,
        variance: 60.761523040956945
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.28264457394742,
        latitude: 14.739530835077726,
        longitude: -17.397158940633137,
        pm2_5: 33.446668939456714,
        variance: 60.79738264619027
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.28716415418153,
        latitude: 14.739530835077726,
        longitude: -17.382889217800564,
        pm2_5: 33.44239258165347,
        variance: 60.83334753146937
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.291694614522653,
        latitude: 14.739530835077726,
        longitude: -17.36861949496799,
        pm2_5: 33.43809710515562,
        variance: 60.8694096688414
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.296234939236488,
        latitude: 14.739530835077726,
        longitude: -17.354349772135418,
        pm2_5: 33.433783442585195,
        variance: 60.90556104652205
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.30078411605797,
        latitude: 14.739530835077726,
        longitude: -17.34008004930284,
        pm2_5: 33.429452528075664,
        variance: 60.94179367092147
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.739530835077726],
        type: 'Point'
      },
      properties: {
        interval: 15.276260838439278,
        latitude: 14.739530835077726,
        longitude: -17.32581032647027,
        pm2_5: 33.45324497543612,
        variance: 60.74660172949643
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.411428663465713, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.280837090118718,
        latitude: 14.750165723700812,
        longitude: -17.411428663465713,
        pm2_5: 33.44892528736589,
        variance: 60.7830024403238
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.285425290577523,
        latitude: 14.750165723700812,
        longitude: -17.397158940633137,
        pm2_5: 33.444585307774865,
        variance: 60.81950914041727
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.290024404260537,
        latitude: 14.750165723700812,
        longitude: -17.382889217800564,
        pm2_5: 33.44022598221359,
        variance: 60.856113672137326
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.294633398983114,
        latitude: 14.750165723700812,
        longitude: -17.36861949496799,
        pm2_5: 33.4358482579611,
        variance: 60.89280789496297
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.299251246200276,
        latitude: 14.750165723700812,
        longitude: -17.354349772135418,
        pm2_5: 33.431453083784156,
        variance: 60.929583687619925
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.279035077830173,
        latitude: 14.750165723700812,
        longitude: -17.34008004930284,
        pm2_5: 33.45117726580228,
        variance: 60.768667458758046
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.750165723700812],
        type: 'Point'
      },
      properties: {
        interval: 15.283691469689515,
        latitude: 14.750165723700812,
        longitude: -17.32581032647027,
        pm2_5: 33.44677410121545,
        variance: 60.80571244811017
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.425698386298286, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.28835880395138,
        latitude: 14.760800612323898,
        longitude: -17.425698386298286,
        pm2_5: 33.44235136654383,
        variance: 60.84285582006396
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.411428663465713, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.29303603206529,
        latitude: 14.760800612323898,
        longitude: -17.411428663465713,
        pm2_5: 33.43791002364317,
        variance: 60.88008930603064
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.297722109290639,
        latitude: 14.760800612323898,
        longitude: -17.397158940633137,
        pm2_5: 33.43345103583176,
        variance: 60.91740465771545
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.302320536985553,
        latitude: 14.760800612323898,
        longitude: -17.382889217800564,
        pm2_5: 33.42744959935586,
        variance: 60.95403316759939
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.297840461782151,
        latitude: 14.760800612323898,
        longitude: -17.36861949496799,
        pm2_5: 33.431715816181544,
        variance: 60.91834724961973
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.293369234448837,
        latitude: 14.760800612323898,
        longitude: -17.354349772135418,
        pm2_5: 33.43596498206426,
        variance: 60.88274222750579
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.288907850886117,
        latitude: 14.760800612323898,
        longitude: -17.34008004930284,
        pm2_5: 33.44019617758366,
        variance: 60.84722596649499
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.760800612323898],
        type: 'Point'
      },
      properties: {
        interval: 15.2856955014135,
        latitude: 14.760800612323898,
        longitude: -17.32581032647027,
        pm2_5: 33.44160372520176,
        variance: 60.821659454897144
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.425698386298286, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.306949286330706,
        latitude: 14.771435500946986,
        longitude: -17.425698386298286,
        pm2_5: 33.421428881536464,
        variance: 60.99091432067371
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.411428663465713, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.279511328691868,
        latitude: 14.771435500946986,
        longitude: -17.411428663465713,
        pm2_5: 33.44798341478078,
        variance: 60.772455863083906
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.283798148131856,
        latitude: 14.771435500946986,
        longitude: -17.397158940633137,
        pm2_5: 33.4439399553409,
        variance: 60.80656128509963
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.288097663768864,
        latitude: 14.771435500946986,
        longitude: -17.382889217800564,
        pm2_5: 33.43987630728604,
        variance: 60.84077732635751
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.292408904458334,
        latitude: 14.771435500946986,
        longitude: -17.36861949496799,
        pm2_5: 33.4357933549976,
        variance: 60.87509634036769
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.296730901538217,
        latitude: 14.771435500946986,
        longitude: -17.354349772135418,
        pm2_5: 33.431691984875656,
        variance: 60.90951069191851
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.301062689084294,
        latitude: 14.771435500946986,
        longitude: -17.34008004930284,
        pm2_5: 33.42757308511403,
        variance: 60.94401275908149
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.771435500946986],
        type: 'Point'
      },
      properties: {
        interval: 15.30540330415956,
        latitude: 14.771435500946986,
        longitude: -17.32581032647027,
        pm2_5: 33.42343754547981,
        variance: 60.978594935177625
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.397158940633137, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.286698013735908,
        latitude: 14.782070389570071,
        longitude: -17.397158940633137,
        pm2_5: 33.44447301155067,
        variance: 60.82963769344997
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.277549248062188,
        latitude: 14.782070389570071,
        longitude: -17.382889217800564,
        pm2_5: 33.45038029149982,
        variance: 60.75684897619885
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.286275080009288,
        latitude: 14.782070389570071,
        longitude: -17.36861949496799,
        pm2_5: 33.44214418645956,
        variance: 60.82627181947964
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.290656170935687,
        latitude: 14.782070389570071,
        longitude: -17.354349772135418,
        pm2_5: 33.43799635039818,
        variance: 60.86114278888317
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.295048063624332,
        latitude: 14.782070389570071,
        longitude: -17.34008004930284,
        pm2_5: 33.433829859703714,
        variance: 60.89610976379072
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.782070389570071],
        type: 'Point'
      },
      properties: {
        interval: 15.299449775473745,
        latitude: 14.782070389570071,
        longitude: -17.32581032647027,
        pm2_5: 33.42964561745427,
        variance: 60.93116499173357
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.382889217800564, 14.792705278193157],
        type: 'Point'
      },
      properties: {
        interval: 15.30386032702653,
        latitude: 14.792705278193157,
        longitude: -17.382889217800564,
        pm2_5: 33.42544452828034,
        variance: 60.966300736447465
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.36861949496799, 14.792705278193157],
        type: 'Point'
      },
      properties: {
        interval: 15.271180782650125,
        latitude: 14.792705278193157,
        longitude: -17.36861949496799,
        pm2_5: 33.45692292611753,
        variance: 60.706206397434016
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.792705278193157],
        type: 'Point'
      },
      properties: {
        interval: 15.275592769885566,
        latitude: 14.792705278193157,
        longitude: -17.354349772135418,
        pm2_5: 33.4527727721331,
        variance: 60.74128864831846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.792705278193157],
        type: 'Point'
      },
      properties: {
        interval: 15.280018614954653,
        latitude: 14.792705278193157,
        longitude: -17.34008004930284,
        pm2_5: 33.44860098774471,
        variance: 60.776491272740714
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.32581032647027, 14.792705278193157],
        type: 'Point'
      },
      properties: {
        interval: 15.284457310302068,
        latitude: 14.792705278193157,
        longitude: -17.32581032647027,
        pm2_5: 33.44440848485214,
        variance: 60.811806349033304
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.354349772135418, 14.803340166816245],
        type: 'Point'
      },
      properties: {
        interval: 15.281905776342292,
        latitude: 14.803340166816245,
        longitude: -17.354349772135418,
        pm2_5: 33.44627246659066,
        variance: 60.791504622293814
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-17.34008004930284, 14.803340166816245],
        type: 'Point'
      },
      properties: {
        interval: 15.291443029395047,
        latitude: 14.803340166816245,
        longitude: -17.34008004930284,
        pm2_5: 33.43996850103184,
        variance: 60.867406789159304
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.017546300839841,
        latitude: 2.2521293333333334,
        longitude: 32.90784744444444,
        pm2_5: 22.96970871281792,
        variance: 58.70644962980748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.017546274624408,
        latitude: 2.2521293333333334,
        longitude: 32.90790466666667,
        pm2_5: 22.969708588749512,
        variance: 58.70644942484523
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.017546273762571,
        latitude: 2.2521293333333334,
        longitude: 32.90796188888889,
        pm2_5: 22.969708590020325,
        variance: 58.70644941810707
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.01754627362907,
        latitude: 2.2521293333333334,
        longitude: 32.90801911111111,
        pm2_5: 22.96970859062574,
        variance: 58.70644941706331
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.017546274223921,
        latitude: 2.2521293333333334,
        longitude: 32.908076333333334,
        pm2_5: 22.969708590565666,
        variance: 58.70644942171407
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.01754627554712,
        latitude: 2.2521293333333334,
        longitude: 32.90813355555556,
        pm2_5: 22.969708589840135,
        variance: 58.706449432059344
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 15.017546277598699,
        latitude: 2.2521293333333334,
        longitude: 32.908190777777776,
        pm2_5: 22.969708588449144,
        variance: 58.70644944809936
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.01754629472777,
        latitude: 2.2522556666666667,
        longitude: 32.90784744444444,
        pm2_5: 22.969708532274833,
        variance: 58.70644958202098
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546292408893,
        latitude: 2.2522556666666667,
        longitude: 32.90790466666667,
        pm2_5: 22.96970853487696,
        variance: 58.70644956389111
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.01754629081843,
        latitude: 2.2522556666666667,
        longitude: 32.90796188888889,
        pm2_5: 22.969708536813588,
        variance: 58.706449551456274
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546289956494,
        latitude: 2.2522556666666667,
        longitude: 32.90801911111111,
        pm2_5: 22.969708538084586,
        variance: 58.706449544717316
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546289822963,
        latitude: 2.2522556666666667,
        longitude: 32.908076333333334,
        pm2_5: 22.969708538690075,
        variance: 58.70644954367333
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546290417927,
        latitude: 2.2522556666666667,
        longitude: 32.90813355555556,
        pm2_5: 22.96970853862998,
        variance: 58.706449548325
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546291741304,
        latitude: 2.2522556666666667,
        longitude: 32.908190777777776,
        pm2_5: 22.969708537904374,
        variance: 58.706449558671636
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546319862598,
        latitude: 2.2523820000000003,
        longitude: 32.90784744444444,
        pm2_5: 22.96970847216425,
        variance: 58.70644977853465
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546317543358,
        latitude: 2.2523820000000003,
        longitude: 32.90790466666667,
        pm2_5: 22.969708474766772,
        variance: 58.70644976040194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546315952657,
        latitude: 2.2523820000000003,
        longitude: 32.90796188888889,
        pm2_5: 22.969708476703723,
        variance: 58.70644974796522
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546315090573,
        latitude: 2.2523820000000003,
        longitude: 32.90801911111111,
        pm2_5: 22.969708477974898,
        variance: 58.70644974122513
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546314957013,
        latitude: 2.2523820000000003,
        longitude: 32.908076333333334,
        pm2_5: 22.969708478580525,
        variance: 58.706449740180915
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546315552075,
        latitude: 2.2523820000000003,
        longitude: 32.90813355555556,
        pm2_5: 22.96970847852039,
        variance: 58.70644974483332
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 15.017546316875716,
        latitude: 2.2523820000000003,
        longitude: 32.908190777777776,
        pm2_5: 22.969708477794583,
        variance: 58.706449755182064
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546353937659,
        latitude: 2.2525083333333336,
        longitude: 32.90784744444444,
        pm2_5: 22.969708403879636,
        variance: 58.70645004494645
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546351618055,
        latitude: 2.2525083333333336,
        longitude: 32.90790466666667,
        pm2_5: 22.96970840648259,
        variance: 58.7064500268109
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546350027157,
        latitude: 2.2525083333333336,
        longitude: 32.90796188888889,
        pm2_5: 22.96970840841971,
        variance: 58.70645001437265
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546349164913,
        latitude: 2.2525083333333336,
        longitude: 32.90801911111111,
        pm2_5: 22.969708409691144,
        variance: 58.706450007631304
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546349031361,
        latitude: 2.2525083333333336,
        longitude: 32.908076333333334,
        pm2_5: 22.969708410296818,
        variance: 58.70645000658715
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546276214565,
        latitude: 2.2525083333333336,
        longitude: 32.90813355555556,
        pm2_5: 22.96970858681324,
        variance: 58.70644943727768
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 15.017546349626494,
        latitude: 2.2525083333333336,
        longitude: 32.908190777777776,
        pm2_5: 22.96970841023672,
        variance: 58.70645001124012
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546278533128,
        latitude: 2.252634666666667,
        longitude: 32.907790222222225,
        pm2_5: 22.96970858421146,
        variance: 58.70644945540511
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546268293192,
        latitude: 2.252634666666667,
        longitude: 32.90784744444444,
        pm2_5: 22.969708633601815,
        variance: 58.70644937534536
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546299250624,
        latitude: 2.252634666666667,
        longitude: 32.90790466666667,
        pm2_5: 22.969708714752983,
        variance: 58.70644961738236
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546298389325,
        latitude: 2.252634666666667,
        longitude: 32.90796188888889,
        pm2_5: 22.969708716023025,
        variance: 58.706449610648406
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546298255898,
        latitude: 2.252634666666667,
        longitude: 32.90801911111111,
        pm2_5: 22.96970871662807,
        variance: 58.706449609605215
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546298850412,
        latitude: 2.252634666666667,
        longitude: 32.908076333333334,
        pm2_5: 22.969708716568004,
        variance: 58.70644961425336
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.01754630017279,
        latitude: 2.252634666666667,
        longitude: 32.90813355555556,
        pm2_5: 22.96970871584295,
        variance: 58.70644962459221
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546302223082,
        latitude: 2.252634666666667,
        longitude: 32.908190777777776,
        pm2_5: 22.96970871445274,
        variance: 58.70644964062217
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.017546281273173,
        latitude: 2.252761,
        longitude: 32.907790222222225,
        pm2_5: 22.969708693577736,
        variance: 58.7064494768278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.017546279683726,
        latitude: 2.252761,
        longitude: 32.90784744444444,
        pm2_5: 22.969708695513134,
        variance: 58.70644946440092
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.01754627882229,
        latitude: 2.252761,
        longitude: 32.90790466666667,
        pm2_5: 22.969708696783414,
        variance: 58.70644945766588
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.01754627868884,
        latitude: 2.252761,
        longitude: 32.90796188888889,
        pm2_5: 22.969708697388544,
        variance: 58.70644945662252
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.017546279283406,
        latitude: 2.252761,
        longitude: 32.90801911111111,
        pm2_5: 22.969708697328464,
        variance: 58.70644946127106
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.017546280606032,
        latitude: 2.252761,
        longitude: 32.908076333333334,
        pm2_5: 22.969708696603252,
        variance: 58.70644947161185
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 15.017546282656621,
        latitude: 2.252761,
        longitude: 32.90813355555556,
        pm2_5: 22.969708695212915,
        variance: 58.706449487644136
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546270646754,
        latitude: 2.2528873333333337,
        longitude: 32.907790222222225,
        pm2_5: 22.969708666163584,
        variance: 58.706449393746425
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546269057034,
        latitude: 2.2528873333333337,
        longitude: 32.90784744444444,
        pm2_5: 22.969708668099315,
        variance: 58.706449381317384
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546268195474,
        latitude: 2.2528873333333337,
        longitude: 32.90790466666667,
        pm2_5: 22.969708669369705,
        variance: 58.70644937458138
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546268062032,
        latitude: 2.2528873333333337,
        longitude: 32.90796188888889,
        pm2_5: 22.96970866997494,
        variance: 58.70644937353808
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546268656707,
        latitude: 2.2528873333333337,
        longitude: 32.90801911111111,
        pm2_5: 22.96970866991487,
        variance: 58.70644937818747
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.01754626997947,
        latitude: 2.2528873333333337,
        longitude: 32.908076333333334,
        pm2_5: 22.969708669189597,
        variance: 58.706449388529336
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 15.017546272030444,
        latitude: 2.2528873333333337,
        longitude: 32.90813355555556,
        pm2_5: 22.96970866779894,
        variance: 58.70644940456464
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546268960533,
        latitude: 2.253013666666667,
        longitude: 32.907790222222225,
        pm2_5: 22.969708630575433,
        variance: 58.7064493805629
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546267370625,
        latitude: 2.253013666666667,
        longitude: 32.90784744444444,
        pm2_5: 22.969708632511356,
        variance: 58.70644936813238
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.01754626650892,
        latitude: 2.253013666666667,
        longitude: 32.90790466666667,
        pm2_5: 22.96970863378204,
        variance: 58.706449361395244
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546266375476,
        latitude: 2.253013666666667,
        longitude: 32.90796188888889,
        pm2_5: 22.969708634387278,
        variance: 58.70644936035194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546266970216,
        latitude: 2.253013666666667,
        longitude: 32.90801911111111,
        pm2_5: 22.96970863432723,
        variance: 58.706449365001845
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546270344456,
        latitude: 2.253013666666667,
        longitude: 32.908076333333334,
        pm2_5: 22.96970863221106,
        variance: 58.70644939138293
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 15.017546350950312,
        latitude: 2.253013666666667,
        longitude: 32.90813355555556,
        pm2_5: 22.969708409510908,
        variance: 58.70645002159023
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 26.187922068431497,
        latitude: 6.410288888888888,
        longitude: 2.8887333333333336,
        pm2_5: 19.64276238308866,
        variance: 178.52125735689333
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 25.78264169961607,
        latitude: 6.410288888888888,
        longitude: 3.0711666666666666,
        pm2_5: 19.835274099275775,
        variance: 173.03847693949956
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 25.97345077392198,
        latitude: 6.410288888888888,
        longitude: 3.2536,
        pm2_5: 19.72889741917494,
        variance: 175.60915897161294
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 25.89528090170633,
        latitude: 6.410288888888888,
        longitude: 4.165766666666666,
        pm2_5: 19.76551992244097,
        variance: 174.55372057951809
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.8337825640035,
        latitude: 6.447377777777778,
        longitude: 2.8887333333333336,
        pm2_5: 19.795467018283603,
        variance: 173.7256147345406
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.792573793909547,
        latitude: 6.447377777777778,
        longitude: 3.0711666666666666,
        pm2_5: 19.81733433417392,
        variance: 173.1718197923442
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.774192528130683,
        latitude: 6.447377777777778,
        longitude: 3.2536,
        pm2_5: 19.83006307938925,
        variance: 172.925083422831
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.779800647075753,
        latitude: 6.447377777777778,
        longitude: 3.4360333333333335,
        pm2_5: 19.83302667188716,
        variance: 173.00034397203444
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.969760281638624,
        latitude: 6.447377777777778,
        longitude: 3.618466666666667,
        pm2_5: 19.72746798270627,
        variance: 175.55925892486857
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.892348366704905,
        latitude: 6.447377777777778,
        longitude: 3.8009000000000004,
        pm2_5: 19.7636560880496,
        variance: 174.51418782351266
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.7769872309176,
        latitude: 6.447377777777778,
        longitude: 3.9833333333333334,
        pm2_5: 19.832286126756088,
        variance: 172.96258608467542
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 25.831467904141878,
        latitude: 6.447377777777778,
        longitude: 4.165766666666666,
        pm2_5: 19.7932435066529,
        variance: 173.69448513190127
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.772495849583674,
        latitude: 6.484466666666666,
        longitude: 2.8887333333333336,
        pm2_5: 19.827424589836024,
        variance: 172.9023173461078
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.9668159602462,
        latitude: 6.484466666666666,
        longitude: 3.0711666666666666,
        pm2_5: 19.725784156668425,
        variance: 175.51945312195357
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.890299538857523,
        latitude: 6.484466666666666,
        longitude: 3.2536,
        pm2_5: 19.761482386564815,
        variance: 174.48657075483288
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.83014732257751,
        latitude: 6.484466666666666,
        longitude: 3.4360333333333335,
        pm2_5: 19.790664095512422,
        variance: 173.6767260271913
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.789863268912576,
        latitude: 6.484466666666666,
        longitude: 3.618466666666667,
        pm2_5: 19.811970039001295,
        variance: 173.1354246744081
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.771901918630174,
        latitude: 6.484466666666666,
        longitude: 3.8009000000000004,
        pm2_5: 19.82437617459074,
        variance: 172.8943483193184
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 25.964624946073695,
        latitude: 6.484466666666666,
        longitude: 3.9833333333333334,
        pm2_5: 19.723849209923394,
        variance: 175.4898345976344
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.889139692250918,
        latitude: 6.5215555555555556,
        longitude: 2.8887333333333336,
        pm2_5: 19.759003151312445,
        variance: 174.47093763142493
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.829824368773195,
        latitude: 6.5215555555555556,
        longitude: 3.0711666666666666,
        pm2_5: 19.787734051589073,
        variance: 173.67238310122593
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.79068399979061,
        latitude: 6.5215555555555556,
        longitude: 3.2536,
        pm2_5: 19.814847143656888,
        variance: 173.14644449631805
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.79552744559198,
        latitude: 6.5215555555555556,
        longitude: 3.4360333333333335,
        pm2_5: 19.81942644744113,
        variance: 173.21148380786371
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.83708509599007,
        latitude: 6.5215555555555556,
        longitude: 3.618466666666667,
        pm2_5: 19.79733008823417,
        variance: 173.77003494831115
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.899089618300767,
        latitude: 6.5215555555555556,
        longitude: 3.8009000000000004,
        pm2_5: 19.767070167914795,
        variance: 174.60507159953522
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 26.087792309871332,
        latitude: 6.5215555555555556,
        longitude: 3.9833333333333334,
        pm2_5: 19.68906342552347,
        variance: 177.158711891655
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 25.99547052401242,
        latitude: 6.5215555555555556,
        longitude: 4.165766666666666,
        pm2_5: 19.73202296137812,
        variance: 175.90704075510166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 25.7975966567983,
        latitude: 6.558644444444444,
        longitude: 3.2536,
        pm2_5: 19.839452525138885,
        variance: 173.23927354926354
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 26.180937631665703,
        latitude: 6.558644444444444,
        longitude: 3.4360333333333335,
        pm2_5: 19.642843709673446,
        variance: 178.42604520855093
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 26.08101259254974,
        latitude: 6.558644444444444,
        longitude: 3.618466666666667,
        pm2_5: 19.688903308581825,
        variance: 177.06664354767236
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 25.98890154638471,
        latitude: 6.558644444444444,
        longitude: 3.8009000000000004,
        pm2_5: 19.731633993840045,
        variance: 175.81814962194858
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 25.909294471537326,
        latitude: 6.558644444444444,
        longitude: 3.9833333333333334,
        pm2_5: 19.76921813619347,
        variance: 174.74269575511107
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 25.84661587730301,
        latitude: 6.558644444444444,
        longitude: 4.165766666666666,
        pm2_5: 19.799960450801688,
        variance: 173.89825913912227
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 25.80459097063124,
        latitude: 6.5957333333333334,
        longitude: 3.2536,
        pm2_5: 19.822408956716753,
        variance: 173.33322447979572
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 25.78583661929459,
        latitude: 6.5957333333333334,
        longitude: 3.4360333333333335,
        pm2_5: 19.835468268189747,
        variance: 173.0813645764665
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 25.791551983449402,
        latitude: 6.5957333333333334,
        longitude: 3.618466666666667,
        pm2_5: 19.83849031062027,
        variance: 173.1580991552928
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 26.1743323731468,
        latitude: 6.5957333333333334,
        longitude: 3.8009000000000004,
        pm2_5: 19.6427959014692,
        variance: 178.3360254008644
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 26.0747760874301,
        latitude: 6.5957333333333334,
        longitude: 3.9833333333333334,
        pm2_5: 19.68854566320859,
        variance: 176.9819731386965
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 25.983032893745474,
        latitude: 6.632822222222222,
        longitude: 3.2536,
        pm2_5: 19.730982469823424,
        variance: 175.73875425798087
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 25.90376477681245,
        latitude: 6.632822222222222,
        longitude: 3.4360333333333335,
        pm2_5: 19.768303726816153,
        variance: 174.6681147470922
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 25.84136666982222,
        latitude: 6.632822222222222,
        longitude: 3.618466666666667,
        pm2_5: 19.798828914933868,
        variance: 173.82763207106382
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 25.799536834700493,
        latitude: 6.632822222222222,
        longitude: 3.8009000000000004,
        pm2_5: 19.821119150608183,
        variance: 173.26533238365982
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 25.780872186749168,
        latitude: 6.632822222222222,
        longitude: 3.9833333333333334,
        pm2_5: 19.83408909991584,
        variance: 173.0147258198399
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 26.16811939512164,
        latitude: 6.669911111111111,
        longitude: 3.2536,
        pm2_5: 19.642619196345827,
        variance: 178.25137252117383
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 26.069096470407565,
        latitude: 6.669911111111111,
        longitude: 3.4360333333333335,
        pm2_5: 19.687991236756716,
        variance: 176.90488098277183
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 25.977878526196314,
        latitude: 6.669911111111111,
        longitude: 3.618466666666667,
        pm2_5: 19.73006967976786,
        variance: 175.6690370475353
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 25.790113864200578,
        latitude: 6.669911111111111,
        longitude: 3.8009000000000004,
        pm2_5: 19.80870899487679,
        variance: 173.13878933997057
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 25.772412384768224,
        latitude: 6.669911111111111,
        longitude: 3.9833333333333334,
        pm2_5: 19.820924214415534,
        variance: 172.90119745172706
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 5.453911111111111],
        type: 'Point'
      },
      properties: {
        interval: 22.427939597936284,
        latitude: 5.453911111111111,
        longitude: -2.270477777777778,
        pm2_5: 26.327973533329153,
        variance: 130.93827431504542
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 5.453911111111111],
        type: 'Point'
      },
      properties: {
        interval: 22.218688526268892,
        latitude: 5.453911111111111,
        longitude: -1.774666666666667,
        pm2_5: 26.408784123037094,
        variance: 128.50638271224307
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 5.453911111111111],
        type: 'Point'
      },
      properties: {
        interval: 22.208200465006257,
        latitude: 5.453911111111111,
        longitude: -1.2788555555555559,
        pm2_5: 26.393155627958002,
        variance: 128.3850916008705
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 5.453911111111111],
        type: 'Point'
      },
      properties: {
        interval: 22.15434232149029,
        latitude: 5.453911111111111,
        longitude: -0.7830444444444447,
        pm2_5: 26.37189541185034,
        variance: 127.76314132074549
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.06645928084311,
        latitude: 6.169022222222223,
        longitude: -2.766288888888889,
        pm2_5: 26.34947842252317,
        variance: 126.75151634556096
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 21.962302327746773,
        latitude: 6.169022222222223,
        longitude: -2.270477777777778,
        pm2_5: 26.33123514113853,
        variance: 125.55776851711562
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.179917331592506,
        latitude: 6.169022222222223,
        longitude: -1.774666666666667,
        pm2_5: 26.430122520876033,
        variance: 128.0582915546329
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.360348489864815,
        latitude: 6.169022222222223,
        longitude: -1.2788555555555559,
        pm2_5: 26.455368331795516,
        variance: 130.15024588405868
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.487203391128407,
        latitude: 6.169022222222223,
        longitude: -0.7830444444444447,
        pm2_5: 26.46124145348272,
        variance: 131.6311735615309
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.544430510825535,
        latitude: 6.169022222222223,
        longitude: -0.2872333333333339,
        pm2_5: 26.44844596279469,
        variance: 132.30199579795953
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.52721646159794,
        latitude: 6.169022222222223,
        longitude: 0.2085777777777773,
        pm2_5: 26.419663067642784,
        variance: 132.1000316294485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.7043888888888885, 6.169022222222223],
        type: 'Point'
      },
      properties: {
        interval: 22.43687016366083,
        latitude: 6.169022222222223,
        longitude: 0.7043888888888885,
        pm2_5: 26.379313496388324,
        variance: 131.04257151732963
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.28242836909917,
        latitude: 6.884133333333334,
        longitude: -2.766288888888889,
        pm2_5: 26.334497852620817,
        variance: 129.24474542483222
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.396663441740763,
        latitude: 6.884133333333334,
        longitude: -2.270477777777778,
        pm2_5: 26.433978399501918,
        variance: 130.57333749547252
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.55641723052568,
        latitude: 6.884133333333334,
        longitude: -1.774666666666667,
        pm2_5: 26.459338858186086,
        variance: 132.4427213342242
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.66858467319383,
        latitude: 6.884133333333334,
        longitude: -1.2788555555555559,
        pm2_5: 26.465926284145205,
        variance: 133.7632057178671
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.719149686709375,
        latitude: 6.884133333333334,
        longitude: -0.7830444444444447,
        pm2_5: 26.454283955491334,
        variance: 134.3606212221748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.703968940278262,
        latitude: 6.884133333333334,
        longitude: -0.2872333333333339,
        pm2_5: 26.42686654921927,
        variance: 134.18112391740942
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 6.884133333333334],
        type: 'Point'
      },
      properties: {
        interval: 22.62416231003063,
        latitude: 6.884133333333334,
        longitude: 0.2085777777777773,
        pm2_5: 26.38781507877796,
        variance: 133.23946278389485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.487555325752666,
        latitude: 7.5992444444444445,
        longitude: -2.766288888888889,
        pm2_5: 26.343917609603366,
        variance: 131.63529376530278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.552380577878743,
        latitude: 7.5992444444444445,
        longitude: -2.270477777777778,
        pm2_5: 26.413866074541822,
        variance: 132.3953221911397
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.630728260816994,
        latitude: 7.5992444444444445,
        longitude: -1.774666666666667,
        pm2_5: 26.428292450566055,
        variance: 133.31681112425576
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.68866384697653,
        latitude: 7.5992444444444445,
        longitude: -1.2788555555555559,
        pm2_5: 26.432842868010674,
        variance: 134.00027779079028
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.715676561067916,
        latitude: 7.5992444444444445,
        longitude: -0.7830444444444447,
        pm2_5: 26.42705440153638,
        variance: 134.31954436355954
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.184119480209784,
        latitude: 7.5992444444444445,
        longitude: -0.2872333333333339,
        pm2_5: 26.415667684454867,
        variance: 128.1068193232568
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 7.5992444444444445],
        type: 'Point'
      },
      properties: {
        interval: 22.707522771999187,
        latitude: 7.5992444444444445,
        longitude: 0.2085777777777773,
        pm2_5: 26.41224299180032,
        variance: 134.22313370493066
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.110203920177,
        latitude: 8.314355555555554,
        longitude: -2.270477777777778,
        pm2_5: 26.412248599902597,
        variance: 127.25455992081697
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 21.91314491036014,
        latitude: 8.314355555555554,
        longitude: -1.774666666666667,
        pm2_5: 26.36966181332966,
        variance: 124.99633482466743
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.331932961881595,
        latitude: 8.314355555555554,
        longitude: -1.2788555555555559,
        pm2_5: 26.318786901705067,
        variance: 129.81966623645712
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.28290774664849,
        latitude: 8.314355555555554,
        longitude: -0.7830444444444447,
        pm2_5: 26.326937812583036,
        variance: 129.25030655082446
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.297984818270987,
        latitude: 8.314355555555554,
        longitude: -0.2872333333333339,
        pm2_5: 26.350364732283886,
        variance: 129.42527253119624
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.375375663199772,
        latitude: 8.314355555555554,
        longitude: 0.2085777777777773,
        pm2_5: 26.324027282739046,
        variance: 130.32523846035838
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.7043888888888885, 8.314355555555554],
        type: 'Point'
      },
      properties: {
        interval: 22.182335128883963,
        latitude: 8.314355555555554,
        longitude: 0.7043888888888885,
        pm2_5: 26.287558804796348,
        variance: 128.08621193516228
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 22.011790875260267,
        latitude: 9.029466666666668,
        longitude: -2.766288888888889,
        pm2_5: 26.272785638290067,
        variance: 126.12425487718428
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 21.922409567649638,
        latitude: 9.029466666666668,
        longitude: -2.270477777777778,
        pm2_5: 26.286389486090997,
        variance: 125.1020515545024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 21.95008768894214,
        latitude: 9.029466666666668,
        longitude: -1.774666666666667,
        pm2_5: 26.32484364608921,
        variance: 125.41814596841141
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 22.083371517938385,
        latitude: 9.029466666666668,
        longitude: -1.2788555555555559,
        pm2_5: 26.375398114158497,
        variance: 126.94588129927433
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 22.271653009105396,
        latitude: 9.029466666666668,
        longitude: -0.7830444444444447,
        pm2_5: 26.42269084646207,
        variance: 129.11977503071466
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 22.456989022380032,
        latitude: 9.029466666666668,
        longitude: -0.2872333333333339,
        pm2_5: 26.45545303570918,
        variance: 131.27768532676419
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 9.029466666666668],
        type: 'Point'
      },
      properties: {
        interval: 22.157547726742116,
        latitude: 9.029466666666668,
        longitude: 0.2085777777777773,
        pm2_5: 26.323337200283305,
        variance: 127.8001148643416
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 21.9736785204381,
        latitude: 9.744577777777778,
        longitude: -2.766288888888889,
        pm2_5: 26.29289385232149,
        variance: 125.68787685328061
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 21.81426018722156,
        latitude: 9.744577777777778,
        longitude: -2.270477777777778,
        pm2_5: 26.28156362397811,
        variance: 123.87076934501238
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 21.731762468137596,
        latitude: 9.744577777777778,
        longitude: -1.774666666666667,
        pm2_5: 26.294288787935738,
        variance: 122.93562577351986
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 21.757288398216485,
        latitude: 9.744577777777778,
        longitude: -1.2788555555555559,
        pm2_5: 26.327762982599523,
        variance: 123.22459351394355
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 21.880956454476596,
        latitude: 9.744577777777778,
        longitude: -0.7830444444444447,
        pm2_5: 26.371395746322605,
        variance: 124.62938758920791
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 22.058395832425028,
        latitude: 9.744577777777778,
        longitude: -0.2872333333333339,
        pm2_5: 26.41238322318307,
        variance: 126.65889907849487
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2085777777777773, 9.744577777777778],
        type: 'Point'
      },
      properties: {
        interval: 22.000890425132436,
        latitude: 9.744577777777778,
        longitude: 0.2085777777777773,
        pm2_5: 26.354045834475702,
        variance: 125.99936992364746
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.766288888888889, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 21.941441762581725,
        latitude: 10.459688888888888,
        longitude: -2.766288888888889,
        pm2_5: 26.345421686477167,
        variance: 125.31936344772112
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-2.270477777777778, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 21.893356293047724,
        latitude: 10.459688888888888,
        longitude: -2.270477777777778,
        pm2_5: 26.342728121284154,
        variance: 124.77068142813732
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.774666666666667, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 21.8695935425824,
        latitude: 10.459688888888888,
        longitude: -1.774666666666667,
        pm2_5: 26.346809931857212,
        variance: 124.49997962249108
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-1.2788555555555559, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 21.87688515419095,
        latitude: 10.459688888888888,
        longitude: -1.2788555555555559,
        pm2_5: 26.35665466136615,
        variance: 124.58301334070711
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.7830444444444447, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 21.96829047145421,
        latitude: 10.459688888888888,
        longitude: -0.7830444444444447,
        pm2_5: 26.382483457602458,
        variance: 125.62624589707048
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2872333333333339, 10.459688888888888],
        type: 'Point'
      },
      properties: {
        interval: 22.66544459516127,
        latitude: 10.459688888888888,
        longitude: -0.2872333333333339,
        pm2_5: 26.39126595076182,
        variance: 133.72615022290847
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 5.354577777777777],
        type: 'Point'
      },
      properties: {
        interval: 30.934955570305117,
        latitude: 5.354577777777777,
        longitude: 6.671,
        pm2_5: 53.190891019942136,
        variance: 249.10752710765087
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 5.354577777777777],
        type: 'Point'
      },
      properties: {
        interval: 30.806506933208016,
        latitude: 5.354577777777777,
        longitude: 8.0052,
        pm2_5: 53.40640827442528,
        variance: 247.04312511083754
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 6.421755555555555],
        type: 'Point'
      },
      properties: {
        interval: 30.826524999348955,
        latitude: 6.421755555555555,
        longitude: 5.3368,
        pm2_5: 53.278275493510925,
        variance: 247.36428663460174
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 6.421755555555555],
        type: 'Point'
      },
      properties: {
        interval: 30.722349466782266,
        latitude: 6.421755555555555,
        longitude: 6.671,
        pm2_5: 53.29148617707245,
        variance: 245.69521989772397
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 6.421755555555555],
        type: 'Point'
      },
      properties: {
        interval: 30.65081175796114,
        latitude: 6.421755555555555,
        longitude: 8.0052,
        pm2_5: 53.42708009282069,
        variance: 244.55233793783032
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 6.421755555555555],
        type: 'Point'
      },
      properties: {
        interval: 30.724964441108817,
        latitude: 6.421755555555555,
        longitude: 9.339400000000001,
        pm2_5: 53.477830168068856,
        variance: 245.73704703961926
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 30.827700966585393,
        latitude: 7.488933333333334,
        longitude: 4.0026,
        pm2_5: 53.36405971640517,
        variance: 247.38315985141867
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 30.804532407428503,
        latitude: 7.488933333333334,
        longitude: 5.3368,
        pm2_5: 53.26308163390535,
        variance: 247.0114579446879
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 30.68947579921092,
        latitude: 7.488933333333334,
        longitude: 6.671,
        pm2_5: 53.3259482274111,
        variance: 245.1697013823284
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 30.82833674813729,
        latitude: 7.488933333333334,
        longitude: 8.0052,
        pm2_5: 52.7872862694618,
        variance: 247.39336387352978
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 30.78191299178679,
        latitude: 7.488933333333334,
        longitude: 9.339400000000001,
        pm2_5: 53.078509989942596,
        variance: 246.64883575435556
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 7.488933333333334],
        type: 'Point'
      },
      properties: {
        interval: 31.011084445060824,
        latitude: 7.488933333333334,
        longitude: 10.6736,
        pm2_5: 53.04648758332706,
        variance: 250.33510996946416
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 31.152079681357034,
        latitude: 8.556111111111111,
        longitude: 4.0026,
        pm2_5: 52.746841988384176,
        variance: 252.61663590004628
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 31.005696836950733,
        latitude: 8.556111111111111,
        longitude: 5.3368,
        pm2_5: 52.64027711135535,
        variance: 250.24813524179945
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 30.77913553375189,
        latitude: 8.556111111111111,
        longitude: 6.671,
        pm2_5: 52.87996643684081,
        variance: 246.60432741697946
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 30.83286683138022,
        latitude: 8.556111111111111,
        longitude: 8.0052,
        pm2_5: 53.11482265054603,
        variance: 247.46607586464665
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 31.077402354450474,
        latitude: 8.556111111111111,
        longitude: 9.339400000000001,
        pm2_5: 52.966920862654035,
        variance: 251.40694947428256
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 31.57700781343521,
        latitude: 8.556111111111111,
        longitude: 10.6736,
        pm2_5: 50.86903450816461,
        variance: 259.5552432449365
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [12.007800000000001, 8.556111111111111],
        type: 'Point'
      },
      properties: {
        interval: 31.52954640514419,
        latitude: 8.556111111111111,
        longitude: 12.007800000000001,
        pm2_5: 51.21398232297085,
        variance: 258.77558738914536
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.76087526435996,
        latitude: 9.623288888888888,
        longitude: 4.0026,
        pm2_5: 51.18120959591315,
        variance: 262.5867340582654
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.89940707573023,
        latitude: 9.623288888888888,
        longitude: 5.3368,
        pm2_5: 50.831633828424906,
        variance: 264.88238540794146
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.526691771967858,
        latitude: 9.623288888888888,
        longitude: 6.671,
        pm2_5: 50.9767383627222,
        variance: 258.7287312798485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.54131621483929,
        latitude: 9.623288888888888,
        longitude: 8.0052,
        pm2_5: 51.506131907999546,
        variance: 258.9688225126208
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.581630696856283,
        latitude: 9.623288888888888,
        longitude: 9.339400000000001,
        pm2_5: 51.259030755544465,
        variance: 259.63124673901893
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.596073675645048,
        latitude: 9.623288888888888,
        longitude: 10.6736,
        pm2_5: 51.785809962729076,
        variance: 259.86877127155094
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [12.007800000000001, 9.623288888888888],
        type: 'Point'
      },
      properties: {
        interval: 31.149965050778512,
        latitude: 9.623288888888888,
        longitude: 12.007800000000001,
        pm2_5: 51.95979462467754,
        variance: 252.5823413850278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 31.06145747477434,
        latitude: 10.690466666666666,
        longitude: 4.0026,
        pm2_5: 52.92722989600115,
        variance: 251.14903697865861
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 31.439983910743443,
        latitude: 10.690466666666666,
        longitude: 5.3368,
        pm2_5: 51.43524009383236,
        variance: 257.30752506971226
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 31.686833962523963,
        latitude: 10.690466666666666,
        longitude: 6.671,
        pm2_5: 51.40006109794846,
        variance: 261.3638709310085
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 31.83422779854411,
        latitude: 10.690466666666666,
        longitude: 8.0052,
        pm2_5: 51.033939549233814,
        variance: 263.8010359042062
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 31.68113004440436,
        latitude: 10.690466666666666,
        longitude: 9.339400000000001,
        pm2_5: 50.90101054903377,
        variance: 261.26978365536775
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 32.064337074853434,
        latitude: 10.690466666666666,
        longitude: 10.6736,
        pm2_5: 49.81646862710389,
        variance: 267.6285172974335
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [12.007800000000001, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 32.0511067623968,
        latitude: 10.690466666666666,
        longitude: 12.007800000000001,
        pm2_5: 49.92716480732905,
        variance: 267.4077063448974
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [13.342, 10.690466666666666],
        type: 'Point'
      },
      properties: {
        interval: 32.11765962177774,
        latitude: 10.690466666666666,
        longitude: 13.342,
        pm2_5: 49.91877619321764,
        variance: 268.5193824397054
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 32.16023404902299,
        latitude: 11.757644444444445,
        longitude: 4.0026,
        pm2_5: 49.80540446133756,
        variance: 269.2317404435489
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 32.11605514496128,
        latitude: 11.757644444444445,
        longitude: 5.3368,
        pm2_5: 49.76109384061241,
        variance: 268.49255468403635
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 32.05031896243075,
        latitude: 11.757644444444445,
        longitude: 6.671,
        pm2_5: 49.851632233422684,
        variance: 267.3945610145638
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 32.08515602304354,
        latitude: 11.757644444444445,
        longitude: 8.0052,
        pm2_5: 50.177490984123665,
        variance: 267.9761654058327
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.339400000000001, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 32.108397319023034,
        latitude: 11.757644444444445,
        longitude: 9.339400000000001,
        pm2_5: 49.97720463723148,
        variance: 268.36452998652794
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 31.985400071578173,
        latitude: 11.757644444444445,
        longitude: 10.6736,
        pm2_5: 49.99058592125353,
        variance: 266.3124265251231
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [12.007800000000001, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 31.897994652085753,
        latitude: 11.757644444444445,
        longitude: 12.007800000000001,
        pm2_5: 50.20126954394354,
        variance: 264.8589293066668
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [13.342, 11.757644444444445],
        type: 'Point'
      },
      properties: {
        interval: 31.988555759851224,
        latitude: 11.757644444444445,
        longitude: 13.342,
        pm2_5: 50.28826246580127,
        variance: 266.3649780302767
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.0026, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 32.109757616904034,
        latitude: 12.824822222222222,
        longitude: 4.0026,
        pm2_5: 50.11140908645246,
        variance: 268.38726942324206
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [5.3368, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 32.08285147991434,
        latitude: 12.824822222222222,
        longitude: 5.3368,
        pm2_5: 49.952269608496664,
        variance: 267.9376715645153
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [6.671, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 31.546019145876375,
        latitude: 12.824822222222222,
        longitude: 6.671,
        pm2_5: 51.906080138473484,
        variance: 259.04605475635117
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [8.0052, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 31.593325218454105,
        latitude: 12.824822222222222,
        longitude: 8.0052,
        pm2_5: 51.54850938263777,
        variance: 259.82356267154523
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [10.6736, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 31.33828609515104,
        latitude: 12.824822222222222,
        longitude: 10.6736,
        pm2_5: 51.57733148443192,
        variance: 255.64561000144136
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [12.007800000000001, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 31.34497178421228,
        latitude: 12.824822222222222,
        longitude: 12.007800000000001,
        pm2_5: 52.11443613171029,
        variance: 255.75470016479176
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [13.342, 12.824822222222222],
        type: 'Point'
      },
      properties: {
        interval: 31.826398836591242,
        latitude: 12.824822222222222,
        longitude: 13.342,
        pm2_5: 51.08804094557188,
        variance: 263.6712991737236
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.295919093969935],
        type: 'Point'
      },
      properties: {
        interval: 43.04822117902567,
        latitude: -1.295919093969935,
        longitude: 29.990265891066276,
        pm2_5: 47.376536411375,
        variance: 482.3899798725306
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.295919093969935],
        type: 'Point'
      },
      properties: {
        interval: 43.08255551705848,
        latitude: -1.295919093969935,
        longitude: 30.00039152110056,
        pm2_5: 47.37957883831037,
        variance: 483.15977454196855
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 43.08021606128776,
        latitude: -1.2871811453663708,
        longitude: 29.93963774089484,
        pm2_5: 47.37949024716034,
        variance: 483.10730317764364
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 43.102860722598585,
        latitude: -1.2871811453663708,
        longitude: 29.94976337092913,
        pm2_5: 47.380748042365646,
        variance: 483.61531717818934
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 43.10066356686275,
        latitude: -1.2871811453663708,
        longitude: 29.990265891066276,
        pm2_5: 47.38067400189935,
        variance: 483.566014135748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 43.09842549805948,
        latitude: -1.2784431967628067,
        longitude: 29.93963774089484,
        pm2_5: 47.38059656962089,
        variance: 483.51579560906475
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 43.09614670244378,
        latitude: -1.2784431967628067,
        longitude: 29.94976337092913,
        pm2_5: 47.38051575255778,
        variance: 483.4646659200739
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 43.09382736989732,
        latitude: -1.2784431967628067,
        longitude: 29.959889000963415,
        pm2_5: 47.380431558051505,
        variance: 483.4126294737898
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 43.09146769392428,
        latitude: -1.2784431967628067,
        longitude: 29.980140261031988,
        pm2_5: 47.38034399376078,
        variance: 483.35969075815274
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 43.0848558593045,
        latitude: -1.2784431967628067,
        longitude: 29.990265891066276,
        pm2_5: 47.37966415437456,
        variance: 483.2113714121838
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.08906787164969,
        latitude: -1.2697052481592426,
        longitude: 29.93963774089484,
        pm2_5: 47.38025306764981,
        variance: 483.3058543439279
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.107436258314976,
        latitude: -1.2697052481592426,
        longitude: 29.94976337092913,
        pm2_5: 47.38136228395825,
        variance: 483.71799790834257
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.10510052495793,
        latitude: -1.2697052481592426,
        longitude: 29.959889000963415,
        pm2_5: 47.381279402079066,
        variance: 483.66557977580396
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.102723219007466,
        latitude: -1.2697052481592426,
        longitude: 29.970014630997703,
        pm2_5: 47.38119305604866,
        variance: 483.6122315947432
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.10030453760592,
        latitude: -1.2697052481592426,
        longitude: 29.980140261031988,
        pm2_5: 47.381103253692544,
        variance: 483.5579579431419
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.09784468159488,
        latitude: -1.2697052481592426,
        longitude: 29.990265891066276,
        pm2_5: 47.38101000315049,
        variance: 483.5027634836724
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.1187198727407,
        latitude: -1.2697052481592426,
        longitude: 30.00039152110056,
        pm2_5: 47.38220340666536,
        variance: 483.9712628758548
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 43.11637032270369,
        latitude: -1.2697052481592426,
        longitude: 30.01051715113485,
        pm2_5: 47.38212202762603,
        variance: 483.9185208778954
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.11397797216457,
        latitude: -1.2609672995556784,
        longitude: 29.94976337092913,
        pm2_5: 47.38203709044353,
        variance: 483.8648210600509
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.10973022563596,
        latitude: -1.2609672995556784,
        longitude: 29.959889000963415,
        pm2_5: 47.38144169418157,
        variance: 483.7694814991437
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.11154301804596,
        latitude: -1.2609672995556784,
        longitude: 29.970014630997703,
        pm2_5: 47.3819486027796,
        variance: 483.81016800208954
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.08711689470107,
        latitude: -1.2609672995556784,
        longitude: 29.980140261031988,
        pm2_5: 47.379746187564294,
        variance: 483.26208931112933
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.09152028935397,
        latitude: -1.2609672995556784,
        longitude: 29.990265891066276,
        pm2_5: 47.37990037569289,
        variance: 483.3608706913278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.046161422654855,
        latitude: -1.2609672995556784,
        longitude: 30.00039152110056,
        pm2_5: 47.37646018765402,
        variance: 482.34381851969465
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 43.06754720169958,
        latitude: -1.2609672995556784,
        longitude: 30.01051715113485,
        pm2_5: 47.377674095783895,
        variance: 482.823204386355
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.06560941390407,
        latitude: -1.2522293509521143,
        longitude: 29.94976337092913,
        pm2_5: 47.377610750734284,
        variance: 482.77975692184054
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.057491332294674,
        latitude: -1.2522293509521143,
        longitude: 29.959889000963415,
        pm2_5: 47.377326972315096,
        variance: 482.59776130534965
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.07702902406541,
        latitude: -1.2522293509521143,
        longitude: 29.970014630997703,
        pm2_5: 47.37846900496827,
        variance: 483.03582609854584
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.075036215982685,
        latitude: -1.2522293509521143,
        longitude: 29.980140261031988,
        pm2_5: 47.37840382358564,
        variance: 482.9911352062213
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.07300547963356,
        latitude: -1.2522293509521143,
        longitude: 29.990265891066276,
        pm2_5: 47.37833550746194,
        variance: 482.94559585811703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.0688309132457,
        latitude: -1.2522293509521143,
        longitude: 30.00039152110056,
        pm2_5: 47.37818949633134,
        variance: 482.85198777429923
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 43.08933843346413,
        latitude: -1.2522293509521143,
        longitude: 30.01051715113485,
        pm2_5: 47.37982493039766,
        variance: 483.3119238425679
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.06668743723755,
        latitude: -1.2434914023485502,
        longitude: 29.959889000963415,
        pm2_5: 47.37811181472024,
        variance: 482.80392722217675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.08438730870475,
        latitude: -1.2434914023485502,
        longitude: 29.970014630997703,
        pm2_5: 47.37919109467556,
        variance: 483.2008615593709
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.08230079198742,
        latitude: -1.2434914023485502,
        longitude: 29.980140261031988,
        pm2_5: 47.379120861933316,
        variance: 483.15406120660145
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.08017546196304,
        latitude: -1.2434914023485502,
        longitude: 29.990265891066276,
        pm2_5: 47.37904741256026,
        variance: 483.1063926055608
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.078011497678936,
        latitude: -1.2434914023485502,
        longitude: 30.00039152110056,
        pm2_5: 47.378970753272355,
        variance: 483.0578599006035
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 43.07580908165073,
        latitude: -1.2434914023485502,
        longitude: 30.01051715113485,
        pm2_5: 47.37889089108203,
        variance: 483.0084673153956
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 43.073568399858765,
        latitude: -1.234753453744986,
        longitude: 29.959889000963415,
        pm2_5: 47.37880783329944,
        variance: 482.95821915277793
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 43.071289641743995,
        latitude: -1.234753453744986,
        longitude: 29.970014630997703,
        pm2_5: 47.37872158753046,
        variance: 482.90711979461776
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 43.093662279679755,
        latitude: -1.234753453744986,
        longitude: 29.980140261031988,
        pm2_5: 47.37997251658035,
        variance: 483.40892562346244
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 43.08643483654061,
        latitude: -1.234753453744986,
        longitude: 29.990265891066276,
        pm2_5: 47.37925810437388,
        variance: 483.24678959898483
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 43.10906566104786,
        latitude: -1.234753453744986,
        longitude: 30.00039152110056,
        pm2_5: 47.38185657262651,
        variance: 483.7545663704018
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.2355890161111789],
        type: 'Point'
      },
      properties: {
        interval: 19.679795795550195,
        latitude: 0.2355890161111789,
        longitude: 32.61595805366672,
        pm2_5: 25.446593633605268,
        variance: 100.81590029012784
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.2355890161111789],
        type: 'Point'
      },
      properties: {
        interval: 19.67979542573977,
        latitude: 0.2355890161111789,
        longitude: 32.6335582984445,
        pm2_5: 25.447037665407937,
        variance: 100.81589650118906
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 19.679776360871994,
        latitude: 0.25685871222228546,
        longitude: 32.61595805366672,
        pm2_5: 25.447871203749507,
        variance: 100.81570116980845
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 19.679757577657313,
        latitude: 0.25685871222228546,
        longitude: 32.6335582984445,
        pm2_5: 25.448687204849797,
        variance: 100.81550872432331
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 19.679739094489673,
        latitude: 0.25685871222228546,
        longitude: 32.65115854322227,
        pm2_5: 25.449484910080173,
        variance: 100.8153193531823
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.679720929761405,
        latitude: 0.278128408333392,
        longitude: 32.54555707455562,
        pm2_5: 25.45026356952657,
        variance: 100.81513324481705
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.67982652699416,
        latitude: 0.278128408333392,
        longitude: 32.56315731933339,
        pm2_5: 25.445755404227537,
        variance: 100.81621515321297
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.679807012289643,
        latitude: 0.278128408333392,
        longitude: 32.58075756411117,
        pm2_5: 25.44661900508023,
        variance: 100.81601521266259
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.679787743266353,
        latitude: 0.278128408333392,
        longitude: 32.59835780888895,
        pm2_5: 25.447466608714983,
        variance: 100.81581778946702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.679814753897862,
        latitude: 0.278128408333392,
        longitude: 32.61595805366672,
        pm2_5: 25.446187355857546,
        variance: 100.81609453033525
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.679768738100464,
        latitude: 0.278128408333392,
        longitude: 32.6335582984445,
        pm2_5: 25.44829744877935,
        variance: 100.81562306984495
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 19.67973159231178,
        latitude: 0.278128408333392,
        longitude: 32.65115854322227,
        pm2_5: 25.44990580480684,
        variance: 100.81524248891981
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.52795682977784, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.67980004286731,
        latitude: 0.29939810444449855,
        longitude: 32.52795682977784,
        pm2_5: 25.447011471990866,
        variance: 100.8159438065494
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.67978085112341,
        latitude: 0.29939810444449855,
        longitude: 32.54555707455562,
        pm2_5: 25.447855618195597,
        variance: 100.8157471751988
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.679761923646463,
        latitude: 0.29939810444449855,
        longitude: 32.56315731933339,
        pm2_5: 25.44868302068543,
        variance: 100.81555325161526
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.679743278522913,
        latitude: 0.29939810444449855,
        longitude: 32.58075756411117,
        pm2_5: 25.44949292594239,
        variance: 100.81536222109742
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.679724933863852,
        latitude: 0.29939810444449855,
        longitude: 32.59835780888895,
        pm2_5: 25.450284587906925,
        variance: 100.81517426919584
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.67979385796469,
        latitude: 0.29939810444449855,
        longitude: 32.61595805366672,
        pm2_5: 25.447364129845578,
        variance: 100.81588043835507
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.679774761621946,
        latitude: 0.29939810444449855,
        longitude: 32.6335582984445,
        pm2_5: 25.44820406822159,
        variance: 100.81568478450959
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 19.6797500150278,
        latitude: 0.29939810444449855,
        longitude: 32.65115854322227,
        pm2_5: 25.449110765067488,
        variance: 100.81543124062546
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.52795682977784, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.679755929792126,
        latitude: 0.32066780055560506,
        longitude: 32.52795682977784,
        pm2_5: 25.449027295121414,
        variance: 100.81549184094865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.679834327046382,
        latitude: 0.32066780055560506,
        longitude: 32.54555707455562,
        pm2_5: 25.44532104723299,
        variance: 100.81629506976083
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.67972921873639,
        latitude: 0.32066780055560506,
        longitude: 32.56315731933339,
        pm2_5: 25.44980319325093,
        variance: 100.81521817023815
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.67977724579911,
        latitude: 0.32066780055560506,
        longitude: 32.58075756411117,
        pm2_5: 25.44739490446756,
        variance: 100.81571023643073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.67978507869251,
        latitude: 0.32066780055560506,
        longitude: 32.59835780888895,
        pm2_5: 25.4471753090143,
        variance: 100.81579048925664
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.679766519500454,
        latitude: 0.32066780055560506,
        longitude: 32.61595805366672,
        pm2_5: 25.44797674618375,
        variance: 100.81560033893459
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.67974827692401,
        latitude: 0.32066780055560506,
        longitude: 32.6335582984445,
        pm2_5: 25.448759149101242,
        variance: 100.81541343270862
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 19.67985213330533,
        latitude: 0.32066780055560506,
        longitude: 32.65115854322227,
        pm2_5: 25.44433987085841,
        variance: 100.81647750644584
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.679832497944343,
        latitude: 0.3419374966667116,
        longitude: 32.54555707455562,
        pm2_5: 25.445209311361218,
        variance: 100.81627632943207
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.67981310580868,
        latitude: 0.3419374966667116,
        longitude: 32.56315731933339,
        pm2_5: 25.446062782347013,
        variance: 100.8160776446166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.679793975379347,
        latitude: 0.3419374966667116,
        longitude: 32.58075756411117,
        pm2_5: 25.446899502748387,
        variance: 100.81588164134143
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.679854126979077,
        latitude: 0.3419374966667116,
        longitude: 32.59835780888895,
        pm2_5: 25.444439516480546,
        variance: 100.8164979329382
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.679775125206344,
        latitude: 0.3419374966667116,
        longitude: 32.61595805366672,
        pm2_5: 25.447718697505163,
        variance: 100.81568850965493
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 19.67973833998069,
        latitude: 0.3419374966667116,
        longitude: 32.6335582984445,
        pm2_5: 25.449301447847215,
        variance: 100.81531162278895
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 19.679862706619392,
        latitude: 0.36320719277781816,
        longitude: 32.56315731933339,
        pm2_5: 25.44396549362851,
        variance: 100.81658583699209
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 19.679842867412045,
        latitude: 0.36320719277781816,
        longitude: 32.58075756411117,
        pm2_5: 25.444848955938067,
        variance: 100.81638257133193
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 19.67982325406994,
        latitude: 0.36320719277781816,
        longitude: 32.59835780888895,
        pm2_5: 25.44571721027083,
        variance: 100.81618162001041
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 19.679803884897776,
        latitude: 0.36320719277781816,
        longitude: 32.61595805366672,
        pm2_5: 25.44656947483227,
        variance: 100.81598317056375
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 19.67978477829698,
        latitude: 0.36320719277781816,
        longitude: 32.6335582984445,
        pm2_5: 25.447404972580085,
        variance: 100.8157874115185
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 19.679765952735142,
        latitude: 0.38447688888892473,
        longitude: 32.56315731933339,
        pm2_5: 25.448222932527532,
        variance: 100.81559453207865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 19.679747426713973,
        latitude: 0.38447688888892473,
        longitude: 32.58075756411117,
        pm2_5: 25.449022591058565,
        variance: 100.815404721797
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 19.67975657387661,
        latitude: 0.38447688888892473,
        longitude: 32.59835780888895,
        pm2_5: 25.448519598890698,
        variance: 100.81549843998323
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 19.67973738039084,
        latitude: 0.38447688888892473,
        longitude: 32.61595805366672,
        pm2_5: 25.449833064562146,
        variance: 100.81530179122046
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.36139841750257884],
        type: 'Point'
      },
      properties: {
        interval: 43.2586953474801,
        latitude: -0.36139841750257884,
        longitude: 34.8274887932674,
        pm2_5: 47.36205757938516,
        variance: 487.11857641766346
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.36139841750257884],
        type: 'Point'
      },
      properties: {
        interval: 42.813559073716746,
        latitude: -0.36139841750257884,
        longitude: 34.930594550238986,
        pm2_5: 47.321515520411,
        variance: 477.14515841280536
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.3124584332107806],
        type: 'Point'
      },
      properties: {
        interval: 42.95280623476852,
        latitude: -0.3124584332107806,
        longitude: 34.8274887932674,
        pm2_5: 47.33307855553723,
        variance: 480.2539471682553
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.3124584332107806],
        type: 'Point'
      },
      properties: {
        interval: 43.08237102773303,
        latitude: -0.3124584332107806,
        longitude: 34.930594550238986,
        pm2_5: 47.34430293167378,
        variance: 483.1556365502006
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 43.201398884942016,
        latitude: -0.2635184489189823,
        longitude: 34.51817152235265,
        pm2_5: 47.35508075930468,
        variance: 485.8290466513613
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 43.309170058896925,
        latitude: -0.2635184489189823,
        longitude: 34.72438303629582,
        pm2_5: 47.3653121970278,
        variance: 488.25599000167995
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 43.40508663318851,
        latitude: -0.2635184489189823,
        longitude: 34.8274887932674,
        pm2_5: 47.37490585864976,
        variance: 490.4210604005102
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 43.48865929260765,
        latitude: -0.2635184489189823,
        longitude: 34.930594550238986,
        pm2_5: 47.38377904422512,
        variance: 492.3114033393663
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 43.57218881741757,
        latitude: -0.2635184489189823,
        longitude: 35.033700307210566,
        pm2_5: 47.39318601727913,
        variance: 494.20440398289475
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 43.559494482603874,
        latitude: -0.21457846462718402,
        longitude: 34.51817152235265,
        pm2_5: 47.391857824140374,
        variance: 493.91648260620514
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 42.932651337917946,
        latitude: -0.21457846462718402,
        longitude: 34.62127727932423,
        pm2_5: 47.33119346261758,
        variance: 479.80335040171485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 43.06320813707022,
        latitude: -0.21457846462718402,
        longitude: 34.72438303629582,
        pm2_5: 47.342488485974684,
        variance: 482.725920204246
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 43.1831351325859,
        latitude: -0.21457846462718402,
        longitude: 34.8274887932674,
        pm2_5: 47.3533335254395,
        variance: 485.41835690315884
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 43.29171024326695,
        latitude: -0.21457846462718402,
        longitude: 34.930594550238986,
        pm2_5: 47.36362819096524,
        variance: 487.86239478003563
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 43.388334122732665,
        latitude: -0.21457846462718402,
        longitude: 35.033700307210566,
        pm2_5: 47.373280616496686,
        variance: 490.04257026912956
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 43.472516714673795,
        latitude: -0.16563848033538575,
        longitude: 34.51817152235265,
        pm2_5: 47.38220768793714,
        variance: 491.9459885223846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 42.769682403223214,
        latitude: -0.16563848033538575,
        longitude: 34.62127727932423,
        pm2_5: 47.31756671741667,
        variance: 476.16767307178816
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 42.79232276927488,
        latitude: -0.16563848033538575,
        longitude: 34.72438303629582,
        pm2_5: 47.31955696398038,
        variance: 476.671930442993
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 43.419196158410145,
        latitude: -0.16563848033538575,
        longitude: 34.8274887932674,
        pm2_5: 47.37637369475564,
        variance: 490.7399508128119
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 43.32417326137902,
        latitude: -0.16563848033538575,
        longitude: 34.930594550238986,
        pm2_5: 47.366860094363616,
        variance: 488.59433277332073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 43.21741939572373,
        latitude: -0.16563848033538575,
        longitude: 35.033700307210566,
        pm2_5: 47.356714837230165,
        variance: 486.18943649153425
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.23991182115373, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 43.35930841373021,
        latitude: -0.16563848033538575,
        longitude: 35.23991182115373,
        pm2_5: 47.37163469897831,
        variance: 489.387137160812
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.25182683293297,
        latitude: -0.11669849604358745,
        longitude: 34.51817152235265,
        pm2_5: 47.360906465995654,
        variance: 486.9639015998596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.3542797665865,
        latitude: -0.11669849604358745,
        longitude: 34.62127727932423,
        pm2_5: 47.37065844003382,
        variance: 489.27362923767487
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 42.86848489773585,
        latitude: -0.11669849604358745,
        longitude: 34.72438303629582,
        pm2_5: 47.32715726910831,
        variance: 478.37020965936244
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.127747050201656,
        latitude: -0.11669849604358745,
        longitude: 34.8274887932674,
        pm2_5: 47.34919979013083,
        variance: 484.1739289947359
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.2426496854335,
        latitude: -0.11669849604358745,
        longitude: 34.930594550238986,
        pm2_5: 47.35963059245458,
        variance: 486.75727608733905
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.34674136650759,
        latitude: -0.11669849604358745,
        longitude: 35.033700307210566,
        pm2_5: 47.369535787391,
        variance: 489.1034951829706
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.13680606418215, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 43.439428102437326,
        latitude: -0.11669849604358745,
        longitude: 35.13680606418215,
        pm2_5: 47.37882640479518,
        variance: 491.1973953214342
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.23991182115373, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 42.85167307831934,
        latitude: -0.11669849604358745,
        longitude: 35.23991182115373,
        pm2_5: 47.32531992708509,
        variance: 477.9950764293935
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 42.98788080447684,
        latitude: -0.06775851175178921,
        longitude: 34.51817152235265,
        pm2_5: 47.336655904386596,
        variance: 481.0386026811507
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 43.114663704663826,
        latitude: -0.06775851175178921,
        longitude: 34.62127727932423,
        pm2_5: 47.34766208144139,
        variance: 483.8802130274512
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 43.23117561897483,
        latitude: -0.06775851175178921,
        longitude: 34.72438303629582,
        pm2_5: 47.35823245993582,
        variance: 486.4989966156404
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 43.3367019554107,
        latitude: -0.06775851175178921,
        longitude: 34.8274887932674,
        pm2_5: 47.36826886471107,
        variance: 488.8769617794924
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 43.43064740462772,
        latitude: -0.06775851175178921,
        longitude: 34.930594550238986,
        pm2_5: 47.37768135746812,
        variance: 490.99883745967736
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 42.83335397603818,
        latitude: -0.06775851175178921,
        longitude: 35.033700307210566,
        pm2_5: 47.32343794755082,
        variance: 477.5864777271413
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.13680606418215, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 42.97122580337771,
        latitude: -0.06775851175178921,
        longitude: 35.13680606418215,
        pm2_5: 47.334900686276356,
        variance: 480.66593269597934
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 43.09953115265482,
        latitude: -0.018818527459990908,
        longitude: 34.51817152235265,
        pm2_5: 47.346028666918905,
        variance: 483.5406043259745
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 42.91079349515294,
        latitude: -0.018818527459990908,
        longitude: 34.62127727932423,
        pm2_5: 47.329249532287285,
        variance: 479.314920445559
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 43.04207052886119,
        latitude: -0.018818527459990908,
        longitude: 34.72438303629582,
        pm2_5: 47.34058916143081,
        variance: 482.2521437451742
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 43.26857525529447,
        latitude: 2.665338888888889,
        longitude: 32.282275999999996,
        pm2_5: 47.372685090538994,
        variance: 487.34110907514605
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 43.44576561091382,
        latitude: 2.665338888888889,
        longitude: 32.32058466666666,
        pm2_5: 47.38842749337821,
        variance: 491.34073029947467
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 43.456204830808886,
        latitude: 2.665338888888889,
        longitude: 32.358893333333334,
        pm2_5: 47.390290306467826,
        variance: 491.5768789819913
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 43.464776672876816,
        latitude: 2.7066507777777775,
        longitude: 32.24396733333333,
        pm2_5: 47.392017980725825,
        variance: 491.77082757784683
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 43.4714765673777,
        latitude: 2.7066507777777775,
        longitude: 32.282275999999996,
        pm2_5: 47.39360872245116,
        variance: 491.9224476645327
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 43.41782136598463,
        latitude: 2.7066507777777775,
        longitude: 32.32058466666666,
        pm2_5: 47.38220372282185,
        variance: 490.7088744711973
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 43.43578738981193,
        latitude: 2.7066507777777775,
        longitude: 32.358893333333334,
        pm2_5: 47.384609518051704,
        variance: 491.1150630396046
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 43.45190183514927,
        latitude: 2.7066507777777775,
        longitude: 32.397202,
        pm2_5: 47.38688758935915,
        variance: 491.47953277057695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.46615581647359,
        latitude: 2.7479626666666666,
        longitude: 32.205658666666665,
        pm2_5: 47.389035514774505,
        variance: 491.80203599072274
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.47854160076844,
        latitude: 2.7479626666666666,
        longitude: 32.24396733333333,
        pm2_5: 47.391051029326434,
        variance: 492.08235623952305
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.4890525650105,
        latitude: 2.7479626666666666,
        longitude: 32.282275999999996,
        pm2_5: 47.392932023723226,
        variance: 492.3203074245748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.49768315899928,
        latitude: 2.7479626666666666,
        longitude: 32.32058466666666,
        pm2_5: 47.394676543039516,
        variance: 492.5157330801462
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.50442887365005,
        latitude: 2.7479626666666666,
        longitude: 32.358893333333334,
        pm2_5: 47.39628278540911,
        variance: 492.6685057326313
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.448142513577466,
        latitude: 2.7479626666666666,
        longitude: 32.397202,
        pm2_5: 47.38461322204349,
        variance: 491.39449392964843
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.46620650904539,
        latitude: 2.7479626666666666,
        longitude: 32.435510666666666,
        pm2_5: 47.38703853930164,
        variance: 491.803183123433
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.48240838563164,
        latitude: 2.7479626666666666,
        longitude: 32.47381933333333,
        pm2_5: 47.38933505423475,
        variance: 492.1698872904126
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.49673935330343,
        latitude: 2.7892745555555556,
        longitude: 32.205658666666665,
        pm2_5: 47.39150033514738,
        variance: 492.4943602585422
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.50919176533027,
        latitude: 2.7892745555555556,
        longitude: 32.24396733333333,
        pm2_5: 47.39353210825906,
        variance: 492.77638694093184
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.51975907504669,
        latitude: 2.7892745555555556,
        longitude: 32.282275999999996,
        pm2_5: 47.3954282563447,
        variance: 493.015782473477
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.528435798054296,
        latitude: 2.7892745555555556,
        longitude: 32.32058466666666,
        pm2_5: 47.397186817327814,
        variance: 493.2123914580734
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.51080689585505,
        latitude: 2.7892745555555556,
        longitude: 32.358893333333334,
        pm2_5: 47.39164360547602,
        variance: 492.81297290930524
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.52519419281003,
        latitude: 2.7892745555555556,
        longitude: 32.397202,
        pm2_5: 47.3938227772173,
        variance: 493.13893417373583
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.43346463625331,
        latitude: 2.7892745555555556,
        longitude: 32.435510666666666,
        pm2_5: 47.38643148730526,
        variance: 491.0625391265794
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 43.41930861428364,
        latitude: 2.7892745555555556,
        longitude: 32.47381933333333,
        pm2_5: 47.38430438747858,
        variance: 490.7424928525629
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.403305373271365,
        latitude: 2.830586444444444,
        longitude: 32.24396733333333,
        pm2_5: 47.38204844774806,
        variance: 490.3808093829257
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.43638290030374,
        latitude: 2.830586444444444,
        longitude: 32.282275999999996,
        pm2_5: 47.390787167651254,
        variance: 491.12852963916066
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.282123189349534,
        latitude: 2.830586444444444,
        longitude: 32.32058466666666,
        pm2_5: 47.37469419690981,
        variance: 487.64634209132373
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.293897379526996,
        latitude: 2.830586444444444,
        longitude: 32.358893333333334,
        pm2_5: 47.376579669681966,
        variance: 487.9116905219216
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.293732672855114,
        latitude: 2.830586444444444,
        longitude: 32.397202,
        pm2_5: 47.37360785504593,
        variance: 487.907978120742
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.30925602817295,
        latitude: 2.830586444444444,
        longitude: 32.435510666666666,
        pm2_5: 47.3757752736525,
        variance: 488.2579283928144
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 43.32298908089418,
        latitude: 2.830586444444444,
        longitude: 32.47381933333333,
        pm2_5: 47.37781907193391,
        variance: 488.56762362121935
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.334923679145255,
        latitude: 2.871898333333333,
        longitude: 32.205658666666665,
        pm2_5: 47.37973704456735,
        variance: 488.83684149243663
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.345052827584865,
        latitude: 2.871898333333333,
        longitude: 32.24396733333333,
        pm2_5: 47.38152713643353,
        variance: 489.06539062529237
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.31473956858616,
        latitude: 2.871898333333333,
        longitude: 32.282275999999996,
        pm2_5: 47.37422010985759,
        variance: 488.3815763990119
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.332250584585914,
        latitude: 2.871898333333333,
        longitude: 32.32058466666666,
        pm2_5: 47.37654391840553,
        variance: 488.7765360072226
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.34795864768038,
        latitude: 2.871898333333333,
        longitude: 32.358893333333334,
        pm2_5: 47.37874452778979,
        variance: 489.13096598318634
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.537695327403256,
        latitude: 2.871898333333333,
        longitude: 32.397202,
        pm2_5: 47.395867564411915,
        variance: 493.42224969330255
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.361854534547625,
        latitude: 2.871898333333333,
        longitude: 32.435510666666666,
        pm2_5: 47.3808195609118,
        variance: 489.4446138784019
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 43.384178765810745,
        latitude: 2.871898333333333,
        longitude: 32.47381933333333,
        pm2_5: 47.3845841536,
        variance: 489.94871074131197
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.39259442956321,
        latitude: 2.9132102222222223,
        longitude: 32.205658666666665,
        pm2_5: 47.386269719441394,
        variance: 490.1388096961059
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.399172491777485,
        latitude: 2.9132102222222223,
        longitude: 32.24396733333333,
        pm2_5: 47.38782171944102,
        variance: 490.2874252840106
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.35109443284253,
        latitude: 2.9132102222222223,
        longitude: 32.282275999999996,
        pm2_5: 47.37700367628534,
        variance: 489.20173587183217
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.36878436699507,
        latitude: 2.9132102222222223,
        longitude: 32.32058466666666,
        pm2_5: 47.379358716373524,
        variance: 489.6010666052989
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.3846522692982,
        latitude: 2.9132102222222223,
        longitude: 32.358893333333334,
        pm2_5: 47.381588834799594,
        variance: 489.9594055934822
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.398689035786745,
        latitude: 2.9132102222222223,
        longitude: 32.397202,
        pm2_5: 47.38369163676526,
        variance: 490.2765019848284
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 43.410886735452706,
        latitude: 2.9132102222222223,
        longitude: 32.435510666666666,
        pm2_5: 47.385664881979295,
        variance: 490.5521363906455
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 43.4212385696152,
        latitude: 2.954522111111111,
        longitude: 32.282275999999996,
        pm2_5: 47.38750648350929,
        variance: 490.78612008523487
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 43.42973883637824,
        latitude: 2.954522111111111,
        longitude: 32.32058466666666,
        pm2_5: 47.38921450662601,
        variance: 490.9782943034206
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 43.3739302056607,
        latitude: 2.954522111111111,
        longitude: 32.358893333333334,
        pm2_5: 47.382766793606436,
        variance: 489.7172588206804
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 43.54830382017765,
        latitude: 2.954522111111111,
        longitude: 32.397202,
        pm2_5: 47.39777584390697,
        variance: 493.66273573888475
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.2990997417778279],
        type: 'Point'
      },
      properties: {
        interval: 15.634886524671021,
        latitude: 0.2990997417778279,
        longitude: 32.66865347777785,
        pm2_5: 32.98687810538524,
        variance: 63.63225651794551
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.2990997417778279],
        type: 'Point'
      },
      properties: {
        interval: 15.63348593021025,
        latitude: 0.2990997417778279,
        longitude: 32.677854153888966,
        pm2_5: 32.98474544200394,
        variance: 63.62085649991718
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.32360693055560813],
        type: 'Point'
      },
      properties: {
        interval: 15.63174852866093,
        latitude: 0.32360693055560813,
        longitude: 32.66865347777785,
        pm2_5: 32.986958054421564,
        variance: 63.60671648877894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.32360693055560813],
        type: 'Point'
      },
      properties: {
        interval: 15.635166903713744,
        latitude: 0.32360693055560813,
        longitude: 32.677854153888966,
        pm2_5: 32.98344033731938,
        variance: 63.63453876171013
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 15.638560546184147,
        latitude: 0.3481141193333883,
        longitude: 32.64105144944452,
        pm2_5: 32.97994762854784,
        variance: 63.66216575298506
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 15.64192927718529,
        latitude: 0.3481141193333883,
        longitude: 32.650252125555625,
        pm2_5: 32.976480168647356,
        variance: 63.68959587475695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 15.633245239752267,
        latitude: 0.3481141193333883,
        longitude: 32.65945280166674,
        pm2_5: 32.98587227628356,
        variance: 63.61889752348941
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 15.636700059017608,
        latitude: 0.3481141193333883,
        longitude: 32.66865347777785,
        pm2_5: 32.982315244560525,
        variance: 63.6470191419412
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 15.640129816694227,
        latitude: 0.3481141193333883,
        longitude: 32.677854153888966,
        pm2_5: 32.97878353194864,
        variance: 63.67494290999787
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 15.643534333356676,
        latitude: 0.3726213081111685,
        longitude: 32.64105144944452,
        pm2_5: 32.975277381014116,
        variance: 63.70266723211921
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 15.631080846204464,
        latitude: 0.3726213081111685,
        longitude: 32.650252125555625,
        pm2_5: 32.988584734734346,
        variance: 63.60128290831426
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 15.634595427238823,
        latitude: 0.3726213081111685,
        longitude: 32.65945280166674,
        pm2_5: 32.984965029943005,
        variance: 63.62988707138618
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 15.638084816030808,
        latitude: 0.3726213081111685,
        longitude: 32.66865347777785,
        pm2_5: 32.9813706927592,
        variance: 63.65829256387269
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 15.641548829996312,
        latitude: 0.3726213081111685,
        longitude: 32.677854153888966,
        pm2_5: 32.97780197011998,
        variance: 63.68649776165114
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61344942111118, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.644987289226911,
        latitude: 0.3971284968889487,
        longitude: 32.61344942111118,
        pm2_5: 32.974259106500526,
        variance: 63.714501062076124
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62265009722229, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.648400016468234,
        latitude: 0.3971284968889487,
        longitude: 32.62265009722229,
        pm2_5: 32.970742343911475,
        variance: 63.74230088385127
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.651786837100092,
        latitude: 0.3971284968889487,
        longitude: 32.631850773333404,
        pm2_5: 32.96725192189822,
        variance: 63.76989566691475
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.628678147963956,
        latitude: 0.3971284968889487,
        longitude: 32.64105144944452,
        pm2_5: 32.99157266021623,
        variance: 63.58173174006822
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.632251014740907,
        latitude: 0.3971284968889487,
        longitude: 32.650252125555625,
        pm2_5: 32.98789200329084,
        variance: 63.61080585898276
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.635798578350174,
        latitude: 0.3971284968889487,
        longitude: 32.65945280166674,
        pm2_5: 32.98423674074559,
        variance: 63.63968064940059
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 15.639320653016812,
        latitude: 0.3971284968889487,
        longitude: 32.66865347777785,
        pm2_5: 32.98060712383032,
        variance: 63.66835445852723
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 15.64281705569298,
        latitude: 0.42163568566672893,
        longitude: 32.631850773333404,
        pm2_5: 32.9770034013057,
        variance: 63.69682565542462
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 15.629671379794472,
        latitude: 0.42163568566672893,
        longitude: 32.64105144944452,
        pm2_5: 32.991090928673266,
        variance: 63.589813473648064
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 15.633275600473459,
        latitude: 0.42163568566672893,
        longitude: 32.650252125555625,
        pm2_5: 32.987376510681514,
        variance: 63.61914462733205
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 15.63685423804805,
        latitude: 0.42163568566672893,
        longitude: 32.65945280166674,
        pm2_5: 32.98368774765529,
        variance: 63.648274276853726
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 15.640407106296665,
        latitude: 0.4461428744445091,
        longitude: 32.631850773333404,
        pm2_5: 32.980024892579856,
        variance: 63.67720076288401
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 15.643934021754703,
        latitude: 0.4461428744445091,
        longitude: 32.64105144944452,
        pm2_5: 32.97638819592451,
        variance: 63.70592244820239
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 15.630520573647617,
        latitude: 0.4461428744445091,
        longitude: 32.650252125555625,
        pm2_5: 32.99078458480897,
        variance: 63.59672360558659
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 15.634154214453524,
        latitude: 0.4461428744445091,
        longitude: 32.65945280166674,
        pm2_5: 32.98703849416596,
        variance: 63.62629581458634
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 15.631225406086504,
        latitude: 0.4706500632222893,
        longitude: 32.650252125555625,
        pm2_5: 32.990653765455775,
        variance: 63.602459312756196
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 15.63010586475025,
        latitude: 0.4706500632222893,
        longitude: 32.65945280166674,
        pm2_5: 32.988221852624086,
        variance: 63.593348954420094
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 15.626701592026611,
        latitude: 0.4706500632222893,
        longitude: 32.66865347777785,
        pm2_5: 32.99172270493322,
        variance: 63.565650418119276
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.4105754295984412],
        type: 'Point'
      },
      properties: {
        interval: 20.09434056654312,
        latitude: -1.4105754295984412,
        longitude: 36.90804587470177,
        pm2_5: 30.76908645770259,
        variance: 105.10790368706284
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 20.15246561010366,
        latitude: -1.3789922793705829,
        longitude: 36.76130337185356,
        pm2_5: 30.73231937048146,
        variance: 105.7168549995863
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 20.147654479419305,
        latitude: -1.3789922793705829,
        longitude: 36.810217539469626,
        pm2_5: 30.73753561132763,
        variance: 105.66638406446918
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 20.14248427478305,
        latitude: -1.3789922793705829,
        longitude: 36.859131707085695,
        pm2_5: 30.742999557976724,
        variance: 105.61215971467163
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 20.136965668168664,
        latitude: -1.3789922793705829,
        longitude: 36.90804587470177,
        pm2_5: 30.748698816819726,
        variance: 105.55429673079016
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 20.17920511793632,
        latitude: -1.3474091291427246,
        longitude: 36.71238920423748,
        pm2_5: 30.70871928445384,
        variance: 105.99758412946358
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 20.175153382689967,
        latitude: -1.3474091291427246,
        longitude: 36.76130337185356,
        pm2_5: 30.71358571695955,
        variance: 105.95502239042753
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 20.170675501573292,
        latitude: -1.3474091291427246,
        longitude: 36.810217539469626,
        pm2_5: 30.718763311683688,
        variance: 105.90799411437138
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 20.165780414244878,
        latitude: -1.3474091291427246,
        longitude: 36.859131707085695,
        pm2_5: 30.724240504063033,
        variance: 105.85659613586586
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 20.160477942287645,
        latitude: -1.3474091291427246,
        longitude: 36.90804587470177,
        pm2_5: 30.73000502319974,
        variance: 105.80093473070247
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.154778782459893,
        latitude: -1.3158259789148663,
        longitude: 36.71238920423748,
        pm2_5: 30.736043913419856,
        variance: 105.74112551277994
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.148694498814972,
        latitude: -1.3158259789148663,
        longitude: 36.76130337185356,
        pm2_5: 30.742343557427088,
        variance: 105.6772933169973
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.193236065319798,
        latitude: -1.3158259789148663,
        longitude: 36.810217539469626,
        pm2_5: 30.699643819106814,
        variance: 106.14503925180452
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.18881726552953,
        latitude: -1.3158259789148663,
        longitude: 36.859131707085695,
        pm2_5: 30.70496581856986,
        variance: 106.09858980137005
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.183933092967255,
        latitude: -1.3158259789148663,
        longitude: 36.90804587470177,
        pm2_5: 30.71062862460862,
        variance: 106.04726028253299
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 20.178593114755895,
        latitude: -1.3158259789148663,
        longitude: 36.95696004231784,
        pm2_5: 30.716619674995083,
        variance: 105.99115475085227
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.15690778749727,
        latitude: -1.284242828687008,
        longitude: 36.71238920423748,
        pm2_5: 30.727362632034303,
        variance: 105.7634661478728
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.15994824991492,
        latitude: -1.284242828687008,
        longitude: 36.76130337185356,
        pm2_5: 30.736425217788167,
        variance: 105.79537521846305
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.160971933908954,
        latitude: -1.284242828687008,
        longitude: 36.810217539469626,
        pm2_5: 30.722676573758196,
        variance: 105.80611966885272
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.16793387747782,
        latitude: -1.284242828687008,
        longitude: 36.859131707085695,
        pm2_5: 30.71415799401505,
        variance: 105.87920577007435
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.117918706520033,
        latitude: -1.284242828687008,
        longitude: 36.90804587470177,
        pm2_5: 30.74971679152362,
        variance: 105.35470977773548
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.11540207804622,
        latitude: -1.284242828687008,
        longitude: 36.95696004231784,
        pm2_5: 30.752704044599376,
        variance: 105.32835296789517
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.00587420993391, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.112622213084794,
        latitude: -1.284242828687008,
        longitude: 37.00587420993391,
        pm2_5: 30.755881133067053,
        variance: 105.29924309825901
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 20.109585089928146,
        latitude: -1.284242828687008,
        longitude: 37.05478837754998,
        pm2_5: 30.759240763354104,
        variance: 105.26744390073418
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.13659717892121,
        latitude: -1.2526596784591497,
        longitude: 36.76130337185356,
        pm2_5: 30.73554181806478,
        variance: 105.55043365944857
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.133997983543896,
        latitude: -1.2526596784591497,
        longitude: 36.810217539469626,
        pm2_5: 30.738778309959095,
        variance: 105.52318690164248
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.131087838500907,
        latitude: -1.2526596784591497,
        longitude: 36.859131707085695,
        pm2_5: 30.742243216940757,
        variance: 105.4926847046645
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.127872869513183,
        latitude: -1.2526596784591497,
        longitude: 36.90804587470177,
        pm2_5: 30.745928654921563,
        variance: 105.4589926726585
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.124359865099073,
        latitude: -1.2526596784591497,
        longitude: 36.95696004231784,
        pm2_5: 30.74982622113111,
        variance: 105.42218346001937
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.00587420993391, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.152522558750768,
        latitude: -1.2526596784591497,
        longitude: 37.00587420993391,
        pm2_5: 30.72461629424022,
        variance: 105.71745248879597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 20.149577951270828,
        latitude: -1.2526596784591497,
        longitude: 37.05478837754998,
        pm2_5: 30.72829394965882,
        variance: 105.68656070760608
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 20.146280681911435,
        latitude: -1.2210765282312914,
        longitude: 36.76130337185356,
        pm2_5: 30.73223150105566,
        variance: 105.65197451956419
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 20.142637560733082,
        latitude: -1.2210765282312914,
        longitude: 36.810217539469626,
        pm2_5: 30.73642005272921,
        variance: 105.61376715510596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 20.138656139215687,
        latitude: -1.2210765282312914,
        longitude: 36.859131707085695,
        pm2_5: 30.740850120114473,
        variance: 105.57201975571888
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 20.13434470263607,
        latitude: -1.2210765282312914,
        longitude: 36.90804587470177,
        pm2_5: 30.74551164744206,
        variance: 105.52682127357593
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 20.164649781172056,
        latitude: -1.2210765282312914,
        longitude: 37.05478837754998,
        pm2_5: 30.71827173425264,
        variance: 105.84472636331793
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.1894933780034331],
        type: 'Point'
      },
      properties: {
        interval: 20.190896689418526,
        latitude: -1.1894933780034331,
        longitude: 36.90804587470177,
        pm2_5: 30.709462660460325,
        variance: 106.12044698114642
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.504706172981306,
        latitude: 0.3396774444444444,
        longitude: 32.71017044444445,
        pm2_5: 18.250185688074364,
        variance: 3.197356663612368
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.50470566088001,
        latitude: 0.3396774444444444,
        longitude: 32.71150566666667,
        pm2_5: 18.250185714008804,
        variance: 3.1973557292285477
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.5047056420212543,
        latitude: 0.3396774444444444,
        longitude: 32.71284088888889,
        pm2_5: 18.25018571496381,
        variance: 3.197355694818725
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.504705622858781,
        latitude: 0.3396774444444444,
        longitude: 32.714176111111115,
        pm2_5: 18.25018571593424,
        variance: 3.197355659854736
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.5047056036452457,
        latitude: 0.3396774444444444,
        longitude: 32.71551133333334,
        pm2_5: 18.250185716907318,
        variance: 3.1973556247975807
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.504705586312309,
        latitude: 0.3396774444444444,
        longitude: 32.716846555555556,
        pm2_5: 18.250185717785083,
        variance: 3.1973555931717783
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 3.504705568675591,
        latitude: 0.3396774444444444,
        longitude: 32.71818177777778,
        pm2_5: 18.250185718678246,
        variance: 3.1973555609916957
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.5047055507354976,
        latitude: 0.34084088888888886,
        longitude: 32.70883522222223,
        pm2_5: 18.250185719586785,
        variance: 3.197355528258072
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.5047055324915304,
        latitude: 0.34084088888888886,
        longitude: 32.71017044444445,
        pm2_5: 18.250185720510757,
        variance: 3.1973554949699974
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.5047055139442183,
        latitude: 0.34084088888888886,
        longitude: 32.71150566666667,
        pm2_5: 18.250185721450055,
        variance: 3.1973554611284385
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.5047054950932197,
        latitude: 0.34084088888888886,
        longitude: 32.71284088888889,
        pm2_5: 18.250185722404687,
        variance: 3.19735542673277
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.504705679435172,
        latitude: 0.34084088888888886,
        longitude: 32.714176111111115,
        pm2_5: 18.250185713069033,
        variance: 3.197355763084431
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.504705456473119,
        latitude: 0.34084088888888886,
        longitude: 32.71551133333334,
        pm2_5: 18.250185724360538,
        variance: 3.1973553562662573
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.5047054215181674,
        latitude: 0.34084088888888886,
        longitude: 32.716846555555556,
        pm2_5: 18.250185726130717,
        variance: 3.1973552924872024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 3.504705403585395,
        latitude: 0.34084088888888886,
        longitude: 32.71818177777778,
        pm2_5: 18.250185727038886,
        variance: 3.197355259766937
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047053853492147,
        latitude: 0.3420043333333333,
        longitude: 32.70883522222223,
        pm2_5: 18.250185727962453,
        variance: 3.197355226493073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047053668095662,
        latitude: 0.3420043333333333,
        longitude: 32.71017044444445,
        pm2_5: 18.250185728901336,
        variance: 3.1973551926654977
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047053091023495,
        latitude: 0.3420043333333333,
        longitude: 32.71150566666667,
        pm2_5: 18.25018573182377,
        variance: 3.1973550873725003
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.504705291783867,
        latitude: 0.3420043333333333,
        longitude: 32.71284088888889,
        pm2_5: 18.250185732700835,
        variance: 3.197355055773073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047052741620077,
        latitude: 0.3420043333333333,
        longitude: 32.714176111111115,
        pm2_5: 18.250185733593288,
        variance: 3.197355023620105
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.504705256236711,
        latitude: 0.3420043333333333,
        longitude: 32.71551133333334,
        pm2_5: 18.250185734501073,
        variance: 3.1973549909134817
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047052380082566,
        latitude: 0.3420043333333333,
        longitude: 32.716846555555556,
        pm2_5: 18.250185735424317,
        variance: 3.1973549576537152
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 3.5047051442218375,
        latitude: 0.3420043333333333,
        longitude: 32.71818177777778,
        pm2_5: 18.250185740173933,
        variance: 3.1973547865303544
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047054391473775,
        latitude: 0.34316777777777774,
        longitude: 32.70883522222223,
        pm2_5: 18.25018572523798,
        variance: 3.1973553246535857
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047056976866777,
        latitude: 0.34316777777777774,
        longitude: 32.71017044444445,
        pm2_5: 18.25018571214471,
        variance: 3.1973557963862618
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047057156343406,
        latitude: 0.34316777777777774,
        longitude: 32.71150566666667,
        pm2_5: 18.25018571123584,
        variance: 3.1973558291336985
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.504705733278254,
        latitude: 0.34316777777777774,
        longitude: 32.71284088888889,
        pm2_5: 18.250185710342265,
        variance: 3.197355861326912
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047061553154313,
        latitude: 0.34316777777777774,
        longitude: 32.714176111111115,
        pm2_5: 18.25018568896896,
        variance: 3.1973566313790798
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.504706137345371,
        latitude: 0.34316777777777774,
        longitude: 32.71551133333334,
        pm2_5: 18.250185689879043,
        variance: 3.1973565985907726
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047061190713436,
        latitude: 0.34316777777777774,
        longitude: 32.716846555555556,
        pm2_5: 18.250185690804496,
        variance: 3.197356565247844
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 3.5047061004931614,
        latitude: 0.34316777777777774,
        longitude: 32.71818177777778,
        pm2_5: 18.250185691745347,
        variance: 3.1973565313499535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.5047060816109803,
        latitude: 0.34433122222222223,
        longitude: 32.70883522222223,
        pm2_5: 18.25018569270158,
        variance: 3.1973564968973847
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.504706062424739,
        latitude: 0.34433122222222223,
        longitude: 32.71017044444445,
        pm2_5: 18.250185693673195,
        variance: 3.197356461890024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.504706043967526,
        latitude: 0.34433122222222223,
        longitude: 32.71150566666667,
        pm2_5: 18.25018569460805,
        variance: 3.1973564282128564
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.5047060266130643,
        latitude: 0.34433122222222223,
        longitude: 32.71284088888889,
        pm2_5: 18.2501856954869,
        variance: 3.197356396547775
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.5047060089544164,
        latitude: 0.34433122222222223,
        longitude: 32.714176111111115,
        pm2_5: 18.250185696381145,
        variance: 3.197356364327675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.5047059909918015,
        latitude: 0.34433122222222223,
        longitude: 32.71551133333334,
        pm2_5: 18.250185697290807,
        variance: 3.197356331552953
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 3.50470597272525,
        latitude: 0.34433122222222223,
        longitude: 32.716846555555556,
        pm2_5: 18.250185698215986,
        variance: 3.197356298223667
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.504705954154793,
        latitude: 0.34549466666666667,
        longitude: 32.70883522222223,
        pm2_5: 18.25018569915643,
        variance: 3.1973562643398736
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.504705935280337,
        latitude: 0.34549466666666667,
        longitude: 32.71017044444445,
        pm2_5: 18.25018570011229,
        variance: 3.197356229901402
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.504705916101977,
        latitude: 0.34549466666666667,
        longitude: 32.71150566666667,
        pm2_5: 18.250185701083435,
        variance: 3.197356194908423
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.5047058973926672,
        latitude: 0.34549466666666667,
        longitude: 32.71284088888889,
        pm2_5: 18.250185702030965,
        variance: 3.197356160771278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.504705880045276,
        latitude: 0.34549466666666667,
        longitude: 32.714176111111115,
        pm2_5: 18.250185702909473,
        variance: 3.1973561291191004
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 3.5047058623940117,
        latitude: 0.34549466666666667,
        longitude: 32.71551133333334,
        pm2_5: 18.25018570380344,
        variance: 3.197356096912472
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 3.5047058444388104,
        latitude: 0.3466581111111111,
        longitude: 32.70883522222223,
        pm2_5: 18.25018570471268,
        variance: 3.197356064151279
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 3.5047058261798596,
        latitude: 0.3466581111111111,
        longitude: 32.71017044444445,
        pm2_5: 18.250185705637467,
        variance: 3.197356030835863
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 3.504705807616941,
        latitude: 0.3466581111111111,
        longitude: 32.71150566666667,
        pm2_5: 18.250185706577533,
        variance: 3.1973559969658254
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 3.504705788750398,
        latitude: 0.3466581111111111,
        longitude: 32.71284088888889,
        pm2_5: 18.25018570753291,
        variance: 3.197355962541792
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 3.504705769579887,
        latitude: 0.3466581111111111,
        longitude: 32.714176111111115,
        pm2_5: 18.2501857085038,
        variance: 3.1973559275631374
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 3.504705750618574,
        latitude: 0.34782155555555555,
        longitude: 32.71017044444445,
        pm2_5: 18.250185709464112,
        variance: 3.1973558929661863
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 3.5047051266074547,
        latitude: 0.34782155555555555,
        longitude: 32.71150566666667,
        pm2_5: 18.250185741065927,
        variance: 3.1973547543910286
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 3.5047051086897274,
        latitude: 0.34782155555555555,
        longitude: 32.71284088888889,
        pm2_5: 18.250185741973333,
        variance: 3.1973547216982183
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.742755555555556],
        type: 'Point'
      },
      properties: {
        interval: 19.93286631905576,
        latitude: 8.742755555555556,
        longitude: 7.509622222222222,
        pm2_5: 31.01900519415126,
        variance: 103.42543723796007
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.801633333333333],
        type: 'Point'
      },
      properties: {
        interval: 20.0052678340457,
        latitude: 8.801633333333333,
        longitude: 7.509622222222222,
        pm2_5: 30.917421005533498,
        variance: 104.17813960638887
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 20.02688005824045,
        latitude: 8.86051111111111,
        longitude: 7.229233333333333,
        pm2_5: 30.9043959983323,
        variance: 104.40335403663812
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 20.046909268113478,
        latitude: 8.86051111111111,
        longitude: 7.285311111111111,
        pm2_5: 30.892764965329654,
        variance: 104.61228946375832
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 20.065320527642847,
        latitude: 8.86051111111111,
        longitude: 7.341388888888889,
        pm2_5: 30.882556359071522,
        variance: 104.80453141322505
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 19.958434826809313,
        latitude: 8.86051111111111,
        longitude: 7.397466666666666,
        pm2_5: 30.934906265092337,
        variance: 103.69094146605448
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 19.985018563379004,
        latitude: 8.86051111111111,
        longitude: 7.453544444444444,
        pm2_5: 30.917545638080554,
        variance: 103.96734875536322
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 19.982111393948976,
        latitude: 8.86051111111111,
        longitude: 7.509622222222222,
        pm2_5: 30.931807908407954,
        variance: 103.93710322787001
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.117077777777777, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.010117038733306,
        latitude: 8.91938888888889,
        longitude: 7.117077777777777,
        pm2_5: 30.90150069720432,
        variance: 104.22865053722535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.055674063922194,
        latitude: 8.91938888888889,
        longitude: 7.173155555555556,
        pm2_5: 30.873513726046443,
        variance: 104.7037854431178
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.076051069385958,
        latitude: 8.91938888888889,
        longitude: 7.229233333333333,
        pm2_5: 30.861640400909067,
        variance: 104.9166562215205
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.094779337906306,
        latitude: 8.91938888888889,
        longitude: 7.285311111111111,
        pm2_5: 30.851220177515206,
        variance: 105.11249391897809
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.01136123941447,
        latitude: 8.91938888888889,
        longitude: 7.341388888888889,
        pm2_5: 30.88863648373256,
        variance: 104.24161251935129
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.036813467084034,
        latitude: 8.91938888888889,
        longitude: 7.397466666666666,
        pm2_5: 30.87231632918725,
        variance: 104.50694864502293
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.060708118258432,
        latitude: 8.91938888888889,
        longitude: 7.453544444444444,
        pm2_5: 30.857376279322782,
        variance: 104.756354176895
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 20.033683145258394,
        latitude: 8.91938888888889,
        longitude: 7.509622222222222,
        pm2_5: 30.886811327718036,
        variance: 104.47429726275777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.117077777777777, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.957453579191487,
        latitude: 8.978266666666666,
        longitude: 7.117077777777777,
        pm2_5: 30.947521001517252,
        variance: 103.68074587817136
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.931341456368145,
        latitude: 8.978266666666666,
        longitude: 7.173155555555556,
        pm2_5: 30.964520954867268,
        variance: 103.40961376778932
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.903826499075617,
        latitude: 8.978266666666666,
        longitude: 7.229233333333333,
        pm2_5: 30.98276482065988,
        variance: 103.12429959009387
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.968020794867115,
        latitude: 8.978266666666666,
        longitude: 7.285311111111111,
        pm2_5: 30.983429572637437,
        variance: 103.79057019581569
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.898939451685358,
        latitude: 8.978266666666666,
        longitude: 7.341388888888889,
        pm2_5: 31.01030333597894,
        variance: 103.07366495778842
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.92245088279818,
        latitude: 8.978266666666666,
        longitude: 7.397466666666666,
        pm2_5: 30.995423196654528,
        variance: 103.31738056474023
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.944540197725765,
        latitude: 8.978266666666666,
        longitude: 7.453544444444444,
        pm2_5: 30.981796101507324,
        variance: 103.54661695613777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 19.965164762439983,
        latitude: 8.978266666666666,
        longitude: 7.509622222222222,
        pm2_5: 30.969456444869305,
        variance: 103.76088192195311
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.984285844355384,
        latitude: 9.037144444444444,
        longitude: 7.173155555555556,
        pm2_5: 30.958435151321755,
        variance: 103.95972529906885
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 20.001868459739796,
        latitude: 9.037144444444444,
        longitude: 7.229233333333333,
        pm2_5: 30.948759669309432,
        variance: 104.14273789065328
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.876275676122958,
        latitude: 9.037144444444444,
        longitude: 7.285311111111111,
        pm2_5: 31.012839208808575,
        variance: 102.8390084218131
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.903188890475207,
        latitude: 9.037144444444444,
        longitude: 7.341388888888889,
        pm2_5: 30.995049991266512,
        variance: 103.11769263065798
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.928735677955462,
        latitude: 9.037144444444444,
        longitude: 7.397466666666666,
        pm2_5: 30.978471923016738,
        variance: 103.3825764581984
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.952864789801577,
        latitude: 9.037144444444444,
        longitude: 7.453544444444444,
        pm2_5: 30.963147196575765,
        variance: 103.6330730216846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 19.975529291881323,
        latitude: 9.037144444444444,
        longitude: 7.509622222222222,
        pm2_5: 30.949114466901754,
        variance: 103.86864079831548
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 19.99668639765551,
        latitude: 9.096022222222222,
        longitude: 7.229233333333333,
        pm2_5: 30.93640884070092,
        variance: 104.08878250889757
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 20.016297299615367,
        latitude: 9.096022222222222,
        longitude: 7.285311111111111,
        pm2_5: 30.925061870300027,
        variance: 104.2930439365341
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 20.034327002082556,
        latitude: 9.096022222222222,
        longitude: 7.341388888888889,
        pm2_5: 30.915101551019752,
        variance: 104.48101270990583
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 20.083002454457993,
        latitude: 9.096022222222222,
        longitude: 7.397466666666666,
        pm2_5: 30.8438529193786,
        variance: 104.98932413207149
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 20.10365786968725,
        latitude: 9.096022222222222,
        longitude: 7.453544444444444,
        pm2_5: 30.83177909747863,
        variance: 105.20539872486415
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 334.1862457028455,
        latitude: 0.6221293861111437,
        longitude: 30.261528885222276,
        pm2_5: 230.05634644131817,
        variance: 29071.336634986103
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 334.21214074547197,
        latitude: 0.6221293861111437,
        longitude: 30.270733705333384,
        pm2_5: 232.37909748451406,
        variance: 29075.84210268408
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 334.2399878973792,
        latitude: 0.6221293861111437,
        longitude: 30.279938525444493,
        pm2_5: 234.06948033534488,
        variance: 29080.68760663271
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 334.2682282006341,
        latitude: 0.6221293861111437,
        longitude: 30.2891433455556,
        pm2_5: 235.7653323706485,
        variance: 29085.601932629943
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 334.2968617951192,
        latitude: 0.631207524222254,
        longitude: 30.261528885222276,
        pm2_5: 237.4665101866924,
        variance: 29090.58512236178
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 334.32588870366317,
        latitude: 0.631207524222254,
        longitude: 30.270733705333384,
        pm2_5: 239.17286962808444,
        variance: 29095.6371973902
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 334.2469158369076,
        latitude: 0.631207524222254,
        longitude: 30.279938525444493,
        pm2_5: 234.64990590381038,
        variance: 29081.89315558225
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 334.37932192766203,
        latitude: 0.631207524222254,
        longitude: 30.2891433455556,
        pm2_5: 242.0841453970896,
        variance: 29104.93828946352
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.27498703605454,
        latitude: 0.6402856623333643,
        longitude: 30.270733705333384,
        pm2_5: 236.3337834745041,
        variance: 29086.77815440297
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.3322949650507,
        latitude: 0.6402856623333643,
        longitude: 30.279938525444493,
        pm2_5: 239.7172603832894,
        variance: 29096.752253383398
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.2265666280526,
        latitude: 0.6402856623333643,
        longitude: 30.2891433455556,
        pm2_5: 233.56839352896546,
        variance: 29078.352207407355
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.25408346319705,
        latitude: 0.6402856623333643,
        longitude: 30.29834816566671,
        pm2_5: 235.23476582684776,
        variance: 29083.140439353883
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.307552985777818, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.2819839023951,
        latitude: 0.6402856623333643,
        longitude: 30.307552985777818,
        pm2_5: 236.9065300229076,
        variance: 29087.995825104415
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.316757805888926, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 334.3102680411685,
        latitude: 0.6402856623333643,
        longitude: 30.316757805888926,
        pm2_5: 238.58354469910398,
        variance: 29092.9183980003
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.2071678266772,
        latitude: 0.6493638004444746,
        longitude: 30.270733705333384,
        pm2_5: 232.52118357279258,
        variance: 29074.976839527488
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.3034467430074,
        latitude: 0.6493638004444746,
        longitude: 30.279938525444493,
        pm2_5: 238.0229493560319,
        variance: 29091.73118082434
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.34932215366683,
        latitude: 0.6493638004444746,
        longitude: 30.2891433455556,
        pm2_5: 240.35587954116033,
        variance: 29099.71606221795
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.3197202273013,
        latitude: 0.6493638004444746,
        longitude: 30.29834816566671,
        pm2_5: 238.6325401657736,
        variance: 29094.563549786806
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.307552985777818, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.29051632570577,
        latitude: 0.6493638004444746,
        longitude: 30.307552985777818,
        pm2_5: 236.91427301169887,
        variance: 29089.480764605105
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.316757805888926, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 334.2147343493277,
        latitude: 0.6493638004444746,
        longitude: 30.316757805888926,
        pm2_5: 231.79307037751852,
        variance: 29076.2933819741
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 334.24363488052535,
        latitude: 0.6584419385555849,
        longitude: 30.261528885222276,
        pm2_5: 233.53541275664924,
        variance: 29081.322224631906
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 334.2729475190059,
        latitude: 0.6584419385555849,
        longitude: 30.270733705333384,
        pm2_5: 235.2832262623274,
        variance: 29086.423220284283
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 334.19234234728856,
        latitude: 0.6584419385555849,
        longitude: 30.279938525444493,
        pm2_5: 230.62993383343215,
        variance: 29072.397356197238
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 334.2206729657883,
        latitude: 0.6584419385555849,
        longitude: 30.2891433455556,
        pm2_5: 232.35528485991895,
        variance: 29077.32669661194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 334.24941083482076,
        latitude: 0.6584419385555849,
        longitude: 30.29834816566671,
        pm2_5: 234.0862178619338,
        variance: 29082.32732284069
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 334.2785561539582,
        latitude: 0.6675200766666952,
        longitude: 30.270733705333384,
        pm2_5: 235.82258611319008,
        variance: 29087.399287894368
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 334.2268634230931,
        latitude: 0.6675200766666952,
        longitude: 30.279938525444493,
        pm2_5: 232.9221225908676,
        variance: 29078.403850905597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 334.25543704458426,
        latitude: 0.6675200766666952,
        longitude: 30.2891433455556,
        pm2_5: 234.64150326898024,
        variance: 29083.375987574458
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 334.28441342746294,
        latitude: 0.6675200766666952,
        longitude: 30.29834816566671,
        pm2_5: 236.366283295338,
        variance: 29088.418643414974
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 334.3137926410994,
        latitude: 0.6765982147778055,
        longitude: 30.261528885222276,
        pm2_5: 238.0963164699799,
        variance: 29093.531848728657
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 334.34357463935515,
        latitude: 0.6765982147778055,
        longitude: 30.270733705333384,
        pm2_5: 239.8314564791889,
        variance: 29098.71561396867
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 334.3737592620465,
        latitude: 0.6765982147778055,
        longitude: 30.279938525444493,
        pm2_5: 241.57155652892112,
        variance: 29103.969929985702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 334.23330274080115,
        latitude: 0.6765982147778055,
        longitude: 30.2891433455556,
        pm2_5: 233.49353675264229,
        variance: 29079.524328671396
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.252324065111168, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 334.261710512403,
        latitude: 0.6856763528889158,
        longitude: 30.252324065111168,
        pm2_5: 235.20122348017236,
        variance: 29084.467699572444
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 334.23413842986747,
        latitude: 0.6856763528889158,
        longitude: 30.261528885222276,
        pm2_5: 234.169851366611,
        variance: 29079.669744886458
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 334.2614876466231,
        latitude: 0.6856763528889158,
        longitude: 30.270733705333384,
        pm2_5: 235.82401185296604,
        variance: 29084.42891600728
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.3976606461111487],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.3976606461111487,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.40645178522225933,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.40645178522225933,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.40645178522225933,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.40645178522225933,
        longitude: 33.25752756133339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.40645178522225933,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.25752756133339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.41524292433336996,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.19542152966672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.25752756133339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4240340634444806,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.19542152966672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.25752756133339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4328252025555912,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.19542152966672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.25752756133339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.44161634166670183,
        longitude: 33.269948767666726,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.18300032333338, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.18300032333338,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.19542152966672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.45040748077781245,
        longitude: 33.245106355000054,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.18300032333338, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4591986198889231,
        longitude: 33.18300032333338,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4591986198889231,
        longitude: 33.19542152966672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4591986198889231,
        longitude: 33.20784273600005,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4591986198889231,
        longitude: 33.22026394233339,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: NaN,
        latitude: 0.4591986198889231,
        longitude: 33.23268514866672,
        pm2_5: NaN,
        variance: NaN
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 49.03426093316791,
        latitude: 0.33574773744449105,
        longitude: 32.561856704555595,
        pm2_5: 47.36374248135837,
        variance: 625.8743089499158
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 49.033151496739315,
        latitude: 0.33574773744449105,
        longitude: 32.56793615633338,
        pm2_5: 47.32665106020237,
        variance: 625.8459875318067
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 49.032980476144765,
        latitude: 0.33574773744449105,
        longitude: 32.57401560811116,
        pm2_5: 47.326302848960204,
        variance: 625.8416218174702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 49.032824798023945,
        latitude: 0.34422949488893234,
        longitude: 32.561856704555595,
        pm2_5: 47.3259211073179,
        variance: 625.8376477701249
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 49.03268447841214,
        latitude: 0.34422949488893234,
        longitude: 32.56793615633338,
        pm2_5: 47.32550585787394,
        variance: 625.8340657953768
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 49.03394695176196,
        latitude: 0.34422949488893234,
        longitude: 32.57401560811116,
        pm2_5: 47.318528107309554,
        variance: 625.8662936454098
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 49.0337155687359,
        latitude: 0.34422949488893234,
        longitude: 32.58009505988894,
        pm2_5: 47.31831328200548,
        variance: 625.8603869418193
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 49.03349939844238,
        latitude: 0.34422949488893234,
        longitude: 32.58617451166672,
        pm2_5: 47.31806508431606,
        variance: 625.8548686112686
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.03329846297342,
        latitude: 0.3527112523333737,
        longitude: 32.555777252777816,
        pm2_5: 47.317783525041,
        variance: 625.849739212576
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.033112782889994,
        latitude: 0.3527112523333737,
        longitude: 32.561856704555595,
        pm2_5: 47.31746861793228,
        variance: 625.8449992658293
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.03333784222057,
        latitude: 0.3527112523333737,
        longitude: 32.56793615633338,
        pm2_5: 47.32696572141684,
        variance: 625.8507444682787
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.03294237721718,
        latitude: 0.3527112523333737,
        longitude: 32.57401560811116,
        pm2_5: 47.317120379675934,
        variance: 625.8406492522649
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.03264745750277,
        latitude: 0.3527112523333737,
        longitude: 32.58009505988894,
        pm2_5: 47.31632399117966,
        variance: 625.8331207548295
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 49.03349346354217,
        latitude: 0.3527112523333737,
        longitude: 32.58617451166672,
        pm2_5: 47.308838558767256,
        variance: 625.8547171072555
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.033293267527085,
        latitude: 0.361193009777815,
        longitude: 32.555777252777816,
        pm2_5: 47.30855657147765,
        variance: 625.8496065856198
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.03310827470846,
        latitude: 0.361193009777815,
        longitude: 32.561856704555595,
        pm2_5: 47.30824145781653,
        variance: 625.844884183487
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.03293850399895,
        latitude: 0.361193009777815,
        longitude: 32.56793615633338,
        pm2_5: 47.30789323448889,
        variance: 625.8405503792542
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.032783972780344,
        latitude: 0.361193009777815,
        longitude: 32.57401560811116,
        pm2_5: 47.307511921118824,
        variance: 625.8366056125951
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.03352169022883,
        latitude: 0.361193009777815,
        longitude: 32.58009505988894,
        pm2_5: 47.2995686407996,
        variance: 625.8554376681959
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.033322257185354,
        latitude: 0.361193009777815,
        longitude: 32.58617451166672,
        pm2_5: 47.29928626260015,
        variance: 625.8503466204156
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.03313797333798,
        latitude: 0.361193009777815,
        longitude: 32.592253963444506,
        pm2_5: 47.298970982034234,
        variance: 625.8456423137231
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 49.03278726344061,
        latitude: 0.361193009777815,
        longitude: 32.598333415222285,
        pm2_5: 47.31673882990362,
        variance: 625.8366896141774
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03353949345382,
        latitude: 0.36967476722225634,
        longitude: 32.555777252777816,
        pm2_5: 47.32724681593517,
        variance: 625.8558921428821
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03375642976012,
        latitude: 0.36967476722225634,
        longitude: 32.561856704555595,
        pm2_5: 47.327494330054435,
        variance: 625.8614300325494
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03398862892075,
        latitude: 0.36967476722225634,
        longitude: 32.56793615633338,
        pm2_5: 47.32770825303636,
        variance: 625.8673575752628
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03404119129268,
        latitude: 0.36967476722225634,
        longitude: 32.57401560811116,
        pm2_5: 47.363498034038614,
        variance: 625.8686993829101
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03383691708473,
        latitude: 0.36967476722225634,
        longitude: 32.58009505988894,
        pm2_5: 47.363219158224794,
        variance: 625.8634846968089
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.034083695183085,
        latitude: 0.36967476722225634,
        longitude: 32.58617451166672,
        pm2_5: 47.354754605820034,
        variance: 625.8697844195699
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.0338646156081,
        latitude: 0.36967476722225634,
        longitude: 32.592253963444506,
        pm2_5: 47.35450934282917,
        variance: 625.8641917799314
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 49.03366096083084,
        latitude: 0.36967476722225634,
        longitude: 32.598333415222285,
        pm2_5: 47.35422985918101,
        variance: 625.8589929252671
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03347275186511,
        latitude: 0.37815652466669764,
        longitude: 32.555777252777816,
        pm2_5: 47.35391616843284,
        variance: 625.8541883871039
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03330000815756,
        latitude: 0.37815652466669764,
        longitude: 32.561856704555595,
        pm2_5: 47.35356828717045,
        variance: 625.8497786573262
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.034174261469175,
        latitude: 0.37815652466669764,
        longitude: 32.56793615633338,
        pm2_5: 47.34592839990877,
        variance: 625.8720963932024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03394051275033,
        latitude: 0.37815652466669764,
        longitude: 32.57401560811116,
        pm2_5: 47.34571637417725,
        variance: 625.8661292711208
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03372212163969,
        latitude: 0.37815652466669764,
        longitude: 32.58009505988894,
        pm2_5: 47.34547032785787,
        variance: 625.860554222766
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03351911059835,
        latitude: 0.37815652466669764,
        longitude: 32.58617451166672,
        pm2_5: 47.345190271542684,
        variance: 625.855371816278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03333150053188,
        latitude: 0.37815652466669764,
        longitude: 32.592253963444506,
        pm2_5: 47.34487621884414,
        variance: 625.8505825804486
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 49.03315931078575,
        latitude: 0.37815652466669764,
        longitude: 32.598333415222285,
        pm2_5: 47.34452818637653,
        variance: 625.8461870046062
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 49.034064404265266,
        latitude: 0.386638282111139,
        longitude: 32.56793615633338,
        pm2_5: 47.33684214581409,
        variance: 625.869291962108
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 49.03383141648102,
        latitude: 0.386638282111139,
        longitude: 32.57401560811116,
        pm2_5: 47.33662915618892,
        variance: 625.8633442783948
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 49.03361373984652,
        latitude: 0.386638282111139,
        longitude: 32.58009505988894,
        pm2_5: 47.33638235934115,
        variance: 625.8577874813791
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 49.033411396703436,
        latitude: 0.386638282111139,
        longitude: 32.58617451166672,
        pm2_5: 47.33610176593965,
        variance: 625.8526221361844
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 49.03322440784527,
        latitude: 0.386638282111139,
        longitude: 32.592253963444506,
        pm2_5: 47.3357873896392,
        variance: 625.8478487687717
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 49.03305279251383,
        latitude: 0.3951200395555803,
        longitude: 32.56793615633338,
        pm2_5: 47.33543924708256,
        variance: 625.8434678658496
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 49.03289656839482,
        latitude: 0.3951200395555803,
        longitude: 32.57401560811116,
        pm2_5: 47.33505735790471,
        variance: 625.8394798747668
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 49.03275575161385,
        latitude: 0.3951200395555803,
        longitude: 32.58009505988894,
        pm2_5: 47.334641744715846,
        variance: 625.8358852034103
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 49.03296885748418,
        latitude: 0.3951200395555803,
        longitude: 32.58617451166672,
        pm2_5: 47.29862281582932,
        variance: 625.8413252236082
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 49.032814926898965,
        latitude: 0.3951200395555803,
        longitude: 32.592253963444506,
        pm2_5: 47.298241783590626,
        variance: 625.8373957870485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.31038644444444446],
        type: 'Point'
      },
      properties: {
        interval: 2.7206413591070047,
        latitude: 0.31038644444444446,
        longitude: 32.58894933333333,
        pm2_5: 14.792213413700637,
        variance: 1.926772543961789
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 2.720803128608987,
        latitude: 0.3113328888888889,
        longitude: 32.58894933333333,
        pm2_5: 14.792208015539085,
        variance: 1.9270016828010341
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 2.720795320702196,
        latitude: 0.3113328888888889,
        longitude: 32.589745666666666,
        pm2_5: 14.792207839098946,
        variance: 1.9269906229578737
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 2.72078397035894,
        latitude: 0.31227933333333335,
        longitude: 32.589745666666666,
        pm2_5: 14.792209094658402,
        variance: 1.9269745453358382
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 2.7207761599831475,
        latitude: 0.31227933333333335,
        longitude: 32.590542,
        pm2_5: 14.792208918163672,
        variance: 1.926963482073262
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 2.7207683549510984,
        latitude: 0.31227933333333335,
        longitude: 32.59133833333333,
        pm2_5: 14.792208741124755,
        variance: 1.9269524264117308
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 2.720760555268074,
        latitude: 0.31322577777777777,
        longitude: 32.59133833333333,
        pm2_5: 14.792208563541493,
        variance: 1.9269413783586629
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 2.7207527609390976,
        latitude: 0.31322577777777777,
        longitude: 32.59213466666667,
        pm2_5: 14.792208385413927,
        variance: 1.9269303379211067
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 2.72074497196891,
        latitude: 0.31322577777777777,
        longitude: 32.592931,
        pm2_5: 14.792208206742252,
        variance: 1.926919305105713
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 2.7207570016020717,
        latitude: 0.31322577777777777,
        longitude: 32.593727333333334,
        pm2_5: 14.792209996710858,
        variance: 1.9269363446914554
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 2.7208222891731286,
        latitude: 0.31417222222222224,
        longitude: 32.59133833333333,
        pm2_5: 14.79220693590272,
        variance: 1.9270288237352418
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 2.720749194109925,
        latitude: 0.31417222222222224,
        longitude: 32.59213466666667,
        pm2_5: 14.792209819617337,
        variance: 1.9269252856231276
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 2.7207456608693645,
        latitude: 0.31417222222222224,
        longitude: 32.592931,
        pm2_5: 14.792211251342204,
        variance: 1.9269202809088597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.7207378455764943,
        latitude: 0.31511866666666666,
        longitude: 32.589745666666666,
        pm2_5: 14.79221107473906,
        variance: 1.9269092108372092
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.720730035630905,
        latitude: 0.31511866666666666,
        longitude: 32.590542,
        pm2_5: 14.792210897591017,
        variance: 1.9268981483715493
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.7207222310375583,
        latitude: 0.31511866666666666,
        longitude: 32.59133833333333,
        pm2_5: 14.792210719898534,
        variance: 1.9268870935188431
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.720703072493338,
        latitude: 0.31511866666666666,
        longitude: 32.59213466666667,
        pm2_5: 14.792211797298382,
        variance: 1.9268599564438489
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.720695270814227,
        latitude: 0.31511866666666666,
        longitude: 32.592931,
        pm2_5: 14.792211619006869,
        variance: 1.9268489058285354
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 2.720687474499073,
        latitude: 0.31511866666666666,
        longitude: 32.593727333333334,
        pm2_5: 14.7922114401705,
        variance: 1.9268378628426035
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 2.720668313488055,
        latitude: 0.31606511111111113,
        longitude: 32.592931,
        pm2_5: 14.792212516941062,
        variance: 1.926810722620246
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 2.7206605201091443,
        latitude: 0.31606511111111113,
        longitude: 32.593727333333334,
        pm2_5: 14.792212337505637,
        variance: 1.9267996839026864
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 2.7207413919680716,
        latitude: 0.31701155555555555,
        longitude: 32.593727333333334,
        pm2_5: 14.792209641979134,
        variance: 1.9269142341650252
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59452366666667, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 2.7208300999395476,
        latitude: 0.31701155555555555,
        longitude: 32.59452366666667,
        pm2_5: 14.792207111743936,
        variance: 1.9270398877387152
      },
      type: 'Feature'
    }
  ],
  type: 'FeatureCollection'
};

const HeatMapOverlay = () => {
  const dispatch = useDispatch();
  // const [heatMapData, setHeatMapData] = useState(usePM25HeatMapData());
  const [heatMapData, setHeatMapData] = useState(heatMapData22);
  const monitoringSiteData = useEventsMapData();

  useEffect(() => {
    if (heatMapData && (!heatMapData.features || heatMapData.features.length === 0)) {
      dispatch(loadPM25HeatMapData());
    }
  }, [heatMapData]);

  useEffect(() => {
    if (!monitoringSiteData.features || monitoringSiteData.features.length === 0) {
      dispatch(
        loadMapEventsData({
          recent: 'yes',
          external: 'no',
          metadata: 'site_id',
          frequency: 'hourly',
          active: 'yes'
        })
      );
    }
  }, [monitoringSiteData]);

  // Check if data is still loading
  if (!monitoringSiteData.features) {
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
    <div>
      <ErrorBoundary>
        <OverlayMap
          center={[22.5600613, 0.8341424]}
          zoom={2.4}
          heatMapData={heatMapData}
          monitoringSiteData={monitoringSiteData}
        />
      </ErrorBoundary>
    </div>
  );
};

export default HeatMapOverlay;
