import createSecureApiClient from "../utils/secureApiProxyClient";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

export const permissions = {
  getPermissionsApi: async () => {
    try {
      const response = await createSecureApiClient().get(
        `/users/permissions`,
        { headers: { 'X-Auth-Type': 'JWT' } }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch permissions summary"
      );
    }
  },
};
