import React from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import { ChartContainer } from "views/charts";
import Copyable from "views/components/Copy/Copyable";

const DeviceLocation = ({ deviceData }) => {
  return (
    <ChartContainer title={"device location"} green centerItems>
      {deviceData.latitude && deviceData.longitude ? (
        <Map
          center={[deviceData.latitude, deviceData.longitude]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[deviceData.latitude, deviceData.longitude]}>
            <Popup>
              <span>
                <Copyable
                  width={"120px"}
                  value={`${deviceData.latitude}, ${deviceData.longitude}`}
                  format={"[latitude, longitude]"}
                />
              </span>
            </Popup>
          </Marker>
        </Map>
      ) : (
        <span style={{ margin: "auto" }}>
          Coordinates not set for this device
        </span>
      )}
    </ChartContainer>
  );
};

export default DeviceLocation;
