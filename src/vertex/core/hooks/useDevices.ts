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
  MyDevicesResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse
} from "@/app/types/devices";
import { AxiosError } from "axios";
import { useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Device } from "@/app/types/devices";

interface ErrorResponse {
  message: string;
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
  const { toast } = useToast();

  return useMutation<DeviceClaimResponse, AxiosError<ErrorResponse>, DeviceClaimRequest>({
    mutationFn: devices.claimDevice,
    onSuccess: (data) => {
      toast({
        title: "Device Claimed Successfully!",
        description: `${data.device.long_name} is now yours.`,
      });
      // Invalidate and refetch user devices
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMyDevices = (userId: string, organizationId?: string) => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  
  return useQuery<MyDevicesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["myDevices", userId, organizationId || activeGroup?._id],
    queryFn: () => devices.getMyDevices(userId, organizationId),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
};

export const useAssignDeviceToOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, DeviceAssignmentRequest>({
    mutationFn: devices.assignDeviceToOrganization,
    onSuccess: (data) => {
      toast({
        title: "Device Assigned Successfully!",
        description: `${data.device.name} has been assigned to the organization.`,
      });
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUnassignDeviceFromOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, { deviceName: string; userId: string }>({
    mutationFn: ({ deviceName, userId }) => devices.unassignDeviceFromOrganization(deviceName, userId),
    onSuccess: (data) => {
      toast({
        title: "Device Unassigned Successfully!",
        description: `${data.device.name} is now personal only.`,
      });
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      toast({
        title: "Unassignment Failed",
        description: error.message,
        variant: "destructive",
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Record<string, any>;
    }) => devices.updateDeviceLocal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      toast({
        title: "Device Updated Successfully!",
        description: "Device information has been updated locally.",
      });
      // Invalidate and refetch device details
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDeviceGlobal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Record<string, any>;
    }) => devices.updateDeviceGlobal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      toast({
        title: "Device Synced Successfully!",
        description: "Device information has been updated globally.",
      });
      // Invalidate and refetch device details
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
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

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (deviceData: {
      long_name: string;
      category: string;
      description?: string;
      network: string;
    }) => devices.createDevice(deviceData),
    onSuccess: (data, variables) => {
      toast({
        title: "Device Created Successfully!",
        description: `${variables.long_name} has been created.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export const useImportDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (deviceData: {
      long_name: string;
      category: string;
      network: string;
      device_number?: string;
      writeKey?: string;
      readKey?: string;
      description?: string;
      serial_number: string;
    }) => devices.importDevice(deviceData),
    onSuccess: (data, variables) => {
      toast({
        title: "Device Imported Successfully!",
        description: `${variables.long_name} has been imported.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export const useDeployDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Device Deployed Successfully!",
        description: `${variables.deviceName} has been deployed.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["claimedDevices"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export const useRecallDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({
        title: "Device Recalled Successfully!",
        description: `${variables.deviceName} has been recalled.`,
      });
      // Invalidate and refetch devices
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Recall Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export const useAddMaintenanceLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ deviceName, logData }: {
      deviceName: string;
      logData: any;
    }) => devices.addMaintenanceLog(deviceName, logData),
    onSuccess: (data, variables) => {
      toast({
        title: "Maintenance Log Added Successfully!",
        description: `Maintenance log has been added for ${variables.deviceName}.`,
      });
      // Invalidate and refetch devices to update maintenance status
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: "Failed to Add Maintenance Log",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
