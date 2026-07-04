import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import {
  DeviceDetailsResponse,
  GetDevicesSummaryParams,
  DeviceCountResponse,
  type DeviceActivitiesResponse,
} from '../apis/devices';
import { adapter } from '../adapters';
import { useGroupCohorts, usePersonalUserCohorts } from './useCohorts';
import { useAppSelector } from '../redux/hooks';
import { useMemo } from 'react';
import type {
  DevicesSummaryResponse,
  DeviceAvailabilityResponse,
  DeviceClaimRequest,
  DeviceClaimResponse,
  BulkDeviceClaimRequest,
  BulkDeviceClaimResponse,
  DeviceAssignmentRequest,
  DeviceAssignmentResponse,
  Device,
  DeviceCreationResponse,
  BulkImportDeviceResponse,
  DeviceUpdateGroupResponse,
  MaintenanceLogData,
  DecryptionRequest,
  DecryptionResponse,
  MyDevicesResponse,
  OrphanedDevicesResponse,
} from '@/app/types/devices';
import { AxiosError } from 'axios';
import { isSystemGroupTitle } from '@/core/config/system-group';
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
  const isSystemGroup = isSystemGroupTitle(activeGroup?.grp_title);
  const { page = 1, limit = 100, search, sortBy, order, network, enabled = true, filterStatus, ...rest } = options;

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(
    activeGroup?._id,
    {
      enabled: !isSystemGroup && !!activeGroup?._id && enabled,
    }
  );

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  // Combine known params with dynamic rest params for the query key
  const queryParams = useMemo(() => ({ page, limit, search, sortBy, order, network, ...rest }), [page, limit, search, sortBy, order, network, JSON.stringify(rest)]);

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
    queryFn: async ({ signal }: QueryFunctionContext) => {
      // 1. Hybrid Strategy: If a generic status filter is provided, use the optimized status endpoint
      if (filterStatus) {
        const commonParams = {
          status: filterStatus,
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          ...(network && { network }),
          ...rest,
        };

        if (isSystemGroup) {
          // Admin view: status across all (or filtered network)
          return adapter.getDevicesByStatus(commonParams);
        } else {
          // Org view: status scoped by organization cohorts
          if (!groupCohortIds || groupCohortIds.length === 0) {
            throw new Error('Cohort IDs are not available for this organization.');
          }
          return adapter.getDevicesByStatus({
            ...commonParams,
            cohort_id: groupCohortIds,
          });
        }
      }

      if (isSystemGroup) {
        const params: GetDevicesSummaryParams = {
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          ...(network && { network }),
          ...rest,
        };
        return adapter.getDevices(params, signal);
      }

      if (!groupCohortIds) {
        // This will be handled by the `enabled` option, but as a safeguard:
        throw new Error('Cohort IDs are not available yet.');
      }

      return adapter.getDevicesByCohorts({
        cohort_ids: groupCohortIds,
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(network && { network }),
        ...rest,
      }, signal);
    },
    enabled:
      enabled &&
      !!activeGroup?.grp_title &&
      (isSystemGroup || (!!groupCohortIds && groupCohortIds.length > 0)),
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

  const { data: personalCohortIds, isLoading: isPersonalCohortsLoading } = usePersonalUserCohorts(userId, { enabled: !!userId && enabled });

  const groupIds = userDetails?.groups
    ? (userDetails.groups as UserGroup[])
        .filter((g) => !isSystemGroupTitle(g.grp_title))
        .map((g) => g._id)
    : userDetails?.group_ids || [];
  const cohortIds = personalCohortIds && personalCohortIds.length > 0 ? personalCohortIds : (userDetails?.cohort_ids || []);

  const query = useQuery<MyDevicesResponse, AxiosError<ErrorResponse>>({
    queryKey: [
      "myDevices",
      userId,
      organizationId || activeGroup?._id,
      groupIds,
      cohortIds,
    ],
    queryFn: () => adapter.getMyDevices(userId, groupIds, cohortIds),
    enabled: !!userId && enabled && !!userDetails && !isPersonalCohortsLoading,
    staleTime: 60_000, // 1 minute
  });

  return {
    ...query,
    isLoading: query.isLoading || isPersonalCohortsLoading,
  };
};

