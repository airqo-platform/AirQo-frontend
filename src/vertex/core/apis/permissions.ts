import createAxiosInstance from "./axiosConfig";
import { USERS_MGT_URL } from "../urls";
import { AxiosError } from "axios";

const axiosInstance = createAxiosInstance();

interface ErrorResponse {
  message: string;
}

export const permissions = {
  getPermissionsApi: async () => {
    try {
      const response = await axiosInstance.get(
        `${USERS_MGT_URL}/permissions`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch grids summary"
      );
    }
  },
};
