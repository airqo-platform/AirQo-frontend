import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";
import { Site } from "@/app/types/sites";

interface ApproximateCoordinatesResponse {
  success: boolean;
  message: string;
  approximate_coordinates: {
    approximate_latitude: number;
    approximate_longitude: number;
    approximate_distance_in_km?: number;
    bearing_in_radians?: number;
    provided_latitude?: number;
    provided_longitude?: number;
  };
}

interface ErrorResponse {
  message: string;
}

interface SiteDetailsResponse {
  message: string;
  data: Site;
}

interface UpdateSiteRequest {
  name?: string;
  description?: string;
  network?: string;
  latitude?: string;
  longitude?: string;
  parish?: string;
  sub_county?: string;
  district?: string;
  region?: string;
  altitude?: string;
  search_name?: string;
  location_name?: string;
}

export const sites = {
  getSitesSummary: async (networkId: string, groupName: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/sites/summary?network=${networkId}&group=${groupName}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },
  getSitesApi: async (networkId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/sites/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },
  createSite: async (data: {
    name: string;
    latitude: string;
    longitude: string;
    network: string;
  }) => {
    try {
      const response = await createSecureApiClient().post(`/sites`, data, {
        headers: { 'X-Auth-Type': 'JWT' }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to create site"
      );
    }
  },

  getApproximateCoordinates: async (
    latitude: string,
    longitude: string
  ): Promise<ApproximateCoordinatesResponse> => {
    try {
      const response = await createSecureApiClient().get<ApproximateCoordinatesResponse>(
        `/sites/approximate?latitude=${latitude}&longitude=${longitude}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message ||
          "Failed to get approximate coordinates"
      );
    }
  },

  getSiteDetails: async (siteId: string): Promise<SiteDetailsResponse> => {
    try {
      const response = await createSecureApiClient().get<SiteDetailsResponse>(
        `/sites/${siteId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch site details"
      );
    }
  },

  updateSiteDetails: async (siteId: string, data: UpdateSiteRequest): Promise<SiteDetailsResponse> => {
    try {
      const response = await createSecureApiClient().put<SiteDetailsResponse>(
        `/sites?id=${siteId}`,
        data,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to update site details"
      );
    }
  },
};

export type { ApproximateCoordinatesResponse };
