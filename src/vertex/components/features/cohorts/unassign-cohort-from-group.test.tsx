import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnassignCohortFromGroupDialog } from "./unassign-cohort-from-group";
import { useUnassignCohortsFromGroup } from "@/core/hooks/useCohorts";
import type { Group } from "@/app/types/groups";

vi.mock("@/core/hooks/useCohorts", () => ({
  useUnassignCohortsFromGroup: vi.fn(),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

const ORG: Group = { _id: "org-1", grp_title: "AirQo Uganda" } as Group;

function dialog() {
  return within(screen.getByRole("dialog"));
}

function mockUnassign(
  unassignSpy: (variables: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useUnassignCohortsFromGroup).mockImplementation((hookOptions) =>
    ({
      mutate: (variables: unknown, callOptions: unknown) =>
        unassignSpy(variables, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useUnassignCohortsFromGroup>
  );
}

describe("UnassignCohortFromGroupDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("names the organization and cohort in the confirmation copy", () => {
    mockUnassign(vi.fn());
    render(
      <UnassignCohortFromGroupDialog
        open
        onOpenChange={vi.fn()}
        organization={ORG}
        cohortId="cohort-1"
        cohortName="Kampala Cohort"
      />
    );

    expect(dialog().getByText(/AirQo Uganda/)).toBeInTheDocument();
    expect(dialog().getByText(/Kampala Cohort/)).toBeInTheDocument();
  });

  it("disables Confirm Unassign when there is no organization", () => {
    mockUnassign(vi.fn());
    render(
      <UnassignCohortFromGroupDialog
        open
        onOpenChange={vi.fn()}
        organization={null}
        cohortId="cohort-1"
        cohortName="Kampala Cohort"
      />
    );

    expect(
      dialog().getByRole("button", { name: "Confirm Unassign" })
    ).toBeDisabled();
  });

  it("unassigns the organization from the cohort on confirm", async () => {
    const unassignSpy = vi.fn();
    mockUnassign(unassignSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <UnassignCohortFromGroupDialog
        open
        onOpenChange={onOpenChange}
        organization={ORG}
        cohortId="cohort-1"
        cohortName="Kampala Cohort"
      />
    );

    await user.click(dialog().getByRole("button", { name: "Confirm Unassign" }));

    expect(unassignSpy).toHaveBeenCalledWith(
      { groupId: "org-1", cohortIds: ["cohort-1"] },
      expect.anything(),
      expect.anything()
    );
  });

  it("closes the dialog once the unassign call succeeds", async () => {
    const unassignSpy = vi.fn((_variables, _hookOptions, callOptions) =>
      callOptions?.onSuccess?.()
    );
    mockUnassign(unassignSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <UnassignCohortFromGroupDialog
        open
        onOpenChange={onOpenChange}
        organization={ORG}
        cohortId="cohort-1"
        cohortName="Kampala Cohort"
      />
    );

    await user.click(dialog().getByRole("button", { name: "Confirm Unassign" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
