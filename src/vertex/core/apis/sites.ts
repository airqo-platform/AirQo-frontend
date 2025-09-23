import createSecureApiClient from "../utils/secureApiProxyClient";
import { Site } from "@/app/types/sites";
import { PaginationMeta } from "@/app/types/devices";

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

interface SiteDetailsResponse {
  message: string;
  data: Site;
}

export interface SitesSummaryResponse {
  success: boolean;
  message: string;
  sites: Site[];
  meta: PaginationMeta;
}

export interface GetSitesSummaryParams {
  network: string;
  group?: string;
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
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
  getSitesSummary: async (params: GetSitesSummaryParams): Promise<SitesSummaryResponse> => {
    try {
      const { network, group, limit, skip, search, sortBy, order } = params;
      const queryParams = new URLSearchParams();

      if (network) queryParams.set("network", network);
      if (group) queryParams.set("group", group);
      if (limit !== undefined) queryParams.set("limit", String(limit));
      if (skip !== undefined) queryParams.set("skip", String(skip));
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortBy && order) queryParams.set("order", order);

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
