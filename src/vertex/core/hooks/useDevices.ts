import { useQuery, UseQueryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { DeviceDetailsResponse, devices } from "../apis/devices";
import { setDevices, setError } from "../redux/slices/devicesSlice";
import { useAppSelector } from "../redux/hooks";
import type {
  DevicesSummaryResponse,
  ReadingsApiResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device,
  DeviceCreationResponse,
  DeviceUpdateGroupResponse,
  MyDevicesResponse,
  MaintenanceLogData, // Add MaintenanceLogData type
} from "@/app/types/devices";
import { AxiosError } from "axios";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export const useDevices = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["devices", activeNetwork?.net_name, activeGroup?.grp_title],
    queryFn: () =>
      devices.getDevicesSummaryApi(
        activeNetwork?.net_name || "",
        activeGroup?.grp_title || ""
      ),
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
    onSuccess: (data: DevicesSummaryResponse) => {
      // Convert Device[] to DeviceStatus[]
      const devicesWithStatus = data.devices.map(device => ({
        ...device,
        device_number: 0,
        mobility: false,
        maintenance_status: "good" as const,
        powerType: "mains" as const,
        elapsed_time: 0,
        status: device.isOnline ? "online" as const : "offline" as const,
      }));
      dispatch(setDevices(devicesWithStatus));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<DevicesSummaryResponse, AxiosError<ErrorResponse>>);

  return {
    devices: devicesQuery.data?.devices || [],
    isLoading: devicesQuery.isLoading,
    error: devicesQuery.error,
  };
};

export function useDeviceStatus() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["deviceStatus"],
    queryFn: devices.getDevicesStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const summary = useMemo(() => data?.data[0], [data]);
  const allDevices = useMemo(() => 
    summary ? [...summary.online_devices, ...summary.offline_devices] : []
  , [summary]);

  useEffect(() => {
    if (data) {
      dispatch(setDevices(allDevices));
    }
    if (error) {
      dispatch(setError((error as Error).message));
    }
  }, [data, error, dispatch, allDevices]);

  const deviceStats = useMemo(() => ({
    total: summary?.total_active_device_count || 0,
    online: summary?.count_of_online_devices || 0,
    offline: summary?.count_of_offline_devices || 0,
    maintenance: {
      good: allDevices.filter(d => d.maintenance_status === "good").length,
      due: summary?.count_due_maintenance || 0,
      overdue: summary?.count_overdue_maintenance || 0,
      unspecified: summary?.count_unspecified_maintenance || 0,
    },
    powerSource: {
      solar: summary?.count_of_solar_devices || 0,
      alternator: summary?.count_of_alternator_devices || 0,
      mains: summary?.count_of_mains || 0,
    },
  }), [summary, allDevices]);

  return {
    devices: allDevices,
    stats: deviceStats,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export const useMapReadings = () => {
  const dispatch = useDispatch();

  const mapReadingsQuery = useQuery<
    ReadingsApiResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["mapReadings"],
    queryFn: () =>
      devices.getMapReadingsApi() as Promise<unknown> as Promise<ReadingsApiResponse>,
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<ReadingsApiResponse, AxiosError<ErrorResponse>>);

  return {
    mapReadings: mapReadingsQuery.data?.measurements || [],
    isLoading: mapReadingsQuery.isLoading,
    error: mapReadingsQuery.error,
  };
};

// New hooks for device claiming and management
export const useDeviceAvailability = (deviceName: string) => {
  return useQuery<DeviceAvailabilityResponse, AxiosError<ErrorResponse>>({
    queryKey: ["deviceAvailability", deviceName],
    queryFn: () => devices.checkDeviceAvailability(deviceName),
    enabled: !!deviceName && deviceName.length > 0,
    staleTime: 30000, // 30 seconds
  });
};

export const useClaimDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation<DeviceClaimResponse, AxiosError<ErrorResponse>, DeviceClaimRequest>({
    mutationFn: devices.claimDevice,
    onSuccess: () => {
      toast("Device Claimed Successfully!");
      // Invalidate and refetch user devices
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error) => {
      toast.error("Claim Failed", {
        description: error.message,
      });
    },
  });
};

export const useMyDevices = (userId: string, organizationId?: string) => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  
  return useQuery<MyDevicesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["myDevices", userId, organizationId || activeGroup?._id],
    queryFn: () => devices.getMyDevices(userId),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
};

export const useAssignDeviceToOrganization = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, DeviceAssignmentRequest>({
    mutationFn: devices.assignDeviceToOrganization,
    onSuccess: (data) => {
      toast("Device Assigned Successfully!", {
        description: `${data.device.name} has been assigned to the organization.`,
      });
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error) => {
      toast.error("Assignment Failed", {
        description: error.message,
      });
    },
  });
};

