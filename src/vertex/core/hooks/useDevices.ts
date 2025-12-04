import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  DeviceDetailsResponse,
  devices,
  type MaintenanceActivitiesResponse,
  GetDevicesSummaryParams,
  DeviceCountResponse,
} from '../apis/devices';
import { useGroupCohorts } from './useCohorts';
import { setError } from '@/core/redux/slices/devicesSlice';
import { useAppSelector } from '../redux/hooks';
import type {
  DevicesSummaryResponse,
  ReadingsApiResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  BulkDeviceClaimRequest,
  BulkDeviceClaimResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device,
  DeviceCreationResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
  DecryptionRequest,
  DecryptionResponse,
  MyDevicesResponse,
  PrepareDeviceResponse,
  BulkPrepareResponse,
  GenerateLabelsResponse,
  ShippingStatusResponse,
  OrphanedDevicesResponse,
  ShippingBatchesResponse,
  ShippingBatchDetailsResponse,
} from '@/app/types/devices';
import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import logger from '@/lib/logger';

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
  order?: 'asc' | 'desc';
  network?: string;
  enabled?: boolean;
}

export const useDevices = (options: DeviceListingOptions = {}) => {
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const isAirQoGroup = activeGroup?.grp_title === 'airqo';
  const { enabled = true } = options;

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(
    activeGroup?._id,
    {
      enabled: !isAirQoGroup && !!activeGroup?._id && enabled,
    }
  );

  const { page = 1, limit = 100, search, sortBy, order, network } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const queryKey = [
    'devices',
    activeGroup?.grp_title,
    { page, limit, search, sortBy, order, network },
    groupCohortIds,
  ];

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey,
    queryFn: async () => {
      if (isAirQoGroup) {
        const params: GetDevicesSummaryParams = {
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          ...(network && { network }),
        };
        return devices.getDevicesSummaryApi(params);
      }

      if (!groupCohortIds) {
        // This will be handled by the `enabled` option, but as a safeguard:
        throw new Error('Cohort IDs are not available yet.');
      }

      return devices.getDevicesByCohorts({
        cohort_ids: groupCohortIds,
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(network && { network }),
      });
    },
    enabled:
      enabled &&
      !!activeGroup?.grp_title &&
      (isAirQoGroup || (!!groupCohortIds && groupCohortIds.length > 0)),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: devicesQuery.data,
    devices: devicesQuery.data?.devices || [],
    meta: devicesQuery.data?.meta,
    isLoading: devicesQuery.isLoading || isLoadingCohorts,
    isFetching: devicesQuery.isFetching,
    error: devicesQuery.error,
  };
};

export const useMyDevices = (
  userId: string,
  organizationId?: string,
  options: { enabled?: boolean } = {}
) => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const userDetails = useAppSelector((state) => state.user.userDetails);
  const { enabled = true } = options;

  // The user profile is fetched from Redux state
  // We use optional chaining and fallbacks to ensure safety
  type UserGroup = {
    _id: string;
    grp_title?: string;
  };

  const groupIds = userDetails?.groups
    ? (userDetails.groups as UserGroup[])
        .filter((g) => g.grp_title?.toLowerCase() !== "airqo")
        .map((g) => g._id)
    : userDetails?.group_ids || [];
  const cohortIds = userDetails?.cohort_ids || [];

  return useQuery<MyDevicesResponse, AxiosError<ErrorResponse>>({
    queryKey: [
      "myDevices",
      userId,
      organizationId || activeGroup?._id,
      groupIds,
      cohortIds,
    ],
    queryFn: () => devices.getMyDevices(userId, groupIds, cohortIds),
    enabled: !!userId && enabled && !!userDetails,
    staleTime: 60_000, // 1 minute
  });
};

export const useDeviceCount = (options: { enabled?: boolean } = {}) => {
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const { enabled = true } = options;
  const isAirQoGroup = activeGroup?.grp_title === 'airqo';

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(
    activeGroup?._id,
    {
      enabled: !isAirQoGroup && !!activeGroup?._id && enabled,
    }
  );

  const query = useQuery<DeviceCountResponse, AxiosError<ErrorResponse>>({
    queryKey: [
      'deviceCount',
      activeGroup?._id,
      isAirQoGroup ? null : groupCohortIds,
    ],
    queryFn: () => {
      if (isAirQoGroup) {
        return devices.getDeviceCountApi({});
      }

      if (!groupCohortIds || groupCohortIds.length === 0) {
        return Promise.reject(new Error('Cohort IDs must be provided.'));
      }
      return devices.getDeviceCountApi({ cohort_id: groupCohortIds });
    },
    enabled:
      !!activeGroup?.grp_title &&
      (isAirQoGroup || (!!groupCohortIds && groupCohortIds.length > 0)) &&
      enabled,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: query.isLoading || (!isAirQoGroup && isLoadingCohorts),
    isFetching: query.isFetching || (!isAirQoGroup && isLoadingCohorts),
  };
};

export const useMapReadings = () => {
  const dispatch = useDispatch();

  const mapReadingsQuery = useQuery<
    ReadingsApiResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['mapReadings'],
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
    queryKey: ['deviceAvailability', deviceName],
    queryFn: () => devices.checkDeviceAvailability(deviceName),
    enabled: !!deviceName && deviceName.length > 0,
    staleTime: 30000,
  });
};

