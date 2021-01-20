import React from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Map as LeafletMap, TileLayer, Popup, Marker } from "react-leaflet";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";
import L from "leaflet";
import { MapKey } from "./MapKey";

import "assets/scss/device-management-map.sass";

const Map = ({ className, devices, ...rest }) => {
  const history = useHistory();
  let CategoryColorClass = (isOnline) => {
    return isOnline === true
      ? "deviceOnline"
      : isOnline === false
      ? "deviceOffline"
      : "UnCategorise";
  };

  let CategoryColorClass2 = (maintenanceStatus) => {
    return maintenanceStatus === "overdue"
      ? "red"
      : maintenanceStatus === "due"
      ? "orange"
      : maintenanceStatus === -1
      ? "grey"
      : "b-success";
  };

  const handleDetailsClick = (device) => (event) => {
    event.preventDefault();
    history.push(`/device/${device._id}/overview`);
  };

  return (
    <LeafletMap
      animate
      attributionControl
      center={[0.3341424, 32.5600613]}
      doubleClickZoom
      dragging
      easeLinearity={0.35}
      scrollWheelZoom
      zoom={7}
      zoomControl
    >
      <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
      {devices.map((device, index) => (
        <Marker
          position={[device.latitude, device.longitude]}
          fill="true"
          key={`device-maintenance-${device.channelId}-${index}`}
          clickable="true"
          icon={L.divIcon({
            //html:`${contact.isOnline}`,
            iconSize: 38,
            className: `leafletMarkerIcon ${CategoryColorClass2(
              device.maintenance_status
            )}`,
          })}
        />
      ))}

      {devices.map((device, index) => (
        <Marker
          position={[device.latitude, device.longitude]}
          fill="false"
          key={`device-status-${device.channelId}-${index}`}
          clickable="true"
          icon={L.divIcon({
            //html:`${contact.isOnline}`,
            iconSize: 30,
            className: `leafletMarkerIcon ${CategoryColorClass(
              device.isOnline
            )}`,
          })}
        >
          <Popup>
            <div className={"popup-container"}>
              <span>
                <b>Device Name</b>: {device.name}
              </span>
              <span>
                <b>Status</b>:{" "}
                {device.isOnline ? (
                  <span className={"popup-success"}>online</span>
                ) : (
                  <span className={"popup-danger"}>offline</span>
                )}
              </span>
              <span>
                <b>Maintenance Status</b>:{" "}
                {device.maintenance_status === "overdue" ? (
                  <span className={"popup-danger"}>
                    {device.maintenance_status}
                  </span>
                ) : device.maintenance_status === -1 ? (
                  <span className={"popup-grey"}>not set</span>
                ) : (
                  <span className={"popup-success"}>
                    {device.maintenance_status}
                  </span>
                )}
              </span>
              <a
                className={"popup-more-details"}
                onClick={handleDetailsClick(device)}
              >
                Device details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
      <FullscreenControl position="topleft" />
      <MapKey />
    </LeafletMap>
  );
};
Map.propTypes = {
  className: PropTypes.string,
};
export default Map;
