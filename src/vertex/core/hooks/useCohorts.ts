import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from '@tanstack/react-query';
import {
  GetCohortsSummaryParams,
  cohorts as cohortsApi,
} from '../apis/cohorts';
import { AxiosError } from 'axios';
import {
  Cohort,
  CohortsSummaryResponse,
  GroupCohortsResponse,
} from '@/app/types/cohorts';

interface ErrorResponse {
  message: string;
}

export interface CohortListingOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  cohort_id?: string[];
  tags?: string;
  enabled?: boolean;
}

export const useCohorts = (
  options: CohortListingOptions = {},
  queryOptions?: { enabled?: boolean }
) => {
  const { enabled = true } = queryOptions || {};
  const { page = 1, limit = 25, search, sortBy, order } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const { data, isLoading, isFetching, error } = useQuery<
    CohortsSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['cohorts', { page, limit, search, sortBy, order, cohort_id: options.cohort_id, tags: options.tags }],
    queryFn: ({ signal }: QueryFunctionContext) => {
      const params: GetCohortsSummaryParams = {
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(options.cohort_id && { cohort_id: options.cohort_id }),
        ...(options.tags && { tags: options.tags }),
      };
      return cohortsApi.getCohortsSummary(params, signal);
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    cohorts: data?.cohorts ?? [],
    meta: data?.meta,
    isLoading,
    isFetching,
    error: error as Error | null,
  };
};

export const useUserCohorts = (
  options: CohortListingOptions = {},
  queryOptions?: { enabled?: boolean }
) => {
  const { enabled = true } = queryOptions || {};
  const { page = 1, limit = 25, search, sortBy, order } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const { data, isLoading, isFetching, error } = useQuery<
    CohortsSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['user-cohorts', { page, limit, search, sortBy, order, cohort_id: options.cohort_id }],
    queryFn: ({ signal }: QueryFunctionContext) => {
      const params: GetCohortsSummaryParams = {
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(options.cohort_id && { cohort_id: options.cohort_id }),
      };
      return cohortsApi.getUserCohortsSummary(params, signal);
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    cohorts: data?.cohorts ?? [],
    meta: data?.meta,
    isLoading,
    isFetching,
    error: error as Error | null,
  };
};

export const useGroupCohorts = (
  groupId?: string,
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ['groupCohorts', groupId],
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required');
      return await cohortsApi.getGroupCohorts(groupId);
    },
    enabled: !!groupId && enabled,
    staleTime: 300_000, // 5 minutes
    select: (data: GroupCohortsResponse) => data.data,
  });
};

export const usePersonalUserCohorts = (
  userId?: string,
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ['personalUserCohorts', userId],
    queryFn: async ({ signal }: QueryFunctionContext) => {
      if (!userId) throw new Error('User ID is required');
      const resp = await cohortsApi.getPersonalUserCohorts(userId, signal);
      const ids: string[] = resp?.cohorts ?? [];

      if (!ids || ids.length === 0) return [];

      const verifyResults = await Promise.all(
        ids.map((id) => cohortsApi.verifyCohortIdApi(id).catch(() => null))
      );

      const filteredIds = ids.filter((id, idx) => {
        const result = verifyResults[idx];
        if (!result) return false;
        const name = (result?.cohort?.name || '').toLowerCase();
        return name !== 'airqo';
      });

      return filteredIds;
    },
    enabled: !!userId && enabled,
    staleTime: 60_000, // 1 minute - personal context refreshes faster
  });
};

type UseCohortDetailsOptions = { enabled?: boolean };

export const useCohortDetails = (
  cohortId: string,
  options: UseCohortDetailsOptions = {}
) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['cohort-details', cohortId],
    queryFn: async () => {
      const resp = await cohortsApi.getCohortDetailsApi(cohortId);
      const cohort = Array.isArray(resp?.cohorts) ? resp.cohorts[0] : null;
      return cohort;
    },
    enabled: !!cohortId && enabled,
  });
};

interface UseUpdateCohortDetailsOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useUpdateCohortDetails = (options?: UseUpdateCohortDetailsOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cohortId,
      data,
    }: {
      cohortId: string;
      data: Partial<{ name: string; visibility: boolean; cohort_tags: string[] }>;
    }) => cohortsApi.updateCohortDetailsApi(cohortId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cohort-details', variables.cohortId],
      });
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
      options?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseUpdateCohortNameOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useUpdateCohortName = (options?: UseUpdateCohortNameOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cohortId,
      name,
      updateReason,
    }: {
      cohortId: string;
      name: string;
      updateReason: string;
    }) =>
      cohortsApi.updateCohortNameApi(cohortId, {
        name,
        confirm_update: true,
        update_reason: updateReason,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cohort-details', variables.cohortId],
      });
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      options?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseCreateCohortOptions {
    onSuccess?: (data: { success: boolean; message: string; cohort: Cohort }) => void;
    onError?: (error: AxiosError) => void;
}

export const useCreateCohort = (options?: UseCreateCohortOptions) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            name,
            network,
            cohort_tags,
        }: {
            name: string;
            network: string;
            cohort_tags?: string[];
        }) => {
            const createResp = await cohortsApi.createCohort({ name, network, cohort_tags });
            const cohortId = createResp?.cohort?._id;
            if (!cohortId) throw new Error('Cohort created but missing id');
            return createResp;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['cohorts'] });
            queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
            queryClient.invalidateQueries({ queryKey: ['personalUserCohorts'] });
            options?.onSuccess?.(data);
        },
        onError: (error: AxiosError) => {
            options?.onError?.(error);
        },
    });
}

interface UseCreateCohortWithDevicesOptions {
  onSuccess?: (data: { success: boolean; message: string; cohort: Cohort }) => void;
  onError?: (error: AxiosError) => void;
  invalidateOnSuccess?: boolean;
}

export const useCreateCohortWithDevices = (options?: UseCreateCohortWithDevicesOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      network,
      deviceIds,
      cohort_tags,
      groupId,
      userId,
    }: {
      name: string;
      network: string;
      deviceIds: string[];
      cohort_tags?: string[];
      groupId?: string;
      userId?: string;
    }) => {
      const createResp = await cohortsApi.createCohort({ name, network, cohort_tags });
      const cohortId = createResp?.cohort?._id;
      if (!cohortId) throw new Error('Cohort created but missing id');
      if (Array.isArray(deviceIds) && deviceIds.length > 0) {
        await cohortsApi.assignDevicesToCohort(cohortId, deviceIds);
      }
      
      if (groupId) {
        await cohortsApi.assignCohortsToGroup(groupId, [cohortId]);
      } else if (userId) {
        await cohortsApi.assignCohortsToUser(userId, [cohortId]);
      }
      
      return createResp;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      if (options?.invalidateOnSuccess === false) return;

      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['personalUserCohorts'] });
      queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseCreateCohortFromCohortsOptions {
  onSuccess?: (data: { success: boolean; message: string; data: Cohort }) => void;
  onError?: (error: AxiosError) => void;
}

export const useCreateCohortFromCohorts = (options?: UseCreateCohortFromCohortsOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      cohort_ids,
      network,
      cohort_tags,
    }: {
      name: string;
      description?: string;
      cohort_ids: string[];
      network?: string;
      cohort_tags?: string[];
    }) =>
      cohortsApi.createCohortFromCohorts({
        name,
        description,
        cohort_ids,
        network,
        cohort_tags,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['personalUserCohorts'] });
      options?.onSuccess?.(data);
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseAssignDevicesToCohortOptions {
  onSuccess?: (variables: { cohortId: string; deviceIds: string[] }) => void;
  onError?: (error: AxiosError) => void;
}

