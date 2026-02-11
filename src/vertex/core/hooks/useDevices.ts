import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import {
  DeviceDetailsResponse,
  devices,
  GetDevicesSummaryParams,
  DeviceCountResponse,
  type DeviceActivitiesResponse,
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

export type DeviceListingOptions = Partial<Device> & {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  network?: string;
  enabled?: boolean;
  filterStatus?: string;
};

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

  const { page = 1, limit = 100, search, sortBy, order, network, enabled: _enabled, filterStatus, ...rest } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  // Combine known params with dynamic rest params for the query key
  const queryParams = { page, limit, search, sortBy, order, network, ...rest };

  const queryKey = [
    'devices',
    activeGroup?.grp_title,
    queryParams,
    groupCohortIds,
  ];

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey,
    queryFn: async () => {
      // 1. Hybrid Strategy: If a generic status filter is provided, use the optimized status endpoint
      if (options.filterStatus) {
        const commonParams = {
          status: options.filterStatus,
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          ...(network && { network }),
          ...rest,
        };

        if (isAirQoGroup) {
          // Admin view: status across all (or filtered network)
          return devices.getDevicesByStatusApi(commonParams);
        } else {
          // Org view: status scoped by organization cohorts
          if (!groupCohortIds || groupCohortIds.length === 0) {
            throw new Error('Cohort IDs are not available for this organization.');
          }
          return devices.getDevicesByStatusApi({
            ...commonParams,
            cohort_id: groupCohortIds,
          });
        }
      }

      if (isAirQoGroup) {
        const params: GetDevicesSummaryParams = {
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          ...(network && { network }),
          ...rest,
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
        ...rest,
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

export const useDeviceCount = (options: { enabled?: boolean; cohortIds?: string[]; network?: string } = {}) => {
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const { enabled = true, cohortIds, network } = options;
  const isAirQoGroup = activeGroup?.grp_title === 'airqo';

  const shouldFetchGroupCohorts = !cohortIds && !isAirQoGroup && !!activeGroup?._id && enabled && !network;

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(
    activeGroup?._id,
    {
      enabled: shouldFetchGroupCohorts,
    }
  );

  const effectiveCohortIds = cohortIds || groupCohortIds;

  const isQueryEnabled =
    enabled &&
    (!!network || isAirQoGroup || (!!effectiveCohortIds && effectiveCohortIds.length > 0));

  const query = useQuery<DeviceCountResponse, AxiosError<ErrorResponse>>({
    queryKey: [
      'deviceCount',
      activeGroup?._id,
      isAirQoGroup ? null : effectiveCohortIds,
      network
    ],
    queryFn: () => {
      if (network) {
        return devices.getDeviceCountApi({ network });
      }

      if (isAirQoGroup) {
        return devices.getDeviceCountApi({});
      }

      if (!effectiveCohortIds || effectiveCohortIds.length === 0) {
        return Promise.reject(new Error('Cohort IDs must be provided.'));
      }
      return devices.getDeviceCountApi({ cohort_id: effectiveCohortIds });
    },
    enabled: isQueryEnabled,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: (shouldFetchGroupCohorts && isLoadingCohorts) || (isQueryEnabled && query.isLoading),
    isFetching: (shouldFetchGroupCohorts && isLoadingCohorts) || (isQueryEnabled && query.isFetching),
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
      queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
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
  const pathname = usePathname();
  const userContext = useAppSelector((state) => state.user.userContext);

  // Determine active module based on pathname
  const isAdminModule = pathname?.startsWith('/admin/');

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
      api_code?: string;
      cohort_id?: string;
      user_id: string;
    }
  >({
    mutationFn: devices.importDevice,
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.long_name} has been imported.`,
        type: 'SUCCESS',
      });

      // Refresh based on active module
      if (isAdminModule) {
        queryClient.invalidateQueries({ queryKey: ['network-devices'] });
      } else {
        if (userContext === 'external-org') {
          queryClient.invalidateQueries({ queryKey: ['devices'] });
          queryClient.invalidateQueries({ queryKey: ['deviceCount'] });
          queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
        } else {
          queryClient.invalidateQueries({ queryKey: ['myDevices'] });
          queryClient.invalidateQueries({ queryKey: ['deviceCount'] });
          queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
        }
      }
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
      firstName?: string;
      lastName?: string;
      email?: string;
      userName?: string;
    }) => devices.deployDevice(deviceData),
    onSuccess: (data, variables) => {
      ReusableToast({
        message: `${variables.deviceName} has been deployed.`,
        type: 'SUCCESS',
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['claimedDevices'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
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
        firstName?: string;
        lastName?: string;
        email?: string;
        userName?: string;
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
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
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
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
    },
    onError: error => {
      ReusableToast({
        message: `Failed to Add Maintenance Log: ${getApiErrorMessage(error)}`,
        type: 'ERROR',
      });
    },
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

export const useDeviceActivities = (deviceName: string) => {
  return useInfiniteQuery<DeviceActivitiesResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceActivities', deviceName],
    queryFn: ({ pageParam = 1 }) =>
      devices.getDeviceActivities(deviceName, { page: pageParam as number, limit: 10 }),
    getNextPageParam: (lastPage: DeviceActivitiesResponse, allPages: DeviceActivitiesResponse[]) => {
        if (!lastPage.meta) {
            if (!lastPage.site_activities || lastPage.site_activities.length < 10) return undefined;
            return allPages.length + 1;
        }
        if (lastPage.meta.page < lastPage.meta.totalPages) {
            return lastPage.meta.page + 1;
        }
        return undefined;
    },
    enabled: !!deviceName,
    staleTime: 60_000,
    initialPageParam: 1,
  });
};
