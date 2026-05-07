export type DeviceBulkUpdateJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'completed_with_errors'
  | 'failed'
  | 'paused'
  | 'cancelled';

export interface DeviceBulkUpdateJobFilter {
  network?: string;
  category?: string;
  status?: string;
  deployment_type?: string;
  mobility?: string;
  isActive?: boolean;
  owner?: string;
  device_manufacturer?: string;
  product_name?: string;
  long_name?: string;
  device_number?: number;
}

export interface DeviceBulkUpdateJobUpdateData {
  category?: 'bam' | 'lowcost' | 'gas' | string;
  groups?: unknown[];
  mobility?: string;
  owner?: string;
  description?: string;
  product_name?: string;
  device_manufacturer?: string;
  collocation?: string;
}

export interface DeviceBulkUpdateJob {
  _id: string;
  name: string;
  description?: string;
  status: DeviceBulkUpdateJobStatus;
  filter: DeviceBulkUpdateJobFilter;
  updateData: DeviceBulkUpdateJobUpdateData;
  batchSize: number;
  dryRun: boolean;
  processedCount: number;
  failedCount: number;
  totalDevices: number | null;
  progress?: number | null;
  failedIds?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  lastRunAt?: string;
  startedAt?: string;
}

export interface BulkUpdateJobsListMeta {
  total: number;
  totalResults: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
  previousPage?: string;
}

export interface CreateDeviceBulkUpdateJobRequest {
  name: string;
  description?: string;
  filter: DeviceBulkUpdateJobFilter;
  updateData: DeviceBulkUpdateJobUpdateData;
  batchSize?: number;
  dryRun?: boolean;
  createdBy?: string;
}

export interface UpdateDeviceBulkUpdateJobRequest {
  status?: Extract<DeviceBulkUpdateJobStatus, 'pending' | 'paused' | 'cancelled'>;
  description?: string;
  batchSize?: number;
  dryRun?: boolean;
}

export interface CreateDeviceBulkUpdateJobResponse {
  success: boolean;
  message: string;
  job: DeviceBulkUpdateJob;
}

export interface ListDeviceBulkUpdateJobsResponse {
  success: boolean;
  message: string;
  meta: BulkUpdateJobsListMeta;
  jobs: DeviceBulkUpdateJob[];
}

export interface GetDeviceBulkUpdateJobResponse {
  success: boolean;
  message: string;
  job: DeviceBulkUpdateJob;
}

export interface UpdateDeviceBulkUpdateJobResponse {
  success: boolean;
  message: string;
  job: DeviceBulkUpdateJob;
}

export interface DeleteDeviceBulkUpdateJobResponse {
  success: boolean;
  message: string;
  job: { jobId: string };
}

export interface TriggerDeviceBulkUpdateJobResponse {
  success: boolean;
  message: string;
  job: { jobId: string; status: DeviceBulkUpdateJobStatus };
}

