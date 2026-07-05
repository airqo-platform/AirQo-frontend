/* eslint-disable @typescript-eslint/no-explicit-any --
 * v1 contract preserves the legacy loose response types; tightening
 * these into precise DTOs is tracked for the v2 adapter contract. */

import { Cohort, CohortsSummaryResponse, GroupCohortsResponse, OriginalCohortResponse, PersonalUserCohortsResponse } from "@/app/types/cohorts";

export interface GetCohortsSummaryParams {
  network?: string;
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  cohort_id?: string[];
  tags?: string;
}

/** Cohorts: logical device groupings used for scoping and sharing. */
export interface CohortAdapter {
  getCohortsSummary(params: GetCohortsSummaryParams, signal?: AbortSignal): Promise<CohortsSummaryResponse>;
  getUserCohortsSummary(params: GetCohortsSummaryParams, signal?: AbortSignal): Promise<CohortsSummaryResponse>;
  getCohortDetailsApi(cohortId: string): Promise<any>;
  createCohort(payload: { name: string; network: string; cohort_tags?: string[] }): Promise<any>;
  assignCohortsToGroup(groupId: string, cohortIds: string[]): Promise<any>;
  unassignCohortsFromGroup(groupId: string, cohortIds: string[]): Promise<any>;
  assignCohortsToUser(userId: string, cohortIds: string[]): Promise<any>;
  updateCohortDetailsApi(cohortId: string, cohortData: Partial<Cohort>): Promise<any>;
  updateCohortNameApi(cohortId: string, payload: { name: string; confirm_update: boolean; update_reason: string }): Promise<any>;
  createCohortFromCohorts(payload: { name: string; description?: string; cohort_ids: string[]; network?: string; cohort_tags?: string[] }): Promise<any>;
  assignDevicesToCohort(cohortId: string, deviceIds: string[]): Promise<any>;
  unassignDevicesFromCohort(params: { cohortId: string; device_ids: string[] }): Promise<any>;
  getGroupCohorts(groupId: string): Promise<GroupCohortsResponse>;
  verifyCohortIdApi(cohortId: string): Promise<any>;
  getOriginalCohortApi(cohortId: string): Promise<OriginalCohortResponse>;
  getPersonalUserCohorts(userId: string, signal?: AbortSignal): Promise<PersonalUserCohortsResponse>;
}
