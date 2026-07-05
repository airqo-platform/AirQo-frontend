/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import { Role } from "@/app/types/roles";

/** Role and permission administration. */
export interface AccessControlAdapter {
  getPermissionsApi(): Promise<any>;
  getRolesApi(): Promise<any>;
  getRolesDetailsApi(roleId: string): Promise<any>;
  getOrgRolesApi(groupId: string): Promise<any>;
  updateRoleDetailsApi(roleId: string, data: Role): Promise<any>;
  createRoleApi(data: any): Promise<any>;
}
