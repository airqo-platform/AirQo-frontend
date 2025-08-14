"use client";

import * as React from "react";
import { useSearchParams } from 'next/navigation';
import { useUserContext } from "@/core/hooks/useUserContext";
import { useDevices } from "@/core/hooks/useDevices";
import { Device } from "@/app/types/devices";
import dynamic from 'next/dynamic';

const DeployDeviceComponent = dynamic(
  () => import('@/components/features/devices/deploy-device-component'),
  { ssr: false }
);

const DeployDevicePage = () => {
  const searchParams = useSearchParams();
  const deviceIdFromUrl = searchParams.get('deviceId');
  const { isPersonalContext } = useUserContext();
  const { devices: allDevices } = useDevices();

  // Filter AirQo devices for internal context: not deployed or recalled
  const filteredAirQoDevices = React.useMemo(() => {
    if (isPersonalContext) return [];
    return allDevices.filter(
      (dev) =>
        dev.status === "not deployed" ||
        dev.status === "recalled"
    );
  }, [isPersonalContext, allDevices]);

  const prefilledDevice = React.useMemo<Device | undefined>(() => {
    if (!deviceIdFromUrl) return undefined;
    return allDevices.find(dev => dev._id === deviceIdFromUrl || dev.name === deviceIdFromUrl);
  }, [deviceIdFromUrl, allDevices]);

  return (
    <DeployDeviceComponent 
      prefilledDevice={prefilledDevice} 
      availableDevices={isPersonalContext ? [] : filteredAirQoDevices}
    />
  );
};

export default DeployDevicePage;