export const useUnassignDeviceFromOrganization = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, { deviceName: string; userId: string }>({
    mutationFn: ({ deviceName, userId }) => devices.unassignDeviceFromOrganization(deviceName, userId),
    onSuccess: (data) => {
      toast("Device Unassigned Successfully!", {
        description: `${data.device.name} is now personal only.`,
      });
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error) => {
      toast.error("Unassignment Failed", {
        description: error.response?.data?.message || "Failed to update device group",
      });
    },
  });
};

export const useDeviceDetails = (deviceId: string) => {
  return useQuery<DeviceDetailsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["device-details", deviceId],
    queryFn: () => devices.getDeviceDetails(deviceId),
    enabled: !!deviceId,
  });
};

export const useUpdateDeviceLocal = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceLocal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      toast("Device Updated Successfully!", {
        description: "Device information has been updated locally.",
      });
      // Invalidate and refetch device details
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Update Failed", {
        description: error.response?.data?.message || "Failed to update device locally",
      });
    },
  });
};

export const useUpdateDeviceGlobal = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceGlobal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      toast("Device Synced Successfully!", {
        description: "Device information has been updated globally.",
      });
      // Invalidate and refetch device details
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Sync Failed", {
        description: error.response?.data?.message || "Failed to update device globally",
      });
    },
  });
};

export const useDeviceStatusFeed = (deviceNumber?: number) => {
  return useQuery({
    queryKey: ["deviceStatusFeed", deviceNumber],
    queryFn: () => devices.getDeviceStatusFeed(deviceNumber!),
    enabled: !!deviceNumber,
    refetchOnWindowFocus: false,
  });
}; 

export const useUpdateDeviceGroup = () => {

  return useMutation<
    DeviceUpdateGroupResponse,
    AxiosError<ErrorResponse>,
    { deviceId: string; groupName: string }
  >({
    mutationFn: ({ deviceId, groupName }) =>
      devices.updateDeviceGroup(deviceId, groupName),
    onSuccess: () => {
      toast("Device Group Updated", {
        description: "Device has been successfully added to the group.",
      });
    },
    onError: (error) => {
      toast.error("Group Update Failed", {
        description: error.response?.data?.message || "Failed to update device group",
      });
    },
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const updateDeviceGroup = useUpdateDeviceGroup();

  return useMutation<DeviceCreationResponse, AxiosError<ErrorResponse>, {
    long_name: string;
    category: string;
    description?: string;
    network: string;
  }>({ 
    mutationFn: devices.createDevice,
    onSuccess: (data, variables) => {
      toast("Device Created Successfully!", {
        description: `${variables.long_name} has been created.`,
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || "",
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.errors?.message || "Failed to create device";
      toast.error("Creation Failed", {
        description: errorMessage,
      });
    },
  });
}

export const useImportDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const updateDeviceGroup = useUpdateDeviceGroup();

  return useMutation<DeviceCreationResponse, AxiosError<ErrorResponse>, {
    long_name: string;
    category: string;
    network: string;
    device_number?: string;
    writeKey?: string;
    readKey?: string;
    description?: string;
    serial_number: string;
  }>({ 
    mutationFn: devices.importDevice,
    onSuccess: (data, variables) => {
      toast("Device Imported Successfully!", {
        description: `${variables.long_name} has been imported.`,
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || "",
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Import Failed", {
        description: error.message,
      });
    },
  });
}

export const useDeployDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation({
    mutationFn: (deviceData: {
      deviceName: string;
      height: string;
      mountType: string;
      powerType: string;
      isPrimaryInLocation: boolean;
      latitude: string;
      longitude: string;
      site_name: string;
      network: string;
      user_id: string;
    }) => devices.deployDevice(deviceData),
    onSuccess: (data, variables) => {
      toast("Device Deployed Successfully!", {
        description: `${variables.deviceName} has been deployed.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
      queryClient.invalidateQueries({ queryKey: ["claimedDevices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Deployment Failed", {
        description: error.message,
      });
    },
  });
}

export const useRecallDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation({
    mutationFn: ({ deviceName, recallData }: {
      deviceName: string;
      recallData: {
        recallType: string;
        user_id: string;
        date: string;
      }
    }) => devices.recallDevice(deviceName, recallData),
    onSuccess: (data, variables) => {
      toast("Device Recalled Successfully!", {
        description: `${variables.deviceName} has been recalled.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Recall Failed", {
        description: error.message,
      });
    },
  });
}

export const useAddMaintenanceLog = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation({
    mutationFn: ({ deviceName, logData }: {
      deviceName: string;
      logData: MaintenanceLogData; // Update type to MaintenanceLogData
    }) => devices.addMaintenanceLog(deviceName, logData),
    onSuccess: (data, variables) => {
      toast("Maintenance Log Added Successfully!", {
        description: `Maintenance log has been added for ${variables.deviceName}.`,
      });
      // Invalidate and refetch devices to update maintenance status
      queryClient.invalidateQueries({ queryKey: ["devices", activeGroup?.grp_title] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Failed to Add Maintenance Log", {
        description: error.message,
      });
    },
  });
};
