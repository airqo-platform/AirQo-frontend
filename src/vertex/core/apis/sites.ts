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
      const queryParams = new URLSearchParams({
        network: networkId,
        ...(groupName && groupName !== "airqo" && { group: groupName }),
      });

      const response = await createSecureApiClient().get(
        `/devices/sites/summary?${queryParams.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getSitesApi: async (networkId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/sites/summary?network=${networkId}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createSite: async (data: {
    name: string;
    latitude: string;
    longitude: string;
    network: string;
  }) => {
    try {
      const response = await createSecureApiClient().post(`/devices/sites`, data, {
        headers: { "X-Auth-Type": "JWT" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApproximateCoordinates: async (
    latitude: string,
    longitude: string
  ): Promise<ApproximateCoordinatesResponse> => {
    try {
      const response =
        await createSecureApiClient().get<ApproximateCoordinatesResponse>(
          `/devices/sites/approximate?latitude=${latitude}&longitude=${longitude}`,
          { headers: { "X-Auth-Type": "JWT" } }
        );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSiteDetails: async (siteId: string): Promise<SiteDetailsResponse> => {
    try {
      const response = await createSecureApiClient().get<SiteDetailsResponse>(
        `/devices/sites/${siteId}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSiteDetails: async (
    siteId: string,
    data: UpdateSiteRequest
  ): Promise<SiteDetailsResponse> => {
    try {
      const response = await createSecureApiClient().put<SiteDetailsResponse>(
        `/devices/sites?id=${siteId}`,
        data,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  bulkUpdate: async (data: { siteIds: string[]; updateData: { groups?: string[] } }) => {
    try {
      const response = await createSecureApiClient().put(
        `/devices/sites/bulk`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export type { ApproximateCoordinatesResponse };
