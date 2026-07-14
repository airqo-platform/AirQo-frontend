import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CohortDetailsModal from "./edit-cohort-details-modal";
import { useUpdateCohortDetails, useUpdateCohortName } from "@/core/hooks/useCohorts";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useUpdateCohortDetails: vi.fn(),
  useUpdateCohortName: vi.fn(),
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

function dialog() {
  return within(screen.getByRole("dialog"));
}

// ReusableDialog auto-focuses the first focusable element 100ms after
// opening; typing that straddles that window gets its focus yanked back
// mid-field. Wait it out before typing.
async function settleDialogFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

async function selectTag(user: ReturnType<typeof userEvent.setup>, tag: string) {
  await user.click(dialog().getAllByRole("combobox")[0]);
  await user.click(screen.getByRole("option", { name: tag }));
  await user.keyboard("{Escape}");
}

const NON_ORG_COHORT = {
  name: "Combined Cohort",
  id: "cohort-1",
  visibility: false,
  cohort_tags: ["individual"],
};

const ORG_COHORT = {
  name: "nairobi_wri",
  id: "cohort-1",
  visibility: false,
  cohort_tags: ["organizational"],
};

const LEGACY_ORG_COHORT = {
  name: "Nairobi WRI Cohort",
  id: "cohort-1",
  visibility: false,
  cohort_tags: ["organizational"],
};

function mockMutations({
  updateName = vi.fn().mockResolvedValue(undefined),
  updateDetails = vi.fn().mockResolvedValue(undefined),
}: {
  updateName?: ReturnType<typeof vi.fn>;
  updateDetails?: ReturnType<typeof vi.fn>;
} = {}) {
  vi.mocked(useUpdateCohortName).mockReturnValue({
    mutateAsync: updateName,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCohortName>);
  vi.mocked(useUpdateCohortDetails).mockReturnValue({
    mutateAsync: updateDetails,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCohortDetails>);
  return { updateName, updateDetails };
}

describe("CohortDetailsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables Save when nothing has changed", async () => {
    mockMutations();
    render(<CohortDetailsModal open cohortDetails={NON_ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    expect(dialog().getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("saves a renamed non-organizational cohort via useUpdateCohortDetails", async () => {
    const { updateDetails } = mockMutations();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={NON_ORG_COHORT} onClose={onClose} />);
    await settleDialogFocus();

    const nameField = dialog().getByLabelText(/^Cohort name/);
    await user.clear(nameField);
    await user.type(nameField, "New Cohort Name");

    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateDetails).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        data: { name: "New Cohort Name", cohort_tags: ["individual"] },
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(showBannerWithDelayMock).toHaveBeenCalledWith({
      severity: "success",
      message: "Cohort details updated successfully",
      scoped: false,
    });
  });

  it("saves tags-only changes for a non-organizational cohort without requiring a reason", async () => {
    const { updateDetails } = mockMutations();
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={NON_ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    await selectTag(user, "hardware");
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateDetails).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        data: { cohort_tags: ["hardware", "individual"] },
      });
    });
  });

  it("requires an update reason before renaming a structured organizational cohort", async () => {
    mockMutations();
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    await user.clear(dialog().getByLabelText(/^Project name/));
    await user.type(dialog().getByLabelText(/^Project name/), "AirQo");

    expect(dialog().getByRole("button", { name: "Save" })).toBeDisabled();

    await user.type(dialog().getByLabelText(/^Update reason/), "Rebranding project");
    expect(dialog().getByRole("button", { name: "Save" })).not.toBeDisabled();
  });

  it("renames a structured organizational cohort, using both mutations when tags also changed", async () => {
    const { updateName, updateDetails } = mockMutations();
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    await user.clear(dialog().getByLabelText(/^Project name/));
    await user.type(dialog().getByLabelText(/^Project name/), "AirQo");
    await selectTag(user, "hardware");
    await user.type(dialog().getByLabelText(/^Update reason/), "Rebranding project");

    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateName).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        name: "nairobi_airqo",
        updateReason: "Rebranding project",
      });
    });
    await waitFor(() => {
      expect(updateDetails).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        data: { cohort_tags: ["hardware", "organizational"] },
      });
    });
  });

  it("shows the plain name field with a legacy notice for unstructured organizational names", async () => {
    mockMutations();
    render(<CohortDetailsModal open cohortDetails={LEGACY_ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    expect(dialog().getByLabelText(/^Cohort name/)).toHaveValue("Nairobi WRI Cohort");
    expect(
      screen.getByText("Legacy cohort name detected. Update will preserve this format.")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^City/)).not.toBeInTheDocument();
  });

  it("shows an error banner when saving fails", async () => {
    const updateDetails = vi.fn().mockRejectedValue(new Error("Network Error"));
    mockMutations({ updateDetails });
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={NON_ORG_COHORT} onClose={vi.fn()} />);
    await settleDialogFocus();

    const nameField = dialog().getByLabelText(/^Cohort name/);
    await user.clear(nameField);
    await user.type(nameField, "New Cohort Name");
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to update cohort: Network Error",
        scoped: true,
      });
    });
  });

  it("resets the form and closes on Cancel", async () => {
    mockMutations();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CohortDetailsModal open cohortDetails={NON_ORG_COHORT} onClose={onClose} />);
    await settleDialogFocus();

    const nameField = dialog().getByLabelText(/^Cohort name/);
    await user.type(nameField, " edited");
    await user.click(dialog().getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
