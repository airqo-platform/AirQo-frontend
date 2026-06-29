import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDevices, useDeviceDetails } from "./useDevices";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { adapter } from "../adapters";

vi.mock("../adapters", () => ({
  adapter: {
    getDevices: vi.fn(),
    getDevicesByCohorts: vi.fn(),
    getDevice: vi.fn(),
  },
}));

vi.mock("./useCohorts", () => ({
  useGroupCohorts: vi.fn(() => ({ data: ["cohort-1"], isLoading: false })),
  usePersonalUserCohorts: vi.fn(() => ({ data: ["cohort-1"], isLoading: false })),
}));

describe("useDevices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useDevices", () => {
    it("fetches devices for airqo group", async () => {
      const mockDevices = [{ _id: "d1", name: "Device 1" }];
      (adapter.getDevices as any).mockResolvedValue({ devices: mockDevices });

      const { result } = renderHookWithProviders(() => useDevices(), {
        preloadedState: { user: { activeGroup: { grp_title: "airqo" } } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getDevices).toHaveBeenCalled();
      expect(result.current.devices).toEqual(mockDevices);
    });

    it("fetches devices by cohorts for non-airqo group", async () => {
      const mockDevices = [{ _id: "d2", name: "Device 2" }];
      (adapter.getDevicesByCohorts as any).mockResolvedValue({ devices: mockDevices });

      const { result } = renderHookWithProviders(() => useDevices(), {
        preloadedState: { user: { activeGroup: { _id: "org-1", grp_title: "Other Org" } } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getDevicesByCohorts).toHaveBeenCalledWith(
        expect.objectContaining({ cohort_ids: ["cohort-1"] }),
        expect.any(AbortSignal)
      );
      expect(result.current.devices).toEqual(mockDevices);
    });
  });

  describe("useDeviceDetails", () => {
    it("fetches device details", async () => {
      const mockDevice = { _id: "d1", name: "Device 1" };
      (adapter.getDevice as any).mockResolvedValue(mockDevice);

      const { result } = renderHookWithProviders(() => useDeviceDetails("d1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getDevice).toHaveBeenCalledWith("d1");
      expect(result.current.data).toEqual(mockDevice);
    });
  });
});
