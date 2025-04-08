"use client";

import { DeviceStatus } from "@/core/apis/devices";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface DeviceMarkerProps {
  device: DeviceStatus;
}

const getMaintenanceColor = (status: DeviceStatus["maintenance_status"]) => {
  switch (status) {
    case "good":
      return "#22c55e"; // green-500
    case "due":
      return "#eab308"; // yellow-500
    case "overdue":
      return "#ef4444"; // red-500
    default:
      return "#94a3b8"; // slate-400
  }
};

const getStatusColor = (status: DeviceStatus["status"]) => {
  return status === "online" ? "#22c55e" : "#ef4444";
};

const createCustomIcon = (device: DeviceStatus) => {
  const maintenanceColor = getMaintenanceColor(device.maintenance_status);
  const statusColor = getStatusColor(device.status);

  // Create SVG for double circle marker
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="none" stroke="${maintenanceColor}" stroke-width="2"/>
      <circle cx="12" cy="12" r="6" fill="${statusColor}"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "custom-device-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const isValidCoordinate = (num: number) => {
  return typeof num === 'number' && !isNaN(num) && num !== 0;
};

export function DeviceMarker({ device }: DeviceMarkerProps) {
  if (!isValidCoordinate(device.latitude) || !isValidCoordinate(device.longitude)) {
    return null;
  }

  return (
    <Marker
      position={[device.latitude, device.longitude]}
      icon={createCustomIcon(device)}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{device.name}</h3>
          <div className="text-sm space-y-1 mt-2">
            <p>Status: <span className={device.status === "online" ? "text-green-600" : "text-red-600"}>{device.status}</span></p>
            <p>Maintenance: <span className={
              device.maintenance_status === "good" ? "text-green-600" : 
              device.maintenance_status === "due" ? "text-yellow-600" : 
              "text-red-600"
            }>{device.maintenance_status}</span></p>
            <p>Power Source: {device.powerType}</p>
            {device.nextMaintenance && (
              <p>Next Maintenance: {new Date(device.nextMaintenance.$date).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
} 