export const useDeviceCount = (options: { enabled?: boolean; cohortIds?: string[]; network?: string } = {}) => {
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const { enabled = true, cohortIds, network } = options;

  // If cohortIds are explicitly passed (e.g. personal scope), bypass group logic entirely
  const hasExplicitCohorts = !!cohortIds;

  // Only treat as system group if no explicit cohortIds were passed
  const isSystemGroup = !hasExplicitCohorts && isSystemGroupTitle(activeGroup?.grp_title);

  const shouldFetchGroupCohorts =
    !hasExplicitCohorts &&
    !isSystemGroup &&
    !!activeGroup?._id &&
    enabled &&
    !network;

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(
    activeGroup?._id,
    { enabled: shouldFetchGroupCohorts }
  );

  // Explicit cohortIds take priority over group-derived ones
  const effectiveCohortIds = hasExplicitCohorts ? cohortIds : groupCohortIds;

  const isQueryEnabled =
    enabled &&
    (
      !!network ||
      isSystemGroup ||
      (!!effectiveCohortIds && effectiveCohortIds.length > 0)
    );

  const query = useQuery<DeviceCountResponse, AxiosError<ErrorResponse>>({
    queryKey: [
      'deviceCount',
      hasExplicitCohorts ? 'personal' : activeGroup?._id,
      isSystemGroup ? null : effectiveCohortIds,
      network,
    ],
    queryFn: () => {
      if (network) {
        return adapter.getDeviceCount({ network });
      }

      if (isSystemGroup) {
        return adapter.getDeviceCount({});
      }

      if (!effectiveCohortIds || effectiveCohortIds.length === 0) {
        return Promise.reject(new Error('Cohort IDs must be provided.'));
      }

      return adapter.getDeviceCount({ cohort_id: effectiveCohortIds });
    },
    enabled: isQueryEnabled,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    isLoading: (shouldFetchGroupCohorts && isLoadingCohorts) || (isQueryEnabled && query.isLoading),
    isFetching: (shouldFetchGroupCohorts && isLoadingCohorts) || (isQueryEnabled && query.isFetching),
  };
};

export const useDeviceAvailability = (deviceName: string) => {
  return useQuery<DeviceAvailabilityResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceAvailability', deviceName],
    queryFn: () => adapter.checkDeviceAvailability(deviceName),
    enabled: !!deviceName && deviceName.length > 0,
    staleTime: 30000,
  });
};

