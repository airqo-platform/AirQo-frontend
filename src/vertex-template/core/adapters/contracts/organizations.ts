/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import { CohortGroupsResponse } from "@/app/types/groups";

/** Organizations (groups) the user belongs to. */
export interface OrganizationAdapter {
  getGroupsApi(): Promise<any>;
  getGroupsByCohortApi(cohortId: string): Promise<CohortGroupsResponse>;
  updateGroupOnboardingApi(groupId: string, payload: { action: 'mark_step_complete' | 'dismiss_checklist'; step_id?: string }): Promise<any>;
  getGroupDetailsApi(groupId: string): Promise<any>;
}
