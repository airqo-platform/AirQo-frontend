import React, { useState } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useHistory } from "react-router-dom";
import { MapKey } from "./MapKey";
import MapFilter from "./MapFilter";
import { useManagementFilteredDevicesData } from "redux/DeviceManagement/selectors";
import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";

import "assets/css/manager-map.css";

import "mapbox-gl/dist/mapbox-gl.css";

import mapboxgl from "mapbox-gl";
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const onlineClassGenerator = (online) =>
  (online && "manager-online") || "manager-offline";

const maintenanceClassGenerator = (maintenanceStatus) => {
  if (maintenanceStatus === "overdue") return "manager-overdue";
  if (maintenanceStatus === "due") return "manager-due";
  if (maintenanceStatus === -1) return "manager-unknown";
  return "manager-good";
};

const maintenanceLabelColorGenerator = (maintenanceStatus) => {
  if (maintenanceStatus === "overdue") return "popup-danger";
  if (maintenanceStatus === "due") return "popup-warning";
  if (maintenanceStatus === -1) return "popup-grey";
  return "popup-success";
};

const MapBoxMap = () => {
  const history = useHistory();
  const devices = useManagementFilteredDevicesData();
  const [viewport, setViewport] = useState({
    latitude: 0.3341424,
    longitude: 32.5600613,
    zoom: 6,
  });

  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleDetailsClick = (device) => (event) => {
    event.preventDefault();
    history.push(`/device/${device.name}/overview`);
  };

  return (
    <ErrorBoundary>
      <div className="manager-map-container">
        <ReactMapGL
          {...viewport}
          width="100%"
          height="100%"
          onViewportChange={(viewport) => setViewport(viewport)}
          mapStyle={"mapbox://styles/mapbox/streets-v11"}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        >
          {devices.map(
            (device) =>
              device.latitude &&
              device.longitude && (
                <Marker
                  key={device.name}
                  longitude={parseFloat(device.longitude)}
                  latitude={parseFloat(device.latitude)}
                >
                  <div
                    onClick={() => setSelectedDevice(device)}
                    className={`manager-marker ${onlineClassGenerator(
                      device.isOnline
                    )} ${maintenanceClassGenerator(device.maintenance_status)}`}
                  />
                </Marker>
              )
          )}
          {selectedDevice && (
            <Popup
              longitude={parseFloat(selectedDevice.longitude)}
              latitude={parseFloat(selectedDevice.latitude)}
              offsetLeft={17}
              offsetTop={5}
              onClose={() => setSelectedDevice(null)}
            >
              <div className={"popup-container"}>
                <span>
                  <b>Device Name</b>: {selectedDevice.name}
                </span>
                <span>
                  <b>Status</b>:{" "}
                  {selectedDevice.isOnline ? (
                    <span className={"popup-success"}>online</span>
                  ) : (
                    <span className={"popup-danger"}>offline</span>
                  )}
                </span>
                <span>
                  <b>Maintenance Status</b>:{" "}
                  <span
                    className={maintenanceLabelColorGenerator(
                      selectedDevice.maintenance_status
                    )}
                  >
                    {(selectedDevice.maintenance_status === -1 && "not set") ||
                      selectedDevice.maintenance_status}
                  </span>
                </span>
                <a
                  className={"popup-more-details"}
                  onClick={handleDetailsClick(selectedDevice)}
                >
                  Device details
                </a>
              </div>
            </Popup>
          )}
          <MapFilter />
          <MapKey />
        </ReactMapGL>
      </div>
    </ErrorBoundary>
  );
};

export default MapBoxMap;
