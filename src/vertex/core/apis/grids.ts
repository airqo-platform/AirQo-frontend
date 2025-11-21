import createSecureApiClient from "../utils/secureApiProxyClient";
import { CreateGrid, GridsSummaryResponse } from "@/app/types/grids";

const jwtApiClient = createSecureApiClient();

export interface GetGridsSummaryParams {
  network?: string;
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const grids = {
  getGridsApi: async (params: GetGridsSummaryParams): Promise<GridsSummaryResponse> => {
    try {
      const { network, limit, skip, search, sortBy, order } = params;
      const queryParams = new URLSearchParams();

      if (network) queryParams.set("network", network);
      if (limit !== undefined) queryParams.set("limit", String(limit));
      if (skip !== undefined) queryParams.set("skip", String(skip));
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortBy && order) queryParams.set("order", order);

      const response = await jwtApiClient.get<GridsSummaryResponse>(
        `/devices/grids?${queryParams.toString()}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getGridDetailsApi: async (gridId: string): Promise<GridsSummaryResponse> => {
    try {
      const response = await jwtApiClient.get<GridsSummaryResponse>(
        `/devices/grids/${gridId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateGridDetailsApi: async (
    gridId: string,
    updatePayload: { name?: string; visibility?: boolean; admin_level?: string }
  ) => {
    try {
      const response = await jwtApiClient.put(
        `/devices/grids/${gridId}`,
        updatePayload,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createGridApi: async (data: CreateGrid) => {
    try {
      const response = await jwtApiClient.post(
        `/devices/grids`,
        data,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
