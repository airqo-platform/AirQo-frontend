import React, { useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { circlePointPaint, heatMapPaint } from "./paints";
import { getFirstDuration } from "utils/dateTime";
import Filter from "../Dashboard/components/Map/Filter";
import Divider from "@material-ui/core/Divider";
import {
  loadPM25HeatMapData,
  loadMapEventsData,
} from "redux/MapData/operations";
import { usePM25HeatMapData, useEventsMapData } from "redux/MapData/selectors";
import SettingsIcon from "@material-ui/icons/Settings";
import RichTooltip from "../../containers/RichToolTip";
import { MenuItem } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { useInitScrollTop } from "utils/customHooks";
import { ErrorBoundary } from "../../ErrorBoundary";
import { useDashboardSitesData } from "redux/Dashboard/selectors";
import { useOrgData } from "redux/Join/selectors";

// css
import "assets/css/overlay-map.css";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { ErrorEvent } from "mapbox-gl";
import BoundaryAlert from "../../ErrorBoundary/Alert";
import CircularLoader from "../../components/Loader/CircularLoader";

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const markerDetailsPM2_5 = {
  0.0: ["marker-good", "Good"],
  12.1: ["marker-moderate", "Moderate"],
  35.5: ["marker-uhfsg", "Unhealthy for sensitive groups"],
  55.5: ["marker-unhealthy", "Unhealthy"],
  150.5: ["marker-v-unhealthy", "VeryUnhealthy"],
  250.5: ["marker-hazardous", "Hazardous"],
  500.5: ["marker-unknown", "Invalid"],
};

const markerDetailsPM10 = {
  0.0: ["marker-good", "Good"],
  54.1: ["marker-moderate", "Moderate"],
  154.1: ["marker-uhfsg", "Unhealthy for sensitive groups"],
  254.1: ["marker-unhealthy", "Unhealthy"],
  354.1: ["marker-v-unhealthy", "VeryUnhealthy"],
  424.1: ["marker-hazardous", "Hazardous"],
  604.1: ["marker-unknown", "Invalid"],
};

const markerDetailsNO2 = {
  0.0: ["marker-good", "Good"],
  53.1: ["marker-moderate", "Moderate"],
  100.1: ["marker-uhfsg", "Unhealthy for sensitive groups"],
  360.1: ["marker-unhealthy", "Unhealthy"],
  649.1: ["marker-v-unhealthy", "VeryUnhealthy"],
  1249.1: ["marker-hazardous", "Hazardous"],
  2049.1: ["marker-unknown", "Invalid"],
};

const markerDetailsMapper = {
  pm2_5: markerDetailsPM2_5,
  pm10: markerDetailsPM10,
  no2: markerDetailsNO2,
};

const getMarkerDetail = (markerValue, markerKey) => {
  if (markerValue === null || markerValue === undefined)
    return ["marker-unknown", "uncategorised"];

  const markerDetails = markerDetailsMapper[markerKey] || markerDetailsPM2_5;
  let keys = Object.keys(markerDetails);
  // in-place reverse sorting
  keys.sort((key1, key2) => -(key1 - key2));

  for (let i = 0; i < keys.length; i++) {
    if (markerValue >= keys[i]) {
      return markerDetails[keys[i]];
    }
  }
  return ["marker-unknown", "uncategorised"];
};

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapControllerPosition = ({ className, children, position }) => {
  const positions = {
    topLeft: { top: 0, left: 0 },
    bottomLeft: { bottom: 0, left: 0 },
    topRight: { top: 0, right: 0 },
    bottomRight: { bottom: 0, right: 0 },
  };

  const style = {
    display: "flex",
    flexWrap: "wrap",
    position: "absolute",
    cursor: "pointer",
    margin: "10px",
    padding: "10px",
    ...(positions[position] || positions.topLeft),
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
  const [pollutant, setPollutant] = useState("pm2_5");
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
    ),
  };

  const onHandleClick = () => {
    setOpen(!open);
  };

  const handleMenuItemChange = (pollutant, state) => () => {
    setPollutant(pollutant);
    setOpen(!open);
    onChange(state);
  };

  return (
    <RichTooltip
      content={
        <div>
          <MenuItem
            onClick={handleMenuItemChange("pm2_5", {
              pm2_5: true,
              no2: false,
              pm10: false,
            })}
          >
            PM<sub>2.5</sub>
          </MenuItem>
          <MenuItem
            onClick={handleMenuItemChange("pm10", {
              pm2_5: false,
              no2: false,
              pm10: true,
            })}
          >
            PM<sub>10</sub>
          </MenuItem>
          {orgData.name !== "airqo" && (
            <MenuItem
              onClick={handleMenuItemChange("no2", {
                pm2_5: false,
                no2: true,
                pm10: false,
              })}
            >
              NO<sub>2</sub>
            </MenuItem>
          )}
        </div>
      }
      open={open}
      placement="left"
      onClose={() => setOpen(false)}
    >
      <div style={{ padding: "10px" }}>
        <span className={className} onClick={onHandleClick}>
          {pollutantMapper[pollutant]}
        </span>
      </div>
    </RichTooltip>
  );
};

