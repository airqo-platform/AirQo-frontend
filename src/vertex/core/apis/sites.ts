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

export interface SitesSummaryCountResponse {
  message: string;
  summary: {
    total_sites: number;
    operational: number;
    transmitting: number;
    not_transmitting: number;
    data_available: number;
  };
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

export interface CreateSiteResponse {
  success: boolean;
  message: string;
  site: Site;
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

  getSitesByCohorts: async (params: {
    cohort_ids: string[];
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    network?: string;
  }): Promise<SitesSummaryResponse> => {
    try {
      const { cohort_ids, ...rest } = params;
      const queryParams = new URLSearchParams();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.set(key, String(value));
        }
      });

      const response = await createSecureApiClient().post<SitesSummaryResponse>(
        `/devices/cohorts/sites?${queryParams.toString()}`,
        { cohort_ids },
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSitesByStatusApi: async (params: {
    status: string;
    limit?: number;
    skip?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
    network?: string;
    group?: string;
  }): Promise<SitesSummaryResponse> => {
    try {
      const { status, ...rest } = params;
      const queryParams = new URLSearchParams();
      
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.set(key, String(value));
        }
      });

      const formattedStatus = status.replace(/_/g, '-').replace(/ /g, '-');
      const response = await createSecureApiClient().get<SitesSummaryResponse>(
        `/devices/sites/status/${formattedStatus}?${queryParams.toString()}`,
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
  }): Promise<CreateSiteResponse> => {
    try {
      const response = await createSecureApiClient().post<CreateSiteResponse>(`/devices/sites`, data, {
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
  getSitesSummaryCount: async (params: { network?: string }): Promise<SitesSummaryCountResponse> => {
    try {
      const { network } = params;
      const queryParams = new URLSearchParams();
      if (network) queryParams.set("network", network);

      const response = await createSecureApiClient().get<SitesSummaryCountResponse>(
        `/devices/sites/summary/count?${queryParams.toString()}`,
        { headers: { "X-Auth-Type": "JWT" } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export type { ApproximateCoordinatesResponse };
