import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditGridDetailsDialog from "./edit-grid-details-dialog";
import { useUpdateGridDetails } from "@/core/hooks/useGrids";
import type { Grid } from "@/app/types/grids";

vi.mock("@/core/hooks/useGrids", () => ({
  useUpdateGridDetails: vi.fn(),
}));

let grantedPermissions = new Set<string>(["SITE_UPDATE"]);
vi.mock("@/core/hooks/usePermissions", () => ({
  usePermission: (permission: string) => grantedPermissions.has(permission),
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

// jsdom doesn't implement scrollIntoView, which ReusableSelectInput uses.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const GRID: Grid = {
  _id: "grid-1",
  name: "Kampala Grid",
  admin_level: "City",
  visibility: true,
  network: "airqo",
  long_name: "Kampala Grid",
  createdAt: "2026-06-01T00:00:00.000Z",
  sites: [],
  numberOfSites: 3,
};

function dialog() {
  return within(screen.getByRole("dialog"));
}

function mockUpdateGridDetails(updateSpy: (updates: unknown, options: unknown) => void) {
  vi.mocked(useUpdateGridDetails).mockImplementation((_gridId, options) => ({
    updateGridDetails: (async (updates: unknown) => {
      updateSpy(updates, options);
      return GRID;
    }) as ReturnType<typeof useUpdateGridDetails>["updateGridDetails"],
    isLoading: false,
    error: null,
  }));
}

describe("EditGridDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grantedPermissions = new Set(["SITE_UPDATE"]);
  });

  it("renders pre-filled with the grid's current name, admin level, and visibility", () => {
    mockUpdateGridDetails(vi.fn());
    render(<EditGridDetailsDialog open grid={GRID} onClose={vi.fn()} />);

    expect(dialog().getByText("Edit Grid Details")).toBeInTheDocument();
    expect(dialog().getByLabelText(/Grid Name/)).toHaveValue("Kampala Grid");
    expect(dialog().getByLabelText(/Admin Level/)).toHaveValue("City");
    expect(dialog().getByRole("button", { name: /Visibility/ })).toHaveTextContent("Public");
  });

  it("disables Save when the user lacks SITE.UPDATE permission", () => {
    grantedPermissions = new Set();
    mockUpdateGridDetails(vi.fn());
    render(<EditGridDetailsDialog open grid={GRID} onClose={vi.fn()} />);

    expect(dialog().getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("disables Save when name or admin level is emptied out", async () => {
    mockUpdateGridDetails(vi.fn());
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={vi.fn()} />);

    await user.clear(dialog().getByLabelText(/Grid Name/));
    expect(dialog().getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("closes without saving when no changes were made", async () => {
    const updateSpy = vi.fn();
    mockUpdateGridDetails(updateSpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={onClose} />);

    await user.click(dialog().getByRole("button", { name: "Save" }));

    expect(updateSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("saves the changed name alongside the (always-included) admin level", async () => {
    const updateSpy = vi.fn();
    mockUpdateGridDetails(updateSpy);
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={vi.fn()} />);

    const nameInput = dialog().getByLabelText(/Grid Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Grid");
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { admin_level: "City", name: "Renamed Grid" },
        expect.anything()
      );
    });
  });

  it("includes visibility in the update only when it changed", async () => {
    const updateSpy = vi.fn();
    mockUpdateGridDetails(updateSpy);
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={vi.fn()} />);

    await user.click(dialog().getByRole("button", { name: /Visibility/ }));
    await user.click(dialog().getByRole("option", { name: "Private" }));
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { admin_level: "City", visibility: false },
        expect.anything()
      );
    });
  });

  it("shows a success banner and closes when the update succeeds", async () => {
    const updateSpy = vi.fn((_updates, options) => options?.onSuccess?.());
    mockUpdateGridDetails(updateSpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={onClose} />);

    const nameInput = dialog().getByLabelText(/Grid Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Grid");
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        message: "Grid details updated successfully",
        severity: "success",
        scoped: false,
      });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error banner and keeps the dialog open when the update fails", async () => {
    const updateSpy = vi.fn((_updates, options) =>
      options?.onError?.(new Error("Network Error"))
    );
    mockUpdateGridDetails(updateSpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditGridDetailsDialog open grid={GRID} onClose={onClose} />);

    const nameInput = dialog().getByLabelText(/Grid Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Grid");
    await user.click(dialog().getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Failed to update grid: Network Error",
        severity: "error",
        scoped: true,
      });
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