export const useAssignDevicesToCohort = (options?: UseAssignDevicesToCohortOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cohortId,
      deviceIds,
    }: {
      cohortId: string;
      deviceIds: string[];
    }) => {
      if (!cohortId || !deviceIds?.length) {
        throw new Error('Cohort ID and at least one device ID are required');
      }
      return cohortsApi.assignDevicesToCohort(cohortId, deviceIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['devices'], exact: false });
      queryClient.invalidateQueries({
        queryKey: ['cohort-details', variables.cohortId],
      });
      options?.onSuccess?.(variables);
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseUnassignDevicesFromCohortOptions {
  onSuccess?: (variables: { cohortId: string; device_ids: string[] }) => void;
  onError?: (error: AxiosError) => void;
}

export const useUnassignDevicesFromCohort = (options?: UseUnassignDevicesFromCohortOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cohortId,
      device_ids,
    }: {
      cohortId: string;
      device_ids: string[];
    }) => {
      if (!cohortId || !device_ids?.length) {
        throw new Error('Cohort ID and at least one device ID are required');
      }
      return cohortsApi.unassignDevicesFromCohort({ cohortId, device_ids });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['devices'], exact: false });
      queryClient.invalidateQueries({
        queryKey: ['cohort-details', variables.cohortId],
      });
      options?.onSuccess?.(variables);
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseAssignCohortsToGroupOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useAssignCohortsToGroup = (options?: UseAssignCohortsToGroupOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      cohortIds,
    }: {
      groupId: string;
      cohortIds: string[];
    }) => {
      if (!groupId) {
        throw new Error('Group ID is required');
      }
      if (!cohortIds?.length) {
        throw new Error('At least one cohort ID is required');
      }
      return cohortsApi.assignCohortsToGroup(groupId, cohortIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
      queryClient.invalidateQueries({ queryKey: ['deviceCount'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['myDevices'] });
      options?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseUnassignCohortsFromGroupOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError) => void;
}

export const useUnassignCohortsFromGroup = (options?: UseUnassignCohortsFromGroupOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      cohortIds,
    }: {
      groupId: string;
      cohortIds: string[];
    }) => {
      if (!groupId) {
        throw new Error('Group ID is required');
      }
      if (!cohortIds?.length) {
        throw new Error('At least one cohort ID is required');
      }
      return cohortsApi.unassignCohortsFromGroup(groupId, cohortIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['groupCohorts'] });
      queryClient.invalidateQueries({ queryKey: ['cohort-details'] });
      options?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

interface UseAssignCohortsToUserOptions {
  onSuccess?: (variables: { userId: string; cohortIds: string[] }) => void;
  onError?: (error: AxiosError) => void;
}

export const useAssignCohortsToUser = (options?: UseAssignCohortsToUserOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      cohortIds,
    }: {
      userId: string;
      cohortIds: string[];
    }) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!cohortIds?.length) {
        throw new Error('At least one cohort ID is required');
      }
      return cohortsApi.assignCohortsToUser(userId, cohortIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
      queryClient.invalidateQueries({
        queryKey: ['userDetails', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['myDevices'],
      });
      queryClient.invalidateQueries({ queryKey: ['user-cohorts'] });
      options?.onSuccess?.(variables);
    },
    onError: (error: AxiosError) => {
      options?.onError?.(error);
    },
  });
};

export const useVerifyCohort = () => {
  return useMutation({
    mutationFn: async (cohortId: string) => {
      if (!cohortId) throw new Error('Cohort ID is required');
      return await cohortsApi.verifyCohortIdApi(cohortId);
    },
  });
};

export const useOriginalCohort = (cohortId: string, options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ['original-cohort', cohortId],
    queryFn: async () => {
      if (!cohortId) throw new Error('Cohort ID is required');
      return await cohortsApi.getOriginalCohortApi(cohortId);
    },
    enabled: !!cohortId && enabled,
    retry: false,
    staleTime: 300_000,
  });
};
