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
    if (pollutant) {
      setShowPollutant({
        pm2_5: pollutant === 'pm2_5',
        no2: pollutant === 'no2',
        pm10: pollutant === 'pm10'
      });
    } else {
      console.error('No pollutant data found in localStorage');
    }
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

        // Set visibility to visible
        const visibility = 'visible';
        ['sensor-heat', 'sensor-point'].forEach((id) =>
          map.setLayoutProperty(id, 'visibility', visibility)
        );
      });
    } else {
      console.error('No map or heatmap data found');
    }
  }, [map, heatMapData]);

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
      } else {
        return;
      }
    }
  }, [map, heatMapData]);

  const toggleSensors = () => {
    try {
      const markers = document.getElementsByClassName('marker');
      if (markers.length > 0) {
        for (let i = 0; i < markers.length; i++) {
          markers[i].style.visibility = !showSensors ? 'visible' : 'hidden';
        }
        setShowSensors(!showSensors);
      } else {
        console.error('No markers found');
      }
    } catch (err) {
      console.error('Error toggling sensors:', err);
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
          // onHeatmapChange={toggleHeatMap}
          onCalibratedChange={setShowCalibratedValues}
          onPollutantChange={setShowPollutant}
          className={'pollutant-selector'}
        />
      )}
    </div>
  );
};

