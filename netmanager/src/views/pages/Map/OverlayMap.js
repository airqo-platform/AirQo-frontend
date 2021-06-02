import React, { useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import mapboxgl from "mapbox-gl";
import { isEmpty } from "underscore";
import { heatMapPaint } from "./paints";
import { formatDateString, getFirstDuration } from "utils/dateTime";
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

// css
import "assets/css/overlay-map.css";

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
    return ["marker-unknown", "UnCategorised"];

  const markerDetails = markerDetailsMapper[markerKey] || markerDetailsPM2_5;
  let keys = Object.keys(markerDetails);
  // in-place reverse sorting
  keys.sort((key1, key2) => -(key1 - key2));

  for (let i = 0; i < keys.length; i++) {
    if (markerValue >= keys[i]) {
      return markerDetails[keys[i]];
    }
  }
  return ["marker-unknown", "UnCategorised"];
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
          <MenuItem
            onClick={handleMenuItemChange("no2", {
              pm2_5: false,
              no2: true,
              pm10: false,
            })}
          >
            NO<sub>2</sub>
          </MenuItem>
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

const MapSettings = () => {
  const [open, setOpen] = useState(false);
  return (
    <RichTooltip
      content={
        <div>
          <MenuItem>
            <Checkbox defaultChecked color="default" /> Sensors
          </MenuItem>
          <MenuItem>
            <Checkbox defaultChecked color="default" /> Heatmap
          </MenuItem>
          <Divider />
          <MenuItem>
            <Checkbox defaultChecked color="default" /> Raw values
          </MenuItem>
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

const CustomMapControl = ({ className, onChange }) => {
  return (
    <MapControllerPosition
      className={"custom-map-control"}
      position={"topRight"}
    >
      <MapSettings />
      <PollutantSelector className={className} onChange={onChange} />
    </MapControllerPosition>
  );
};

const MapToggleController = ({ controls }) => {
  return (
    <div className="map-toggle-controller">
      {controls.map((control, index) => (
        <span
          className={`control-item ${
            control.active ? "" : "control-item-disabled"
          }`}
          onClick={control.toggleState}
          key={index}
        >
          {control.label}
        </span>
      ))}
    </div>
  );
};

export const OverlayMap = ({
  center,
  zoom,
  heatMapData,
  monitoringSiteData,
}) => {
  const MAX_OFFLINE_DURATION = 86400; // 24 HOURS
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
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
      style: "mapbox://styles/mapbox/streets-v11",
      // style: "mapbox://styles/mapbox/dark-v10",
      center,
      zoom,
      maxZoom: 18,
    });
    map.addControl(
      new mapboxgl.FullscreenControl({ container: mapContainerRef.current }),
      "bottom-right"
    );
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      map.addSource("heatmap-data", {
        type: "geojson",
        data: heatMapData,
      });
      map.addLayer({
        id: "circular-points-layer",
        source: "heatmap-data",
        type: "circle",
        paint: heatMapPaint,
      });
      map.setLayoutProperty(
        "circular-points-layer",
        "visibility",
        showHeatMap ? "visible" : "none"
      );
      map.on("mousemove", function (e) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["circular-points-layer"],
        });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = features.length ? "pointer" : "";

        if (map.getZoom() < 9) {
          popup.remove();
          return;
        }

        if (!features.length) {
          popup.remove();
          return;
        }

        const reducer = (accumulator, feature) =>
          accumulator + parseFloat(feature.properties.predicted_value);
        let average_predicted_value =
          features.reduce(reducer, 0) / features.length;

        popup
          .setLngLat(e.lngLat)
          .setText(`${average_predicted_value.toFixed(2)}`)
          .addTo(map);
      });
    });

    map.on("click", async () => {
      console.log("zoom", map.getZoom());
    });

    setMap(map);

    // clean up on unmount
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (map) {
      map.getSource("heatmap-data") &&
        map.getSource("heatmap-data").setData(heatMapData);
    }
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
    try {
      map.setLayoutProperty(
        "circular-points-layer",
        "visibility",
        !showHeatMap ? "visible" : "none"
      );
      setShowHeatMap(!showHeatMap);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  return (
    <div className="overlay-map-container" ref={mapContainerRef}>
      {showSensors &&
        map &&
        monitoringSiteData.features.forEach((feature) => {
          const [seconds, duration] = getFirstDuration(
            formatDateString(feature.properties.time)
          );
          const pollutantValue =
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
          el.innerText = (pollutantValue && pollutantValue.toFixed(0)) || "n/a";

          new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div>
                    <div>Device - <span style="text-transform: uppercase"><b>${
                      feature.properties.device || feature.properties._id
                    }</b></span></div>
                    <div class="${"popup-body " + markerClass}"> AQI: ${
                  (pollutantValue && pollutantValue.toFixed(2)) || "n/a"
                } - ${desc}</div>
                    <span>Last Refreshed: <b>${duration}</b> ago</span>
                </div>`
              )
            )
            .addTo(map);
        })}
      <Filter fetchFilteredData={(m) => monitoringSiteData.features} />
      {map && (
        <MapToggleController
          controls={[
            {
              label: "sensor",
              active: showSensors,
              toggleState: toggleSensors,
            },
            {
              label: "heatmap",
              active: showHeatMap,
              toggleState: toggleHeatMap,
            },
          ]}
        />
      )}
      {map && (
        <CustomMapControl
          onChange={setShowPollutant}
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
    // const locationData = {
    //   min_long: 32.4,
    //   max_long: 32.8,
    //   min_lat: 0.1,
    //   max_lat: 0.5,
    // };

    if (isEmpty(heatMapData.features)) {
      dispatch(loadPM25HeatMapData());
    }

    if (isEmpty(monitoringSiteData.features)) {
      dispatch(loadMapEventsData({ recent: "yes" }));
    }
  }, []);

  return (
    <div>
      <OverlayMap
        center={[32.5600613, 0.3341424]}
        zoom={11}
        heatMapData={heatMapData}
        monitoringSiteData={monitoringSiteData}
      />
    </div>
  );
};

export default MapContainer;
