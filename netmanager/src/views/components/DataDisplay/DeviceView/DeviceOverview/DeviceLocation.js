import React from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import { ChartContainer } from "views/charts";

const DeviceLocation = ({deviceData}) => {
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
                <span>{deviceData.name}</span>
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
