import { describe, it, expect } from "vitest";
import { getCohortAssignmentOutcome } from "./cohortAssignment";

describe("getCohortAssignmentOutcome", () => {
  it("reports the newly-assigned count when every device was assigned", () => {
    expect(
      getCohortAssignmentOutcome(
        {
          success: true,
          updated_cohort: { assigned: ["d1", "d2"], already_assigned: [] },
        },
        2
      )
    ).toEqual({
      severity: "success",
      message: "2 device(s) assigned to cohort successfully",
    });
  });

  it("reports a single already-assigned device as a no-op, not a success", () => {
    expect(
      getCohortAssignmentOutcome(
        {
          success: true,
          updated_cohort: { assigned: [], already_assigned: ["d1"] },
        },
        1
      )
    ).toEqual({
      severity: "info",
      message: "Device is already assigned to this cohort",
    });
  });

  it("pluralises the message when several devices were already assigned", () => {
    expect(
      getCohortAssignmentOutcome(
        {
          success: true,
          updated_cohort: { assigned: [], already_assigned: ["d1", "d2"] },
        },
        2
      )
    ).toEqual({
      severity: "info",
      message: "2 device(s) were already assigned and skipped",
    });
  });

  it("combines both counts for a partial assignment", () => {
    expect(
      getCohortAssignmentOutcome(
        {
          success: true,
          updated_cohort: { assigned: ["d1"], already_assigned: ["d2", "d3"] },
        },
        3
      )
    ).toEqual({
      severity: "success",
      message:
        "1 device(s) assigned to cohort successfully, 2 already assigned and skipped",
    });
  });

  it("counts only what the API reports, ignoring the submitted count", () => {
    // The submitted count (5) must not leak into the message when the backend
    // says only one device was actually attached.
    expect(
      getCohortAssignmentOutcome(
        { success: true, updated_cohort: { assigned: ["d1"] } },
        5
      ).message
    ).toBe("1 device(s) assigned to cohort successfully");
  });

  it("falls back to the submitted count when the API omits the breakdown", () => {
    expect(getCohortAssignmentOutcome({ success: true }, 3)).toEqual({
      severity: "success",
      message: "3 device(s) assigned to cohort successfully",
    });
    expect(getCohortAssignmentOutcome(undefined, 1)).toEqual({
      severity: "success",
      message: "1 device(s) assigned to cohort successfully",
    });
  });

  it("does not claim success when the API reports both lists empty", () => {
    expect(
      getCohortAssignmentOutcome(
        {
          success: true,
          updated_cohort: { assigned: [], already_assigned: [] },
        },
        2
      )
    ).toEqual({
      severity: "info",
      message: "No devices were assigned to the cohort",
    });
  });
});
