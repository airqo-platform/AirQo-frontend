import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSites, useSiteDetails } from "./useSites";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { adapter } from "../adapters";

vi.mock("../adapters", () => ({
  adapter: {
    getSites: vi.fn(),
    getSitesByCohorts: vi.fn(),
    getSite: vi.fn(),
  },
}));

vi.mock("./useCohorts", () => ({
  useGroupCohorts: vi.fn(() => ({ data: ["cohort-1"], isLoading: false })),
  usePersonalUserCohorts: vi.fn(() => ({ data: ["cohort-1"], isLoading: false })),
}));

describe("useSites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useSites", () => {
    it("fetches sites for airqo group without cohorts", async () => {
      const mockSites = [{ _id: "s1", name: "Site 1" }];
      (adapter.getSites as any).mockResolvedValue({ sites: mockSites });

      const { result } = renderHookWithProviders(() => useSites(), {
        preloadedState: { user: { activeGroup: { grp_title: "airqo" } } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getSites).toHaveBeenCalled();
      expect(result.current.sites).toEqual(mockSites);
    });

    it("fetches sites by cohorts for non-airqo group", async () => {
      const mockSites = [{ _id: "s2", name: "Site 2" }];
      (adapter.getSitesByCohorts as any).mockResolvedValue({ sites: mockSites });

      const { result } = renderHookWithProviders(() => useSites(), {
        preloadedState: { user: { activeGroup: { _id: "org-1", grp_title: "Other Org" } } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getSitesByCohorts).toHaveBeenCalledWith(
        expect.objectContaining({ cohort_ids: ["cohort-1"] }),
        expect.any(AbortSignal)
      );
      expect(result.current.sites).toEqual(mockSites);
    });
  });

  describe("useSiteDetails", () => {
    it("fetches site details", async () => {
      const mockSite = { _id: "s1", name: "Site 1" };
      (adapter.getSite as any).mockResolvedValue({ data: mockSite });

      const { result } = renderHookWithProviders(() => useSiteDetails("s1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getSite).toHaveBeenCalledWith("s1");
      expect(result.current.data).toEqual(mockSite);
    });
  });
});
