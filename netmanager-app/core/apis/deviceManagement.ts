import { COHORTS, GRIDS } from '@/config/urls/deviceRegistry';
  import createAxiosInstance from './axiosConfig';
  
  // Device Management
export const getCohortsApi = async (params: ApiParams): Promise<ApiResponse<Cohort>> => {
  const response = await createAxiosInstance().get<ApiResponse<Cohort>>(COHORTS, { params });
  return response.data;
};

export const getCohortsSummaryApi = async (params: ApiParams): Promise<ApiResponse<Cohort>> => {
  const response = await createAxiosInstance().get<ApiResponse<Cohort>>(`${COHORTS}/summary`, { params });
  return response.data;
};

export const getGridsApi = async (params: ApiParams): Promise<ApiResponse<Grid>> => {
  const response = await createAxiosInstance().get<ApiResponse<Grid>>(GRIDS, { params });
  return response.data;
};

export const getGridsSummaryApi = async (params: ApiParams): Promise<ApiResponse<Grid>> => {
  const response = await createAxiosInstance().get<ApiResponse<Grid>>(`${GRIDS}/summary`, { params });
  return response.data;
};
