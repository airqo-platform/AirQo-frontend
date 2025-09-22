import { useQuery, UseQueryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceDetailsResponse, devices, type MaintenanceActivitiesResponse, GetDevicesSummaryParams } from "../apis/devices";
import { setDevices, setError } from "@/core/redux/slices/devicesSlice";
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
  MaintenanceLogData,
  MyDevicesResponse,
} from "@/app/types/devices";
import { AxiosError } from "axios";
import { useEffect, useMemo } from "react";import { useDispatch } from "react-redux";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export interface DeviceListingOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const useDevices = (options: DeviceListingOptions = {}) => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const { page = 1, limit = 100, search, sortBy, order } = options;
  const skip = (page - 1) * limit;

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["devices", activeNetwork?.net_name, activeGroup?.grp_title, { page, limit, search, sortBy, order }],
    queryFn: () => {
      const params: GetDevicesSummaryParams = {
        network: activeNetwork?.net_name || "",
        group: activeGroup?.grp_title === "airqo" ? "" : (activeGroup?.grp_title || ""),
        limit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      };
      return devices.getDevicesSummaryApi(params);
    },
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: devicesQuery.data,
    devices: devicesQuery.data?.devices || [],
    meta: devicesQuery.data?.meta,
    isLoading: devicesQuery.isLoading,
    isFetching: devicesQuery.isFetching,
    error: devicesQuery.error,
  };
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

export function useDeviceStatus() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["deviceStatus"],
    queryFn: devices.getDevicesStatus,
    refetchInterval: 30000,
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

export const useDeviceAvailability = (deviceName: string) => {
  return useQuery<DeviceAvailabilityResponse, AxiosError<ErrorResponse>>({
    queryKey: ["deviceAvailability", deviceName],
    queryFn: () => devices.checkDeviceAvailability(deviceName),
    enabled: !!deviceName && deviceName.length > 0,
    staleTime: 30000,
  });
};

export const useClaimDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<DeviceClaimResponse, AxiosError<ErrorResponse>, DeviceClaimRequest>({
    mutationFn: devices.claimDevice,
    onSuccess: () => {
      ReusableToast({
        message: "Device Claimed Successfully!",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Claim Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useAssignDeviceToOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, DeviceAssignmentRequest>({
    mutationFn: devices.assignDeviceToOrganization,
    onSuccess: (data) => {
      ReusableToast({
        message: `${data.device.name} has been assigned to the organization.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Assignment Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useUnassignDeviceFromOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<DeviceAssignmentResponse, AxiosError<ErrorResponse>, { deviceName: string; userId: string }>({
    mutationFn: ({ deviceName, userId }) => devices.unassignDeviceFromOrganization(deviceName, userId),
    onSuccess: (data) => {
      ReusableToast({
        message: `${data.device.name} is now personal only.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Unassignment Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
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

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceLocal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: "Device information has been updated locally.",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Update Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useUpdateDeviceGlobal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceId, deviceData }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceGlobal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: "Device information has been updated globally.",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["device-details", variables.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Sync Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
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
      ReusableToast({
        message: "Device has been successfully added to the group.",
        type: "SUCCESS",
      });
    },
    onError: (error) => {
      ReusableToast({
        message: `Group Update Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
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
      ReusableToast({
        message: `${variables.long_name} has been created.`,
        type: "SUCCESS",
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || "",
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Creation Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
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
      ReusableToast({
        message: `${variables.long_name} has been imported.`,
        type: "SUCCESS",
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || "",
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Import Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
}

export const useDeployDevice = () => {
  const queryClient = useQueryClient();

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
      deployment_date: string | undefined;
    }) => devices.deployDevice(deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.deviceName} has been deployed.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["claimedDevices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Deployment Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
}

export const useRecallDevice = () => {
  const queryClient = useQueryClient();

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
      ReusableToast({
        message: `${variables.deviceName} has been recalled.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Recall Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
}

export const useAddMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deviceName, logData }: {
      deviceName: string;
      logData: MaintenanceLogData;
    }) => devices.addMaintenanceLog(deviceName, logData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `Maintenance log has been added for ${variables.deviceName}.`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device-details"] });
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to Add Maintenance Log: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};

export const useDeviceMaintenanceLogs = (deviceName: string) => {
  return useQuery<MaintenanceActivitiesResponse, AxiosError<ErrorResponse>>({
    queryKey: ["deviceMaintenanceLogs", deviceName],
    queryFn: () => devices.getDeviceMaintenanceLogs(deviceName),
    enabled: !!deviceName,
    staleTime: 60_000,
  });
};
