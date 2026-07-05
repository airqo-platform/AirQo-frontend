/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import { LoginCredentials } from "@/app/types/users";

/** User identity and role-permission assignment. */
export interface UserAdapter {
  loginWithDetails(data: LoginCredentials): Promise<any>;
  getUserDetails(userID: string): Promise<any>;
  getNetworkPermissionsApi(): Promise<any>;
  assignPermissionsToRoleApi(roleID: string, data: { permission_ids: string[] }): Promise<any>;
  removePermissionsFromRoleApi(roleID:string, permissionID:string): Promise<any>;
  updatePermissionsToRoleApi(roleID: string, data: { permission_ids: string[] }): Promise<any>;
}
