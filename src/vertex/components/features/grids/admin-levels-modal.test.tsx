import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminLevelsModal } from "./admin-levels-modal";
import { useAdminLevels, useUpdateAdminLevel } from "@/core/hooks/useGrids";
import type { AdminLevel, AdminLevelResponse } from "@/core/apis/grids";

vi.mock("@/core/hooks/useGrids", () => ({
  useAdminLevels: vi.fn(),
  useUpdateAdminLevel: vi.fn(),
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: () => ({ handleCopy: vi.fn() }),
}));

const LEVELS: AdminLevel[] = [
  { _id: "lvl-1", name: "Country" },
  { _id: "lvl-2", name: "Region" },
];

function mockAdminLevels(overrides: Partial<ReturnType<typeof useAdminLevels>> = {}) {
  vi.mocked(useAdminLevels).mockReturnValue({
    adminLevels: [],
    isLoading: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAdminLevels>);
}

function mockUpdateAdminLevel(
  updateSpy: (payload: { levelId: string; data: { name: string } }, options: unknown) => void
) {
  vi.mocked(useUpdateAdminLevel).mockImplementation((options) => ({
    updateAdminLevel: (payload: { levelId: string; data: { name: string } }) =>
      updateSpy(payload, options),
    isLoading: false,
    error: null,
  }));
}

describe("AdminLevelsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading row while admin levels are loading", () => {
    mockAdminLevels({ isLoading: true });
    mockUpdateAdminLevel(vi.fn());
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Loading admin levels...")).toBeInTheDocument();
  });

  it("shows an empty state when there are no admin levels", () => {
    mockAdminLevels();
    mockUpdateAdminLevel(vi.fn());
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("No admin levels found.")).toBeInTheDocument();
  });

  it("renders each admin level's name and id", () => {
    mockAdminLevels({ adminLevels: LEVELS });
    mockUpdateAdminLevel(vi.fn());
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("lvl-1")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("lvl-2")).toBeInTheDocument();
  });

  // Icon-only buttons with no accessible name — the edit trigger is last in DOM order.
  function startEditing(row: HTMLElement) {
    const buttons = within(row).getAllByRole("button");
    return buttons[buttons.length - 1];
  }

  function saveButton(row: HTMLElement) {
    return within(row).getAllByRole("button")[1];
  }

  function cancelButton(row: HTMLElement) {
    const buttons = within(row).getAllByRole("button");
    return buttons[buttons.length - 1];
  }

  it("edits a level's name and saves it", async () => {
    const updateSpy = vi.fn();
    mockAdminLevels({ adminLevels: LEVELS });
    mockUpdateAdminLevel(updateSpy);
    const user = userEvent.setup();
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    const row = screen.getByText("Country").closest("tr")!;
    await user.click(startEditing(row));

    const input = within(row).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Nation");
    await user.click(saveButton(row));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        { levelId: "lvl-1", data: { name: "Nation" } },
        expect.anything()
      );
    });
  });

  it("cancels editing without saving", async () => {
    const updateSpy = vi.fn();
    mockAdminLevels({ adminLevels: LEVELS });
    mockUpdateAdminLevel(updateSpy);
    const user = userEvent.setup();
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    const row = screen.getByText("Country").closest("tr")!;
    await user.click(startEditing(row));

    const input = within(row).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Should not save");
    await user.click(cancelButton(row));

    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.getByText("Country")).toBeInTheDocument();
  });

  it("shows a success banner naming the updated level", async () => {
    const updateSpy = vi.fn((_payload, options) =>
      options?.onSuccess?.({
        success: true,
        message: "updated",
        admin_levels: { _id: "lvl-1", name: "Nation" },
      } satisfies AdminLevelResponse)
    );
    mockAdminLevels({ adminLevels: LEVELS });
    mockUpdateAdminLevel(updateSpy);
    const user = userEvent.setup();
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    const row = screen.getByText("Country").closest("tr")!;
    await user.click(startEditing(row));
    await user.click(saveButton(row));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Admin level updated to 'Nation' successfully",
        severity: "success",
        scoped: true,
      });
    });
  });

  it("shows an error banner when the update fails", async () => {
    const updateSpy = vi.fn((_payload, options) =>
      options?.onError?.(new Error("Network Error"))
    );
    mockAdminLevels({ adminLevels: LEVELS });
    mockUpdateAdminLevel(updateSpy);
    const user = userEvent.setup();
    render(<AdminLevelsModal isOpen onClose={vi.fn()} />);

    const row = screen.getByText("Country").closest("tr")!;
    await user.click(startEditing(row));
    await user.click(saveButton(row));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Failed to update admin level: Network Error",
        severity: "error",
        scoped: true,
      });
    });
  });
});
