import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { deviceBulkUpdateJobs } from '../apis/deviceBulkUpdateJobs';
import type {
  CreateDeviceBulkUpdateJobRequest,
  CreateDeviceBulkUpdateJobResponse,
  DeleteDeviceBulkUpdateJobResponse,
  DeviceBulkUpdateJob,
  DeviceBulkUpdateJobStatus,
  GetDeviceBulkUpdateJobResponse,
  ListDeviceBulkUpdateJobsResponse,
  TriggerDeviceBulkUpdateJobResponse,
  UpdateDeviceBulkUpdateJobRequest,
  UpdateDeviceBulkUpdateJobResponse,
} from '@/app/types/deviceBulkUpdateJobs';

interface ErrorResponse {
  message: string;
  errors?: { message?: string };
}

const TERMINAL_STATUSES: DeviceBulkUpdateJobStatus[] = [
  'completed',
  'completed_with_errors',
  'failed',
  'cancelled',
];

const shouldPollJob = (job?: DeviceBulkUpdateJob | null) => {
  if (!job) return false;
  if (TERMINAL_STATUSES.includes(job.status)) return false;
  return job.status === 'running' || job.status === 'pending';
};

export type BulkUpdateJobsListOptions = {
  tenant?: string;
  status?: DeviceBulkUpdateJobStatus;
  limit?: number;
  skip?: number;
  enabled?: boolean;
};

export const useDeviceBulkUpdateJobs = (options: BulkUpdateJobsListOptions = {}) => {
  const { tenant, status, limit = 20, skip = 0, enabled = true } = options;

  return useQuery<ListDeviceBulkUpdateJobsResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceBulkUpdateJobs', { tenant: tenant || 'airqo', status, limit, skip }],
    queryFn: ({ signal }) =>
      deviceBulkUpdateJobs.listJobs(
        { tenant, status, limit, skip },
        signal,
      ),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

export type BulkUpdateJobOptions = {
  tenant?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
};

export const useDeviceBulkUpdateJob = (jobId?: string, options: BulkUpdateJobOptions = {}) => {
  const { tenant, enabled = true, pollIntervalMs = 4000 } = options;

  return useQuery<GetDeviceBulkUpdateJobResponse, AxiosError<ErrorResponse>>({
    queryKey: ['deviceBulkUpdateJob', jobId, { tenant: tenant || 'airqo' }],
    queryFn: ({ signal }) => {
      if (!jobId) return Promise.reject(new Error('jobId is required'));
      return deviceBulkUpdateJobs.getJob(jobId, { tenant }, signal);
    },
    enabled: enabled && !!jobId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      return shouldPollJob(data?.job) ? pollIntervalMs : false;
    },
  });
};

export const useCreateDeviceBulkUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateDeviceBulkUpdateJobResponse,
    AxiosError<ErrorResponse>,
    { payload: CreateDeviceBulkUpdateJobRequest; tenant?: string }
  >({
    mutationFn: ({ payload, tenant }) => deviceBulkUpdateJobs.createJob(payload, { tenant }),
    onSuccess: (data) => {
      ReusableToast({ type: 'SUCCESS', message: data.message || 'Bulk update job created' });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJobs'] });
    },
    onError: (error) => {
      ReusableToast({ type: 'ERROR', message: `Create job failed: ${getApiErrorMessage(error)}` });
    },
  });
};

export const useTriggerDeviceBulkUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TriggerDeviceBulkUpdateJobResponse,
    AxiosError<ErrorResponse>,
    { jobId: string; tenant?: string }
  >({
    mutationFn: ({ jobId, tenant }) => deviceBulkUpdateJobs.triggerJob(jobId, { tenant }),
    onSuccess: (_data, variables) => {
      ReusableToast({ type: 'SUCCESS', message: 'Job queued for execution' });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJobs'] });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJob', variables.jobId] });
    },
    onError: (error) => {
      ReusableToast({ type: 'ERROR', message: `Trigger failed: ${getApiErrorMessage(error)}` });
    },
  });
};

export const useUpdateDeviceBulkUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateDeviceBulkUpdateJobResponse,
    AxiosError<ErrorResponse>,
    { jobId: string; payload: UpdateDeviceBulkUpdateJobRequest; tenant?: string }
  >({
    mutationFn: ({ jobId, payload, tenant }) => deviceBulkUpdateJobs.updateJob(jobId, payload, { tenant }),
    onSuccess: (data, variables) => {
      ReusableToast({ type: 'SUCCESS', message: data.message || 'Job updated' });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJobs'] });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJob', variables.jobId] });
    },
    onError: (error) => {
      ReusableToast({ type: 'ERROR', message: `Update failed: ${getApiErrorMessage(error)}` });
    },
  });
};

export const useDeleteDeviceBulkUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteDeviceBulkUpdateJobResponse,
    AxiosError<ErrorResponse>,
    { jobId: string; tenant?: string }
  >({
    mutationFn: ({ jobId, tenant }) => deviceBulkUpdateJobs.deleteJob(jobId, { tenant }),
    onSuccess: (data) => {
      ReusableToast({ type: 'SUCCESS', message: data.message || 'Job deleted' });
      queryClient.invalidateQueries({ queryKey: ['deviceBulkUpdateJobs'] });
    },
    onError: (error) => {
      ReusableToast({ type: 'ERROR', message: `Delete failed: ${getApiErrorMessage(error)}` });
    },
  });
};

