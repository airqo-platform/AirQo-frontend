import type { AssignDevicesToCohortResponse } from "@/core/apis/cohorts";
import type { BannerSeverity } from "@/components/ui/banner";

export interface CohortAssignmentOutcome {
  severity: BannerSeverity;
  message: string;
}

/**
 * Turns the assign-devices API response into the banner the user should see.
 *
 * The response reports which devices were newly attached and which were already
 * in the cohort, so a request can succeed while changing nothing. Reporting the
 * submitted count instead would tell a user that devices were assigned when the
 * call was a no-op.
 *
 * `requestedCount` is only used when the backend returns no breakdown at all
 * (older deployments), where the submitted count remains the best estimate.
 */
export const getCohortAssignmentOutcome = (
  data: AssignDevicesToCohortResponse | undefined,
  requestedCount: number
): CohortAssignmentOutcome => {
  const assigned = data?.updated_cohort?.assigned;
  const alreadyAssigned = data?.updated_cohort?.already_assigned;

  if (!Array.isArray(assigned) && !Array.isArray(alreadyAssigned)) {
    return {
      severity: "success",
      message: `${requestedCount} device(s) assigned to cohort successfully`,
    };
  }

  const assignedCount = assigned?.length ?? 0;
  const skippedCount = alreadyAssigned?.length ?? 0;

  if (assignedCount === 0 && skippedCount === 0) {
    return {
      severity: "info",
      message: "No devices were assigned to the cohort",
    };
  }

  if (assignedCount === 0) {
    return {
      severity: "info",
      message:
        skippedCount === 1
          ? "Device is already assigned to this cohort"
          : `${skippedCount} device(s) were already assigned and skipped`,
    };
  }

  if (skippedCount === 0) {
    return {
      severity: "success",
      message: `${assignedCount} device(s) assigned to cohort successfully`,
    };
  }

  return {
    severity: "success",
    message: `${assignedCount} device(s) assigned to cohort successfully, ${skippedCount} already assigned and skipped`,
  };
};
