import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CohortDetailsCard from "./cohort-detail-card";
import { useUpdateCohortDetails, useOriginalCohort } from "@/core/hooks/useCohorts";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useUpdateCohortDetails: vi.fn(),
  useOriginalCohort: vi.fn(),
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

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: () => ({ handleCopy: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/cohorts/cohort-1",
}));

function mockUpdateCohort(mutateAsync: (variables: unknown) => Promise<unknown>) {
  vi.mocked(useUpdateCohortDetails).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCohortDetails>);
}

const DEFAULT_PROPS = {
  name: "Kampala Cohort",
  id: "cohort-1",
  visibility: false,
  onShowDetailsModal: vi.fn(),
  loading: false,
  cohort_tags: ["individual"],
};

describe("CohortDetailsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOriginalCohort).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useOriginalCohort>);
  });

  it("renders the cohort's name, id, and tags", () => {
    mockUpdateCohort(vi.fn());
    render(<CohortDetailsCard {...DEFAULT_PROPS} />);

    expect(screen.getByText("Kampala Cohort")).toBeInTheDocument();
    expect(screen.getByText("cohort-1")).toBeInTheDocument();
    expect(screen.getByText("individual")).toBeInTheDocument();
  });

  it("shows None when there are no tags", () => {
    mockUpdateCohort(vi.fn());
    render(<CohortDetailsCard {...DEFAULT_PROPS} cohort_tags={[]} />);

    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("calls onShowDetailsModal when the edit-name button is clicked", async () => {
    mockUpdateCohort(vi.fn());
    const onShowDetailsModal = vi.fn();
    const user = userEvent.setup();
    render(<CohortDetailsCard {...DEFAULT_PROPS} onShowDetailsModal={onShowDetailsModal} />);

    await user.click(screen.getByRole("button", { name: "Edit cohort" }));
    expect(onShowDetailsModal).toHaveBeenCalledTimes(1);
  });

  it("confirms and saves a visibility change", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockUpdateCohort(mutateAsync);
    const user = userEvent.setup();
    render(<CohortDetailsCard {...DEFAULT_PROPS} visibility={false} />);

    await user.click(screen.getByRole("switch"));
    const confirmDialog = screen.getByRole("dialog", { name: "Make cohort public?" });
    await user.click(
      within(confirmDialog).getByRole("button", { name: "Confirm & Publish" })
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        data: { visibility: true },
      });
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Cohort is now public",
        scoped: false,
      });
    });
  });

  it("shows an error banner when the visibility update fails", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("Network Error"));
    mockUpdateCohort(mutateAsync);
    const user = userEvent.setup();
    render(<CohortDetailsCard {...DEFAULT_PROPS} visibility={false} />);

    await user.click(screen.getByRole("switch"));
    const confirmDialog = screen.getByRole("dialog", { name: "Make cohort public?" });
    await user.click(
      within(confirmDialog).getByRole("button", { name: "Confirm & Publish" })
    );

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to update visibility: Network Error",
        scoped: true,
      });
    });
  });

  it("edits tags and saves the change", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    mockUpdateCohort(mutateAsync);
    const user = userEvent.setup();
    render(<CohortDetailsCard {...DEFAULT_PROPS} cohort_tags={["individual"]} />);

    await user.click(screen.getByRole("button", { name: "Edit tags" }));
    const tagsDialog = () => screen.getByRole("dialog", { name: "Edit Cohort Tags" });
    await user.click(within(tagsDialog()).getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "hardware" }));
    // MultiSelectCombobox's popover is `modal`, so while it's open Radix
    // marks the rest of the document aria-hidden (trapping focus/a11y) —
    // selecting an item doesn't auto-close a multi-select, so the parent
    // dialog is invisible to role queries until this popover closes too.
    await user.keyboard("{Escape}");
    await user.click(within(tagsDialog()).getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        cohortId: "cohort-1",
        data: { cohort_tags: ["hardware", "individual"] },
      });
    });
  });

  it("links to the original cohort when this one is tagged as a duplicate", () => {
    mockUpdateCohort(vi.fn());
    vi.mocked(useOriginalCohort).mockReturnValue({
      data: {
        success: true,
        original_cohort: { _id: "original-1", name: "Original Cohort" },
      },
    } as unknown as ReturnType<typeof useOriginalCohort>);

    render(<CohortDetailsCard {...DEFAULT_PROPS} cohort_tags={["duplicate"]} />);

    const link = screen.getByRole("link", { name: "Original Cohort" });
    expect(link).toHaveAttribute("href", "/admin/cohorts/original-1");
  });
});
