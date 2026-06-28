import { describe, it, expect, vi, beforeEach } from "vitest";
import { networkService } from "./network-service";
import axios from "axios";
import { mockAxiosSuccess, mockAxiosError, mockFetchSuccess, mockFetchError } from "@/test/factories/apiResponseFactory";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios") as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
      put: vi.fn(),
      isAxiosError: vi.fn().mockReturnValue(true),
    }
  };
});
vi.mock("@/lib/api-routing", () => ({
  buildServerApiUrl: vi.fn((path) => `https://api.airqo.net/v2${path}`),
}));

describe("network-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("getNetworkCreationRequests", () => {
    it("returns requests on success", async () => {
      vi.mocked(axios.get).mockResolvedValueOnce(
        mockAxiosSuccess({ network_creation_requests: [{ _id: "1" }] })
      );

      const requests = await networkService.getNetworkCreationRequests("test-token", "test-secret");
      expect(requests).toHaveLength(1);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("admin_secret=test-secret"),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "JWT test-token" })
        })
      );
    });

    it("throws NOT_FOUND on 404", async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(mockAxiosError(404, "Not found"));

      await expect(
        networkService.getNetworkCreationRequests("token", "secret")
      ).rejects.toThrow("NOT_FOUND");
    });
  });

  describe("updateNetworkRequestStatus", () => {
    it("updates status with notes successfully", async () => {
      vi.mocked(axios.put).mockResolvedValueOnce(mockAxiosSuccess({ success: true }));

      const res = await networkService.updateNetworkRequestStatus("1", "approve", "Looks good", "token", "secret");
      expect(res.success).toBe(true);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/1/approve?admin_secret=secret"),
        { admin_secret: "secret", reviewer_notes: "Looks good" },
        expect.any(Object)
      );
    });

    it("handles errors correctly", async () => {
      vi.mocked(axios.put).mockRejectedValueOnce(mockAxiosError(400, "Bad Request", { message: "Invalid action" }));

      const promise = networkService.updateNetworkRequestStatus("1", "approve", "", "token", "secret");
      await expect(promise).rejects.toThrow("Invalid action");
      await expect(promise).rejects.toMatchObject({
        status: 400,
        data: { message: "Invalid action" },
      });
    });
  });

  describe("submitNetworkRequest", () => {
    it("submits successfully", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(mockFetchSuccess({ success: true }));

      const data = { network_name: "Test Net", website: "test.com" } as any;
      const res = await networkService.submitNetworkRequest(data);
      expect(res.success).toBe(true);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "POST", body: JSON.stringify(data) })
      );
    });

    it("throws on non-ok fetch response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(mockFetchError(500, { message: "Server error" }));

      const data = { network_name: "Test Net" } as any;
      
      const promise = networkService.submitNetworkRequest(data);
      await expect(promise).rejects.toThrow("Server error");
      await expect(promise).rejects.toMatchObject({ status: 500 });
    });

    it("throws on timeout", async () => {
      // Simulate an AbortError as thrown by AbortController signal
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      vi.mocked(global.fetch).mockRejectedValueOnce(abortError);

      const data = { network_name: "Test Net" } as any;
      
      const promise = networkService.submitNetworkRequest(data);
      await expect(promise).rejects.toThrow("Network request timed out");
      await expect(promise).rejects.toMatchObject({ status: 504 });
    });
  });
});