const heatMapData = {
  features: [
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 2.682667164972779,
        latitude: 5.5415,
        longitude: -0.3858666666666667,
        pm2_5: 15.29732419502919,
        variance: 1.8733608699560307
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 2.6872256457810186,
        latitude: 5.5415,
        longitude: -0.2516333333333334,
        pm2_5: 15.298053819943085,
        variance: 1.8797328382296996
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 2.6870454110784077,
        latitude: 5.6126,
        longitude: -0.3858666666666667,
        pm2_5: 15.297786488041275,
        variance: 1.87948069585525
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 2.6875747350106916,
        latitude: 5.6126,
        longitude: -0.2516333333333334,
        pm2_5: 15.297495758491294,
        variance: 1.8802212505903242
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 2.688803678647423,
        latitude: 5.6126,
        longitude: -0.11740000000000006,
        pm2_5: 15.297186863728012,
        variance: 1.8819411761526226
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 2.685355527288726,
        latitude: 5.6837,
        longitude: -0.3858666666666667,
        pm2_5: 15.298438983642553,
        variance: 1.8771174270981135
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 2.6844909968747337,
        latitude: 5.6837,
        longitude: -0.2516333333333334,
        pm2_5: 15.298206000005491,
        variance: 1.8759089734229235
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 2.684315215179193,
        latitude: 5.6837,
        longitude: -0.11740000000000006,
        pm2_5: 15.297945531507246,
        variance: 1.8756633107149412
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 2.6848314854281448,
        latitude: 5.6837,
        longitude: 0.016833333333333256,
        pm2_5: 15.297662265983718,
        variance: 1.8763848670205903
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 2.6860301233915305,
        latitude: 5.7547999999999995,
        longitude: -0.3858666666666667,
        pm2_5: 15.297361301490968,
        variance: 1.878060657998418
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 2.6828922203111905,
        latitude: 5.7547999999999995,
        longitude: -0.2516333333333334,
        pm2_5: 15.298570642547029,
        variance: 1.8736752045518301
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 2.682054074633526,
        latitude: 5.7547999999999995,
        longitude: -0.11740000000000006,
        pm2_5: 15.298344975714176,
        variance: 1.87250470097311
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 2.6818836634682337,
        latitude: 5.7547999999999995,
        longitude: 0.016833333333333256,
        pm2_5: 15.298092687136467,
        variance: 1.8722667597818088
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 2.682384185070999,
        latitude: 5.7547999999999995,
        longitude: 0.15106666666666657,
        pm2_5: 15.297818317381244,
        variance: 1.872965669595743
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.690599175556515,
        latitude: 5.8259,
        longitude: -0.11740000000000006,
        pm2_5: 15.297319636633267,
        variance: 1.8844554153231456
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.683546261992362,
        latitude: 5.8259,
        longitude: 0.016833333333333256,
        pm2_5: 15.297526804352753,
        variance: 1.8745888536685698
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.680246039524215,
        latitude: 5.8259,
        longitude: 0.15106666666666657,
        pm2_5: 15.297963123785607,
        variance: 1.8699809538695433
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.6813654794809847,
        latitude: 5.8259,
        longitude: 0.2852999999999999,
        pm2_5: 15.297682535667322,
        variance: 1.8715433242795427
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.6831012752010177,
        latitude: 5.8259,
        longitude: 0.4195333333333332,
        pm2_5: 15.297390496240062,
        variance: 1.8739672149586966
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 2.6854210251772437,
        latitude: 5.8259,
        longitude: 0.5537666666666665,
        pm2_5: 15.297092261004039,
        variance: 1.8772089968929606
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.6882815257482506,
        latitude: 5.896999999999999,
        longitude: 0.016833333333333256,
        pm2_5: 15.296793196695335,
        variance: 1.8812103190543894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.679499559332056,
        latitude: 5.896999999999999,
        longitude: 0.15106666666666657,
        pm2_5: 15.297827708158243,
        variance: 1.8689394753385784
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.6811601899640514,
        latitude: 5.896999999999999,
        longitude: 0.2852999999999999,
        pm2_5: 15.297548515439193,
        variance: 1.8712567587068065
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.683379557965601,
        latitude: 5.896999999999999,
        longitude: 0.4195333333333332,
        pm2_5: 15.297263399225626,
        variance: 1.8743559590034522
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.6861163887966915,
        latitude: 5.896999999999999,
        longitude: 0.5537666666666665,
        pm2_5: 15.296977490134188,
        variance: 1.8781812927327621
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 2.6795353748396136,
        latitude: 5.9681,
        longitude: 0.016833333333333256,
        pm2_5: 15.297696653095946,
        variance: 1.8689894379989767
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 2.681642737898002,
        latitude: 5.9681,
        longitude: 0.15106666666666657,
        pm2_5: 15.297426097052051,
        variance: 1.8719303867453903
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 2.68424156842846,
        latitude: 5.9681,
        longitude: 0.2852999999999999,
        pm2_5: 15.297154788334888,
        variance: 1.8755603908994374
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 2.6802199499739534,
        latitude: 5.9681,
        longitude: 0.4195333333333332,
        pm2_5: 15.297579531990356,
        variance: 1.8699445492082418
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.685348137812398,
        latitude: 6.039199999999999,
        longitude: 0.15106666666666657,
        pm2_5: 15.297223394339548,
        variance: 1.8771070963277054
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 2.6900595544168833,
        latitude: 6.039199999999999,
        longitude: 0.2852999999999999,
        pm2_5: 15.297616360768865,
        variance: 1.883699605973959
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 31.632930988130592,
        latitude: 5.5415,
        longitude: -0.3858666666666667,
        pm2_5: 42.82448611783261,
        variance: 260.4754068356499
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 31.92384365726214,
        latitude: 5.5415,
        longitude: -0.2516333333333334,
        pm2_5: 42.71355581513294,
        variance: 265.2883678293722
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 31.90498018208319,
        latitude: 5.6126,
        longitude: -0.3858666666666667,
        pm2_5: 42.70837817504061,
        variance: 264.97494804745975
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 31.885507227820387,
        latitude: 5.6126,
        longitude: -0.2516333333333334,
        pm2_5: 42.69878114185006,
        variance: 264.65159599525873
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 31.865764615733763,
        latitude: 5.6126,
        longitude: -0.11740000000000006,
        pm2_5: 42.68486105963351,
        variance: 264.3239677596184
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 31.908667808872405,
        latitude: 5.6837,
        longitude: -0.3858666666666667,
        pm2_5: 42.75170517194165,
        variance: 265.0362040131638
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 31.890858232552272,
        latitude: 5.6837,
        longitude: -0.2516333333333334,
        pm2_5: 42.7509575296611,
        variance: 264.74043076029443
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 31.87213313351205,
        latitude: 5.6837,
        longitude: -0.11740000000000006,
        pm2_5: 42.74585319876344,
        variance: 264.4296310079958
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 31.852808364932493,
        latitude: 5.6837,
        longitude: 0.016833333333333256,
        pm2_5: 42.73640479628736,
        variance: 264.10906932869466
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 31.833221480590083,
        latitude: 5.7547999999999995,
        longitude: -0.3858666666666667,
        pm2_5: 42.72270919623129,
        variance: 263.7843580363135
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 31.875549891012046,
        latitude: 5.7547999999999995,
        longitude: -0.2516333333333334,
        pm2_5: 42.7870091621131,
        variance: 264.48632883548476
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 31.85797609555965,
        latitude: 5.7547999999999995,
        longitude: -0.11740000000000006,
        pm2_5: 42.786258429488235,
        variance: 264.1947732468893
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 31.839504884253536,
        latitude: 5.7547999999999995,
        longitude: 0.016833333333333256,
        pm2_5: 42.7812494350931,
        variance: 263.88850251832696
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 31.820448516798525,
        latitude: 5.7547999999999995,
        longitude: 0.15106666666666657,
        pm2_5: 42.77199728850768,
        variance: 263.5727154857939
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.91834599205925,
        latitude: 5.8259,
        longitude: -0.11740000000000006,
        pm2_5: 42.65937881828755,
        variance: 265.19700407871846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.801140235226264,
        latitude: 5.8259,
        longitude: 0.016833333333333256,
        pm2_5: 42.7585992495732,
        variance: 263.25294675669693
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.788634307164592,
        latitude: 5.8259,
        longitude: 0.15106666666666657,
        pm2_5: 42.80531298325883,
        variance: 263.04593687907163
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.769731332762476,
        latitude: 5.8259,
        longitude: 0.2852999999999999,
        pm2_5: 42.792286392231865,
        variance: 262.73319162742337
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.750930999523085,
        latitude: 5.8259,
        longitude: 0.4195333333333332,
        pm2_5: 42.7754204296576,
        variance: 262.42232906509685
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 31.732584136625317,
        latitude: 5.8259,
        longitude: 0.5537666666666665,
        pm2_5: 42.754978370246974,
        variance: 262.1191420210341
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.7150435414941,
        latitude: 5.896999999999999,
        longitude: 0.016833333333333256,
        pm2_5: 42.73130521959268,
        variance: 261.829442638189
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.739209861271977,
        latitude: 5.896999999999999,
        longitude: 0.15106666666666657,
        pm2_5: 42.82353490511975,
        variance: 262.22861375933576
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.720949576836155,
        latitude: 5.896999999999999,
        longitude: 0.2852999999999999,
        pm2_5: 42.80726252068529,
        variance: 261.9269684652702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.703137618096452,
        latitude: 5.896999999999999,
        longitude: 0.4195333333333332,
        pm2_5: 42.787554412799615,
        variance: 261.6328964056545
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.68611564428791,
        latitude: 5.896999999999999,
        longitude: 0.5537666666666665,
        pm2_5: 42.76474426017097,
        variance: 261.3520211951236
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 31.692203548914716,
        latitude: 5.9681,
        longitude: 0.016833333333333256,
        pm2_5: 42.83653959272875,
        variance: 261.4524588155566
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 31.675054062928137,
        latitude: 5.9681,
        longitude: 0.15106666666666657,
        pm2_5: 42.817684853913136,
        variance: 261.16957775130686
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 31.658672959594156,
        latitude: 5.9681,
        longitude: 0.2852999999999999,
        pm2_5: 42.79587692972215,
        variance: 260.8995141510147
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 31.64854998333729,
        latitude: 5.9681,
        longitude: 0.4195333333333332,
        pm2_5: 42.845156086657965,
        variance: 260.7326936817469
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.78192918340219,
        latitude: 6.039199999999999,
        longitude: 0.15106666666666657,
        pm2_5: 42.74123804655821,
        variance: 262.9349808982695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 31.93785181479664,
        latitude: 6.039199999999999,
        longitude: 0.2852999999999999,
        pm2_5: 42.66907793083568,
        variance: 265.52123556432457
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.027300000000004, -24.088866666666668],
        type: 'Point'
      },
      properties: {
        interval: 6.0030233311726455,
        latitude: -24.088866666666668,
        longitude: 44.027300000000004,
        pm2_5: 16.169470032086384,
        variance: 9.380541731206563
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -24.088866666666668],
        type: 'Point'
      },
      properties: {
        interval: 6.014266276271574,
        latitude: -24.088866666666668,
        longitude: 44.834700000000005,
        pm2_5: 16.17057064993975,
        variance: 9.415711901785073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -24.088866666666668],
        type: 'Point'
      },
      properties: {
        interval: 6.124192230578517,
        latitude: -24.088866666666668,
        longitude: 45.6421,
        pm2_5: 16.192185243341537,
        variance: 9.763049374499758
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -24.088866666666668],
        type: 'Point'
      },
      properties: {
        interval: 6.20564719327872,
        latitude: -24.088866666666668,
        longitude: 46.4495,
        pm2_5: 16.213426197806434,
        variance: 10.024483831593102
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -24.088866666666668],
        type: 'Point'
      },
      properties: {
        interval: 6.212433683921193,
        latitude: -24.088866666666668,
        longitude: 47.2569,
        pm2_5: 16.221589921413422,
        variance: 10.046421354935092
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.027300000000004, -22.571733333333334],
        type: 'Point'
      },
      properties: {
        interval: 6.140899728132614,
        latitude: -22.571733333333334,
        longitude: 44.027300000000004,
        pm2_5: 16.211884321606668,
        variance: 9.816391469955022
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -22.571733333333334],
        type: 'Point'
      },
      properties: {
        interval: 6.0311171109109285,
        latitude: -22.571733333333334,
        longitude: 44.834700000000005,
        pm2_5: 16.189876109848893,
        variance: 9.468547898147278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -22.571733333333334],
        type: 'Point'
      },
      properties: {
        interval: 6.150214234540258,
        latitude: -22.571733333333334,
        longitude: 45.6421,
        pm2_5: 16.214606742878306,
        variance: 9.846193026536241
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -22.571733333333334],
        type: 'Point'
      },
      properties: {
        interval: 6.03743624794926,
        latitude: -22.571733333333334,
        longitude: 46.4495,
        pm2_5: 16.192610163799824,
        variance: 9.488399741787703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -22.571733333333334],
        type: 'Point'
      },
      properties: {
        interval: 5.946882207251995,
        latitude: -22.571733333333334,
        longitude: 47.2569,
        pm2_5: 16.170002701384643,
        variance: 9.205905869150968
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.027300000000004, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 5.9390166616134294,
        latitude: -21.0546,
        longitude: 44.027300000000004,
        pm2_5: 16.16117697939211,
        variance: 9.181569894554855
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 6.019345935697573,
        latitude: -21.0546,
        longitude: 44.834700000000005,
        pm2_5: 16.171853675349926,
        variance: 9.431623670761894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 6.13360447616644,
        latitude: -21.0546,
        longitude: 45.6421,
        pm2_5: 16.194974730803366,
        variance: 9.793082015318873
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 6.211235596815077,
        latitude: -21.0546,
        longitude: 46.4495,
        pm2_5: 16.216045870698764,
        variance: 10.04254676154278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 5.669778120089039,
        latitude: -21.0546,
        longitude: 47.2569,
        pm2_5: 16.16505215624082,
        variance: 8.367967495585276
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.0643, -21.0546],
        type: 'Point'
      },
      properties: {
        interval: 5.765137983237747,
        latitude: -21.0546,
        longitude: 48.0643,
        pm2_5: 16.17650510942115,
        variance: 8.651815901127293
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 5.899989720946881,
        latitude: -19.537466666666667,
        longitude: 44.834700000000005,
        pm2_5: 16.201549215733447,
        variance: 9.061297039587373
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 5.991103459072198,
        latitude: -19.537466666666667,
        longitude: 45.6421,
        pm2_5: 16.224462116183364,
        variance: 9.343325868728357
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 5.944499927820851,
        latitude: -19.537466666666667,
        longitude: 46.4495,
        pm2_5: 16.162206044871148,
        variance: 9.198531703420997
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 5.774923861340704,
        latitude: -19.537466666666667,
        longitude: 47.2569,
        pm2_5: 16.196259128739666,
        variance: 8.68121241260991
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.0643, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 5.91307520689071,
        latitude: -19.537466666666667,
        longitude: 48.0643,
        pm2_5: 16.221648669087703,
        variance: 9.101535402526451
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.871700000000004, -19.537466666666667],
        type: 'Point'
      },
      properties: {
        interval: 6.002421303062745,
        latitude: -19.537466666666667,
        longitude: 48.871700000000004,
        pm2_5: 16.232672575200123,
        variance: 9.37866032368322
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.027300000000004, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.053956473339721,
        latitude: -18.020333333333333,
        longitude: 44.027300000000004,
        pm2_5: 16.175649771621423,
        variance: 9.540396965090565
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.134971354851007,
        latitude: -18.020333333333333,
        longitude: 44.834700000000005,
        pm2_5: 16.191690630827168,
        variance: 9.797447294055189
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.195613522576394,
        latitude: -18.020333333333333,
        longitude: 45.6421,
        pm2_5: 16.207534932813758,
        variance: 9.992093638362007
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.200693577033195,
        latitude: -18.020333333333333,
        longitude: 46.4495,
        pm2_5: 16.213628342577188,
        variance: 10.008486265165743
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.216237173521234,
        latitude: -18.020333333333333,
        longitude: 47.2569,
        pm2_5: 16.22928157075755,
        variance: 10.058726727787189
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.0643, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.136507619290975,
        latitude: -18.020333333333333,
        longitude: 48.0643,
        pm2_5: 16.219653556184763,
        variance: 9.802354685968396
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.871700000000004, -18.020333333333333],
        type: 'Point'
      },
      properties: {
        interval: 6.000450721699487,
        latitude: -18.020333333333333,
        longitude: 48.871700000000004,
        pm2_5: 16.19340271125029,
        variance: 9.37250334848602
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [44.834700000000005, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.89028512061287,
        latitude: -16.5032,
        longitude: 44.834700000000005,
        pm2_5: 16.166284212119564,
        variance: 9.031512599467248
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [45.6421, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.759707260800404,
        latitude: -16.5032,
        longitude: 45.6421,
        pm2_5: 16.197585844936494,
        variance: 8.635523669855502
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [46.4495, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.880677176971292,
        latitude: -16.5032,
        longitude: 46.4495,
        pm2_5: 16.155663262420624,
        variance: 9.002073110097626
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.875924032522542,
        latitude: -16.5032,
        longitude: 47.2569,
        pm2_5: 16.21894769458484,
        variance: 8.98752687317159
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.0643, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.769689415147902,
        latitude: -16.5032,
        longitude: 48.0643,
        pm2_5: 16.20012007083794,
        variance: 8.665482077069385
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.871700000000004, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.684746157057179,
        latitude: -16.5032,
        longitude: 48.871700000000004,
        pm2_5: 16.180713045226682,
        variance: 8.412208160708133
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.6791, -16.5032],
        type: 'Point'
      },
      properties: {
        interval: 5.677413855396775,
        latitude: -16.5032,
        longitude: 49.6791,
        pm2_5: 16.173024881069573,
        variance: 8.39052167988632
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [47.2569, -14.986066666666668],
        type: 'Point'
      },
      properties: {
        interval: 5.752767374025103,
        latitude: -14.986066666666668,
        longitude: 47.2569,
        pm2_5: 16.182002631488388,
        variance: 8.61472627541849
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.0643, -14.986066666666668],
        type: 'Point'
      },
      properties: {
        interval: 5.753680518712162,
        latitude: -14.986066666666668,
        longitude: 48.0643,
        pm2_5: 16.173497985536756,
        variance: 8.617461347201129
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.871700000000004, -14.986066666666668],
        type: 'Point'
      },
      properties: {
        interval: 5.892217849711344,
        latitude: -14.986066666666668,
        longitude: 48.871700000000004,
        pm2_5: 16.198481729084463,
        variance: 9.037440438477972
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.6791, -14.986066666666668],
        type: 'Point'
      },
      properties: {
        interval: 5.994005354343648,
        latitude: -14.986066666666668,
        longitude: 49.6791,
        pm2_5: 16.223089128113177,
        variance: 9.352379265904915
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [48.871700000000004, -13.468933333333334],
        type: 'Point'
      },
      properties: {
        interval: 5.93886870199795,
        latitude: -13.468933333333334,
        longitude: 48.871700000000004,
        pm2_5: 16.225804714729698,
        variance: 9.181112416589656
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.6791, -13.468933333333334],
        type: 'Point'
      },
      properties: {
        interval: 5.677512578831172,
        latitude: -13.468933333333334,
        longitude: 49.6791,
        pm2_5: 16.1780677464593,
        variance: 8.390813484690284
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.31038644444444446],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31038644444444446,
        longitude: 32.58894933333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.3113328888888889,
        longitude: 32.58894933333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.3113328888888889,
        longitude: 32.589745666666666,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31227933333333335,
        longitude: 32.589745666666666,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31227933333333335,
        longitude: 32.590542,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31227933333333335,
        longitude: 32.59133833333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31322577777777777,
        longitude: 32.59133833333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31322577777777777,
        longitude: 32.59213466666667,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31322577777777777,
        longitude: 32.592931,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31322577777777777,
        longitude: 32.593727333333334,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31417222222222224,
        longitude: 32.59133833333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31417222222222224,
        longitude: 32.59213466666667,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31417222222222224,
        longitude: 32.592931,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.589745666666666,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.590542,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.59133833333333,
        pm2_5: 34.874905840224855,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.59213466666667,
        pm2_5: 34.87490584022318,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.592931,
        pm2_5: 34.87490584022318,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31511866666666666,
        longitude: 32.593727333333334,
        pm2_5: 34.87490584022318,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847857492,
        latitude: 0.31606511111111113,
        longitude: 32.592931,
        pm2_5: 34.87490584022318,
        variance: 4.934962164808894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847856689,
        latitude: 0.31606511111111113,
        longitude: 32.593727333333334,
        pm2_5: 34.87490584022318,
        variance: 4.934962164807075
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847856689,
        latitude: 0.31701155555555555,
        longitude: 32.593727333333334,
        pm2_5: 34.87490584022318,
        variance: 4.934962164807075
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59452366666667, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 4.354095847856689,
        latitude: 0.31701155555555555,
        longitude: 32.59452366666667,
        pm2_5: 34.87490584022372,
        variance: 4.934962164807075
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.11805555555556, -15.8049],
        type: 'Point'
      },
      properties: {
        interval: 24.9741867681765,
        latitude: -15.8049,
        longitude: 49.11805555555556,
        pm2_5: 16.402496543364727,
        variance: 162.35683171901348
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.23691111111111, -15.8049],
        type: 'Point'
      },
      properties: {
        interval: 24.7241122479548,
        latitude: -15.8049,
        longitude: 49.23691111111111,
        pm2_5: 16.330188985904822,
        variance: 159.1216489091703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.35576666666667, -15.8049],
        type: 'Point'
      },
      properties: {
        interval: 24.725381658270067,
        latitude: -15.8049,
        longitude: 49.35576666666667,
        pm2_5: 16.329096187447632,
        variance: 159.13798889710483
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.8049],
        type: 'Point'
      },
      properties: {
        interval: 24.744321625290922,
        latitude: -15.8049,
        longitude: 49.47462222222222,
        pm2_5: 16.33209573129307,
        variance: 159.3818858537693
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.8049],
        type: 'Point'
      },
      properties: {
        interval: 24.780468185676515,
        latitude: -15.8049,
        longitude: 49.59347777777778,
        pm2_5: 16.339131777768497,
        variance: 159.84787679647172
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.11805555555556, -15.68],
        type: 'Point'
      },
      properties: {
        interval: 24.83417861668183,
        latitude: -15.68,
        longitude: 49.11805555555556,
        pm2_5: 16.356808421191708,
        variance: 160.54155236496695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.23691111111111, -15.68],
        type: 'Point'
      },
      properties: {
        interval: 24.786274548304,
        latitude: -15.68,
        longitude: 49.23691111111111,
        pm2_5: 16.34442466915017,
        variance: 159.9227941440813
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.35576666666667, -15.68],
        type: 'Point'
      },
      properties: {
        interval: 24.754105790792423,
        latitude: -15.68,
        longitude: 49.35576666666667,
        pm2_5: 16.335683692462222,
        variance: 159.50795332719258
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.68],
        type: 'Point'
      },
      properties: {
        interval: 24.738441679025144,
        latitude: -15.68,
        longitude: 49.47462222222222,
        pm2_5: 16.33074611338384,
        variance: 159.3061476224824
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.68],
        type: 'Point'
      },
      properties: {
        interval: 24.739661523873853,
        latitude: -15.68,
        longitude: 49.59347777777778,
        pm2_5: 16.329703354289425,
        variance: 159.32185868279998
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.11805555555556, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.7577371104219,
        latitude: -15.5551,
        longitude: 49.11805555555556,
        pm2_5: 16.332574969282707,
        variance: 159.55475500540445
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.23691111111111, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.7922339325639,
        latitude: -15.5551,
        longitude: 49.23691111111111,
        pm2_5: 16.33930805935403,
        variance: 159.99970412509708
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.35576666666667, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.787878074179787,
        latitude: -15.5551,
        longitude: 49.35576666666667,
        pm2_5: 16.340853400043535,
        variance: 159.94348693783922
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.77327919631486,
        latitude: -15.5551,
        longitude: 49.47462222222222,
        pm2_5: 16.33622779438832,
        variance: 159.75514424681558
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.77442547457465,
        latitude: -15.5551,
        longitude: 49.59347777777778,
        pm2_5: 16.335252828069542,
        variance: 159.76992857019297
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.950044444444444, -15.5551],
        type: 'Point'
      },
      properties: {
        interval: 24.840939307918028,
        latitude: -15.5551,
        longitude: 49.950044444444444,
        pm2_5: 16.350753791284184,
        variance: 160.62897378687705
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.11805555555556, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.740543293783816,
        latitude: -15.4302,
        longitude: 49.11805555555556,
        pm2_5: 16.335353405161232,
        variance: 159.3332159703226
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.23691111111111, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.82766900593775,
        latitude: -15.4302,
        longitude: 49.23691111111111,
        pm2_5: 16.346518186762047,
        variance: 160.45740011151656
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.35576666666667, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.77426928668304,
        latitude: -15.4302,
        longitude: 49.35576666666667,
        pm2_5: 16.344492795106426,
        variance: 159.76791406942073
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.889941251732647,
        latitude: -15.4302,
        longitude: 49.47462222222222,
        pm2_5: 16.373949608912163,
        variance: 161.26332140636782
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.907525057388124,
        latitude: -15.4302,
        longitude: 49.59347777777778,
        pm2_5: 16.385587397173065,
        variance: 161.4912548116455
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.71233333333333, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.856388669404094,
        latitude: -15.4302,
        longitude: 49.71233333333333,
        pm2_5: 16.372326959575105,
        variance: 160.82883634019163
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.83118888888889, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.822015132914874,
        latitude: -15.4302,
        longitude: 49.83118888888889,
        pm2_5: 16.362960763156885,
        variance: 160.38432821185313
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.950044444444444, -15.4302],
        type: 'Point'
      },
      properties: {
        interval: 24.805252824737366,
        latitude: -15.4302,
        longitude: 49.950044444444444,
        pm2_5: 16.357664171596976,
        variance: 160.16778626070936
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.23691111111111, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.929200872840813,
        latitude: -15.3053,
        longitude: 49.23691111111111,
        pm2_5: 16.389046377312024,
        variance: 161.7724531857682
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.35576666666667, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.861638869270813,
        latitude: -15.3053,
        longitude: 49.35576666666667,
        pm2_5: 16.371976774023956,
        variance: 160.8967844819964
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.809809835482362,
        latitude: -15.3053,
        longitude: 49.47462222222222,
        pm2_5: 16.358590795347435,
        variance: 160.22664100187353
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.77497140283282,
        latitude: -15.3053,
        longitude: 49.59347777777778,
        pm2_5: 16.349136553326144,
        variance: 159.77697001540605
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.71233333333333, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.757985812739975,
        latitude: -15.3053,
        longitude: 49.71233333333333,
        pm2_5: 16.343791248687698,
        variance: 159.55796061636659
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.83118888888889, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.90087360712715,
        latitude: -15.3053,
        longitude: 49.83118888888889,
        pm2_5: 16.379466043914483,
        variance: 161.4050152015102
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.950044444444444, -15.3053],
        type: 'Point'
      },
      properties: {
        interval: 24.83370535707681,
        latitude: -15.3053,
        longitude: 49.950044444444444,
        pm2_5: 16.36252872953175,
        variance: 160.53543361154345
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.1804],
        type: 'Point'
      },
      properties: {
        interval: 24.7821869961065,
        latitude: -15.1804,
        longitude: 49.47462222222222,
        pm2_5: 16.349248021298514,
        variance: 159.87005214233398
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.1804],
        type: 'Point'
      },
      properties: {
        interval: 24.747563438958895,
        latitude: -15.1804,
        longitude: 49.59347777777778,
        pm2_5: 16.33986942401768,
        variance: 159.42365060529335
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.71233333333333, -15.1804],
        type: 'Point'
      },
      properties: {
        interval: 24.73068793702541,
        latitude: -15.1804,
        longitude: 49.71233333333333,
        pm2_5: 16.33456823356136,
        variance: 159.20630097837727
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -15.0555],
        type: 'Point'
      },
      properties: {
        interval: 24.78850386531916,
        latitude: -15.0555,
        longitude: 49.47462222222222,
        pm2_5: 16.343735173790957,
        variance: 159.95156285947076
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.59347777777778, -15.0555],
        type: 'Point'
      },
      properties: {
        interval: 24.824468525886275,
        latitude: -15.0555,
        longitude: 49.59347777777778,
        pm2_5: 16.357437455271466,
        variance: 160.41603435878756
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [49.47462222222222, -14.9306],
        type: 'Point'
      },
      properties: {
        interval: 24.911868649065962,
        latitude: -14.9306,
        longitude: 49.47462222222222,
        pm2_5: 16.365177974239437,
        variance: 161.54758423269357
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 3.744215697725721,
        latitude: 5.5415,
        longitude: -0.3858666666666667,
        pm2_5: 17.681379458310364,
        variance: 3.6493000809807654
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.5415],
        type: 'Point'
      },
      properties: {
        interval: 3.7662632142562487,
        latitude: 5.5415,
        longitude: -0.2516333333333334,
        pm2_5: 17.677743882398573,
        variance: 3.6924038419043654
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 3.7605082457435217,
        latitude: 5.6126,
        longitude: -0.3858666666666667,
        pm2_5: 17.678093278585468,
        variance: 3.6811282450814815
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 3.756035099806456,
        latitude: 5.6126,
        longitude: -0.2516333333333334,
        pm2_5: 17.678458738814577,
        variance: 3.672376007647358
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6126],
        type: 'Point'
      },
      properties: {
        interval: 3.752929002911319,
        latitude: 5.6126,
        longitude: -0.11740000000000006,
        pm2_5: 17.67883368665321,
        variance: 3.666304690986294
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 3.76997483970431,
        latitude: 5.6837,
        longitude: -0.3858666666666667,
        pm2_5: 17.67775793800436,
        variance: 3.6996851030829703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 3.7632195283906906,
        latitude: 5.6837,
        longitude: -0.2516333333333334,
        pm2_5: 17.678076588669136,
        variance: 3.686438259803481
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 3.757607895074432,
        latitude: 5.6837,
        longitude: -0.11740000000000006,
        pm2_5: 17.678417015591396,
        variance: 3.6754521795933215
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.6837],
        type: 'Point'
      },
      properties: {
        interval: 3.7532462901727524,
        latitude: 5.6837,
        longitude: 0.016833333333333256,
        pm2_5: 17.678773093436106,
        variance: 3.6669246446000443
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.3858666666666667, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 3.7502177033148674,
        latitude: 5.7547999999999995,
        longitude: -0.3858666666666667,
        pm2_5: 17.679138414636014,
        variance: 3.6610091686422948
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.2516333333333334, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 3.7671805399529785,
        latitude: 5.7547999999999995,
        longitude: -0.2516333333333334,
        pm2_5: 17.6780981906483,
        variance: 3.6942027333924443
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 3.7606327304024996,
        latitude: 5.7547999999999995,
        longitude: -0.11740000000000006,
        pm2_5: 17.678406836048378,
        variance: 3.6813719629775505
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 3.7551937293578646,
        latitude: 5.7547999999999995,
        longitude: 0.016833333333333256,
        pm2_5: 17.67873657312163,
        variance: 3.6707309311246945
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.7547999999999995],
        type: 'Point'
      },
      properties: {
        interval: 3.7509664592340335,
        latitude: 5.7547999999999995,
        longitude: 0.15106666666666657,
        pm2_5: 17.679081468893063,
        variance: 3.662471204263511
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [-0.11740000000000006, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.759317677888721,
        latitude: 5.8259,
        longitude: -0.11740000000000006,
        pm2_5: 17.67813999414004,
        variance: 3.678797741380322
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.7480312218771057,
        latitude: 5.8259,
        longitude: 0.016833333333333256,
        pm2_5: 17.67943531705055,
        variance: 3.6567414723463116
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.749208067060796,
        latitude: 5.8259,
        longitude: 0.15106666666666657,
        pm2_5: 17.679382306252176,
        variance: 3.659038195052517
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.7463815367213464,
        latitude: 5.8259,
        longitude: 0.2852999999999999,
        pm2_5: 17.67972289292717,
        variance: 3.6535231722945127
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.744853040607587,
        latitude: 5.8259,
        longitude: 0.4195333333333332,
        pm2_5: 17.680065966593844,
        variance: 3.650542559284645
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.8259],
        type: 'Point'
      },
      properties: {
        interval: 3.744651676888204,
        latitude: 5.8259,
        longitude: 0.5537666666666665,
        pm2_5: 17.680405352932127,
        variance: 3.6501499846995102
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.7457812626307776,
        latitude: 5.896999999999999,
        longitude: 0.016833333333333256,
        pm2_5: 17.68073494371656,
        variance: 3.6523524748739646
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.745277699400862,
        latitude: 5.896999999999999,
        longitude: 0.15106666666666657,
        pm2_5: 17.679999688413314,
        variance: 3.6513705345765857
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.7438159963328963,
        latitude: 5.896999999999999,
        longitude: 0.2852999999999999,
        pm2_5: 17.680327669145242,
        variance: 3.648520984589254
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.7436233908257894,
        latitude: 5.896999999999999,
        longitude: 0.4195333333333332,
        pm2_5: 17.680652124232644,
        variance: 3.648145588384523
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.5537666666666665, 5.896999999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.7447035258683217,
        latitude: 5.896999999999999,
        longitude: 0.5537666666666665,
        pm2_5: 17.680967214270964,
        variance: 3.6502510663917747
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.016833333333333256, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 3.743338501008102,
        latitude: 5.9681,
        longitude: 0.016833333333333256,
        pm2_5: 17.680575534254757,
        variance: 3.6475903616018286
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 3.7431556640367245,
        latitude: 5.9681,
        longitude: 0.15106666666666657,
        pm2_5: 17.680883418277798,
        variance: 3.647234049669464
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 3.7441807119487462,
        latitude: 5.9681,
        longitude: 0.2852999999999999,
        pm2_5: 17.681182415133776,
        variance: 3.649231883519633
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.4195333333333332, 5.9681],
        type: 'Point'
      },
      properties: {
        interval: 3.7432510714715113,
        latitude: 5.9681,
        longitude: 0.4195333333333332,
        pm2_5: 17.681098065707147,
        variance: 3.647419977111781
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.15106666666666657, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.746443930376038,
        latitude: 6.039199999999999,
        longitude: 0.15106666666666657,
        pm2_5: 17.679791749686203,
        variance: 3.653644867620642
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [0.2852999999999999, 6.039199999999999],
        type: 'Point'
      },
      properties: {
        interval: 3.763879017630385,
        latitude: 6.039199999999999,
        longitude: 0.2852999999999999,
        pm2_5: 17.67776699859238,
        variance: 3.6877304402744358
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.742755555555556],
        type: 'Point'
      },
      properties: {
        interval: 14.474086514364652,
        latitude: 8.742755555555556,
        longitude: 7.509622222222222,
        pm2_5: 30.24380343203673,
        variance: 54.53435558759702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.801633333333333],
        type: 'Point'
      },
      properties: {
        interval: 14.460481291394018,
        latitude: 8.801633333333333,
        longitude: 7.509622222222222,
        pm2_5: 30.252033103337148,
        variance: 54.431882335161504
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.458129446063051,
        latitude: 8.86051111111111,
        longitude: 7.229233333333333,
        pm2_5: 30.253454510795418,
        variance: 54.41417822759149
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.456779211678358,
        latitude: 8.86051111111111,
        longitude: 7.285311111111111,
        pm2_5: 30.254270405027505,
        variance: 54.404015299670846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.456435585266952,
        latitude: 8.86051111111111,
        longitude: 7.341388888888889,
        pm2_5: 30.254478026508334,
        variance: 54.40142904804577
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.472732993055784,
        latitude: 8.86051111111111,
        longitude: 7.397466666666666,
        pm2_5: 30.244622695596405,
        variance: 54.52415667645914
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.467302389940539,
        latitude: 8.86051111111111,
        longitude: 7.453544444444444,
        pm2_5: 30.24790856724234,
        variance: 54.483246158366114
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.86051111111111],
        type: 'Point'
      },
      properties: {
        interval: 14.463826052126826,
        latitude: 8.86051111111111,
        longitude: 7.509622222222222,
        pm2_5: 30.250010988154497,
        variance: 54.4570658231421
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.117077777777777, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.462861958639959,
        latitude: 8.91938888888889,
        longitude: 7.117077777777777,
        pm2_5: 30.250593915900662,
        variance: 54.449806339721704
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.457013613019667,
        latitude: 8.91938888888889,
        longitude: 7.173155555555556,
        pm2_5: 30.25412877376312,
        variance: 54.40577952078195
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.45562738865781,
        latitude: 8.91938888888889,
        longitude: 7.229233333333333,
        pm2_5: 30.254966314770652,
        variance: 54.39534652220789
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.455274601548329,
        latitude: 8.91938888888889,
        longitude: 7.285311111111111,
        pm2_5: 30.255179445107366,
        variance: 54.39269153638281
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.467727526109586,
        latitude: 8.91938888888889,
        longitude: 7.341388888888889,
        pm2_5: 30.247651400106196,
        variance: 54.48644829491593
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.463188421962654,
        latitude: 8.91938888888889,
        longitude: 7.397466666666666,
        pm2_5: 30.25039653037092,
        variance: 54.452264506766596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.459678225477475,
        latitude: 8.91938888888889,
        longitude: 7.453544444444444,
        pm2_5: 30.25251849983859,
        variance: 54.42583673061938
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.91938888888889],
        type: 'Point'
      },
      properties: {
        interval: 14.459428123913268,
        latitude: 8.91938888888889,
        longitude: 7.509622222222222,
        pm2_5: 30.252669660100885,
        variance: 54.42395399589077
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.117077777777777, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.468151379745011,
        latitude: 8.978266666666666,
        longitude: 7.117077777777777,
        pm2_5: 30.24739499725496,
        variance: 54.48964086506078
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.473441337179565,
        latitude: 8.978266666666666,
        longitude: 7.173155555555556,
        pm2_5: 30.244193961524658,
        variance: 54.529493997495365
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.479676481496874,
        latitude: 8.978266666666666,
        longitude: 7.229233333333333,
        pm2_5: 30.2404186751156,
        variance: 54.576486622452535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.467754296939503,
        latitude: 8.978266666666666,
        longitude: 7.285311111111111,
        pm2_5: 30.247635205900885,
        variance: 54.48664993664397
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.473652276193222,
        latitude: 8.978266666666666,
        longitude: 7.341388888888889,
        pm2_5: 30.244066281853577,
        variance: 54.53108345797409
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.469604417272027,
        latitude: 8.978266666666666,
        longitude: 7.397466666666666,
        pm2_5: 30.2465159202259,
        variance: 54.50058621208302
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.466474363770939,
        latitude: 8.978266666666666,
        longitude: 7.453544444444444,
        pm2_5: 30.248409411452975,
        variance: 54.477009714088354
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 8.978266666666666],
        type: 'Point'
      },
      properties: {
        interval: 14.464273562320875,
        latitude: 8.978266666666666,
        longitude: 7.509622222222222,
        pm2_5: 30.249740386172714,
        variance: 54.46043567410834
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.173155555555556, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.463010072397953,
        latitude: 9.037144444444444,
        longitude: 7.173155555555556,
        pm2_5: 30.25050436453467,
        variance: 54.45092158326861
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.462688525136764,
        latitude: 9.037144444444444,
        longitude: 7.229233333333333,
        pm2_5: 30.2506987741049,
        variance: 54.44850046207898
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.4814473696863,
        latitude: 9.037144444444444,
        longitude: 7.285311111111111,
        pm2_5: 30.23934597420074,
        variance: 54.58983702649789
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.475400777117319,
        latitude: 9.037144444444444,
        longitude: 7.341388888888889,
        pm2_5: 30.243007818629717,
        variance: 54.54425959448372
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.470270953725517,
        latitude: 9.037144444444444,
        longitude: 7.397466666666666,
        pm2_5: 30.246112625306573,
        variance: 54.50560742248865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.46607667201575,
        latitude: 9.037144444444444,
        longitude: 7.453544444444444,
        pm2_5: 30.248649945741793,
        variance: 54.47401454618864
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.509622222222222, 9.037144444444444],
        type: 'Point'
      },
      properties: {
        interval: 14.462833318021813,
        latitude: 9.037144444444444,
        longitude: 7.509622222222222,
        pm2_5: 30.25061123220209,
        variance: 54.44959068744322
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.229233333333333, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 14.460552812378749,
        latitude: 9.096022222222222,
        longitude: 7.229233333333333,
        pm2_5: 30.25198987196253,
        variance: 54.43242077248931
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.285311111111111, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 14.459243548844043,
        latitude: 9.096022222222222,
        longitude: 7.285311111111111,
        pm2_5: 30.25278121387625,
        variance: 54.4225645576812
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.341388888888889, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 14.458910350838627,
        latitude: 9.096022222222222,
        longitude: 7.341388888888889,
        pm2_5: 30.252982587098476,
        variance: 54.42005636546969
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.397466666666666, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 14.457209990844444,
        latitude: 9.096022222222222,
        longitude: 7.397466666666666,
        pm2_5: 30.254010114569976,
        variance: 54.40725758001156
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [7.453544444444444, 9.096022222222222],
        type: 'Point'
      },
      properties: {
        interval: 14.455792911390615,
        latitude: 9.096022222222222,
        longitude: 7.453544444444444,
        pm2_5: 30.254866314280218,
        variance: 54.39659222641899
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 340.64790834539895,
        latitude: 6.410288888888888,
        longitude: 2.8887333333333336,
        pm2_5: 177.85599501915078,
        variance: 30206.42374533927
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 344.44024302067135,
        latitude: 6.410288888888888,
        longitude: 3.0711666666666666,
        pm2_5: -150.2682230953637,
        variance: 30882.72621098999
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 338.6630827146019,
        latitude: 6.410288888888888,
        longitude: 3.2536,
        pm2_5: 66.85758480048352,
        variance: 29855.44658313133
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.410288888888888],
        type: 'Point'
      },
      properties: {
        interval: 338.5088648424139,
        latitude: 6.410288888888888,
        longitude: 4.165766666666666,
        pm2_5: 15.099042179041811,
        variance: 29828.2620722875
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 338.8648646811702,
        latitude: 6.447377777777778,
        longitude: 2.8887333333333336,
        pm2_5: -33.9572061435905,
        variance: 29891.034078349592
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 339.84377778315695,
        latitude: 6.447377777777778,
        longitude: 3.0711666666666666,
        pm2_5: -78.6153969892821,
        variance: 30063.982012163615
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 341.62644584661734,
        latitude: 6.447377777777778,
        longitude: 3.2536,
        pm2_5: -117.3544894287366,
        variance: 30380.21358334855
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 344.41957536658475,
        latitude: 6.447377777777778,
        longitude: 3.4360333333333335,
        pm2_5: -148.88372798885274,
        variance: 30879.020172766177
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 338.7101596669889,
        latitude: 6.447377777777778,
        longitude: 3.618466666666667,
        pm2_5: 66.1321030467661,
        variance: 29863.747465024237
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 338.56315202867364,
        latitude: 6.447377777777778,
        longitude: 3.8009000000000004,
        pm2_5: 14.965283981951629,
        variance: 29837.830047790194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 341.61310271621176,
        latitude: 6.447377777777778,
        longitude: 3.9833333333333334,
        pm2_5: -118.4275787119482,
        variance: 30377.84046943905
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.447377777777778],
        type: 'Point'
      },
      properties: {
        interval: 338.922151482449,
        latitude: 6.447377777777778,
        longitude: 4.165766666666666,
        pm2_5: -33.5309954211739,
        variance: 29901.141390434233
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 341.6634903014248,
        latitude: 6.484466666666666,
        longitude: 2.8887333333333336,
        pm2_5: -115.98164473997397,
        variance: 30386.802531484747
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 338.77635363326635,
        latitude: 6.484466666666666,
        longitude: 3.0711666666666666,
        pm2_5: 65.45234097098972,
        variance: 29875.421121681575
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 338.63676756066735,
        latitude: 6.484466666666666,
        longitude: 3.2536,
        pm2_5: 14.948425267271864,
        variance: 29850.807044964982
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 338.99986612079016,
        latitude: 6.484466666666666,
        longitude: 3.4360333333333335,
        pm2_5: -32.92061104593782,
        variance: 29914.855588794686
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 339.9720347565673,
        latitude: 6.484466666666666,
        longitude: 3.618466666666667,
        pm2_5: -76.50160483473437,
        variance: 30086.67857572902
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 341.72409819981783,
        latitude: 6.484466666666666,
        longitude: 3.8009000000000004,
        pm2_5: -114.3110984929104,
        variance: 30397.584155164193
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.484466666666666],
        type: 'Point'
      },
      properties: {
        interval: 338.8621447857135,
        latitude: 6.484466666666666,
        longitude: 3.9833333333333334,
        pm2_5: 64.8193232737756,
        variance: 29890.554240101483
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [2.8887333333333336, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 338.73015088390366,
        latitude: 6.5215555555555556,
        longitude: 2.8887333333333336,
        pm2_5: 15.048474113234551,
        variance: 29867.27278160979
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.0711666666666666, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 339.0983329698795,
        latitude: 6.5215555555555556,
        longitude: 3.0711666666666666,
        pm2_5: -32.12699442577377,
        variance: 29932.236417886103
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 339.89688181248283,
        latitude: 6.5215555555555556,
        longitude: 3.2536,
        pm2_5: -77.68107417737443,
        variance: 30073.378349086037
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 339.8127245127544,
        latitude: 6.5215555555555556,
        longitude: 3.4360333333333335,
        pm2_5: -79.30314788286609,
        variance: 30058.488062469056
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 338.82787242540724,
        latitude: 6.5215555555555556,
        longitude: 3.618466666666667,
        pm2_5: -34.19857245008503,
        variance: 29884.508312246995
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 338.473674370994,
        latitude: 6.5215555555555556,
        longitude: 3.8009000000000004,
        pm2_5: 15.349519613408901,
        variance: 29822.060662797187
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 339.35865522438445,
        latitude: 6.5215555555555556,
        longitude: 3.9833333333333334,
        pm2_5: 124.51506806877065,
        variance: 29978.211389968405
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.5215555555555556],
        type: 'Point'
      },
      properties: {
        interval: 338.6636874876713,
        latitude: 6.5215555555555556,
        longitude: 4.165766666666666,
        pm2_5: 70.19394063309024,
        variance: 29855.55321291834
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 344.65229510886235,
        latitude: 6.558644444444444,
        longitude: 3.2536,
        pm2_5: -152.34799081403716,
        variance: 30920.7633600079
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 340.58344314804094,
        latitude: 6.558644444444444,
        longitude: 3.4360333333333335,
        pm2_5: 176.35838712401832,
        variance: 30194.992124785203
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 339.31614329004594,
        latitude: 6.558644444444444,
        longitude: 3.618466666666667,
        pm2_5: 123.31459467246732,
        variance: 29970.701035305858
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 338.6348959849002,
        latitude: 6.558644444444444,
        longitude: 3.8009000000000004,
        pm2_5: 69.2971202240104,
        variance: 29850.477087334497
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 338.46070956907164,
        latitude: 6.558644444444444,
        longitude: 3.9833333333333334,
        pm2_5: 16.19905209007994,
        variance: 29819.776114639593
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [4.165766666666666, 6.558644444444444],
        type: 'Point'
      },
      properties: {
        interval: 338.81520273117604,
        latitude: 6.558644444444444,
        longitude: 4.165766666666666,
        pm2_5: -34.12544991461058,
        variance: 29882.27342819865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 339.817584539782,
        latitude: 6.5957333333333334,
        longitude: 3.2536,
        pm2_5: -79.93503560735746,
        variance: 30059.34786611097
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 341.6586766189991,
        latitude: 6.5957333333333334,
        longitude: 3.4360333333333335,
        pm2_5: -119.66844392912917,
        variance: 30385.94630077202
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 344.55618094745324,
        latitude: 6.5957333333333334,
        longitude: 3.618466666666667,
        pm2_5: -152.0016624095733,
        variance: 30903.51984305866
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 340.54043854420394,
        latitude: 6.5957333333333334,
        longitude: 3.8009000000000004,
        pm2_5: 174.75203137339545,
        variance: 30187.36731671146
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.5957333333333334],
        type: 'Point'
      },
      properties: {
        interval: 339.2936425422844,
        latitude: 6.5957333333333334,
        longitude: 3.9833333333333334,
        pm2_5: 122.07954250004087,
        variance: 29966.726330073783
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 338.6254049400371,
        latitude: 6.632822222222222,
        longitude: 3.2536,
        pm2_5: 68.44127947481516,
        variance: 29848.803850167664
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 338.45755936544333,
        latitude: 6.632822222222222,
        longitude: 3.4360333333333335,
        pm2_5: 15.716364103344356,
        variance: 29819.221025513485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 338.811234300152,
        latitude: 6.632822222222222,
        longitude: 3.618466666666667,
        pm2_5: -34.25469562255563,
        variance: 29881.573429818964
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 339.80388542333884,
        latitude: 6.632822222222222,
        longitude: 3.8009000000000004,
        pm2_5: -79.74326169032054,
        variance: 30056.924341107253
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.632822222222222],
        type: 'Point'
      },
      properties: {
        interval: 341.62372012070307,
        latitude: 6.632822222222222,
        longitude: 3.9833333333333334,
        pm2_5: -119.19929178863583,
        variance: 30379.728797664633
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.2536, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 340.5185795086511,
        latitude: 6.669911111111111,
        longitude: 3.2536,
        pm2_5: 173.03937221112412,
        variance: 30183.492032119306
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.4360333333333335, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 339.2908154100505,
        latitude: 6.669911111111111,
        longitude: 3.4360333333333335,
        pm2_5: 120.8117810361442,
        variance: 29966.22694232012
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.618466666666667, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 338.63485119976485,
        latitude: 6.669911111111111,
        longitude: 3.618466666666667,
        pm2_5: 67.62769529925109,
        variance: 29850.469191765646
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.8009000000000004, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 340.0693957326824,
        latitude: 6.669911111111111,
        longitude: 3.8009000000000004,
        pm2_5: -75.07877184896549,
        variance: 30103.91345116403
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [3.9833333333333334, 6.669911111111111],
        type: 'Point'
      },
      properties: {
        interval: 341.80825370163177,
        latitude: 6.669911111111111,
        longitude: 3.9833333333333334,
        pm2_5: -112.34533380460965,
        variance: 30412.55786613887
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 27.859784325415326,
        latitude: 2.665338888888889,
        longitude: 32.282275999999996,
        pm2_5: 23.64968073651019,
        variance: 202.04279015479426
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 27.852834694631383,
        latitude: 2.665338888888889,
        longitude: 32.32058466666666,
        pm2_5: 23.65444577551366,
        variance: 201.9420034689873
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.665338888888889],
        type: 'Point'
      },
      properties: {
        interval: 27.85624656101707,
        latitude: 2.665338888888889,
        longitude: 32.358893333333334,
        pm2_5: 23.65628086649371,
        variance: 201.9914807549394
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 27.861591896916632,
        latitude: 2.7066507777777775,
        longitude: 32.24396733333333,
        pm2_5: 23.658850681802964,
        variance: 202.06900849394276
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 27.86885819227258,
        latitude: 2.7066507777777775,
        longitude: 32.282275999999996,
        pm2_5: 23.6621505050435,
        variance: 202.1744213195019
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 27.863045090590248,
        latitude: 2.7066507777777775,
        longitude: 32.32058466666666,
        pm2_5: 23.65782284382324,
        variance: 202.09008791135602
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 27.858637352443683,
        latitude: 2.7066507777777775,
        longitude: 32.358893333333334,
        pm2_5: 23.656685752797664,
        variance: 202.02615450202268
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7066507777777775],
        type: 'Point'
      },
      properties: {
        interval: 27.85619049452936,
        latitude: 2.7066507777777775,
        longitude: 32.397202,
        pm2_5: 23.65629751859143,
        variance: 201.99066765605687
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.855710283727657,
        latitude: 2.7479626666666666,
        longitude: 32.205658666666665,
        pm2_5: 23.656658848347266,
        variance: 201.9837035118104
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.85719785369939,
        latitude: 2.7479626666666666,
        longitude: 32.24396733333333,
        pm2_5: 23.65776906958881,
        variance: 202.00527703565024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.860649699857372,
        latitude: 2.7479626666666666,
        longitude: 32.282275999999996,
        pm2_5: 23.659626132135628,
        variance: 202.05534196641054
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.866057694855307,
        latitude: 2.7479626666666666,
        longitude: 32.32058466666666,
        pm2_5: 23.662226613848024,
        variance: 202.133790986309
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.873409124463347,
        latitude: 2.7479626666666666,
        longitude: 32.358893333333334,
        pm2_5: 23.66556573017428,
        variance: 202.24045611716906
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.869983419088296,
        latitude: 2.7479626666666666,
        longitude: 32.397202,
        pm2_5: 23.662122863162452,
        variance: 202.1907475479635
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.865533655867164,
        latitude: 2.7479626666666666,
        longitude: 32.435510666666666,
        pm2_5: 23.660974815683435,
        variance: 202.12618854807
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.7479626666666666],
        type: 'Point'
      },
      properties: {
        interval: 27.863063402495577,
        latitude: 2.7479626666666666,
        longitude: 32.47381933333333,
        pm2_5: 23.660582988378092,
        variance: 202.09035354318212
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.86257850345198,
        latitude: 2.7892745555555556,
        longitude: 32.205658666666665,
        pm2_5: 23.660948096388147,
        variance: 202.08331967436084
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.8640801079009,
        latitude: 2.7892745555555556,
        longitude: 32.24396733333333,
        pm2_5: 23.6620694586872,
        variance: 202.10510210837117
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.867564664567766,
        latitude: 2.7892745555555556,
        longitude: 32.282275999999996,
        pm2_5: 23.663945000031003,
        variance: 202.1556539811188
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.873023937524952,
        latitude: 2.7892745555555556,
        longitude: 32.32058466666666,
        pm2_5: 23.66657125679508,
        variance: 202.23486657169906
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.872437966367816,
        latitude: 2.7892745555555556,
        longitude: 32.358893333333334,
        pm2_5: 23.665838910601586,
        variance: 202.22636354358133
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.871949398283096,
        latitude: 2.7892745555555556,
        longitude: 32.397202,
        pm2_5: 23.66620711251392,
        variance: 202.21927406821465
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.851364294511743,
        latitude: 2.7892745555555556,
        longitude: 32.435510666666666,
        pm2_5: 23.653348782066068,
        variance: 201.92068228488222
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.7892745555555556],
        type: 'Point'
      },
      properties: {
        interval: 27.851838809054467,
        latitude: 2.7892745555555556,
        longitude: 32.47381933333333,
        pm2_5: 23.652991906800782,
        variance: 201.9275627461351
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.854257123166608,
        latitude: 2.830586444444444,
        longitude: 32.24396733333333,
        pm2_5: 23.653375812180762,
        variance: 201.96263012377074
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.866805165815748,
        latitude: 2.830586444444444,
        longitude: 32.282275999999996,
        pm2_5: 23.659705194817295,
        variance: 202.14463508682195
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.859342317250075,
        latitude: 2.830586444444444,
        longitude: 32.32058466666666,
        pm2_5: 23.65001325573021,
        variance: 202.03637920390486
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.860713723038145,
        latitude: 2.830586444444444,
        longitude: 32.358893333333334,
        pm2_5: 23.651037092949668,
        variance: 202.05627060523898
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.856301800400413,
        latitude: 2.830586444444444,
        longitude: 32.397202,
        pm2_5: 23.649382601140545,
        variance: 201.99228186042046
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.8539991789602,
        latitude: 2.830586444444444,
        longitude: 32.435510666666666,
        pm2_5: 23.649016014193755,
        variance: 201.9588895932725
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.830586444444444],
        type: 'Point'
      },
      properties: {
        interval: 27.85354763126,
        latitude: 2.830586444444444,
        longitude: 32.47381933333333,
        pm2_5: 23.64935557640185,
        variance: 201.9523416406887
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.854948199464918,
        latitude: 2.871898333333333,
        longitude: 32.205658666666665,
        pm2_5: 23.650400663697283,
        variance: 201.97265181041075
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.858197657316104,
        latitude: 2.871898333333333,
        longitude: 32.24396733333333,
        pm2_5: 23.652149369597716,
        variance: 202.01977736206072
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.85731424413326,
        latitude: 2.871898333333333,
        longitude: 32.282275999999996,
        pm2_5: 23.650811667732118,
        variance: 202.00696503966833
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.853087661990273,
        latitude: 2.871898333333333,
        longitude: 32.32058466666666,
        pm2_5: 23.649720219718454,
        variance: 201.945671674957
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.850741568510294,
        latitude: 2.871898333333333,
        longitude: 32.358893333333334,
        pm2_5: 23.649347148181263,
        variance: 201.91165293522158
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.873461871078444,
        latitude: 2.871898333333333,
        longitude: 32.397202,
        pm2_5: 23.66733750767488,
        variance: 202.2412215427072
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.85028140631899,
        latitude: 2.871898333333333,
        longitude: 32.435510666666666,
        pm2_5: 23.649693127147437,
        variance: 201.90498084422052
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.47381933333333, 2.871898333333333],
        type: 'Point'
      },
      properties: {
        interval: 27.855018774608986,
        latitude: 2.871898333333333,
        longitude: 32.47381933333333,
        pm2_5: 23.652538373301034,
        variance: 201.97367527431777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.205658666666665, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.860205323660804,
        latitude: 2.9132102222222223,
        longitude: 32.205658666666665,
        pm2_5: 23.655032438077097,
        variance: 202.04889646931952
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.24396733333333, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.86725588845504,
        latitude: 2.9132102222222223,
        longitude: 32.24396733333333,
        pm2_5: 23.658235162810932,
        variance: 202.15117418592047
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.85670145992249,
        latitude: 2.9132102222222223,
        longitude: 32.282275999999996,
        pm2_5: 23.652161029407612,
        variance: 201.99807794336937
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.852405460583025,
        latitude: 2.9132102222222223,
        longitude: 32.32058466666666,
        pm2_5: 23.651052265350888,
        variance: 201.9357793473332
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.850020765543093,
        latitude: 2.9132102222222223,
        longitude: 32.358893333333334,
        pm2_5: 23.650673417271435,
        variance: 201.90120174957872
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.849552940181415,
        latitude: 2.9132102222222223,
        longitude: 32.397202,
        pm2_5: 23.651025171717645,
        variance: 201.89441872344003
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.435510666666666, 2.9132102222222223],
        type: 'Point'
      },
      properties: {
        interval: 27.851003078066444,
        latitude: 2.9132102222222223,
        longitude: 32.435510666666666,
        pm2_5: 23.652106877664835,
        variance: 201.91544472471537
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.282275999999996, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 27.85436779617969,
        latitude: 2.954522111111111,
        longitude: 32.282275999999996,
        pm2_5: 23.653916548346118,
        variance: 201.96423503874746
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.32058466666666, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 27.859639249641585,
        latitude: 2.954522111111111,
        longitude: 32.32058466666666,
        pm2_5: 23.656450866759794,
        variance: 202.04068594340117
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.358893333333334, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 27.851708244628362,
        latitude: 2.954522111111111,
        longitude: 32.358893333333334,
        pm2_5: 23.650757518407787,
        variance: 201.92566955016127
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.397202, 2.954522111111111],
        type: 'Point'
      },
      properties: {
        interval: 27.87697179654628,
        latitude: 2.954522111111111,
        longitude: 32.397202,
        pm2_5: 23.6692280003351,
        variance: 202.2921586176168
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.9999582031479,
        latitude: 2.2521293333333334,
        longitude: 32.90784744444444,
        pm2_5: 23.77235096880165,
        variance: 43.991803749373275
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202584555,
        latitude: 2.2521293333333334,
        longitude: 32.90790466666667,
        pm2_5: 23.772351012746277,
        variance: 43.99180374556056
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820256601,
        latitude: 2.2521293333333334,
        longitude: 32.90796188888889,
        pm2_5: 23.77235101256178,
        variance: 43.99180374543505
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202563171,
        latitude: 2.2521293333333334,
        longitude: 32.90801911111111,
        pm2_5: 23.77235101240877,
        variance: 43.99180374541584
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202575938,
        latitude: 2.2521293333333334,
        longitude: 32.908076333333334,
        pm2_5: 23.772351012287313,
        variance: 43.99180374550224
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202604326,
        latitude: 2.2521293333333334,
        longitude: 32.90813355555556,
        pm2_5: 23.77235101219728,
        variance: 43.99180374569437
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2521293333333334],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202648452,
        latitude: 2.2521293333333334,
        longitude: 32.908190777777776,
        pm2_5: 23.77235101213889,
        variance: 43.991803745993025
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203016575,
        latitude: 2.2522556666666667,
        longitude: 32.90784744444444,
        pm2_5: 23.772351025221575,
        variance: 43.99180374848447
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820296672,
        latitude: 2.2522556666666667,
        longitude: 32.90790466666667,
        pm2_5: 23.772351024974,
        variance: 43.99180374814705
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202932518,
        latitude: 2.2522556666666667,
        longitude: 32.90796188888889,
        pm2_5: 23.77235102475795,
        variance: 43.99180374791558
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202914009,
        latitude: 2.2522556666666667,
        longitude: 32.90801911111111,
        pm2_5: 23.77235102457342,
        variance: 43.9918037477903
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202911152,
        latitude: 2.2522556666666667,
        longitude: 32.908076333333334,
        pm2_5: 23.77235102442038,
        variance: 43.99180374777097
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202923901,
        latitude: 2.2522556666666667,
        longitude: 32.90813355555556,
        pm2_5: 23.772351024298878,
        variance: 43.99180374785726
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2522556666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202952374,
        latitude: 2.2522556666666667,
        longitude: 32.908190777777776,
        pm2_5: 23.772351024208888,
        variance: 43.99180374804996
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820355669,
        latitude: 2.2523820000000003,
        longitude: 32.90784744444444,
        pm2_5: 23.772351037621934,
        variance: 43.99180375213996
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203506832,
        latitude: 2.2523820000000003,
        longitude: 32.90790466666667,
        pm2_5: 23.772351037374296,
        variance: 43.991803751802536
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820347265,
        latitude: 2.2523820000000003,
        longitude: 32.90796188888889,
        pm2_5: 23.772351037158217,
        variance: 43.99180375157118
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203454154,
        latitude: 2.2523820000000003,
        longitude: 32.90801911111111,
        pm2_5: 23.772351036973625,
        variance: 43.991803751446014
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203451268,
        latitude: 2.2523820000000003,
        longitude: 32.908076333333334,
        pm2_5: 23.772351036820577,
        variance: 43.99180375142646
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203464066,
        latitude: 2.2523820000000003,
        longitude: 32.90813355555556,
        pm2_5: 23.772351036699067,
        variance: 43.99180375151309
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2523820000000003],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203492488,
        latitude: 2.2523820000000003,
        longitude: 32.908190777777776,
        pm2_5: 23.772351036609034,
        variance: 43.99180375170545
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.999958204288935,
        latitude: 2.2525083333333336,
        longitude: 32.90784744444444,
        pm2_5: 23.772351050410848,
        variance: 43.991803757095795
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820423908,
        latitude: 2.2525083333333336,
        longitude: 32.90790466666667,
        pm2_5: 23.772351050163184,
        variance: 43.99180375675837
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.999958204204896,
        latitude: 2.2525083333333336,
        longitude: 32.90796188888889,
        pm2_5: 23.772351049947062,
        variance: 43.99180375652702
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820418635,
        latitude: 2.2525083333333336,
        longitude: 32.90801911111111,
        pm2_5: 23.772351049762438,
        variance: 43.99180375640151
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.999958204183478,
        latitude: 2.2525083333333336,
        longitude: 32.908076333333334,
        pm2_5: 23.77235104960939,
        variance: 43.99180375638207
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202618688,
        latitude: 2.2525083333333336,
        longitude: 32.90813355555556,
        pm2_5: 23.772351012962282,
        variance: 43.99180374579157
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.2525083333333336],
        type: 'Point'
      },
      properties: {
        interval: 12.999958204196279,
        latitude: 2.2525083333333336,
        longitude: 32.908190777777776,
        pm2_5: 23.772351049487845,
        variance: 43.9918037564687
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820266851,
        latitude: 2.252634666666667,
        longitude: 32.907790222222225,
        pm2_5: 23.772351013209857,
        variance: 43.99180374612877
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202448477,
        latitude: 2.252634666666667,
        longitude: 32.90784744444444,
        pm2_5: 23.77235100057436,
        variance: 43.99180374463958
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820311375,
        latitude: 2.252634666666667,
        longitude: 32.90790466666667,
        pm2_5: 23.772350968585716,
        variance: 43.99180374914215
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203095222,
        latitude: 2.252634666666667,
        longitude: 32.90796188888889,
        pm2_5: 23.772350968401337,
        variance: 43.99180374901675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820309235,
        latitude: 2.252634666666667,
        longitude: 32.90801911111111,
        pm2_5: 23.772350968248425,
        variance: 43.99180374899731
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203105132,
        latitude: 2.252634666666667,
        longitude: 32.908076333333334,
        pm2_5: 23.772350968127032,
        variance: 43.99180374908383
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203133556,
        latitude: 2.252634666666667,
        longitude: 32.90813355555556,
        pm2_5: 23.77235096803712,
        variance: 43.99180374927619
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908190777777776, 2.252634666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958203177648,
        latitude: 2.252634666666667,
        longitude: 32.908190777777776,
        pm2_5: 23.772350967978667,
        variance: 43.991803749574615
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202727402,
        latitude: 2.252761,
        longitude: 32.907790222222225,
        pm2_5: 23.77235097925889,
        variance: 43.99180374652735
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202693252,
        latitude: 2.252761,
        longitude: 32.90784744444444,
        pm2_5: 23.772350979042958,
        variance: 43.99180374629623
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202674758,
        latitude: 2.252761,
        longitude: 32.90790466666667,
        pm2_5: 23.77235097885859,
        variance: 43.99180374617106
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820267187,
        latitude: 2.252761,
        longitude: 32.90796188888889,
        pm2_5: 23.772350978705642,
        variance: 43.991803746151504
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202684653,
        latitude: 2.252761,
        longitude: 32.90801911111111,
        pm2_5: 23.77235097858418,
        variance: 43.99180374623802
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820271309,
        latitude: 2.252761,
        longitude: 32.908076333333334,
        pm2_5: 23.772350978494263,
        variance: 43.99180374643049
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.252761],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202757151,
        latitude: 2.252761,
        longitude: 32.90813355555556,
        pm2_5: 23.77235097843586,
        variance: 43.99180374672869
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202499053,
        latitude: 2.2528873333333337,
        longitude: 32.907790222222225,
        pm2_5: 23.772350990104783,
        variance: 43.991803744981894
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202464887,
        latitude: 2.2528873333333337,
        longitude: 32.90784744444444,
        pm2_5: 23.772350989888754,
        variance: 43.991803744750655
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202446377,
        latitude: 2.2528873333333337,
        longitude: 32.90790466666667,
        pm2_5: 23.77235098970436,
        variance: 43.99180374462537
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202443537,
        latitude: 2.2528873333333337,
        longitude: 32.90796188888889,
        pm2_5: 23.77235098955137,
        variance: 43.99180374460616
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202456288,
        latitude: 2.2528873333333337,
        longitude: 32.90801911111111,
        pm2_5: 23.772350989429953,
        variance: 43.99180374469245
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202484725,
        latitude: 2.2528873333333337,
        longitude: 32.908076333333334,
        pm2_5: 23.772350989339976,
        variance: 43.99180374488492
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.2528873333333337],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202528786,
        latitude: 2.2528873333333337,
        longitude: 32.90813355555556,
        pm2_5: 23.772350989281595,
        variance: 43.99180374518312
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.907790222222225, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202462839,
        latitude: 2.253013666666667,
        longitude: 32.907790222222225,
        pm2_5: 23.772351001339235,
        variance: 43.991803744736785
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90784744444444, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202428672,
        latitude: 2.253013666666667,
        longitude: 32.90784744444444,
        pm2_5: 23.772351001123237,
        variance: 43.991803744505546
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90790466666667, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202410127,
        latitude: 2.253013666666667,
        longitude: 32.90790466666667,
        pm2_5: 23.772351000938762,
        variance: 43.991803744380036
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90796188888889, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202407255,
        latitude: 2.253013666666667,
        longitude: 32.90796188888889,
        pm2_5: 23.772351000785775,
        variance: 43.991803744360595
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90801911111111, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958202420038,
        latitude: 2.253013666666667,
        longitude: 32.90801911111111,
        pm2_5: 23.772351000664315,
        variance: 43.99180374444711
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.908076333333334, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.99995820249257,
        latitude: 2.253013666666667,
        longitude: 32.908076333333334,
        pm2_5: 23.772351000515915,
        variance: 43.99180374493801
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.90813355555556, 2.253013666666667],
        type: 'Point'
      },
      properties: {
        interval: 12.999958204224649,
        latitude: 2.253013666666667,
        longitude: 32.90813355555556,
        pm2_5: 23.772351049397844,
        variance: 43.991803756660715
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.31038644444444446],
        type: 'Point'
      },
      properties: {
        interval: 43.41325331288933,
        latitude: 0.31038644444444446,
        longitude: 32.58894933333333,
        pm2_5: 32.37388052605527,
        variance: 490.6056234925802
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58894933333333, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 43.41326416760615,
        latitude: 0.3113328888888889,
        longitude: 32.58894933333333,
        pm2_5: 32.37371422636752,
        variance: 490.6058688271439
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.3113328888888889],
        type: 'Point'
      },
      properties: {
        interval: 43.41326157998586,
        latitude: 0.3113328888888889,
        longitude: 32.589745666666666,
        pm2_5: 32.37372966766921,
        variance: 490.6058103426376
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 43.41325836501398,
        latitude: 0.31227933333333335,
        longitude: 32.589745666666666,
        pm2_5: 32.37372124389395,
        variance: 490.6057376789506
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 43.41325577658425,
        latitude: 0.31227933333333335,
        longitude: 32.590542,
        pm2_5: 32.373736689987126,
        variance: 490.6056791761573
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31227933333333335],
        type: 'Point'
      },
      properties: {
        interval: 43.413254216124926,
        latitude: 0.31227933333333335,
        longitude: 32.59133833333333,
        pm2_5: 32.37375295092045,
        variance: 490.6056439071972
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 43.41325368363859,
        latitude: 0.31322577777777777,
        longitude: 32.59133833333333,
        pm2_5: 32.373770026676816,
        variance: 490.60563187212597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 43.41325417912608,
        latitude: 0.31322577777777777,
        longitude: 32.59213466666667,
        pm2_5: 32.37378791723687,
        variance: 490.60564307096206
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 43.41325570258649,
        latitude: 0.31322577777777777,
        longitude: 32.592931,
        pm2_5: 32.373806622581704,
        variance: 490.60567750368546
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31322577777777777],
        type: 'Point'
      },
      properties: {
        interval: 43.413251577986976,
        latitude: 0.31322577777777777,
        longitude: 32.593727333333334,
        pm2_5: 32.373744987973986,
        variance: 490.6055842809217
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 43.41327157498489,
        latitude: 0.31417222222222224,
        longitude: 32.59133833333333,
        pm2_5: 32.3737084845386,
        variance: 490.60603624619716
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 43.4132500170395,
        latitude: 0.31417222222222224,
        longitude: 32.59213466666667,
        pm2_5: 32.37376125393095,
        variance: 490.6055490009321
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31417222222222224],
        type: 'Point'
      },
      properties: {
        interval: 43.41325157424176,
        latitude: 0.31417222222222224,
        longitude: 32.592931,
        pm2_5: 32.37373910599351,
        variance: 490.60558419627364
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.589745666666666, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.41324898420385,
        latitude: 0.31511866666666666,
        longitude: 32.589745666666666,
        pm2_5: 32.37375456161624,
        variance: 490.6055256571419
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.590542, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.41324742277105,
        latitude: 0.31511866666666666,
        longitude: 32.590542,
        pm2_5: 32.373770832578955,
        variance: 490.6054903661852
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59133833333333, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.413246889945796,
        latitude: 0.31511866666666666,
        longitude: 32.59133833333333,
        pm2_5: 32.37378791886184,
        variance: 490.60547832345605
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59213466666667, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.41324590033163,
        latitude: 0.31511866666666666,
        longitude: 32.59213466666667,
        pm2_5: 32.37379877836418,
        variance: 490.60545595654435
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.413246396261755,
        latitude: 0.31511866666666666,
        longitude: 32.592931,
        pm2_5: 32.37381668543184,
        variance: 490.60546716538283
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31511866666666666],
        type: 'Point'
      },
      properties: {
        interval: 43.41324792111474,
        latitude: 0.31511866666666666,
        longitude: 32.593727333333334,
        pm2_5: 32.373835408029564,
        variance: 490.6055016295745
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592931, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 43.41324853693273,
        latitude: 0.31606511111111113,
        longitude: 32.592931,
        pm2_5: 32.373847554284715,
        variance: 490.6055155480767
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31606511111111113],
        type: 'Point'
      },
      properties: {
        interval: 43.413251091479715,
        latitude: 0.31606511111111113,
        longitude: 32.593727333333334,
        pm2_5: 32.37386709834513,
        variance: 490.60557328505433
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.593727333333334, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 43.41324948438352,
        latitude: 0.31701155555555555,
        longitude: 32.593727333333334,
        pm2_5: 32.37377833496058,
        variance: 490.6055369620278
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59452366666667, 0.31701155555555555],
        type: 'Point'
      },
      properties: {
        interval: 43.41327518911787,
        latitude: 0.31701155555555555,
        longitude: 32.59452366666667,
        pm2_5: 32.37369386240545,
        variance: 490.60611793161115
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.364569136885484,
        latitude: 0.3396774444444444,
        longitude: 32.71017044444445,
        pm2_5: 19.093287855599463,
        variance: 18.212728250139833
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.364569778971239,
        latitude: 0.3396774444444444,
        longitude: 32.71150566666667,
        pm2_5: 19.09328779024927,
        variance: 18.212731046251292
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.364569994048042,
        latitude: 0.3396774444444444,
        longitude: 32.71284088888889,
        pm2_5: 19.093287768359186,
        variance: 18.2127319828532
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.364570253183176,
        latitude: 0.3396774444444444,
        longitude: 32.714176111111115,
        pm2_5: 19.093287741984977,
        variance: 18.21273311131739
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.364569513931267,
        latitude: 0.3396774444444444,
        longitude: 32.71551133333334,
        pm2_5: 19.093287817224475,
        variance: 18.212729892073185
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.3645695087143,
        latitude: 0.3396774444444444,
        longitude: 32.716846555555556,
        pm2_5: 19.09328781775547,
        variance: 18.21272986935469
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.3396774444444444],
        type: 'Point'
      },
      properties: {
        interval: 8.36456954753842,
        latitude: 0.3396774444444444,
        longitude: 32.71818177777778,
        pm2_5: 19.09328781380402,
        variance: 18.21273003842333
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.36456963040365,
        latitude: 0.34084088888888886,
        longitude: 32.70883522222223,
        pm2_5: 19.093287805370185,
        variance: 18.212730399279224
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364569757309798,
        latitude: 0.34084088888888886,
        longitude: 32.71017044444445,
        pm2_5: 19.09328779245393,
        variance: 18.212730951921515
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364569928256635,
        latitude: 0.34084088888888886,
        longitude: 32.71150566666667,
        pm2_5: 19.09328777505533,
        variance: 18.212731696349238
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364570143243876,
        latitude: 0.34084088888888886,
        longitude: 32.71284088888889,
        pm2_5: 19.09328775317437,
        variance: 18.212732632561142
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364569607953205,
        latitude: 0.34084088888888886,
        longitude: 32.714176111111115,
        pm2_5: 19.093287807655138,
        variance: 18.212730301513545
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364569701057604,
        latitude: 0.34084088888888886,
        longitude: 32.71551133333334,
        pm2_5: 19.093287798179173,
        variance: 18.21273070695827
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.36456973465071,
        latitude: 0.34084088888888886,
        longitude: 32.716846555555556,
        pm2_5: 19.09328779476014,
        variance: 18.21273085324725
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.34084088888888886],
        type: 'Point'
      },
      properties: {
        interval: 8.364569817481296,
        latitude: 0.34084088888888886,
        longitude: 32.71818177777778,
        pm2_5: 19.0932877863298,
        variance: 18.21273121395228
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364569944334418,
        latitude: 0.3420043333333333,
        longitude: 32.70883522222223,
        pm2_5: 19.09328777341893,
        variance: 18.212731766363675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364570115209798,
        latitude: 0.3420043333333333,
        longitude: 32.71017044444445,
        pm2_5: 19.093287756027593,
        variance: 18.212732510480237
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364569925851994,
        latitude: 0.3420043333333333,
        longitude: 32.71150566666667,
        pm2_5: 19.093287775300073,
        variance: 18.212731685877657
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364569920639347,
        latitude: 0.3420043333333333,
        longitude: 32.71284088888889,
        pm2_5: 19.09328777583058,
        variance: 18.212731663177976
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364569959431039,
        latitude: 0.3420043333333333,
        longitude: 32.714176111111115,
        pm2_5: 19.093287771882462,
        variance: 18.21273183210542
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.36457004222685,
        latitude: 0.3420043333333333,
        longitude: 32.71551133333334,
        pm2_5: 19.093287763455645,
        variance: 18.21273219265902
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364570169026763,
        latitude: 0.3420043333333333,
        longitude: 32.716846555555556,
        pm2_5: 19.093287750550246,
        variance: 18.212732744838718
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.3420043333333333],
        type: 'Point'
      },
      properties: {
        interval: 8.364570183103728,
        latitude: 0.3420043333333333,
        longitude: 32.71818177777778,
        pm2_5: 19.0932877491175,
        variance: 18.21273280614014
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569695842789,
        latitude: 0.34316777777777774,
        longitude: 32.70883522222223,
        pm2_5: 19.093287798709927,
        variance: 18.212730684249152
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569480994202,
        latitude: 0.34316777777777774,
        longitude: 32.71017044444445,
        pm2_5: 19.093287820576762,
        variance: 18.212729748641095
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569398094444,
        latitude: 0.34316777777777774,
        longitude: 32.71150566666667,
        pm2_5: 19.09328782901413,
        variance: 18.21272938763485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569359254125,
        latitude: 0.34316777777777774,
        longitude: 32.71284088888889,
        pm2_5: 19.093287832967235,
        variance: 18.212729218495667
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569175773985,
        latitude: 0.34316777777777774,
        longitude: 32.714176111111115,
        pm2_5: 19.09328785164146,
        variance: 18.212728419488826
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569258776644,
        latitude: 0.34316777777777774,
        longitude: 32.71551133333334,
        pm2_5: 19.09328784319364,
        variance: 18.212728780943166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569385893201,
        latitude: 0.34316777777777774,
        longitude: 32.716846555555556,
        pm2_5: 19.09328783025593,
        variance: 18.212729334501716
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71818177777778, 0.34316777777777774],
        type: 'Point'
      },
      properties: {
        interval: 8.364569557123513,
        latitude: 0.34316777777777774,
        longitude: 32.71818177777778,
        pm2_5: 19.09328781282848,
        variance: 18.21273008016385
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.364569772467235,
        latitude: 0.34433122222222223,
        longitude: 32.70883522222223,
        pm2_5: 19.093287790911248,
        variance: 18.212731017928093
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.364570031923945,
        latitude: 0.34433122222222223,
        longitude: 32.71017044444445,
        pm2_5: 19.09328776450428,
        variance: 18.21273214779262
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.364569178563098,
        latitude: 0.34433122222222223,
        longitude: 32.71150566666667,
        pm2_5: 19.093287851357584,
        variance: 18.212728431634673
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.364569173339618,
        latitude: 0.34433122222222223,
        longitude: 32.71284088888889,
        pm2_5: 19.09328785188923,
        variance: 18.212728408887813
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.3645692122121,
        latitude: 0.34433122222222223,
        longitude: 32.714176111111115,
        pm2_5: 19.09328784793284,
        variance: 18.21272857816706
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.36456929518055,
        latitude: 0.34433122222222223,
        longitude: 32.71551133333334,
        pm2_5: 19.093287839488504,
        variance: 18.212728939472413
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.716846555555556, 0.34433122222222223],
        type: 'Point'
      },
      properties: {
        interval: 8.364569422244788,
        latitude: 0.34433122222222223,
        longitude: 32.716846555555556,
        pm2_5: 19.093287826556157,
        variance: 18.212729492803135
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.364569593404534,
        latitude: 0.34549466666666667,
        longitude: 32.70883522222223,
        pm2_5: 19.093287809135877,
        variance: 18.212730238157974
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.364569808659606,
        latitude: 0.34549466666666667,
        longitude: 32.71017044444445,
        pm2_5: 19.093287787227684,
        variance: 18.21273117553619
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.364570068009462,
        latitude: 0.34549466666666667,
        longitude: 32.71150566666667,
        pm2_5: 19.093287760831554,
        variance: 18.2127323049354
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.36456925268383,
        latitude: 0.34549466666666667,
        longitude: 32.71284088888889,
        pm2_5: 19.09328784381373,
        variance: 18.21272875441059
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.364569247462528,
        latitude: 0.34549466666666667,
        longitude: 32.714176111111115,
        pm2_5: 19.093287844345134,
        variance: 18.212728731673224
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71551133333334, 0.34549466666666667],
        type: 'Point'
      },
      properties: {
        interval: 8.364569286318956,
        latitude: 0.34549466666666667,
        longitude: 32.71551133333334,
        pm2_5: 19.093287840390417,
        variance: 18.212728900882553
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.70883522222223, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 8.364569369253113,
        latitude: 0.3466581111111111,
        longitude: 32.70883522222223,
        pm2_5: 19.09328783194956,
        variance: 18.21272926203858
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 8.364569496264812,
        latitude: 0.3466581111111111,
        longitude: 32.71017044444445,
        pm2_5: 19.093287819022596,
        variance: 18.212729815140506
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 8.364569667353857,
        latitude: 0.3466581111111111,
        longitude: 32.71150566666667,
        pm2_5: 19.09328780160946,
        variance: 18.21273056018748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 8.36456988251988,
        latitude: 0.3466581111111111,
        longitude: 32.71284088888889,
        pm2_5: 19.093287779710312,
        variance: 18.212731497177913
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.714176111111115, 0.3466581111111111],
        type: 'Point'
      },
      properties: {
        interval: 8.36457014176258,
        latitude: 0.3466581111111111,
        longitude: 32.714176111111115,
        pm2_5: 19.093287753325114,
        variance: 18.212732626110494
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71017044444445, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 8.364569364473285,
        latitude: 0.34782155555555555,
        longitude: 32.71017044444445,
        pm2_5: 19.093287832436044,
        variance: 18.212729241223713
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71150566666667, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 8.36457022187904,
        latitude: 0.34782155555555555,
        longitude: 32.71150566666667,
        pm2_5: 19.093287745171033,
        variance: 18.212732974996243
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.71284088888889, 0.34782155555555555],
        type: 'Point'
      },
      properties: {
        interval: 8.364570304640035,
        latitude: 0.34782155555555555,
        longitude: 32.71284088888889,
        pm2_5: 19.093287736747786,
        variance: 18.21273333539824
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.295919093969935],
        type: 'Point'
      },
      properties: {
        interval: 26.72313995505308,
        latitude: -1.295919093969935,
        longitude: 29.990265891066276,
        pm2_5: 41.75411747266058,
        variance: 185.8929115622018
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.295919093969935],
        type: 'Point'
      },
      properties: {
        interval: 26.72235997588209,
        latitude: -1.295919093969935,
        longitude: 30.00039152110056,
        pm2_5: 41.742155216787296,
        variance: 185.88206025630598
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 26.722393788673042,
        latitude: -1.2871811453663708,
        longitude: 29.93963774089484,
        pm2_5: 41.74233997674073,
        variance: 185.88253066350262
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 26.722489484726687,
        latitude: -1.2871811453663708,
        longitude: 29.94976337092913,
        pm2_5: 41.73811628076822,
        variance: 185.88386200055402
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2871811453663708],
        type: 'Point'
      },
      properties: {
        interval: 26.7224516169539,
        latitude: -1.2871811453663708,
        longitude: 29.990265891066276,
        pm2_5: 41.73828343421536,
        variance: 185.8833351781659
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 26.722428267622746,
        latitude: -1.2784431967628067,
        longitude: 29.93963774089484,
        pm2_5: 41.73845515473125,
        variance: 185.8830103389846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 26.722419439407417,
        latitude: -1.2784431967628067,
        longitude: 29.94976337092913,
        pm2_5: 41.73863142393438,
        variance: 185.88288751968435
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 26.722425133317312,
        latitude: -1.2784431967628067,
        longitude: 29.959889000963415,
        pm2_5: 41.73881222288863,
        variance: 185.88296673410787
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 26.722445348697207,
        latitude: -1.2784431967628067,
        longitude: 29.980140261031988,
        pm2_5: 41.73899753211365,
        variance: 185.88324797326868
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2784431967628067],
        type: 'Point'
      },
      properties: {
        interval: 26.722340297047747,
        latitude: -1.2784431967628067,
        longitude: 29.990265891066276,
        pm2_5: 41.74197482267388,
        variance: 185.881786482513
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.93963774089484, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722480083226035,
        latitude: -1.2697052481592426,
        longitude: 29.93963774089484,
        pm2_5: 41.739187331582286,
        variance: 185.88373120533424
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722627086851034,
        latitude: -1.2697052481592426,
        longitude: 29.94976337092913,
        pm2_5: 41.735233106905596,
        variance: 185.8857763491526
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722618025608888,
        latitude: -1.2697052481592426,
        longitude: 29.959889000963415,
        pm2_5: 41.735414024019846,
        variance: 185.8856502870151
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722623870197257,
        latitude: -1.2697052481592426,
        longitude: 29.970014630997703,
        pm2_5: 41.73559959626284,
        variance: 185.88573159830185
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.72264461994076,
        latitude: -1.2697052481592426,
        longitude: 29.980140261031988,
        pm2_5: 41.73578980361336,
        variance: 185.88602027375282
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722680272451125,
        latitude: -1.2697052481592426,
        longitude: 29.990265891066276,
        pm2_5: 41.73598462548741,
        variance: 185.88651628062485
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722964352751777,
        latitude: -1.2697052481592426,
        longitude: 30.00039152110056,
        pm2_5: 41.731780704041384,
        variance: 185.8904685023017
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2697052481592426],
        type: 'Point'
      },
      properties: {
        interval: 26.722939772662645,
        latitude: -1.2697052481592426,
        longitude: 30.01051715113485,
        pm2_5: 41.73196145143844,
        variance: 185.89012653408872
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.722930479400485,
        latitude: -1.2609672995556784,
        longitude: 29.94976337092913,
        pm2_5: 41.732146999177765,
        variance: 185.88999724252176
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.722651052884693,
        latitude: -1.2609672995556784,
        longitude: 29.959889000963415,
        pm2_5: 41.73505686437623,
        variance: 185.8861097704705
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.722936474034253,
        latitude: -1.2609672995556784,
        longitude: 29.970014630997703,
        pm2_5: 41.73233732727909,
        variance: 185.89008064225072
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.722334754422604,
        latitude: -1.2609672995556784,
        longitude: 29.980140261031988,
        pm2_5: 41.7417988138708,
        variance: 185.88170937302743
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.72236607872976,
        latitude: -1.2609672995556784,
        longitude: 29.990265891066276,
        pm2_5: 41.74146002742559,
        variance: 185.88214515973732
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.72315746772191,
        latitude: -1.2609672995556784,
        longitude: 30.00039152110056,
        pm2_5: 41.754278048267906,
        variance: 185.8931552073775
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2609672995556784],
        type: 'Point'
      },
      properties: {
        interval: 26.72287351761701,
        latitude: -1.2609672995556784,
        longitude: 30.01051715113485,
        pm2_5: 41.75039142846118,
        variance: 185.88920476847056
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.94976337092913, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.72282672538018,
        latitude: -1.2522293509521143,
        longitude: 29.94976337092913,
        pm2_5: 41.75053676363304,
        variance: 185.88855377829373
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.722769238683128,
        latitude: -1.2522293509521143,
        longitude: 29.959889000963415,
        pm2_5: 41.75115870544973,
        variance: 185.8877540045578
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.72261977411782,
        latitude: -1.2522293509521143,
        longitude: 29.970014630997703,
        pm2_5: 41.747358232958454,
        variance: 185.8856746126803
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.722571576761315,
        latitude: -1.2522293509521143,
        longitude: 29.980140261031988,
        pm2_5: 41.74750789923032,
        variance: 185.88500408036543
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.722536733909195,
        latitude: -1.2522293509521143,
        longitude: 29.990265891066276,
        pm2_5: 41.74766176903239,
        variance: 185.88451933963097
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.72250712603318,
        latitude: -1.2522293509521143,
        longitude: 30.00039152110056,
        pm2_5: 41.74798205326834,
        variance: 185.88410742942892
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2522293509521143],
        type: 'Point'
      },
      properties: {
        interval: 26.722343348643243,
        latitude: -1.2522293509521143,
        longitude: 30.01051715113485,
        pm2_5: 41.74162720931753,
        variance: 185.88182893658313
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.722512364371163,
        latitude: -1.2434914023485502,
        longitude: 29.959889000963415,
        pm2_5: 41.74814843347528,
        variance: 185.88418030611456
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.72243030766068,
        latitude: -1.2434914023485502,
        longitude: 29.970014630997703,
        pm2_5: 41.744427950480905,
        variance: 185.88303872026813
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.722394452668762,
        latitude: -1.2434914023485502,
        longitude: 29.980140261031988,
        pm2_5: 41.74458626377701,
        variance: 185.88253990108865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.7223723442649,
        latitude: -1.2434914023485502,
        longitude: 29.990265891066276,
        pm2_5: 41.74474889097206,
        variance: 185.8822323265133
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.722363984967323,
        latitude: -1.2434914023485502,
        longitude: 30.00039152110056,
        pm2_5: 41.74491581469392,
        variance: 185.8821160311013
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.01051715113485, -1.2434914023485502],
        type: 'Point'
      },
      properties: {
        interval: 26.722369375726228,
        latitude: -1.2434914023485502,
        longitude: 30.01051715113485,
        pm2_5: 41.74508701705744,
        variance: 185.8821910278923
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.959889000963415, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 26.722388515924806,
        latitude: -1.234753453744986,
        longitude: 29.959889000963415,
        pm2_5: 41.74526247966126,
        variance: 185.88245730842095
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.970014630997703, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 26.722421403377727,
        latitude: -1.234753453744986,
        longitude: 29.970014630997703,
        pm2_5: 41.74544218359395,
        variance: 185.88291484269575
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.980140261031988, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 26.72240294208537,
        latitude: -1.234753453744986,
        longitude: 29.980140261031988,
        pm2_5: 41.74129728607367,
        variance: 185.88265800686509
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [29.990265891066276, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 26.72247990515509,
        latitude: -1.234753453744986,
        longitude: 29.990265891066276,
        pm2_5: 41.744273967938334,
        variance: 185.88372872798254
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.00039152110056, -1.234753453744986],
        type: 'Point'
      },
      properties: {
        interval: 26.722957755869324,
        latitude: -1.234753453744986,
        longitude: 30.00039152110056,
        pm2_5: 41.732532415185155,
        variance: 185.8903767237548
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.8259732406052405,
        latitude: 3.8097799999991873,
        longitude: 9.629634444440146,
        pm2_5: 21.957421488003963,
        variance: 2.0788537996191394
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.8259583214181254,
        latitude: 3.8097799999991873,
        longitude: 9.689693333328856,
        pm2_5: 21.95742198238299,
        variance: 2.078831849852236
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.8097799999991873],
        type: 'Point'
      },
      properties: {
        interval: 2.8259586958417326,
        latitude: 3.8097799999991873,
        longitude: 9.749752222217568,
        pm2_5: 21.957421891114564,
        variance: 2.0788324007193637
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.865219999998873],
        type: 'Point'
      },
      properties: {
        interval: 2.825956695405251,
        latitude: 3.865219999998873,
        longitude: 9.749752222217568,
        pm2_5: 21.95742216112564,
        variance: 2.078829457597294
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.389398888885303, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.8259564131531962,
        latitude: 3.920659999998558,
        longitude: 9.389398888885303,
        pm2_5: 21.95742208648356,
        variance: 2.078829042336963
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.825957912599148,
        latitude: 3.920659999998558,
        longitude: 9.449457777774013,
        pm2_5: 21.957421864425925,
        variance: 2.0788312483813343
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.825959688888667,
        latitude: 3.920659999998558,
        longitude: 9.749752222217568,
        pm2_5: 21.95742171781123,
        variance: 2.078833861730459
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 3.920659999998558],
        type: 'Point'
      },
      properties: {
        interval: 2.8259621418350687,
        latitude: 3.920659999998558,
        longitude: 9.809811111106278,
        pm2_5: 21.95742154814897,
        variance: 2.0788374706073114
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.8259564361043497,
        latitude: 3.9760999999982434,
        longitude: 9.449457777774013,
        pm2_5: 21.957422216123383,
        variance: 2.0788290761036023
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.82595613262735,
        latitude: 3.9760999999982434,
        longitude: 9.509516666662725,
        pm2_5: 21.957422135868182,
        variance: 2.078828629616339
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.825956569394663,
        latitude: 3.9760999999982434,
        longitude: 9.689693333328856,
        pm2_5: 21.9574220294031,
        variance: 2.078829272205553
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.825957744831435,
        latitude: 3.9760999999982434,
        longitude: 9.749752222217568,
        pm2_5: 21.957421897111857,
        variance: 2.078831001554761
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 3.9760999999982434],
        type: 'Point'
      },
      properties: {
        interval: 2.8259596546975225,
        latitude: 3.9760999999982434,
        longitude: 9.809811111106278,
        pm2_5: 21.95742173947177,
        variance: 2.078833811427046
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.449457777774013, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.8259585815773924,
        latitude: 4.0315399999979284,
        longitude: 9.449457777774013,
        pm2_5: 21.957422051182732,
        variance: 2.078832232609045
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.825962292105011,
        latitude: 4.0315399999979284,
        longitude: 9.509516666662725,
        pm2_5: 21.95742155705093,
        variance: 2.078837691690808
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.569575555551435, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.825957804472709,
        latitude: 4.0315399999979284,
        longitude: 9.569575555551435,
        pm2_5: 21.95742221600663,
        variance: 2.0788310893013886
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.8259574807032046,
        latitude: 4.0315399999979284,
        longitude: 9.629634444440146,
        pm2_5: 21.957422130385098,
        variance: 2.078830612958768
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.8259579466763363,
        latitude: 4.0315399999979284,
        longitude: 9.689693333328856,
        pm2_5: 21.95742201680094,
        variance: 2.078831298517059
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.825964052045911,
        latitude: 4.0315399999979284,
        longitude: 9.749752222217568,
        pm2_5: 21.957421512863785,
        variance: 2.0788402809911872
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.0315399999979284],
        type: 'Point'
      },
      properties: {
        interval: 2.8259676318487714,
        latitude: 4.0315399999979284,
        longitude: 9.809811111106278,
        pm2_5: 21.957421292509377,
        variance: 2.07884554775535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.509516666662725, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.8259607963028985,
        latitude: 4.086979999997614,
        longitude: 9.509516666662725,
        pm2_5: 21.95742216077608,
        variance: 2.0788354910039857
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.569575555551435, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.825960453236225,
        latitude: 4.086979999997614,
        longitude: 9.569575555551435,
        pm2_5: 21.95742207005111,
        variance: 2.078834986270067
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.629634444440146, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.825971209414232,
        latitude: 4.086979999997614,
        longitude: 9.629634444440146,
        pm2_5: 21.95742118223491,
        variance: 2.0788508112344175
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.8259758005982714,
        latitude: 4.086979999997614,
        longitude: 9.749752222217568,
        pm2_5: 21.95742092231881,
        variance: 2.0788575660055812
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.086979999997614],
        type: 'Point'
      },
      properties: {
        interval: 2.8259650410870054,
        latitude: 4.086979999997614,
        longitude: 9.809811111106278,
        pm2_5: 21.957421955051558,
        variance: 2.0788417361114853
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.689693333328856, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.825971230149904,
        latitude: 4.1424199999972995,
        longitude: 9.689693333328856,
        pm2_5: 21.957421785739967,
        variance: 2.078850841741712
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.749752222217568, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.8259717748092066,
        latitude: 4.1424199999972995,
        longitude: 9.749752222217568,
        pm2_5: 21.957421652974855,
        variance: 2.078851643070152
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.1424199999972995],
        type: 'Point'
      },
      properties: {
        interval: 2.825965647541115,
        latitude: 4.1424199999972995,
        longitude: 9.809811111106278,
        pm2_5: 21.957421350507513,
        variance: 2.0788426283534136
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [9.809811111106278, 4.197859999996985],
        type: 'Point'
      },
      properties: {
        interval: 2.825962088822607,
        latitude: 4.197859999996985,
        longitude: 9.809811111106278,
        pm2_5: 21.957421886632194,
        variance: 2.0788373926131385
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.4105754295984412],
        type: 'Point'
      },
      properties: {
        interval: 4.115057444041111,
        latitude: -1.4105754295984412,
        longitude: 36.90804587470177,
        pm2_5: 21.47993825950505,
        variance: 4.4079804684918145
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 4.113292127851736,
        latitude: -1.3789922793705829,
        longitude: 36.76130337185356,
        pm2_5: 21.48119048178658,
        variance: 4.404199325553691
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 4.11337252731166,
        latitude: -1.3789922793705829,
        longitude: 36.810217539469626,
        pm2_5: 21.481163739990443,
        variance: 4.404371498449166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 4.113490903309406,
        latitude: -1.3789922793705829,
        longitude: 36.859131707085695,
        pm2_5: 21.481128962969073,
        variance: 4.404625003021977
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3789922793705829],
        type: 'Point'
      },
      properties: {
        interval: 4.113646968980374,
        latitude: -1.3789922793705829,
        longitude: 36.90804587470177,
        pm2_5: 21.481086233930146,
        variance: 4.404959231934981
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 4.113319851478751,
        latitude: -1.3474091291427246,
        longitude: 36.71238920423748,
        pm2_5: 21.481511649908587,
        variance: 4.4042586944422055
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 4.113281858816153,
        latitude: -1.3474091291427246,
        longitude: 36.76130337185356,
        pm2_5: 21.481509071543353,
        variance: 4.404177334981796
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 4.113286234879501,
        latitude: -1.3474091291427246,
        longitude: 36.810217539469626,
        pm2_5: 21.481497452860577,
        variance: 4.404186706072778
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 4.113332969069159,
        latitude: -1.3474091291427246,
        longitude: 36.859131707085695,
        pm2_5: 21.481476821658955,
        variance: 4.404286785305942
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3474091291427246],
        type: 'Point'
      },
      properties: {
        interval: 4.11342194797473,
        latitude: -1.3474091291427246,
        longitude: 36.90804587470177,
        pm2_5: 21.48144722730227,
        variance: 4.404477332903014
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113552955660595,
        latitude: -1.3158259789148663,
        longitude: 36.71238920423748,
        pm2_5: 21.481408740598877,
        variance: 4.404757892290718
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113725674214754,
        latitude: -1.3158259789148663,
        longitude: 36.76130337185356,
        pm2_5: 21.4813614536341,
        variance: 4.405127791205132
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113552547460174,
        latitude: -1.3158259789148663,
        longitude: 36.810217539469626,
        pm2_5: 21.481790037447226,
        variance: 4.404757018095609
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113510930581736,
        latitude: -1.3158259789148663,
        longitude: 36.859131707085695,
        pm2_5: 21.481787213136837,
        variance: 4.404667892548787
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113515723742946,
        latitude: -1.3158259789148663,
        longitude: 36.90804587470177,
        pm2_5: 21.48177448613791,
        variance: 4.404678157403282
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.3158259789148663],
        type: 'Point'
      },
      properties: {
        interval: 4.113566915320149,
        latitude: -1.3158259789148663,
        longitude: 36.95696004231784,
        pm2_5: 21.481751886902398,
        variance: 4.404787788113424
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.71238920423748, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.113249899775897,
        latitude: -1.284242828687008,
        longitude: 36.71238920423748,
        pm2_5: 21.48120912437547,
        variance: 4.404108896815501
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.113997074905634,
        latitude: -1.284242828687008,
        longitude: 36.76130337185356,
        pm2_5: 21.481625513780784,
        variance: 4.405709061935681
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.113245945418657,
        latitude: -1.284242828687008,
        longitude: 36.810217539469626,
        pm2_5: 21.481219623152846,
        variance: 4.4041004288585555
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.1133528033338855,
        latitude: -1.284242828687008,
        longitude: 36.859131707085695,
        pm2_5: 21.48121610834107,
        variance: 4.404329259864312
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.114319606457039,
        latitude: -1.284242828687008,
        longitude: 36.90804587470177,
        pm2_5: 21.480287954648094,
        variance: 4.40639989173178
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.1142964637584765,
        latitude: -1.284242828687008,
        longitude: 36.95696004231784,
        pm2_5: 21.480286383302108,
        variance: 4.406350320620447
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.00587420993391, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.114299130172137,
        latitude: -1.284242828687008,
        longitude: 37.00587420993391,
        pm2_5: 21.480279302540065,
        variance: 4.406356032001042
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.284242828687008],
        type: 'Point'
      },
      properties: {
        interval: 4.114327599270749,
        latitude: -1.284242828687008,
        longitude: 37.05478837754998,
        pm2_5: 21.48026672930233,
        variance: 4.406417012213922
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113837270202208,
        latitude: -1.2526596784591497,
        longitude: 36.76130337185356,
        pm2_5: 21.480605218740497,
        variance: 4.405366796570377
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113780436792035,
        latitude: -1.2526596784591497,
        longitude: 36.810217539469626,
        pm2_5: 21.480609799621035,
        variance: 4.405245075523965
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113753537095983,
        latitude: -1.2526596784591497,
        longitude: 36.859131707085695,
        pm2_5: 21.480607973535854,
        variance: 4.405187464590199
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113756636141325,
        latitude: -1.2526596784591497,
        longitude: 36.90804587470177,
        pm2_5: 21.48059974485294,
        variance: 4.405194101779671
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.95696004231784, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113789726448292,
        latitude: -1.2526596784591497,
        longitude: 36.95696004231784,
        pm2_5: 21.480585133259318,
        variance: 4.405264971218116
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.00587420993391, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113498575226444,
        latitude: -1.2526596784591497,
        longitude: 37.00587420993391,
        pm2_5: 21.480916020736917,
        variance: 4.404641432837877
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.2526596784591497],
        type: 'Point'
      },
      properties: {
        interval: 4.113433861131083,
        latitude: -1.2526596784591497,
        longitude: 37.05478837754998,
        pm2_5: 21.48092123610551,
        variance: 4.404502845142588
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.76130337185356, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 4.113403231269393,
        latitude: -1.2210765282312914,
        longitude: 36.76130337185356,
        pm2_5: 21.480919157102583,
        variance: 4.4044372508896
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.810217539469626, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 4.113406759792244,
        latitude: -1.2210765282312914,
        longitude: 36.810217539469626,
        pm2_5: 21.480909788701503,
        variance: 4.404444807242953
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.859131707085695, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 4.113444438173687,
        latitude: -1.2210765282312914,
        longitude: 36.859131707085695,
        pm2_5: 21.48089315331706,
        variance: 4.404525496132351
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 4.1135161752316645,
        latitude: -1.2210765282312914,
        longitude: 36.90804587470177,
        pm2_5: 21.480869290749883,
        variance: 4.404679124295228
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [37.05478837754998, -1.2210765282312914],
        type: 'Point'
      },
      properties: {
        interval: 4.113280274346444,
        latitude: -1.2210765282312914,
        longitude: 37.05478837754998,
        pm2_5: 21.481221952999306,
        variance: 4.404173941932413
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [36.90804587470177, -1.1894933780034331],
        type: 'Point'
      },
      properties: {
        interval: 4.11399370007969,
        latitude: -1.1894933780034331,
        longitude: 36.90804587470177,
        pm2_5: 21.482015402749205,
        variance: 4.4057018336878855
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.36139841750257884],
        type: 'Point'
      },
      properties: {
        interval: 11.251725212794975,
        latitude: -0.36139841750257884,
        longitude: 34.8274887932674,
        pm2_5: 22.843271792286995,
        variance: 32.95536241780667
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.36139841750257884],
        type: 'Point'
      },
      properties: {
        interval: 11.247100296340474,
        latitude: -0.36139841750257884,
        longitude: 34.930594550238986,
        pm2_5: 22.838056703843844,
        variance: 32.92827599852717
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.3124584332107806],
        type: 'Point'
      },
      properties: {
        interval: 11.235288561696242,
        latitude: -0.3124584332107806,
        longitude: 34.8274887932674,
        pm2_5: 22.835408675397655,
        variance: 32.85914958990588
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.3124584332107806],
        type: 'Point'
      },
      properties: {
        interval: 11.229585180651883,
        latitude: -0.3124584332107806,
        longitude: 34.930594550238986,
        pm2_5: 22.833155518779975,
        variance: 32.82579740980748
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 11.230084804638848,
        latitude: -0.2635184489189823,
        longitude: 34.51817152235265,
        pm2_5: 22.831326733833627,
        variance: 32.8287184296596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 11.236779135221687,
        latitude: -0.2635184489189823,
        longitude: 34.72438303629582,
        pm2_5: 22.829946246465653,
        variance: 32.86786894360512
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 11.249557179588328,
        latitude: -0.2635184489189823,
        longitude: 34.8274887932674,
        pm2_5: 22.82903194554042,
        variance: 32.94266366535487
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 11.268208654796895,
        latitude: -0.2635184489189823,
        longitude: 34.930594550238986,
        pm2_5: 22.82859534397489,
        variance: 33.05199039151387
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.2635184489189823],
        type: 'Point'
      },
      properties: {
        interval: 11.29351629807886,
        latitude: -0.2635184489189823,
        longitude: 35.033700307210566,
        pm2_5: 22.830880565174095,
        variance: 33.20062223421826
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.2924303452998,
        latitude: -0.21457846462718402,
        longitude: 34.51817152235265,
        pm2_5: 22.828641375168797,
        variance: 33.19423758419612
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.235182730978204,
        latitude: -0.21457846462718402,
        longitude: 34.62127727932423,
        pm2_5: 22.833279860223374,
        variance: 32.85853055978521
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.229452741243602,
        latitude: -0.21457846462718402,
        longitude: 34.72438303629582,
        pm2_5: 22.831014813912113,
        variance: 32.82502313302359
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.229954144122864,
        latitude: -0.21457846462718402,
        longitude: 34.8274887932674,
        pm2_5: 22.829177832656654,
        variance: 32.82795451871675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.236678598247543,
        latitude: -0.21457846462718402,
        longitude: 34.930594550238986,
        pm2_5: 22.827792970108074,
        variance: 32.86728079974864
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.21457846462718402],
        type: 'Point'
      },
      properties: {
        interval: 11.249514429614685,
        latitude: -0.21457846462718402,
        longitude: 35.033700307210566,
        pm2_5: 22.826878186275074,
        variance: 32.94241329188594
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.26825006567101,
        latitude: -0.16563848033538575,
        longitude: 34.51817152235265,
        pm2_5: 22.826445006674533,
        variance: 33.05223332530579
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.248361405050023,
        latitude: -0.16563848033538575,
        longitude: 34.62127727932423,
        pm2_5: 22.833907892516258,
        variance: 32.93566073995703
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.24704886458608,
        latitude: -0.16563848033538575,
        longitude: 34.72438303629582,
        pm2_5: 22.835943290736502,
        variance: 32.92797484443645
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.250956717508023,
        latitude: -0.16563848033538575,
        longitude: 34.8274887932674,
        pm2_5: 22.8312807537109,
        variance: 32.950860854654024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.238272735120901,
        latitude: -0.16563848033538575,
        longitude: 34.930594550238986,
        pm2_5: 22.832192181671925,
        variance: 32.876607160808476
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.231627589034337,
        latitude: -0.16563848033538575,
        longitude: 35.033700307210566,
        pm2_5: 22.833564710867325,
        variance: 32.83773904070108
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.23991182115373, -0.16563848033538575],
        type: 'Point'
      },
      properties: {
        interval: 11.257988521839842,
        latitude: -0.16563848033538575,
        longitude: 35.23991182115373,
        pm2_5: 22.841966497345553,
        variance: 32.99206204651125
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.244644321502005,
        latitude: -0.11669849604358745,
        longitude: 34.51817152235265,
        pm2_5: 22.840745819917203,
        variance: 32.913896792244714
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.251030076189128,
        latitude: -0.11669849604358745,
        longitude: 34.62127727932423,
        pm2_5: 22.83941848054219,
        variance: 32.95129054959193
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.255411275143564,
        latitude: -0.11669849604358745,
        longitude: 34.72438303629582,
        pm2_5: 22.844801895674482,
        variance: 32.97695829150064
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.238435281075954,
        latitude: -0.11669849604358745,
        longitude: 34.8274887932674,
        pm2_5: 22.840057240213802,
        variance: 32.87755819630695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.238921026932118,
        latitude: -0.11669849604358745,
        longitude: 34.930594550238986,
        pm2_5: 22.83828119990261,
        variance: 32.880400314873214
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.245411540107263,
        latitude: -0.11669849604358745,
        longitude: 35.033700307210566,
        pm2_5: 22.83693527560253,
        variance: 32.91838835547105
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.13680606418215, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.257800323450814,
        latitude: -0.11669849604358745,
        longitude: 35.13680606418215,
        pm2_5: 22.836036821235716,
        variance: 32.99095900736393
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.23991182115373, -0.11669849604358745],
        type: 'Point'
      },
      properties: {
        interval: 11.251289277850717,
        latitude: -0.11669849604358745,
        longitude: 35.23991182115373,
        pm2_5: 22.84249250906486,
        variance: 32.952808833267
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.239686572136408,
        latitude: -0.06775851175178921,
        longitude: 34.51817152235265,
        pm2_5: 22.839895492673193,
        variance: 32.88487980004777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.234084908710823,
        latitude: -0.06775851175178921,
        longitude: 34.62127727932423,
        pm2_5: 22.837683414582806,
        variance: 32.85210946900361
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.234576690192236,
        latitude: -0.06775851175178921,
        longitude: 34.72438303629582,
        pm2_5: 22.83588514816784,
        variance: 32.854985789205216
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.8274887932674, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.241153797259022,
        latitude: -0.06775851175178921,
        longitude: 34.8274887932674,
        pm2_5: 22.83452414819029,
        variance: 32.893465923998065
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.930594550238986, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.253707836209415,
        latitude: -0.06775851175178921,
        longitude: 34.930594550238986,
        pm2_5: 22.833617999812034,
        variance: 32.96697731746178
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.033700307210566, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.248515519573962,
        latitude: -0.06775851175178921,
        longitude: 35.033700307210566,
        pm2_5: 22.84024191546788,
        variance: 32.93656325335701
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [35.13680606418215, -0.06775851175178921],
        type: 'Point'
      },
      properties: {
        interval: 11.236791719199399,
        latitude: -0.06775851175178921,
        longitude: 35.13680606418215,
        pm2_5: 22.837616055806603,
        variance: 32.86794256056544
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.51817152235265, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 11.231131175649903,
        latitude: -0.018818527459990908,
        longitude: 34.51817152235265,
        pm2_5: 22.83538057755375,
        variance: 32.834836392298826
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.62127727932423, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 11.23647461709441,
        latitude: -0.018818527459990908,
        longitude: 34.62127727932423,
        pm2_5: 22.83123589607554,
        variance: 32.86608752098266
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [34.72438303629582, -0.018818527459990908],
        type: 'Point'
      },
      properties: {
        interval: 11.230734352914716,
        latitude: -0.018818527459990908,
        longitude: 34.72438303629582,
        pm2_5: 22.82896479575051,
        variance: 32.832516166633354
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 20.47369633504697,
        latitude: 0.6221293861111437,
        longitude: 30.261528885222276,
        pm2_5: 36.20985610921656,
        variance: 109.1139737660651
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 20.47296355532893,
        latitude: 0.6221293861111437,
        longitude: 30.270733705333384,
        pm2_5: 36.206921543174815,
        variance: 109.10616324912189
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 20.4729107840188,
        latitude: 0.6221293861111437,
        longitude: 30.279938525444493,
        pm2_5: 36.207758686259744,
        variance: 109.10560078363005
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6221293861111437],
        type: 'Point'
      },
      properties: {
        interval: 20.47292074438113,
        latitude: 0.6221293861111437,
        longitude: 30.2891433455556,
        pm2_5: 36.20855959270014,
        variance: 109.1057069465096
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 20.472993435255617,
        latitude: 0.631207524222254,
        longitude: 30.261528885222276,
        pm2_5: 36.209324181099156,
        variance: 109.10648172636911
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 20.473128847630573,
        latitude: 0.631207524222254,
        longitude: 30.270733705333384,
        pm2_5: 36.210052373839275,
        variance: 109.1079250342782
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 20.472971503581917,
        latitude: 0.631207524222254,
        longitude: 30.279938525444493,
        pm2_5: 36.206892960401795,
        variance: 109.1062479660759
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.631207524222254],
        type: 'Point'
      },
      properties: {
        interval: 20.473629166700142,
        latitude: 0.631207524222254,
        longitude: 30.2891433455556,
        pm2_5: 36.21223980232072,
        variance: 109.1132578237075
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.472981399158275,
        latitude: 0.6402856623333643,
        longitude: 30.270733705333384,
        pm2_5: 36.207688223962585,
        variance: 109.10635343874446
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.473188040789033,
        latitude: 0.6402856623333643,
        longitude: 30.279938525444493,
        pm2_5: 36.20917050441139,
        variance: 109.1085559541616
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.47318165349188,
        latitude: 0.6402856623333643,
        longitude: 30.2891433455556,
        pm2_5: 36.2051516060351,
        variance: 109.10848787403074
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.47312964603401,
        latitude: 0.6402856623333643,
        longitude: 30.29834816566671,
        pm2_5: 36.205976865738116,
        variance: 109.10793354417865
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.307552985777818, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.47313947572832,
        latitude: 0.6402856623333643,
        longitude: 30.307552985777818,
        pm2_5: 36.206766413625935,
        variance: 109.10803831544808
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.316757805888926, 0.6402856623333643],
        type: 'Point'
      },
      properties: {
        interval: 20.473211141433556,
        latitude: 0.6402856623333643,
        longitude: 30.316757805888926,
        pm2_5: 36.20752016964784,
        variance: 109.10880217662407
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.47354979737778,
        latitude: 0.6493638004444746,
        longitude: 30.270733705333384,
        pm2_5: 36.203336731412605,
        variance: 109.11241183509674
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.473053581203516,
        latitude: 0.6493638004444746,
        longitude: 30.279938525444493,
        pm2_5: 36.20844743096047,
        variance: 109.10712279748805
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.473366556601928,
        latitude: 0.6493638004444746,
        longitude: 30.2891433455556,
        pm2_5: 36.21158008568164,
        variance: 109.1104587049631
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.47316706353336,
        latitude: 0.6493638004444746,
        longitude: 30.29834816566671,
        pm2_5: 36.21088356949162,
        variance: 109.10833236446979
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.307552985777818, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.473030712430237,
        latitude: 0.6493638004444746,
        longitude: 30.307552985777818,
        pm2_5: 36.21015032435544,
        variance: 109.10687904834231
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.316757805888926, 0.6493638004444746],
        type: 'Point'
      },
      properties: {
        interval: 20.473642100964515,
        latitude: 0.6493638004444746,
        longitude: 30.316757805888926,
        pm2_5: 36.210716094275085,
        variance: 109.11339568887615
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 20.473652309348832,
        latitude: 0.6584419385555849,
        longitude: 30.261528885222276,
        pm2_5: 36.21153883219526,
        variance: 109.11350449919428
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 20.47372695900315,
        latitude: 0.6584419385555849,
        longitude: 30.270733705333384,
        pm2_5: 36.212324238988764,
        variance: 109.11430018529063
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 20.47336705781067,
        latitude: 0.6584419385555849,
        longitude: 30.279938525444493,
        pm2_5: 36.209198341745655,
        variance: 109.1104640472322
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 20.473313181167377,
        latitude: 0.6584419385555849,
        longitude: 30.2891433455556,
        pm2_5: 36.21005273347197,
        variance: 109.1098897891925
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6584419385555849],
        type: 'Point'
      },
      properties: {
        interval: 20.473323329229334,
        latitude: 0.6584419385555849,
        longitude: 30.29834816566671,
        pm2_5: 36.210870125711814,
        variance: 109.10999795480166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 20.47339750080845,
        latitude: 0.6675200766666952,
        longitude: 30.270733705333384,
        pm2_5: 36.21165043511906,
        variance: 109.11078853241088
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 20.473081635102577,
        latitude: 0.6675200766666952,
        longitude: 30.279938525444493,
        pm2_5: 36.2093386590131,
        variance: 109.1074218131962
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 20.473091721715182,
        latitude: 0.6675200766666952,
        longitude: 30.2891433455556,
        pm2_5: 36.21015063039301,
        variance: 109.1075293226163
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.29834816566671, 0.6675200766666952],
        type: 'Point'
      },
      properties: {
        interval: 20.473165407427157,
        latitude: 0.6675200766666952,
        longitude: 30.29834816566671,
        pm2_5: 36.21092577056456,
        variance: 109.10831471258643
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 20.47330268306255,
        latitude: 0.6765982147778055,
        longitude: 30.261528885222276,
        pm2_5: 36.21166400065877,
        variance: 109.10977789262188
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 20.47350353145183,
        latitude: 0.6765982147778055,
        longitude: 30.270733705333384,
        pm2_5: 36.212365245652926,
        variance: 109.11191869334925
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.279938525444493, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 20.473767927433244,
        latitude: 0.6765982147778055,
        longitude: 30.279938525444493,
        pm2_5: 36.2130294343802,
        variance: 109.11473686651243
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.2891433455556, 0.6765982147778055],
        type: 'Point'
      },
      properties: {
        interval: 20.47294749626591,
        latitude: 0.6765982147778055,
        longitude: 30.2891433455556,
        pm2_5: 36.20857394879339,
        variance: 109.10599208268968
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.252324065111168, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 20.472957520309397,
        latitude: 0.6856763528889158,
        longitude: 30.252324065111168,
        pm2_5: 36.20938042470547,
        variance: 109.10609892450884
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.261528885222276, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 20.473436805928863,
        latitude: 0.6856763528889158,
        longitude: 30.261528885222276,
        pm2_5: 36.20419129763603,
        variance: 109.11120747770792
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [30.270733705333384, 0.6856763528889158],
        type: 'Point'
      },
      properties: {
        interval: 20.47338518831633,
        latitude: 0.6856763528889158,
        longitude: 30.270733705333384,
        pm2_5: 36.20501050228575,
        variance: 109.11065729622305
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.22563595188895785],
        type: 'Point'
      },
      properties: {
        interval: 32.582286563225296,
        latitude: 0.22563595188895785,
        longitude: 32.618631636666706,
        pm2_5: 33.13619811388559,
        variance: 276.3445953998678
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.22563595188895785],
        type: 'Point'
      },
      properties: {
        interval: 32.57995381736279,
        latitude: 0.22563595188895785,
        longitude: 32.62865916900004,
        pm2_5: 33.13845637207089,
        variance: 276.30502674445347
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 32.57983239486886,
        latitude: 0.23695258377784334,
        longitude: 32.618631636666706,
        pm2_5: 33.136349653081794,
        variance: 276.3029672214042
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 32.57980166056033,
        latitude: 0.23695258377784334,
        longitude: 32.62865916900004,
        pm2_5: 33.13441706203279,
        variance: 276.30244591874475
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.23695258377784334],
        type: 'Point'
      },
      properties: {
        interval: 32.579861623652704,
        latitude: 0.23695258377784334,
        longitude: 32.63868670133338,
        pm2_5: 33.13265899008189,
        variance: 276.3034629884314
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 32.58001226629146,
        latitude: 0.24826921566672885,
        longitude: 32.60860410433337,
        pm2_5: 33.13107579310431,
        variance: 276.30601813611577
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 32.58025354356301,
        latitude: 0.24826921566672885,
        longitude: 32.618631636666706,
        pm2_5: 33.129667791553516,
        variance: 276.31011062131665
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 32.58058538352178,
        latitude: 0.24826921566672885,
        longitude: 32.62865916900004,
        pm2_5: 33.128435270337455,
        variance: 276.31573925784915
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.24826921566672885],
        type: 'Point'
      },
      properties: {
        interval: 32.581214971541236,
        latitude: 0.24826921566672885,
        longitude: 32.63868670133338,
        pm2_5: 33.12790608850089,
        variance: 276.3264184250788
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 32.57987519001807,
        latitude: 0.2595858475556143,
        longitude: 32.60860410433337,
        pm2_5: 33.13813583725494,
        variance: 276.3036930958858
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 32.579723568139734,
        latitude: 0.2595858475556143,
        longitude: 32.618631636666706,
        pm2_5: 33.13410985791587,
        variance: 276.30112134954175
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 32.57978335097808,
        latitude: 0.2595858475556143,
        longitude: 32.62865916900004,
        pm2_5: 33.13235759253887,
        variance: 276.3021353593995
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 32.579933514959734,
        latitude: 0.2595858475556143,
        longitude: 32.63868670133338,
        pm2_5: 33.130779627196794,
        variance: 276.30468238213155
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64871423366671, 0.2595858475556143],
        type: 'Point'
      },
      properties: {
        interval: 32.58017401541244,
        latitude: 0.2595858475556143,
        longitude: 32.64871423366671,
        pm2_5: 33.12937628074452,
        variance: 276.3087616812152
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.57992213701121,
        latitude: 0.27090247944449986,
        longitude: 32.588549039666695,
        pm2_5: 33.138057118018345,
        variance: 276.30448939340727
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.57980157427872,
        latitude: 0.27090247944449986,
        longitude: 32.598576572000034,
        pm2_5: 33.135964669056605,
        variance: 276.3024444552723
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.579771083014705,
        latitude: 0.27090247944449986,
        longitude: 32.60860410433337,
        pm2_5: 33.13404517517648,
        variance: 276.3019272755208
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.57975418420618,
        latitude: 0.27090247944449986,
        longitude: 32.618631636666706,
        pm2_5: 33.1360360692256,
        variance: 276.3016406453821
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.579830672319616,
        latitude: 0.27090247944449986,
        longitude: 32.62865916900004,
        pm2_5: 33.13229902355171,
        variance: 276.3029380042217
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.580791389048606,
        latitude: 0.27090247944449986,
        longitude: 32.63868670133338,
        pm2_5: 33.12896619273954,
        variance: 276.319233532045
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64871423366671, 0.27090247944449986],
        type: 'Point'
      },
      properties: {
        interval: 32.58021654679835,
        latitude: 0.27090247944449986,
        longitude: 32.64871423366671,
        pm2_5: 33.13161498431696,
        variance: 276.3094830894088
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.582530921123215,
        latitude: 0.28221911133338534,
        longitude: 32.57852150733336,
        pm2_5: 33.13477056559375,
        variance: 276.3487404274132
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.58158149032607,
        latitude: 0.28221911133338534,
        longitude: 32.588549039666695,
        pm2_5: 33.13468892899975,
        variance: 276.33263546719036
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.58182533997322,
        latitude: 0.28221911133338534,
        longitude: 32.598576572000034,
        pm2_5: 33.133264789553664,
        variance: 276.3367717837674
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.58216074321174,
        latitude: 0.28221911133338534,
        longitude: 32.60860410433337,
        pm2_5: 33.132018132105586,
        variance: 276.34246113507083
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.580849438226664,
        latitude: 0.28221911133338534,
        longitude: 32.618631636666706,
        pm2_5: 33.13501901477701,
        variance: 276.32021816857423
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.581001316423766,
        latitude: 0.28221911133338534,
        longitude: 32.62865916900004,
        pm2_5: 33.13342179574397,
        variance: 276.32279435152213
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.63868670133338, 0.28221911133338534],
        type: 'Point'
      },
      properties: {
        interval: 32.581244603690116,
        latitude: 0.28221911133338534,
        longitude: 32.63868670133338,
        pm2_5: 33.132001316303494,
        variance: 276.3269210551558
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.580458547653045,
        latitude: 0.29353574322227083,
        longitude: 32.57852150733336,
        pm2_5: 33.13020257482298,
        variance: 276.31358787363035
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.581579227038354,
        latitude: 0.29353574322227083,
        longitude: 32.588549039666695,
        pm2_5: 33.13075786522716,
        variance: 276.33259707616025
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.58054627433845,
        latitude: 0.29353574322227083,
        longitude: 32.598576572000034,
        pm2_5: 33.13239705546628,
        variance: 276.31507588877264
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.5807889452715,
        latitude: 0.29353574322227083,
        longitude: 32.60860410433337,
        pm2_5: 33.130980486328035,
        variance: 276.31919208046793
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.58112271457471,
        latitude: 0.29353574322227083,
        longitude: 32.618631636666706,
        pm2_5: 33.12974046065126,
        variance: 276.32485353555194
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62865916900004, 0.29353574322227083],
        type: 'Point'
      },
      properties: {
        interval: 32.58154748232522,
        latitude: 0.29353574322227083,
        longitude: 32.62865916900004,
        pm2_5: 33.12867723000081,
        variance: 276.3320586065736
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57852150733336, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 32.58003617473298,
        latitude: 0.3048523751111563,
        longitude: 32.57852150733336,
        pm2_5: 33.136905336181634,
        variance: 276.3064236638145
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.588549039666695, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 32.58000532879619,
        latitude: 0.3048523751111563,
        longitude: 32.588549039666695,
        pm2_5: 33.134966704766626,
        variance: 276.30590046449083
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598576572000034, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 32.58006545879853,
        latitude: 0.3048523751111563,
        longitude: 32.598576572000034,
        pm2_5: 33.133203134955714,
        variance: 276.3069203716152
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.60860410433337, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 32.58039477443812,
        latitude: 0.3048523751111563,
        longitude: 32.60860410433337,
        pm2_5: 33.13398988051673,
        variance: 276.3125061584326
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.618631636666706, 0.3048523751111563],
        type: 'Point'
      },
      properties: {
        interval: 32.57998032453004,
        latitude: 0.3048523751111563,
        longitude: 32.618631636666706,
        pm2_5: 33.1307265664319,
        variance: 276.3054763501574
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 43.05102575483658,
        latitude: 0.33574773744449105,
        longitude: 32.561856704555595,
        pm2_5: 38.634634871233594,
        variance: 482.4528369803213
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 43.05105308739163,
        latitude: 0.33574773744449105,
        longitude: 32.56793615633338,
        pm2_5: 38.63534658633501,
        variance: 482.4534495869982
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.33574773744449105],
        type: 'Point'
      },
      properties: {
        interval: 43.051064755669636,
        latitude: 0.33574773744449105,
        longitude: 32.57401560811116,
        pm2_5: 38.63527790464231,
        variance: 482.453711109137
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 43.05108256885039,
        latitude: 0.34422949488893234,
        longitude: 32.561856704555595,
        pm2_5: 38.63523353615573,
        variance: 482.45411035765665
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 43.05110652396257,
        latitude: 0.34422949488893234,
        longitude: 32.56793615633338,
        pm2_5: 38.635213485715695,
        variance: 482.4546472661318
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 43.05110921714765,
        latitude: 0.34422949488893234,
        longitude: 32.57401560811116,
        pm2_5: 38.636262254128475,
        variance: 482.45470762879404
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 43.051096340620965,
        latitude: 0.34422949488893234,
        longitude: 32.58009505988894,
        pm2_5: 38.636097005845414,
        variance: 482.4544190257777
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.34422949488893234],
        type: 'Point'
      },
      properties: {
        interval: 43.05108958843288,
        latitude: 0.34422949488893234,
        longitude: 32.58617451166672,
        pm2_5: 38.63595593345978,
        variance: 482.45426768827406
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.051088961697985,
        latitude: 0.3527112523333737,
        longitude: 32.555777252777816,
        pm2_5: 38.635839052667826,
        variance: 482.4542536412
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.051094460513504,
        latitude: 0.3527112523333737,
        longitude: 32.561856704555595,
        pm2_5: 38.63574637644786,
        variance: 482.4543768867286
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.05104756596504,
        latitude: 0.3527112523333737,
        longitude: 32.56793615633338,
        pm2_5: 38.63543957365388,
        variance: 482.45332583480445
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.051106083959915,
        latitude: 0.3527112523333737,
        longitude: 32.57401560811116,
        pm2_5: 38.63567791506108,
        variance: 482.45463740430296
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.051147695984604,
        latitude: 0.3527112523333737,
        longitude: 32.58009505988894,
        pm2_5: 38.63561366421862,
        variance: 482.4555700597357
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.3527112523333737],
        type: 'Point'
      },
      properties: {
        interval: 43.05114459196243,
        latitude: 0.3527112523333737,
        longitude: 32.58617451166672,
        pm2_5: 38.63640793693749,
        variance: 482.4555004888732
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.05114396496997,
        latitude: 0.361193009777815,
        longitude: 32.555777252777816,
        pm2_5: 38.63629147273679,
        variance: 482.4554864360084
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.05114944028957,
        latitude: 0.361193009777815,
        longitude: 32.561856704555595,
        pm2_5: 38.63619911937276,
        variance: 482.45560915507735
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.05116101700783,
        latitude: 0.361193009777815,
        longitude: 32.56793615633338,
        pm2_5: 38.63613088704734,
        variance: 482.45586862565983
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.051178693201614,
        latitude: 0.361193009777815,
        longitude: 32.57401560811116,
        pm2_5: 38.63608678325685,
        variance: 482.4562648047629
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.051213183221364,
        latitude: 0.361193009777815,
        longitude: 32.58009505988894,
        pm2_5: 38.6369127595176,
        variance: 482.4570378350618
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.051212556099,
        latitude: 0.361193009777815,
        longitude: 32.58617451166672,
        pm2_5: 38.636796726562196,
        variance: 482.45702377926295
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.05121800704713,
        latitude: 0.361193009777815,
        longitude: 32.592253963444506,
        pm2_5: 38.63670470773249,
        variance: 482.4571459522854
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.361193009777815],
        type: 'Point'
      },
      properties: {
        interval: 43.05112383010107,
        latitude: 0.361193009777815,
        longitude: 32.598333415222285,
        pm2_5: 38.635633676046105,
        variance: 482.45503515063933
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.05104819231572,
        latitude: 0.36967476722225634,
        longitude: 32.555777252777816,
        pm2_5: 38.63555685628139,
        variance: 482.4533398732535
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.051054966346236,
        latitude: 0.36967476722225634,
        longitude: 32.561856704555595,
        pm2_5: 38.6356984211646,
        variance: 482.4534917001679
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.05106788693562,
        latitude: 0.36967476722225634,
        longitude: 32.56793615633338,
        pm2_5: 38.63586425251815,
        variance: 482.4537812904882
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.05101890496619,
        latitude: 0.36967476722225634,
        longitude: 32.57401560811116,
        pm2_5: 38.634491516244594,
        variance: 482.45268345370596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.051018281404914,
        latitude: 0.36967476722225634,
        longitude: 32.58009505988894,
        pm2_5: 38.63437277572699,
        variance: 482.4526694777853
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.05101260480327,
        latitude: 0.36967476722225634,
        longitude: 32.58617451166672,
        pm2_5: 38.63482100147082,
        variance: 482.45254224774317
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.05100577215029,
        latitude: 0.36967476722225634,
        longitude: 32.592253963444506,
        pm2_5: 38.63467806680533,
        variance: 482.4523891070694
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.36967476722225634],
        type: 'Point'
      },
      properties: {
        interval: 43.0510051477055,
        latitude: 0.36967476722225634,
        longitude: 32.598333415222285,
        pm2_5: 38.63455966816615,
        variance: 482.4523751113509
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.555777252777816, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05101073156653,
        latitude: 0.37815652466669764,
        longitude: 32.555777252777816,
        pm2_5: 38.634465818814384,
        variance: 482.4525002627697
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.561856704555595, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05102252279001,
        latitude: 0.37815652466669764,
        longitude: 32.561856704555595,
        pm2_5: 38.63439652922982,
        variance: 482.45276454023656
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05102609315819,
        latitude: 0.37815652466669764,
        longitude: 32.56793615633338,
        pm2_5: 38.63522727789117,
        variance: 482.45284456314744
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05101309095651,
        latitude: 0.37815652466669764,
        longitude: 32.57401560811116,
        pm2_5: 38.6350603432185,
        variance: 482.4525531439267
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05100627668673,
        latitude: 0.37815652466669764,
        longitude: 32.58009505988894,
        pm2_5: 38.63491784708215,
        variance: 482.45240041527495
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.051005651481894,
        latitude: 0.37815652466669764,
        longitude: 32.58617451166672,
        pm2_5: 38.63479980544046,
        variance: 482.45238640252137
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05101121543968,
        latitude: 0.37815652466669764,
        longitude: 32.592253963444506,
        pm2_5: 38.63470623148695,
        variance: 482.4525111078492
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.598333415222285, 0.37815652466669764],
        type: 'Point'
      },
      properties: {
        interval: 43.05102296762242,
        latitude: 0.37815652466669764,
        longitude: 32.598333415222285,
        pm2_5: 38.63463713564909,
        variance: 482.45277451029597
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 43.051040175635976,
        latitude: 0.386638282111139,
        longitude: 32.56793615633338,
        pm2_5: 38.63551923313664,
        variance: 482.45316019476854
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 43.05102721314992,
        latitude: 0.386638282111139,
        longitude: 32.57401560811116,
        pm2_5: 38.63535283960726,
        variance: 482.4528696656016
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 43.051020418423114,
        latitude: 0.386638282111139,
        longitude: 32.58009505988894,
        pm2_5: 38.6352108001017,
        variance: 482.4527173749177
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 43.051019792582785,
        latitude: 0.386638282111139,
        longitude: 32.58617451166672,
        pm2_5: 38.63509313049349,
        variance: 482.4527033479162
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.386638282111139],
        type: 'Point'
      },
      properties: {
        interval: 43.05102533572633,
        latitude: 0.386638282111139,
        longitude: 32.592253963444506,
        pm2_5: 38.63499984390606,
        variance: 482.45282758677376
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56793615633338, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 43.051037046922076,
        latitude: 0.3951200395555803,
        longitude: 32.56793615633338,
        pm2_5: 38.634930950714164,
        variance: 482.4530900706625
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.57401560811116, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 43.051054924208785,
        latitude: 0.3951200395555803,
        longitude: 32.57401560811116,
        pm2_5: 38.63488645853592,
        variance: 482.45349075573745
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58009505988894, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 43.05107896459713,
        latitude: 0.3951200395555803,
        longitude: 32.58009505988894,
        pm2_5: 38.63486637223661,
        variance: 482.45402957517126
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58617451166672, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 43.051229535159216,
        latitude: 0.3951200395555803,
        longitude: 32.58617451166672,
        pm2_5: 38.6366367131701,
        variance: 482.4574043338623
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.592253963444506, 0.3951200395555803],
        type: 'Point'
      },
      properties: {
        interval: 43.05124713852532,
        latitude: 0.3951200395555803,
        longitude: 32.592253963444506,
        pm2_5: 38.636592750327885,
        variance: 482.4577988812955
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.2990997417778279],
        type: 'Point'
      },
      properties: {
        interval: 42.33926918655406,
        latitude: 0.2990997417778279,
        longitude: 32.66865347777785,
        pm2_5: 18.722575778850967,
        variance: 466.63205832244023
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.2990997417778279],
        type: 'Point'
      },
      properties: {
        interval: 42.34297186034248,
        latitude: 0.2990997417778279,
        longitude: 32.677854153888966,
        pm2_5: 18.81255447191467,
        variance: 466.71367814602115
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.32360693055560813],
        type: 'Point'
      },
      properties: {
        interval: 42.33629233153122,
        latitude: 0.32360693055560813,
        longitude: 32.66865347777785,
        pm2_5: 18.79704862031708,
        variance: 466.56644324783144
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.32360693055560813],
        type: 'Point'
      },
      properties: {
        interval: 42.33615010022895,
        latitude: 0.32360693055560813,
        longitude: 32.677854153888966,
        pm2_5: 18.799200338361707,
        variance: 466.5633083374415
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 42.33625342309338,
        latitude: 0.3481141193333883,
        longitude: 32.64105144944452,
        pm2_5: 18.801412244137037,
        variance: 466.5655856685721
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 42.336602281465495,
        latitude: 0.3481141193333883,
        longitude: 32.650252125555625,
        pm2_5: 18.803684089647323,
        variance: 466.57327486958286
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 42.3315375833187,
        latitude: 0.3481141193333883,
        longitude: 32.65945280166674,
        pm2_5: 18.784032712591422,
        variance: 466.4616498771146
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 42.33139450270887,
        latitude: 0.3481141193333883,
        longitude: 32.66865347777785,
        pm2_5: 18.7862095242923,
        variance: 466.45849660140846
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.3481141193333883],
        type: 'Point'
      },
      properties: {
        interval: 42.3314998931408,
        latitude: 0.3481141193333883,
        longitude: 32.677854153888966,
        pm2_5: 18.78844733393646,
        variance: 466.46081924275825
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 42.33185373548503,
        latitude: 0.3726213081111685,
        longitude: 32.64105144944452,
        pm2_5: 18.79074588991916,
        variance: 466.4686174204753
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 42.32924938880041,
        latitude: 0.3726213081111685,
        longitude: 32.650252125555625,
        pm2_5: 18.76925391731229,
        variance: 466.4112228808988
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 42.328854416847044,
        latitude: 0.3726213081111685,
        longitude: 32.65945280166674,
        pm2_5: 18.771392341751056,
        variance: 466.4025188053497
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 42.32871061902882,
        latitude: 0.3726213081111685,
        longitude: 32.66865347777785,
        pm2_5: 18.773592783587233,
        variance: 466.399349924376
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.677854153888966, 0.3726213081111685],
        type: 'Point'
      },
      properties: {
        interval: 42.32881801447386,
        latitude: 0.3726213081111685,
        longitude: 32.677854153888966,
        pm2_5: 18.77585499513099,
        variance: 466.4017166030942
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61344942111118, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.32917658359886,
        latitude: 0.3971284968889487,
        longitude: 32.61344942111118,
        pm2_5: 18.77817872136442,
        variance: 466.40961845207573
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.62265009722229, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.32978626811865,
        latitude: 0.3971284968889487,
        longitude: 32.62265009722229,
        pm2_5: 18.780563699987642,
        variance: 466.4230543275215
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.33064697106158,
        latitude: 0.3971284968889487,
        longitude: 32.631850773333404,
        pm2_5: 18.78300966145771,
        variance: 466.44202233148826
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.32929576660533,
        latitude: 0.3971284968889487,
        longitude: 32.64105144944452,
        pm2_5: 18.75488131117895,
        variance: 466.4122449231445
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.32864404509233,
        latitude: 0.3971284968889487,
        longitude: 32.650252125555625,
        pm2_5: 18.756978150113092,
        variance: 466.3978828342697
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.328245963310174,
        latitude: 0.3971284968889487,
        longitude: 32.65945280166674,
        pm2_5: 18.759137985345006,
        variance: 466.3891103525832
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.3971284968889487],
        type: 'Point'
      },
      properties: {
        interval: 42.32810157978436,
        latitude: 0.3971284968889487,
        longitude: 32.66865347777785,
        pm2_5: 18.76136057355239,
        variance: 466.3859286100957
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 42.32821091376855,
        latitude: 0.42163568566672893,
        longitude: 32.631850773333404,
        pm2_5: 18.76364566394477,
        variance: 466.38833797388463
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 42.33077060835866,
        latitude: 0.42163568566672893,
        longitude: 32.64105144944452,
        pm2_5: 18.742983935225258,
        variance: 466.44474705786183
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 42.330113786076375,
        latitude: 0.42163568566672893,
        longitude: 32.650252125555625,
        pm2_5: 18.74510002468335,
        variance: 466.430272059083
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.42163568566672893],
        type: 'Point'
      },
      properties: {
        interval: 42.32971292606598,
        latitude: 0.42163568566672893,
        longitude: 32.65945280166674,
        pm2_5: 18.747279808531122,
        variance: 466.4214380474692
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.631850773333404, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 42.329568087482166,
        latitude: 0.4461428744445091,
        longitude: 32.631850773333404,
        pm2_5: 18.749523040640277,
        variance: 466.418246166386
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.64105144944452, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 42.32967928968251,
        latitude: 0.4461428744445091,
        longitude: 32.64105144944452,
        pm2_5: 18.751829467293888,
        variance: 466.4206967845107
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 42.334318270386504,
        latitude: 0.4461428744445091,
        longitude: 32.650252125555625,
        pm2_5: 18.73149549357218,
        variance: 466.5229340426855
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.4461428744445091],
        type: 'Point'
      },
      properties: {
        interval: 42.33365688405339,
        latitude: 0.4461428744445091,
        longitude: 32.65945280166674,
        pm2_5: 18.73362939627422,
        variance: 466.5083572409311
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.650252125555625, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 42.33993459691002,
        latitude: 0.4706500632222893,
        longitude: 32.650252125555625,
        pm2_5: 18.720425514294483,
        variance: 466.6467257576577
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65945280166674, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 42.34311310990007,
        latitude: 0.4706500632222893,
        longitude: 32.65945280166674,
        pm2_5: 18.810429289318876,
        variance: 466.71679191945816
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.66865347777785, 0.4706500632222893],
        type: 'Point'
      },
      properties: {
        interval: 42.343496787122945,
        latitude: 0.4706500632222893,
        longitude: 32.66865347777785,
        pm2_5: 18.808363683911534,
        variance: 466.7252499378101
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.3976606461111487],
        type: 'Point'
      },
      properties: {
        interval: 24.33147671655525,
        latitude: 0.3976606461111487,
        longitude: 33.269948767666726,
        pm2_5: 12.245357918361352,
        variance: 154.10786110169465
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: 24.32895124658287,
        latitude: 0.40645178522225933,
        longitude: 33.22026394233339,
        pm2_5: 12.247596088517353,
        variance: 154.07587170934153
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: 24.330072202620002,
        latitude: 0.40645178522225933,
        longitude: 33.23268514866672,
        pm2_5: 12.247269791623008,
        variance: 154.09007012304835
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: 24.326788178232146,
        latitude: 0.40645178522225933,
        longitude: 33.245106355000054,
        pm2_5: 12.251318084526218,
        variance: 154.0484753926945
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: 24.32676495224611,
        latitude: 0.40645178522225933,
        longitude: 33.25752756133339,
        pm2_5: 12.25050146495015,
        variance: 154.04818123746088
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.40645178522225933],
        type: 'Point'
      },
      properties: {
        interval: 24.326969848057505,
        latitude: 0.40645178522225933,
        longitude: 33.269948767666726,
        pm2_5: 12.249782944858257,
        variance: 154.0507762360212
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.32740281785507,
        latitude: 0.41524292433336996,
        longitude: 33.20784273600005,
        pm2_5: 12.249162655541902,
        variance: 154.05625985583686
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.328063760425742,
        latitude: 0.41524292433336996,
        longitude: 33.22026394233339,
        pm2_5: 12.248640710187347,
        variance: 154.06463096921607
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.328952521197184,
        latitude: 0.41524292433336996,
        longitude: 33.23268514866672,
        pm2_5: 12.248217203850498,
        variance: 154.07588785367216
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.328058837678707,
        latitude: 0.41524292433336996,
        longitude: 33.245106355000054,
        pm2_5: 12.24802131309063,
        variance: 154.0645686197306
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.330068892304837,
        latitude: 0.41524292433336996,
        longitude: 33.25752756133339,
        pm2_5: 12.247892213429122,
        variance: 154.0900281924978
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.41524292433336996],
        type: 'Point'
      },
      properties: {
        interval: 24.32693776878776,
        latitude: 0.41524292433336996,
        longitude: 33.269948767666726,
        pm2_5: 12.251983885728933,
        variance: 154.05036995170565
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.326914652424378,
        latitude: 0.4240340634444806,
        longitude: 33.19542152966672,
        pm2_5: 12.251170694840429,
        variance: 154.05007718303307
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.327118696921083,
        latitude: 0.4240340634444806,
        longitude: 33.20784273600005,
        pm2_5: 12.25045518553575,
        variance: 154.05266141557877
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.327549854733952,
        latitude: 0.4240340634444806,
        longitude: 33.22026394233339,
        pm2_5: 12.24983748847006,
        variance: 154.05812211957675
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.328208025216657,
        latitude: 0.4240340634444806,
        longitude: 33.23268514866672,
        pm2_5: 12.249317716284372,
        variance: 154.06645817321328
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.327475980105007,
        latitude: 0.4240340634444806,
        longitude: 33.245106355000054,
        pm2_5: 12.253613812357093,
        variance: 154.05718647505887
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.327226802228925,
        latitude: 0.4240340634444806,
        longitude: 33.25752756133339,
        pm2_5: 12.252707009983734,
        variance: 154.0540305828523
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.4240340634444806],
        type: 'Point'
      },
      properties: {
        interval: 24.32720379753024,
        latitude: 0.4240340634444806,
        longitude: 33.269948767666726,
        pm2_5: 12.251897315331725,
        variance: 154.0537392249505
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.327188040433942,
        latitude: 0.4328252025555912,
        longitude: 33.19542152966672,
        pm2_5: 12.252894609565164,
        variance: 154.05353965916083
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.32739518491757,
        latitude: 0.4328252025555912,
        longitude: 33.20784273600005,
        pm2_5: 12.248545388085008,
        variance: 154.05616318282762
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.326960443722925,
        latitude: 0.4328252025555912,
        longitude: 33.22026394233339,
        pm2_5: 12.249168217998395,
        variance: 154.05065712996145
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.32675471586442,
        latitude: 0.4328252025555912,
        longitude: 33.23268514866672,
        pm2_5: 12.2498896891072,
        variance: 154.04805159460432
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.32776882176396,
        latitude: 0.4328252025555912,
        longitude: 33.245106355000054,
        pm2_5: 12.247669675805792,
        variance: 154.06089541992674
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.328208631447502,
        latitude: 0.4328252025555912,
        longitude: 33.25752756133339,
        pm2_5: 12.247039536375794,
        variance: 154.06646585152976
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.4328252025555912],
        type: 'Point'
      },
      properties: {
        interval: 24.32888004005575,
        latitude: 0.4328252025555912,
        longitude: 33.269948767666726,
        pm2_5: 12.246509335575992,
        variance: 154.0749698051393
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.32978288971606,
        latitude: 0.44161634166670183,
        longitude: 33.19542152966672,
        pm2_5: 12.246079170200263,
        variance: 154.08640552392762
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.330916968123145,
        latitude: 0.44161634166670183,
        longitude: 33.20784273600005,
        pm2_5: 12.24574911854571,
        variance: 154.10077064496636
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.32715262202749,
        latitude: 0.44161634166670183,
        longitude: 33.22026394233339,
        pm2_5: 12.248838726117256,
        variance: 154.05309108064841
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.327359955772234,
        latitude: 0.44161634166670183,
        longitude: 33.23268514866672,
        pm2_5: 12.248111533390501,
        variance: 154.05571699752977
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.327798117120143,
        latitude: 0.44161634166670183,
        longitude: 33.245106355000054,
        pm2_5: 12.24748377819098,
        variance: 154.0612664585991
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.25752756133339, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.328467003223345,
        latitude: 0.44161634166670183,
        longitude: 33.25752756133339,
        pm2_5: 12.246955575283636,
        variance: 154.06973831917094
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.269948767666726, 0.44161634166670183],
        type: 'Point'
      },
      properties: {
        interval: 24.32936645700801,
        latitude: 0.44161634166670183,
        longitude: 33.269948767666726,
        pm2_5: 12.24652702104023,
        variance: 154.0811308307441
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.18300032333338, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.330496267243163,
        latitude: 0.45040748077781245,
        longitude: 33.18300032333338,
        pm2_5: 12.246198193417756,
        variance: 154.09544164159036
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.326907383598833,
        latitude: 0.45040748077781245,
        longitude: 33.19542152966672,
        pm2_5: 12.250158698325313,
        variance: 154.04998512343695
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.326883944560475,
        latitude: 0.45040748077781245,
        longitude: 33.20784273600005,
        pm2_5: 12.249335425314362,
        variance: 154.0496882684596
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.327090485096267,
        latitude: 0.45040748077781245,
        longitude: 33.22026394233339,
        pm2_5: 12.248611063236648,
        variance: 154.05230411028253
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.32752695687902,
        latitude: 0.45040748077781245,
        longitude: 33.23268514866672,
        pm2_5: 12.247985744618724,
        variance: 154.05783211101505
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.245106355000054, 0.45040748077781245],
        type: 'Point'
      },
      properties: {
        interval: 24.328193257593952,
        latitude: 0.45040748077781245,
        longitude: 33.245106355000054,
        pm2_5: 12.247459583708842,
        variance: 154.06627113151808
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.18300032333338, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: 24.3290892309835,
        latitude: 0.4591986198889231,
        longitude: 33.18300032333338,
        pm2_5: 12.247032676448601,
        variance: 154.0776194317881
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.19542152966672, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: 24.330214666915765,
        latitude: 0.4591986198889231,
        longitude: 33.19542152966672,
        pm2_5: 12.24670510044989,
        variance: 154.0918746715439
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.20784273600005, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: 24.32677804941421,
        latitude: 0.4591986198889231,
        longitude: 33.20784273600005,
        pm2_5: 12.250709669497256,
        variance: 154.04834711200044
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.22026394233339, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: 24.32740697155108,
        latitude: 0.4591986198889231,
        longitude: 33.22026394233339,
        pm2_5: 12.251184876299883,
        variance: 154.05631246341943
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [33.23268514866672, 0.4591986198889231],
        type: 'Point'
      },
      properties: {
        interval: 24.327836277018715,
        latitude: 0.4591986198889231,
        longitude: 33.23268514866672,
        pm2_5: 12.250569822895708,
        variance: 154.06174977130047
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.2355890161111789],
        type: 'Point'
      },
      properties: {
        interval: 38.121886289913014,
        latitude: 0.2355890161111789,
        longitude: 32.61595805366672,
        pm2_5: 36.11991808888339,
        variance: 378.3002432062313
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.2355890161111789],
        type: 'Point'
      },
      properties: {
        interval: 38.120626589086385,
        latitude: 0.2355890161111789,
        longitude: 32.6335582984445,
        pm2_5: 36.12370634504586,
        variance: 378.27524248869213
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 38.120632673441165,
        latitude: 0.25685871222228546,
        longitude: 32.61595805366672,
        pm2_5: 36.12155502065159,
        variance: 378.2753632401682
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 38.12073180827919,
        latitude: 0.25685871222228546,
        longitude: 32.6335582984445,
        pm2_5: 36.11964772113002,
        variance: 378.2773306952179
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.25685871222228546],
        type: 'Point'
      },
      properties: {
        interval: 38.12092386606541,
        latitude: 0.25685871222228546,
        longitude: 32.65115854322227,
        pm2_5: 36.117986085826786,
        variance: 378.28114233713967
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.121208597336256,
        latitude: 0.278128408333392,
        longitude: 32.54555707455562,
        pm2_5: 36.11657153754093,
        variance: 378.28679324282166
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.1209765983141,
        latitude: 0.278128408333392,
        longitude: 32.56315731933339,
        pm2_5: 36.12958224944856,
        variance: 378.28218888203133
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.120798292903345,
        latitude: 0.278128408333392,
        longitude: 32.58075756411117,
        pm2_5: 36.126967861918786,
        variance: 378.27865016873767
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.12071221793432,
        latitude: 0.278128408333392,
        longitude: 32.59835780888895,
        pm2_5: 36.12459168456696,
        variance: 378.2769418998769
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.12071356049702,
        latitude: 0.278128408333392,
        longitude: 32.61595805366672,
        pm2_5: 36.126099841180945,
        variance: 378.2769685447371
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.12071848850623,
        latitude: 0.278128408333392,
        longitude: 32.6335582984445,
        pm2_5: 36.12245575667526,
        variance: 378.27706634733977
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.278128408333392],
        type: 'Point'
      },
      properties: {
        interval: 38.12100792345301,
        latitude: 0.278128408333392,
        longitude: 32.65115854322227,
        pm2_5: 36.118911763310805,
        variance: 378.2828105737108
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.52795682977784, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12103273245245,
        latitude: 0.29939810444449855,
        longitude: 32.52795682977784,
        pm2_5: 36.128222101877746,
        variance: 378.28330294375024
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12094763428647,
        latitude: 0.29939810444449855,
        longitude: 32.54555707455562,
        pm2_5: 36.12586502811389,
        variance: 378.2816140503986
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12095408081954,
        latitude: 0.29939810444449855,
        longitude: 32.56315731933339,
        pm2_5: 36.12374610379291,
        variance: 378.28174199082457
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12105206625885,
        latitude: 0.29939810444449855,
        longitude: 32.58075756411117,
        pm2_5: 36.12186713657261,
        variance: 378.28368665098344
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.121241465940436,
        latitude: 0.29939810444449855,
        longitude: 32.59835780888895,
        pm2_5: 36.12022972593132,
        variance: 378.28744557073526
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12141639813264,
        latitude: 0.29939810444449855,
        longitude: 32.61595805366672,
        pm2_5: 36.129860862413025,
        variance: 378.2909173781279
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.12133235466876,
        latitude: 0.29939810444449855,
        longitude: 32.6335582984445,
        pm2_5: 36.127524650413065,
        variance: 378.28924940001957
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.29939810444449855],
        type: 'Point'
      },
      properties: {
        interval: 38.120817099073484,
        latitude: 0.29939810444449855,
        longitude: 32.65115854322227,
        pm2_5: 36.12056190952354,
        variance: 378.2790234019714
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.52795682977784, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12133896621445,
        latitude: 0.32066780055560506,
        longitude: 32.52795682977784,
        pm2_5: 36.1254243132465,
        variance: 378.28938061667554
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.120893470695826,
        latitude: 0.32066780055560506,
        longitude: 32.54555707455562,
        pm2_5: 36.12873344527938,
        variance: 378.2805390993699
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.1212758523691,
        latitude: 0.32066780055560506,
        longitude: 32.56315731933339,
        pm2_5: 36.11603096418795,
        variance: 378.28812802280805
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12208133094625,
        latitude: 0.32066780055560506,
        longitude: 32.58075756411117,
        pm2_5: 36.1182232191148,
        variance: 378.30411417203266
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12137420438263,
        latitude: 0.32066780055560506,
        longitude: 32.59835780888895,
        pm2_5: 36.11926109414092,
        variance: 378.29007997463805
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12156879450111,
        latitude: 0.32066780055560506,
        longitude: 32.61595805366672,
        pm2_5: 36.1175726050577,
        variance: 378.2939419392651
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12185762220859,
        latitude: 0.32066780055560506,
        longitude: 32.6335582984445,
        pm2_5: 36.1161360196334,
        variance: 378.29967424196764
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.65115854322227, 0.32066780055560506],
        type: 'Point'
      },
      properties: {
        interval: 38.12117619331514,
        latitude: 0.32066780055560506,
        longitude: 32.65115854322227,
        pm2_5: 36.12819269442327,
        variance: 378.2861501358227
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.54555707455562, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.120993600608024,
        latitude: 0.3419374966667116,
        longitude: 32.54555707455562,
        pm2_5: 36.125526639163624,
        variance: 378.28252631653424
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.120905086163326,
        latitude: 0.3419374966667116,
        longitude: 32.56315731933339,
        pm2_5: 36.123103949455086,
        variance: 378.28076962418595
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.12091077028467,
        latitude: 0.3419374966667116,
        longitude: 32.58075756411117,
        pm2_5: 36.12092673193321,
        variance: 378.2808824333624
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.12116608075759,
        latitude: 0.3419374966667116,
        longitude: 32.59835780888895,
        pm2_5: 36.13160488640694,
        variance: 378.285949436876
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.121010648260516,
        latitude: 0.3419374966667116,
        longitude: 32.61595805366672,
        pm2_5: 36.11899687790429,
        variance: 378.2828646513931
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.3419374966667116],
        type: 'Point'
      },
      properties: {
        interval: 38.12149234221122,
        latitude: 0.3419374966667116,
        longitude: 32.6335582984445,
        pm2_5: 36.11588572993548,
        variance: 378.2924246140328
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 38.12123470207754,
        latitude: 0.36320719277781816,
        longitude: 32.56315731933339,
        pm2_5: 36.13116041598853,
        variance: 378.2873113314455
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 38.120960048660805,
        latitude: 0.36320719277781816,
        longitude: 32.58075756411117,
        pm2_5: 36.128270050466675,
        variance: 378.2818604309645
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 38.1207787082737,
        latitude: 0.36320719277781816,
        longitude: 32.59835780888895,
        pm2_5: 36.12561921637876,
        variance: 378.27826148614474
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 38.12069092303047,
        latitude: 0.36320719277781816,
        longitude: 32.61595805366672,
        pm2_5: 36.12321020951862,
        variance: 378.27651927561897
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.6335582984445, 0.36320719277781816],
        type: 'Point'
      },
      properties: {
        interval: 38.12069681164524,
        latitude: 0.36320719277781816,
        longitude: 32.6335582984445,
        pm2_5: 36.12104511613297,
        variance: 378.2766361425914
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.56315731933339, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 38.120796369114345,
        latitude: 0.38447688888892473,
        longitude: 32.56315731933339,
        pm2_5: 36.11912580937696,
        variance: 378.27861198861973
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.58075756411117, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 38.12098946672197,
        latitude: 0.38447688888892473,
        longitude: 32.58075756411117,
        pm2_5: 36.11745394613004,
        variance: 378.28244427372124
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.59835780888895, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 38.121204590369175,
        latitude: 0.38447688888892473,
        longitude: 32.59835780888895,
        pm2_5: 36.11731606012073,
        variance: 378.2867137184464
      },
      type: 'Feature'
    },
    {
      geometry: {
        coordinates: [32.61595805366672, 0.38447688888892473],
        type: 'Point'
      },
      properties: {
        interval: 38.12143622674719,
        latitude: 0.38447688888892473,
        longitude: 32.61595805366672,
        pm2_5: 36.12356163323422,
        variance: 378.2913109095047
      },
      type: 'Feature'
    }
  ],
  type: 'FeatureCollection'
};

const HeatMapOverlay = () => {
  const dispatch = useDispatch();
  // const heatMapData = usePM25HeatMapData();
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
