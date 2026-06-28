import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGroups, useGroupsByCohort, useGroupDetails } from "./useGroups";
import { groupsApi } from "../apis/organizations";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";

vi.mock("../apis/organizations", () => ({
  groupsApi: {
    getGroupsApi: vi.fn(),
    getGroupsByCohortApi: vi.fn(),
    getGroupDetailsApi: vi.fn(),
  },
}));

describe("useGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useGroups", () => {
    it("fetches and returns groups", async () => {
      const mockGroups = [{ _id: "g1", grp_title: "Group 1" }];
      (groupsApi.getGroupsApi as any).mockResolvedValue({ groups: mockGroups });

      const { result } = renderHookWithProviders(() => useGroups());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.groups).toEqual(mockGroups);
      expect(result.current.error).toBeNull();
    });

    it("handles errors", async () => {
      const error = new Error("Failed to fetch");
      (groupsApi.getGroupsApi as any).mockRejectedValue(error);

      const { result } = renderHookWithProviders(() => useGroups());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.groups).toEqual([]);
    });
  });

  describe("useGroupsByCohort", () => {
    it("fetches groups for a cohort", async () => {
      const mockGroups = [{ _id: "g2", grp_title: "Cohort Group" }];
      (groupsApi.getGroupsByCohortApi as any).mockResolvedValue({ groups: mockGroups });

      const { result } = renderHookWithProviders(() => useGroupsByCohort("cohort-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(groupsApi.getGroupsByCohortApi).toHaveBeenCalledWith("cohort-1");
      expect(result.current.groups).toEqual(mockGroups);
    });
  });
});
