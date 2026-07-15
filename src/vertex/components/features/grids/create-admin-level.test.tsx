import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateAdminLevel } from "./create-admin-level";
import { useCreateAdminLevel } from "@/core/hooks/useGrids";

vi.mock("@/core/hooks/useGrids", () => ({
  useCreateAdminLevel: vi.fn(),
}));

// AdminLevelsModal (opened from the "View Admin Levels" menu item) has its
// own dedicated test file — stub it here so this file stays focused on
// CreateAdminLevel's own trigger/form/menu wiring.
vi.mock("./admin-levels-modal", () => ({
  AdminLevelsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="admin-levels-modal" /> : null,
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

function mockCreateAdminLevel(createSpy: (data: { name: string }, options: unknown) => void) {
  vi.mocked(useCreateAdminLevel).mockImplementation((options) => ({
    createAdminLevel: (data: { name: string }) => createSpy(data, options),
    isLoading: false,
    error: null,
  }));
}

describe("CreateAdminLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the admin levels list from the overflow menu", async () => {
    mockCreateAdminLevel(vi.fn());
    const user = userEvent.setup();
    render(<CreateAdminLevel />);

    expect(screen.queryByTestId("admin-levels-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Grid actions" }));
    await user.click(screen.getByText("View Admin Levels"));

    expect(screen.getByTestId("admin-levels-modal")).toBeInTheDocument();
  });

  it("opens the create dialog and validates the name field", async () => {
    const createSpy = vi.fn();
    mockCreateAdminLevel(createSpy);
    const user = userEvent.setup();
    render(<CreateAdminLevel />);

    await user.click(screen.getByRole("button", { name: "New Admin Level" }));
    expect(dialog().getByText("New Admin Level")).toBeInTheDocument();

    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(
        dialog().getByText("Admin level name must be at least 2 characters.")
      ).toBeInTheDocument();
    });
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("submits a valid name, shows a success banner, and closes", async () => {
    const createSpy = vi.fn((_data, options) => options?.onSuccess?.());
    mockCreateAdminLevel(createSpy);
    const user = userEvent.setup();
    render(<CreateAdminLevel />);

    await user.click(screen.getByRole("button", { name: "New Admin Level" }));
    await user.type(dialog().getByLabelText(/Admin level name/), "Municipality");
    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({ name: "Municipality" }, expect.anything());
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        message: "Admin level created successfully",
        severity: "success",
        scoped: false,
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error banner and keeps the dialog open when creation fails", async () => {
    const createSpy = vi.fn((_data, options) =>
      options?.onError?.(new Error("Network Error"))
    );
    mockCreateAdminLevel(createSpy);
    const user = userEvent.setup();
    render(<CreateAdminLevel />);

    await user.click(screen.getByRole("button", { name: "New Admin Level" }));
    await user.type(dialog().getByLabelText(/Admin level name/), "Municipality");
    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Failed to create admin level: Network Error",
        severity: "error",
        scoped: true,
      });
    });
    expect(dialog().getByText("New Admin Level")).toBeInTheDocument();
  });
});
