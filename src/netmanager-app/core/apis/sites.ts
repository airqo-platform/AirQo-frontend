import createAxiosInstance from "./axiosConfig";
import { SITES_MGT_URL } from "../urls";
import { AxiosError } from "axios";

const axiosInstance = createAxiosInstance();

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

export const sites = {
  getSitesSummary: async (networkId: string, groupName: string) => {
    try {
      const response = await axiosInstance.get(
        `${SITES_MGT_URL}/summary?network=${networkId}&group=${groupName}`
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
      const response = await axiosInstance.get(
        `${SITES_MGT_URL}/summary?network=${networkId}`
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
      const response = await axiosInstance.post(`${SITES_MGT_URL}`, data);
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
      const response = await axiosInstance.get<ApproximateCoordinatesResponse>(
        `${SITES_MGT_URL}/approximate?latitude=${latitude}&longitude=${longitude}`
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
};

export type { ApproximateCoordinatesResponse };
