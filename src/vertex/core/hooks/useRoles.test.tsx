import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRoles, useGroupRoles } from "./useRoles";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { adapter } from "../adapters";

vi.mock("../adapters", () => ({
  adapter: {
    getRolesApi: vi.fn(),
    getOrgRolesApi: vi.fn(),
  },
}));

describe("useRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useRoles", () => {
    it("fetches and returns roles", async () => {
      const mockRoles = [{ _id: "r1", role_name: "Admin" }];
      (adapter.getRolesApi as any).mockResolvedValue({ roles: mockRoles });

      const { result } = renderHookWithProviders(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(mockRoles);
    });
  });

  describe("useGroupRoles", () => {
    it("fetches and returns group roles", async () => {
      const mockGroupRoles = [{ _id: "gr1", role_name: "Group Admin" }];
      (adapter.getOrgRolesApi as any).mockResolvedValue({ group_roles: mockGroupRoles });

      const { result } = renderHookWithProviders(() => useGroupRoles("org-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(adapter.getOrgRolesApi).toHaveBeenCalledWith("org-1");
      expect(result.current.grproles).toEqual(mockGroupRoles);
    });
  });
});
