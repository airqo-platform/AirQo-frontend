import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignCohortsToGroupDialog } from "./assign-cohorts-to-group";
import { useAssignCohortsToGroup, useCohorts } from "@/core/hooks/useCohorts";
import { useGroups } from "@/core/hooks/useGroups";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useAssignCohortsToGroup: vi.fn(),
  useCohorts: vi.fn(),
}));

vi.mock("@/core/hooks/useGroups", () => ({
  useGroups: vi.fn(),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

function dialog() {
  return within(screen.getByRole("dialog"));
}

/** Organization (ComboBox) renders before Cohorts (MultiSelectCombobox); neither has a distinct accessible name. */
function organizationCombobox() {
  return dialog().getAllByRole("combobox")[0];
}

function mockAssignToGroup(
  assignSpy: (variables: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useAssignCohortsToGroup).mockImplementation(() =>
    ({
      mutate: (variables: unknown, callOptions: unknown) =>
        assignSpy(variables, undefined, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useAssignCohortsToGroup>
  );
}

const COHORTS = [
  { _id: "cohort-1", name: "Kampala Cohort" },
  { _id: "cohort-2", name: "Entebbe Cohort" },
];

const GROUPS = [
  { _id: "group-1", grp_title: "AirQo Uganda" },
  { _id: "group-2", grp_title: "AirQo Kenya" },
];

describe("AssignCohortsToGroupDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCohorts).mockReturnValue({
      cohorts: COHORTS,
    } as unknown as ReturnType<typeof useCohorts>);
    vi.mocked(useGroups).mockReturnValue({
      groups: GROUPS,
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
  });

  it("disables Assign until an organization and at least one cohort are selected", () => {
    mockAssignToGroup(vi.fn());
    render(
      <AssignCohortsToGroupDialog
        open
        onOpenChange={vi.fn()}
        initialSelectedCohortIds={[]}
      />
    );

    expect(dialog().getByRole("button", { name: "Assign" })).toBeDisabled();
  });

  it("assigns the selected cohorts to the chosen organization", async () => {
    const assignSpy = vi.fn();
    mockAssignToGroup(assignSpy);
    const user = userEvent.setup();
    render(
      <AssignCohortsToGroupDialog
        open
        onOpenChange={vi.fn()}
        initialSelectedCohortIds={["cohort-1"]}
      />
    );

    await user.click(organizationCombobox());
    await user.click(screen.getByText("AirQo Kenya"));

    await user.click(dialog().getByRole("button", { name: "Assign" }));

    expect(assignSpy).toHaveBeenCalledWith(
      { groupId: "group-2", cohortIds: ["cohort-1"] },
      undefined,
      expect.anything()
    );
  });

  it("closes the dialog once the assignment succeeds", async () => {
    const assignSpy = vi.fn((_variables, _hookOptions, callOptions) =>
      callOptions?.onSuccess?.()
    );
    mockAssignToGroup(assignSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AssignCohortsToGroupDialog
        open
        onOpenChange={onOpenChange}
        initialSelectedCohortIds={["cohort-1"]}
      />
    );

    await user.click(organizationCombobox());
    await user.click(screen.getByText("AirQo Uganda"));
    await user.click(dialog().getByRole("button", { name: "Assign" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
