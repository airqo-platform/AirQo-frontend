import createSecureApiClient from "../utils/secureApiProxyClient";

export const cohorts = {
  getCohortsSummary: async (networkId: string) => { 
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts/summary?network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch sites summary"
      );
    }
  },

  getCohortsApi: async (networkId: string) => {
    try {
      const response = await createSecureApiClient().get(
        `/devices/cohorts&network=${networkId}`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching grid summary:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch grid summary"
      );
    }
  },

};