interface UseClaimDeviceOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useClaimDevice = (options?: UseClaimDeviceOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceClaimResponse,
    AxiosError<ErrorResponse>,
    DeviceClaimRequest
  >({
    mutationFn: adapter.claimDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

interface UseBulkClaimDevicesOptions {
  onSuccess?: (data: BulkDeviceClaimResponse) => void;
  onError?: (error: AxiosError) => void;
}

export const useBulkClaimDevices = (options?: UseBulkClaimDevicesOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkDeviceClaimResponse,
    AxiosError<ErrorResponse>,
    BulkDeviceClaimRequest
  >({
    mutationFn: adapter.claimDevicesBulk,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
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
    mutationFn: adapter.assignDeviceToOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

interface UseUnassignDeviceFromOrganizationOptions {
  onSuccess?: (data: DeviceAssignmentResponse) => void;
  onError?: (error: AxiosError) => void;
}

export const useUnassignDeviceFromOrganization = (options?: UseUnassignDeviceFromOrganizationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceAssignmentResponse,
    AxiosError<ErrorResponse>,
    { deviceName: string; userId: string }
  >({
    mutationFn: ({ deviceName, userId }) =>
      adapter.unassignDeviceFromOrganization(deviceName, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useDeviceDetails = (deviceId: string) => {
  return useQuery<DeviceDetailsResponse, AxiosError<ErrorResponse>>({
    queryKey: ['device-details', deviceId],
    queryFn: () => adapter.getDevice(deviceId),
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
    }) => adapter.updateDevice(deviceId, deviceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['device-details', variables.deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
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
    }) => adapter.updateDeviceGlobal(deviceId, deviceData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['device-details', variables.deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useDeviceStatusFeed = (deviceNumber?: number) => {
  return useQuery({
    queryKey: ['deviceStatusFeed', deviceNumber],
    queryFn: () => adapter.getDeviceStatusFeed(deviceNumber!),
    enabled: !!deviceNumber,
    refetchOnWindowFocus: false,
  });
};

export interface BulkDeviceUpdatePayload {
  deviceIds: string[];
  updateData: Record<string, unknown>;
}

interface UseUpdateDeviceBulkOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useUpdateDeviceBulk = (options?: UseUpdateDeviceBulkOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceUpdateGroupResponse,
    AxiosError<ErrorResponse>,
    BulkDeviceUpdatePayload
  >({
    mutationFn: ({ deviceIds, updateData }) =>
      adapter.bulkUpdateDeviceDetails(deviceIds, updateData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["network-devices"] });
      queryClient.invalidateQueries({ queryKey: ["deviceActivities"] });
      options?.onSuccess?.();
    },

    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

interface UseUpdateDeviceGroupOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useUpdateDeviceGroup = (options?: UseUpdateDeviceGroupOptions) => {
  const queryClient = useQueryClient();
  return useMutation<
    DeviceUpdateGroupResponse,
    AxiosError<ErrorResponse>,
    { deviceId: string; groupName: string }
  >({
    mutationFn: ({ deviceId, groupName }) =>
      adapter.bulkUpdateDeviceDetails([deviceId], { groups: [groupName] }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      queryClient.invalidateQueries({ queryKey: ["network-devices"] });
      queryClient.invalidateQueries({ queryKey: ["deviceActivities"] });
      options?.onSuccess?.();
     
    },

    onError: (error) => {
      options?.onError?.(error);
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
      tags?: string[];
    }
  >({
    mutationFn: async (variables) => {
      const { tags, ...rest } = variables;

      const payload = {
        ...rest,
        ...(tags && tags.length > 0 && { tags }),
      };

      return adapter.createDevice(payload);
    },

    onSuccess: async (data) => {
      try {
        const createdDeviceId = data.created_device?._id;

        if (createdDeviceId && activeGroup?.grp_title) {
          await updateDeviceGroup.mutateAsync({
            deviceId: createdDeviceId,
            groupName: activeGroup.grp_title,
          });
        }
      } catch (error) {
        logger.error("Failed to assign device to group", getApiErrorMessage(error));
      } finally {
        queryClient.invalidateQueries({ queryKey: ["devices"] });
        queryClient.invalidateQueries({ queryKey: ["network-devices"] });
        queryClient.invalidateQueries({ queryKey: ["deviceActivities"] });
      }
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
      authRequired: boolean;
      cohort_id?: string;
      user_id: string;
      tags?: string[];
    }
  >({
    mutationFn: (variables) => {
      const { tags, ...rest } = variables;
      const payload = {
        ...rest,
        ...(tags && tags.length > 0 && { tags }),
      };
      return adapter.importDevice(payload);
    },
    onSuccess: () => {
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
        queryClient.invalidateQueries({ queryKey: ['cohorts'] });
        queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
        queryClient.invalidateQueries({ queryKey: ['personalUserCohorts'] });
      }
    }
  });
};

export const useBulkImportDevices = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const userContext = useAppSelector((state) => state.user.userContext);

  const isAdminModule = pathname?.startsWith('/admin/');

  return useMutation<
    BulkImportDeviceResponse,
    AxiosError<ErrorResponse>,
    { type: 'csv'; payload: FormData } | { type: 'json'; payload: Parameters<typeof adapter.importBulkDevicesJSON>[0] }
  >({
    mutationFn: (variables) => {
      if (variables.type === 'csv') {
        return adapter.importBulkDevicesCSV(variables.payload);
      }
      return adapter.importBulkDevicesJSON(variables.payload);
    },
    onSuccess: () => {
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
        queryClient.invalidateQueries({ queryKey: ['cohorts'] });
        queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
        queryClient.invalidateQueries({ queryKey: ['personalUserCohorts'] });
      }
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
      site_name?: string;
      site_id?: string;
      network: string;
      user_id: string;
      deployment_date: string | undefined;
      firstName?: string;
      lastName?: string;
      email?: string;
      userName?: string;
    }) => adapter.deployDevice(deviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['claimedDevices'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
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
    }) => adapter.recallDevice(deviceName, recallData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-details'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
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
    }) => adapter.addMaintenanceLog(deviceName, logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-details'] });
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['deviceActivities'] });
    },
  });
};

export const useDecryptDeviceKeys = () => {
  return useMutation<
    DecryptionResponse,
    AxiosError<ErrorResponse>,
    DecryptionRequest[]
  >({
    mutationFn: adapter.decryptDeviceKeys,
    onSuccess: () => {
      logger.info('Keys decrypted successfully!');
    },
  });
};

export const useOrphanedDevices = (userId: string) => {
  return useQuery<OrphanedDevicesResponse, AxiosError>({
    queryKey: ['orphanedDevices', userId],
    queryFn: () => adapter.getOrphanedDevices(userId),
    enabled: !!userId,
    staleTime: 300_000, // 5 minutes
  });
};

export const useDeviceActivities = (deviceName: string) => {
  return useInfiniteQuery<DeviceActivitiesResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceActivities', deviceName],
    queryFn: ({ pageParam = 1 }) =>
      adapter.getDeviceActivities(deviceName, { page: pageParam as number, limit: 10 }),
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
