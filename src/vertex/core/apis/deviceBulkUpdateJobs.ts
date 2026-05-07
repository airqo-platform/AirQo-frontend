import createSecureApiClient from '../utils/secureApiProxyClient';
import type {
  CreateDeviceBulkUpdateJobRequest,
  CreateDeviceBulkUpdateJobResponse,
  GetDeviceBulkUpdateJobResponse,
  ListDeviceBulkUpdateJobsResponse,
  UpdateDeviceBulkUpdateJobRequest,
  UpdateDeviceBulkUpdateJobResponse,
  DeleteDeviceBulkUpdateJobResponse,
  TriggerDeviceBulkUpdateJobResponse,
} from '@/app/types/deviceBulkUpdateJobs';

const apiClient = createSecureApiClient();

type TenantParams = { tenant?: string };

export const deviceBulkUpdateJobs = {
  createJob: async (
    payload: CreateDeviceBulkUpdateJobRequest,
    params: TenantParams = {},
    signal?: AbortSignal,
  ): Promise<CreateDeviceBulkUpdateJobResponse> => {
    const response = await apiClient.post<CreateDeviceBulkUpdateJobResponse>(
      `/devices/bulk-update-jobs`,
      payload,
      { params, signal, headers: { 'X-Auth-Type': 'API_TOKEN' } },
    );
    return response.data;
  },

  listJobs: async (
    params: TenantParams & {
      status?: string;
      limit?: number;
      skip?: number;
    } = {},
    signal?: AbortSignal,
  ): Promise<ListDeviceBulkUpdateJobsResponse> => {
    const response = await apiClient.get<ListDeviceBulkUpdateJobsResponse>(
      `/devices/bulk-update-jobs`,
      { params, signal, headers: { 'X-Auth-Type': 'JWT' } },
    );
    return response.data;
  },

  getJob: async (
    jobId: string,
    params: TenantParams = {},
    signal?: AbortSignal,
  ): Promise<GetDeviceBulkUpdateJobResponse> => {
    const response = await apiClient.get<GetDeviceBulkUpdateJobResponse>(
      `/devices/bulk-update-jobs/${jobId}`,
      { params, signal, headers: { 'X-Auth-Type': 'JWT' } },
    );
    return response.data;
  },

  updateJob: async (
    jobId: string,
    payload: UpdateDeviceBulkUpdateJobRequest,
    params: TenantParams = {},
    signal?: AbortSignal,
  ): Promise<UpdateDeviceBulkUpdateJobResponse> => {
    const response = await apiClient.put<UpdateDeviceBulkUpdateJobResponse>(
      `/devices/bulk-update-jobs/${jobId}`,
      payload,
      { params, signal, headers: { 'X-Auth-Type': 'API_TOKEN' } },
    );
    return response.data;
  },

  deleteJob: async (
    jobId: string,
    params: TenantParams = {},
    signal?: AbortSignal,
  ): Promise<DeleteDeviceBulkUpdateJobResponse> => {
    const response = await apiClient.delete<DeleteDeviceBulkUpdateJobResponse>(
      `/devices/bulk-update-jobs/${jobId}`,
      { params, signal, headers: { 'X-Auth-Type': 'API_TOKEN' } },
    );
    return response.data;
  },

  triggerJob: async (
    jobId: string,
    params: TenantParams = {},
    signal?: AbortSignal,
  ): Promise<TriggerDeviceBulkUpdateJobResponse> => {
    const response = await apiClient.post<TriggerDeviceBulkUpdateJobResponse>(
      `/devices/bulk-update-jobs/${jobId}/trigger`,
      {},
      { params, signal, headers: { 'X-Auth-Type': 'API_TOKEN' } },
    );
    return response.data;
  },
};

