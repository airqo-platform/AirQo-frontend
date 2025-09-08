import createSecureApiClient from "../utils/secureApiProxyClient";
import { CreateGrid } from "@/app/types/grids";


export const grids = {
  getGridsApi: async (networkId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/grids/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getGridDetailsApi: async (gridId: string) => {
    try {
      const response = await createSecureApiClient().get(
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
      const response = await createSecureApiClient().put(
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
      const response = await createSecureApiClient().post(
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
