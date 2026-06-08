import { NetworkCreationRequest, NetworkRequestActionResponse } from "@/core/apis/networks";
import { NetworkRequestValues } from "@/components/features/networks/schema";
import { getApiBaseUrl } from "@/lib/envConstants";
import logger from "@/lib/logger";
import axios from "axios";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

const NETWORK_REQUEST_TIMEOUT_MS = 10_000;

/**
 * Service for network-related operations on the server side.
 * This service should be used by Server Components and Route Handlers.
 */
export const networkService = {
  /**
   * Fetches network creation requests from the backend.
   */
  getNetworkCreationRequests: async (token: string, adminSecret: string): Promise<NetworkCreationRequest[]> => {
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/devices/network-creation-requests?admin_secret=${adminSecret.trim()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: token.startsWith("JWT ") ? token : `JWT ${token}`,
          "X-Auth-Type": "JWT"
        }
      });

      return response.data.network_creation_requests || [];
    } catch (error) {
      const message = getApiErrorMessage(error);
      const status = axios.isAxiosError(error) ? error.response?.status : 500;
      
      logger.error(`Error fetching network requests: ${message}`, { status });
      
      if (status === 404) {
        throw new Error("NOT_FOUND");
      }
      
      const err: any = new Error(message);
      err.status = status;
      throw err;
    }
  },

  /**
   * Updates the status of a network creation request.
   */
  updateNetworkRequestStatus: async (
    id: string, 
    action: string, 
    notes: string, 
    token: string, 
    adminSecret: string
  ): Promise<any> => {
    try {
      const baseUrl = getApiBaseUrl();
      // Try putting admin_secret in both URL and body to be safe, 
      // as some AirQo endpoints require it in one or the other.
      const url = `${baseUrl}/devices/network-creation-requests/${id}/${action}?admin_secret=${adminSecret.trim()}`;
      
      const payload: Record<string, any> = {
        admin_secret: adminSecret.trim(),
      };

      if (notes && notes.trim() !== "") {
        payload.reviewer_notes = notes;
      }

      const response = await axios.put(url, payload, {
        headers: {
          Authorization: token.startsWith("JWT ") ? token : `JWT ${token}`,
          "X-Auth-Type": "JWT"
        }
      });

      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      const status = axios.isAxiosError(error) ? error.response?.status : 500;
      const data = axios.isAxiosError(error) ? error.response?.data : null;

      logger.error(`Error updating network request status: ${message}`, { status, data });
      
      const err = new Error(message) as Error & { status?: number; data?: any };
      err.status = status;
      err.data = data;
      throw err;
    }
  },

  /**
   * Submits a new network creation request. Public endpoint — no auth required.
   */
  submitNetworkRequest: async (data: NetworkRequestValues): Promise<NetworkRequestActionResponse> => {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/devices/network-creation-requests`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const err = new Error("Network request timed out") as Error & {
          status?: number;
          data?: unknown;
        };
        err.status = 504;
        err.data = { message: "Network request timed out" };
        throw err;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed" }));
      const err = new Error(errorData.message || "Request failed") as Error & { status?: number; data?: unknown };
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json();
  },
};