const MapSettings = ({
  showSensors,
  showHeatmap,
  showCalibratedValues,
  onSensorChange,
  onHeatmapChange,
  onCalibratedChange,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <RichTooltip
      content={
        <div>
          <MenuItem onClick={() => onSensorChange(!showSensors)}>
            <Checkbox checked={showSensors} color="default" /> Sensors
          </MenuItem>
          <MenuItem onClick={() => onHeatmapChange(!showHeatmap)}>
            <Checkbox checked={showHeatmap} color="default" /> Heatmap
          </MenuItem>
          <Divider />
          {showSensors ? (
            <MenuItem onClick={() => onCalibratedChange(!showCalibratedValues)}>
              <Checkbox checked={showCalibratedValues} color="default" />{" "}
              Calibrated values
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => onCalibratedChange(!showCalibratedValues)}
              disabled
            >
              <Checkbox checked={showCalibratedValues} color="default" />{" "}
              Calibrated values
            </MenuItem>
          )}
        </div>
      }
      open={open}
      placement="left"
      onClose={() => setOpen(false)}
    >
      <div style={{ padding: "10px" }}>
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
  onCalibratedChange,
}) => {
  return (
    <MapControllerPosition
      className={"custom-map-control"}
      position={"topRight"}
    >
      <MapSettings
        showSensors={showSensors}
        showHeatmap={showHeatmap}
        showCalibratedValues={showCalibratedValues}
        onSensorChange={onSensorChange}
        onHeatmapChange={onHeatmapChange}
        onCalibratedChange={onCalibratedChange}
      />
      <PollutantSelector className={className} onChange={onPollutantChange} />
    </MapControllerPosition>
  );
};