export const useClaimDevice = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceClaimResponse,
    AxiosError<ErrorResponse>,
    DeviceClaimRequest
  >({
    mutationFn: devices.claimDevice,
    onSuccess: () => {
      ReusableToast({
        message: 'Device Claimed Successfully!',
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Claim Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useBulkClaimDevices = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkDeviceClaimResponse,
    AxiosError<ErrorResponse>,
    BulkDeviceClaimRequest
  >({
    mutationFn: devices.claimDevicesBulk,
    onSuccess: (response) => {
      const { successful_claims, failed_claims } = response.data;
      const successful_count = successful_claims.length;
      const failed_count = failed_claims.length;
      
      if (failed_count === 0) {
        ReusableToast({
          message: `All ${successful_count} device${successful_count !== 1 ? 's' : ''} claimed successfully!`,
          type: 'SUCCESS',
        });
      } else if (successful_count === 0) {
        ReusableToast({
          message: `Failed to claim all ${failed_count} device${failed_count !== 1 ? 's' : ''}`,
          type: 'ERROR',
        });
      } else {
        ReusableToast({
          message: `${successful_count} device${successful_count !== 1 ? 's' : ''} claimed, ${failed_count} failed`,
          type: 'WARNING',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Bulk Claim Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useAssignDeviceToOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceAssignmentResponse,
    AxiosError<ErrorResponse>,
    DeviceAssignmentRequest
  >({
    mutationFn: devices.assignDeviceToOrganization,
    onSuccess: data => {
      ReusableToast({
        message: `${data.device.name} has been assigned to the organization.`,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Assignment Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useUnassignDeviceFromOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceAssignmentResponse,
    AxiosError<ErrorResponse>,
    { deviceName: string; userId: string }
  >({
    mutationFn: ({ deviceName, userId }) =>
      devices.unassignDeviceFromOrganization(deviceName, userId),
    onSuccess: data => {
      ReusableToast({
        message: `${data.device.name} is now personal only.`,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Unassignment Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useDeviceDetails = (deviceId: string) => {
  return useQuery<DeviceDetailsResponse, AxiosError<ErrorResponse>>({
    queryKey: ['device-details', deviceId],
    queryFn: () => devices.getDeviceDetails(deviceId),
    enabled: !!deviceId,
  });
};

export const useUpdateDeviceLocal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      deviceData,
    }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceLocal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: 'Device information has been updated locally.',
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({
        queryKey: ['device-details', variables.deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Update Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useUpdateDeviceGlobal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      deviceData,
    }: {
      deviceId: string;
      deviceData: Partial<Device>;
    }) => devices.updateDeviceGlobal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: 'Device information has been updated globally.',
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({
        queryKey: ['device-details', variables.deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      ReusableToast({
        message: `Sync Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useDeviceStatusFeed = (deviceNumber?: number) => {
  return useQuery({
    queryKey: ['deviceStatusFeed', deviceNumber],
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
        message: 'Device has been successfully added to the group.',
        type: 'SUCCESS',
      });
    },
    onError: error => {
      ReusableToast({
        message: `Group Update Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const updateDeviceGroup = useUpdateDeviceGroup();

  return useMutation<
    DeviceCreationResponse,
    AxiosError<ErrorResponse>,
    {
      long_name: string;
      category: string;
      description?: string;
      network: string;
    }
  >({
    mutationFn: devices.createDevice,
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.long_name} has been created.`,
        type: 'SUCCESS',
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || '',
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Creation Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useImportDevice = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const updateDeviceGroup = useUpdateDeviceGroup();

  return useMutation<
    DeviceCreationResponse,
    AxiosError<ErrorResponse>,
    {
      long_name: string;
      category: string;
      network: string;
      device_number?: string;
      writeKey?: string;
      readKey?: string;
      description?: string;
      serial_number: string;
    }
  >({
    mutationFn: devices.importDevice,
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.long_name} has been imported.`,
        type: 'SUCCESS',
      });
      if (data.created_device && activeGroup?.grp_title) {
        updateDeviceGroup.mutate({
          deviceId: data.created_device._id || '',
          groupName: activeGroup.grp_title,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Import Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

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
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['claimedDevices'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Deployment Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useRecallDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceName,
      recallData,
    }: {
      deviceName: string;
      recallData: {
        recallType: string;
        user_id: string;
        date: string;
      };
    }) => devices.recallDevice(deviceName, recallData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.deviceName} has been recalled.`,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-details'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
    },
    onError: error => {
      ReusableToast({
        message: `Recall Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useAddMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceName,
      logData,
    }: {
      deviceName: string;
      logData: MaintenanceLogData;
    }) => devices.addMaintenanceLog(deviceName, logData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `Maintenance log has been added for ${variables.deviceName}.`,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-details'] });
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
    },
    onError: error => {
      ReusableToast({
        message: `Failed to Add Maintenance Log: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useDeviceMaintenanceLogs = (deviceName: string) => {
  return useQuery<MaintenanceActivitiesResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceMaintenanceLogs', deviceName],
    queryFn: () => devices.getDeviceMaintenanceLogs(deviceName),
    enabled: !!deviceName,
    staleTime: 60_000,
  });
};

export const useDecryptDeviceKeys = () => {
  return useMutation<
    DecryptionResponse,
    AxiosError<ErrorResponse>,
    DecryptionRequest[]
  >({
    mutationFn: devices.decryptDeviceKeys,
    onSuccess: () => {
      logger.info('Keys decrypted successfully!');
    },
    onError: error => {
      ReusableToast({
        message: `Decryption Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const usePrepareDeviceForShipping = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PrepareDeviceResponse,
    AxiosError<ErrorResponse>,
    { deviceName: string; tokenType?: 'hex' | 'readable' }
  >({
    mutationFn: ({ deviceName, tokenType }) =>
      devices.prepareDeviceForShipping(deviceName, tokenType),
    onSuccess: (data) => {
      ReusableToast({
        message: data.message,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['shippingStatus'] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Preparation Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const usePrepareBulkDevicesForShipping = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkPrepareResponse,
    AxiosError<ErrorResponse>,
    { deviceNames: string[]; tokenType?: 'hex' | 'readable'; batchName?: string }
  >({
    mutationFn: ({ deviceNames, tokenType, batchName }) =>
      devices.prepareBulkDevicesForShipping(deviceNames, tokenType, batchName),
    onSuccess: (data) => {
      ReusableToast({
        message: data.message,
        type: 'SUCCESS',
      });
      // queryClient.invalidateQueries({ queryKey: ['shippingStatus'] });
      queryClient.invalidateQueries({ queryKey: ['shippingBatches'] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Bulk Preparation Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useGenerateShippingLabels = () => {
  return useMutation<
    GenerateLabelsResponse,
    AxiosError<ErrorResponse>,
    string[]
  >({
    mutationFn: (deviceNames) => devices.generateShippingLabels(deviceNames),
    onError: (error) => {
      ReusableToast({
        message: `Label Generation Failed: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
  });
};

export const useShippingStatus = (deviceNames?: string[]) => {
  return useQuery<ShippingStatusResponse, AxiosError<ErrorResponse>>({
    queryKey: ['shippingStatus', deviceNames],
    queryFn: () => devices.getShippingStatus(deviceNames),
    staleTime: 60000,
  });
};

export const useOrphanedDevices = (userId: string) => {
  return useQuery<OrphanedDevicesResponse, AxiosError>({
    queryKey: ['orphanedDevices', userId],
    queryFn: () => devices.getOrphanedDevices(userId),
    enabled: !!userId,
    staleTime: 300_000, // 5 minutes
  });
};

export const useShippingBatches = (params: { limit?: number; skip?: number } = {}) => {
  return useQuery<ShippingBatchesResponse, AxiosError<ErrorResponse>>({
    queryKey: ['shippingBatches', params],
    queryFn: () => devices.getShippingBatches(params),
    staleTime: 60_000,
  });
};

export const useShippingBatchDetails = (batchId: string) => {
  return useQuery<ShippingBatchDetailsResponse, AxiosError<ErrorResponse>>({
    queryKey: ['shippingBatchDetails', batchId],
    queryFn: () => devices.getShippingBatchDetails(batchId),
    enabled: !!batchId,
    staleTime: 60_000,
  });
};
