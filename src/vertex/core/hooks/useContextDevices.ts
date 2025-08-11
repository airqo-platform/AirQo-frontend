import { useUserContext } from "@/core/hooks/useUserContext";

export interface Device {
  _id: string;
  name: string;
  serial_number: string;
  claimed_by_user_id?: string;
  organization_id?: string;
  status?: string;
  // Add other device properties as needed
}

export const useContextDevices = (devices: Device[]) => {
  const { userContext, userDetails } = useUserContext();
  const currentUserId = userDetails?._id;

  const getFilteredDevices = (): Device[] => {
    if (!devices || devices.length === 0) {
      return [];
    }

    switch (userContext) {
      case 'personal':
        // In personal context, only show devices claimed by the current user
        return devices.filter(device => 
          device.claimed_by_user_id === currentUserId
        );

      case 'airqo-internal':
        // In AirQo internal context, show all AirQo devices
        return devices.filter(device => 
          device.organization_id === 'airqo' || 
          !device.organization_id // Include unassigned devices
        );

      case 'external-org':
        // In external org context, show devices assigned to that organization
        // This would need to be implemented based on your organization structure
        return devices.filter(device => 
          device.organization_id === 'external-org-id' // Replace with actual org ID logic
        );

      default:
        return devices;
    }
  };

  const getDeviceCount = () => {
    return getFilteredDevices().length;
  };

  const getPersonalDeviceCount = () => {
    if (userContext === 'personal') {
      return getFilteredDevices().length;
    }
    // For other contexts, count devices claimed by current user
    return devices.filter(device => 
      device.claimed_by_user_id === currentUserId
    ).length;
  };

  return {
    filteredDevices: getFilteredDevices(),
    totalDeviceCount: devices.length,
    filteredDeviceCount: getDeviceCount(),
    personalDeviceCount: getPersonalDeviceCount(),
    userContext,
  };
}; 