export const OverlayMap = ({
  center,
  zoom,
  heatMapData,
  monitoringSiteData,
}) => {
  const sitesData = useDashboardSitesData();
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState();
  const [showSensors, setShowSensors] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showCalibratedValues, setShowCalibratedValues] = useState(false);
  const [showPollutant, setShowPollutant] = useState({
    pm2_5: true,
    no2: false,
    pm10: false,
  });
  const popup = new mapboxgl.Popup({
    closeButton: false,
    offset: 25,
  });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v10",
      center,
      zoom,
      maxZoom: 20,
    });
    map.on("load", () => {
      map.addSource("heatmap-data", {
        type: "geojson",
        data: heatMapData,
      });
      map.addLayer({
        id: "sensor-heat",
        type: "heatmap",
        source: "heatmap-data",
        paint: heatMapPaint,
      });
      map.addLayer({
        id: "sensor-point",
        source: "heatmap-data",
        type: "circle",
        paint: circlePointPaint,
      });
      map.setLayoutProperty(
        "sensor-heat",
        "visibility",
        showHeatMap ? "visible" : "none"
      );
      map.setLayoutProperty(
        "sensor-point",
        "visibility",
        showHeatMap ? "visible" : "none"
      );
      map.on("mousemove", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["sensor-point"],
        });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = features.length > 0 ? "pointer" : "";

        if (map.getZoom() < 9) {
          popup.remove();
          return;
        }

        if (!features.length) {
          popup.remove();
          return;
        }

        const reducerFactory = (key) => (accumulator, feature) =>
          accumulator + parseFloat(feature.properties[key]);
        let average_predicted_value =
          features.reduce(reducerFactory("predicted_value"), 0) /
          features.length;

        let average_confidence_int =
          features.reduce(reducerFactory("interval"), 0) / features.length;

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
                    <td>&#177; ${average_confidence_int.toFixed(4)}</td>
                </tr>
            </table>`
          )
          .addTo(map);
      });
    });

    map.addControl(
      new mapboxgl.FullscreenControl({
        container: mapContainerRef.current,
      }),
      "bottom-right"
    );
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    setMap(map);

    // clean up on unmount
    // return () => map.remove();
  }, []);

  useEffect(() => {
    if (map) {
      map.getSource("heatmap-data") &&
        map.getSource("heatmap-data").setData(heatMapData);
    }
    // if (map) {
    //   map.getLayer("sensor-point") && map.removeLayer("sensor-point");
    // }
    // if (map) {
    //   map.getLayer("sensor-heat") && map.removeLayer("sensor-heat");
    // }
  });

  const toggleSensors = () => {
    try {
      const markers = document.getElementsByClassName("marker");
      for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = !showSensors ? "visible" : "hidden";
      }
      setShowSensors(!showSensors);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  const toggleHeatMap = () => {
    setShowHeatMap(!showHeatMap);
    try {
      map.setLayoutProperty(
        "sensor-heat",
        "visibility",
        showHeatMap ? "none" : "visible"
      );
      map.setLayoutProperty(
        "sensor-point",
        "visibility",
        showHeatMap ? "none" : "visible"
      );
      // eslint-disable-next-line no-empty
    } catch (err) {
      console.log("Heatmap Load error:", err);
    }
  };

  return (
    <div className="overlay-map-container" ref={mapContainerRef}>
      {showSensors &&
        map &&
        monitoringSiteData.features.forEach((feature) => {
          const [seconds, duration] = getFirstDuration(feature.properties.time);
          let pollutantValue =
            (showPollutant.pm2_5 &&
              feature.properties.pm2_5 &&
              feature.properties.pm2_5.value) ||
            (showPollutant.pm10 &&
              feature.properties.pm10 &&
              feature.properties.pm10.value) ||
            (showPollutant.no2 &&
              feature.properties.no2 &&
              feature.properties.no2.value) ||
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
          let markerKey = "";
          for (const property in showPollutant) {
            if (showPollutant[property]) markerKey = property;
          }
          const [markerClass, desc] = getMarkerDetail(
            pollutantValue,
            markerKey
          );

          const el = document.createElement("div");
          el.className = `marker ${
            seconds >= MAX_OFFLINE_DURATION ? "marker-grey" : markerClass
          }`;
          el.innerText = (pollutantValue && pollutantValue.toFixed(0)) || "--";

          if (
            feature.geometry.coordinates.length >= 2 &&
            feature.geometry.coordinates[0] &&
            feature.geometry.coordinates[1]
          ) {
            new mapboxgl.Marker(el)
              .setLngLat(feature.geometry.coordinates)
              .setPopup(
                new mapboxgl.Popup({
                  offset: 25,
                  className: "map-popup",
                }).setHTML(
                  `<div class="popup-body">
                    <div>
                      <span class="popup-title">
                        <b>${
                          (sitesData[feature.properties.site_id] &&
                            sitesData[feature.properties.site_id].name) ||
                          (sitesData[feature.properties.site_id] &&
                            sitesData[feature.properties.site_id]
                              .description) ||
                          feature.properties.device ||
                          feature.properties._id
                        }</b>
                      </span>
                    </div>
                    <div class="${"popup-aqi " + markerClass}"> 
                      <span>AQI</span> </hr>  
                      <div class="pollutant-info">
                        <div class="pollutant-number">${
                          (pollutantValue && pollutantValue.toFixed(2)) || "--"
                        }</div> 
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
          className={"pollutant-selector"}
        />
      )}
    </div>
  );
};

const MapContainer = () => {
  const dispatch = useDispatch();
  const heatMapData = usePM25HeatMapData();
  const monitoringSiteData = useEventsMapData();

  useEffect(() => {
    if (isEmpty(heatMapData.features)) {
      dispatch(loadPM25HeatMapData());
    }
    if (isEmpty(monitoringSiteData.features)) {
      dispatch(loadMapEventsData({ recent: "yes", external: "no" }));
    }
  }, []);
  console.log("Heatmap values:", heatMapData);

  return (
    <div>
      <ErrorBoundary>
        {heatMapData.features.length > 0 ? (
          <OverlayMap
            center={[22.5600613, 0.8341424]}
            zoom={2}
            heatMapData={heatMapData}
            monitoringSiteData={monitoringSiteData}
          />
        ) : (
          <CircularLoader loading={true} />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default MapContainer;
