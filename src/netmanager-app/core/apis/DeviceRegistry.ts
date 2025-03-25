import createAxiosInstance from './axiosConfig';
import {
        SITES_MGT_URL,
        ANALYTICS_MGT_URL,
//   READINGS_URL,
  DEVICES_MGT_URL,
//   GRID_LOCATIONS_URL,
//   NEAREST_SITE_URL,
//   GRIDS_SUMMARY_URL,
} from '../urls';

// Define types for API responses (modify based on actual API response structures)
interface GridLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  // Add other properties as needed
}

interface AnalyticsResponse {
  data: any; // Update based on actual analytics data structure
}

interface RecentMeasurement {
  id: string;
  value: number;
  timestamp: string;
  // Add any other properties if available
}

interface CohortVerificationResponse {
  isValid: boolean;
  message?: string;
}

interface SiteSummary {
  id: string;
  name: string;
  description: string;
}

interface MapReading {
  id: string;
  value: number;
  timestamp: string;
}

// Get grid locations
export const getAllGridLocationsApi = async (): Promise<GridLocation[]> => {
  const response = await createAxiosInstance().get<GridLocation[]>(GRID_LOCATIONS_URL);
  return response.data;
};

// Get grid location details
export const getGridLocationDetails = async (gridID: string): Promise<GridLocation> => {
  const response = await createAxiosInstance().get<GridLocation>(`${GRID_LOCATIONS_URL}/${gridID}`);
  return response.data;
};

// Get Sites Summary
export const getSiteSummaryDetails = async (): Promise<SiteSummary[]> => {
  const response = await createAxiosInstance().get<SiteSummary[]>(`${SITES_MGT_URL}/summary`);
  return response.data;
};

// Get Grids Summary
export const getGirdsSummaryDetails = async (): Promise<any> => {
  const response = await createAxiosInstance().get<any>(GRIDS_SUMMARY_URL);
  return response.data;
};

// Get Analytics Data
export const getAnalyticsData = async ({
  body,
  timeout = 180000,
  signal,
}: {
  body: object;
  timeout?: number;
  signal?: AbortSignal;
}): Promise<AnalyticsResponse> => {
  try {
    const response = await createAxiosInstance().post<AnalyticsResponse>(ANALYTICS_MGT_URL, body, {
      timeout,
      signal,
    });
    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Analytics request timed out. Please try again.');
    }
    if (error.name === 'CanceledError') {
      console.log('Analytics request was canceled.');
      return {} as AnalyticsResponse;
    }
    throw error;
  }
};

// Get Recent Measurements
export const getRecentMeasurements = async ({
  params,
  timeout = 180000,
  signal,
}: {
  params?: object;
  timeout?: number;
  signal?: AbortSignal;
}): Promise<RecentMeasurement[]> => {
  try {
    const response = await createAxiosInstance(false).get<RecentMeasurement[]>(`${DEVICES_MGT_URL}/readings/recent`, {
      params,
      timeout,
      signal,
    });
    console.log("data is ",response.data)
    return response.data;
    
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Recent measurements request timed out. Please try again.');
    }
    if (error.name === 'CanceledError') {
      console.log('Recent measurements request was canceled.');
      return [];
    }
    throw error;
  }
};

// Verify Cohort ID
export const verifyCohortID = async (cohortID: string): Promise<CohortVerificationResponse> => {
  return createAxiosInstance(false)
    .get<CohortVerificationResponse>(`${DEVICES}/cohorts/verify/${cohortID}`)
    .then((response) => response.data);
};

// Update Cohort Details
export const updateCohortDetails = async (body: object, cohortID: string): Promise<any> => {
  return createAxiosInstance()
    .put<any>(`${DEVICES}/cohorts/${cohortID}`, body)
    .then((response) => response.data);
};

// Get Map Readings
export const getMapReadings = async (): Promise<MapReading[]> => {
  return createAxiosInstance(false)
    .get<MapReading[]>(READINGS_URL)
    .then((response) => response.data);
};

// Get Nearest Site
export const getNearestSite = async (params: object): Promise<any> => {
  return createAxiosInstance(false)
    .get<any>(NEAREST_SITE_URL, { params })
    .then((response) => response.data);
};

// Get Grids Summary
export const getGridsSummaryApi = async (): Promise<any> => {
  return createAxiosInstance()
    .get<any>(`${DEVICES}/grids/summary`)
    .then((response) => response.data);
};
