import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCohorts, useGroupCohorts } from "./useCohorts";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { cohorts as cohortsApi } from "../apis/cohorts";

vi.mock("../apis/cohorts", () => ({
  cohorts: {
    getCohortsSummary: vi.fn(),
    getGroupCohorts: vi.fn(),
  },
}));

describe("useCohorts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCohorts", () => {
    it("fetches cohorts summary", async () => {
      const mockCohorts = [{ _id: "c1", name: "Cohort 1" }];
      (cohortsApi.getCohortsSummary as any).mockResolvedValue({ cohorts: mockCohorts });

      const { result } = renderHookWithProviders(() => useCohorts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(cohortsApi.getCohortsSummary).toHaveBeenCalled();
      expect(result.current.cohorts).toEqual(mockCohorts);
    });
  });

  describe("useGroupCohorts", () => {
    it("fetches group cohorts", async () => {
      const mockIds = ["c1", "c2"];
      (cohortsApi.getGroupCohorts as any).mockResolvedValue({ data: mockIds });

      const { result } = renderHookWithProviders(() => useGroupCohorts("group-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(cohortsApi.getGroupCohorts).toHaveBeenCalledWith("group-1");
      expect(result.current.data).toEqual(mockIds);
    });
  });
});
