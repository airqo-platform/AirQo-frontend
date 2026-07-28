import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GridDetailsCard from "./grid-details-card";
import { useClipboard } from "@/core/hooks/useClipboard";
import type { Grid } from "@/app/types/grids";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

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

describe("GridDetailsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
  });

  it("shows a loading spinner instead of grid details while loading", () => {
    render(<GridDetailsCard grid={GRID} onEdit={vi.fn()} loading />);

    expect(screen.queryByText("Grid Details")).not.toBeInTheDocument();
  });

  it("renders the grid's name, admin level, visibility, and id", () => {
    render(<GridDetailsCard grid={GRID} onEdit={vi.fn()} loading={false} />);

    expect(screen.getByText("Kampala Grid")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("grid-1")).toBeInTheDocument();
  });

  it("shows Private for a non-visible grid", () => {
    render(
      <GridDetailsCard grid={{ ...GRID, visibility: false }} onEdit={vi.fn()} loading={false} />
    );

    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("falls back to a dash when name or admin level is missing", () => {
    render(
      <GridDetailsCard
        grid={{ ...GRID, name: "", admin_level: "" }}
        onEdit={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("calls onEdit when Edit Details is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<GridDetailsCard grid={GRID} onEdit={onEdit} loading={false} />);

    await user.click(screen.getByRole("button", { name: "Edit Details" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("copies the grid id to clipboard", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<GridDetailsCard grid={GRID} onEdit={vi.fn()} loading={false} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    expect(handleCopy).toHaveBeenCalledWith("grid-1");
  });
});
