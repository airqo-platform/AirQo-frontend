import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GridsTable from "./grids-list-table";
import { useGrids } from "@/core/hooks/useGrids";
import type { Grid } from "@/app/types/grids";

vi.mock("@/core/hooks/useGrids", () => ({
  useGrids: vi.fn(),
}));

const pushMock = vi.fn();
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/admin/grids",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

function mockGrids(overrides: Partial<ReturnType<typeof useGrids>> = {}) {
  vi.mocked(useGrids).mockReturnValue({
    grids: [],
    meta: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useGrids>);
}

const GRID_A: Grid = {
  _id: "grid-1",
  name: "kampala grid",
  admin_level: "City",
  visibility: true,
  network: "airqo",
  long_name: "kampala grid",
  createdAt: "2026-06-01T10:30:00.000Z",
  sites: [],
  numberOfSites: 5,
};

const GRID_B: Grid = {
  _id: "grid-2",
  name: "hidden grid",
  admin_level: "Region",
  visibility: false,
  network: "airqo",
  long_name: "hidden grid",
  createdAt: "2026-06-02T08:00:00.000Z",
  sites: [],
  numberOfSites: 0,
};

describe("GridsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no grids", () => {
    mockGrids();
    render(<GridsTable />);

    expect(screen.getByText("No grids available")).toBeInTheDocument();
  });

  it("shows an error message when the grids query fails", () => {
    mockGrids({ error: { message: "Network Error" } as never });
    render(<GridsTable />);

    expect(screen.getByText("Unable to load grids")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("renders grid name (uppercased), site count, admin level, visibility, and date", () => {
    mockGrids({ grids: [GRID_A, GRID_B] });
    render(<GridsTable />);

    expect(screen.getByText("KAMPALA GRID")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();

    expect(screen.getByText("HIDDEN GRID")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });

  it("navigates to the grid detail page when a row is clicked", async () => {
    mockGrids({ grids: [GRID_A] });
    const user = userEvent.setup();
    render(<GridsTable />);

    await user.click(screen.getByText("KAMPALA GRID"));
    expect(pushMock).toHaveBeenCalledWith("/admin/grids/grid-1");
  });

  it("calls onGridClick instead of navigating when provided", async () => {
    mockGrids({ grids: [GRID_A] });
    const onGridClick = vi.fn();
    const user = userEvent.setup();
    render(<GridsTable onGridClick={onGridClick} />);

    await user.click(screen.getByText("KAMPALA GRID"));
    expect(onGridClick).toHaveBeenCalledWith(expect.objectContaining(GRID_A));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
