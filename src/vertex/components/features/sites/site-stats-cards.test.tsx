import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SiteStatsCards } from "./site-stats-cards";
import { useSiteStatistics } from "@/core/hooks/useSites";

vi.mock("@/core/hooks/useSites", () => ({
  useSiteStatistics: vi.fn(),
}));

const pushMock = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}));

describe("SiteStatsCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = new URLSearchParams();
  });

  it("renders every metric from the summary", () => {
    vi.mocked(useSiteStatistics).mockReturnValue({
      summary: {
        total_sites: 40,
        operational: 10,
        transmitting: 15,
        not_transmitting: 5,
        data_available: 20,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSiteStatistics>);
    render(<SiteStatsCards />);

    expect(screen.getByText("Total Sites")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Transmitting")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Not Transmitting")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Data Available")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("defaults every metric to zero when there is no summary yet", () => {
    vi.mocked(useSiteStatistics).mockReturnValue({
      summary: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSiteStatistics>);
    render(<SiteStatsCards />);

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("navigates with a status filter when a card is clicked", async () => {
    vi.mocked(useSiteStatistics).mockReturnValue({
      summary: { total_sites: 1, operational: 1, transmitting: 0, not_transmitting: 0, data_available: 0 },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSiteStatistics>);
    const user = userEvent.setup();
    render(<SiteStatsCards />);

    await user.click(screen.getByRole("button", { name: "View operational" }));
    expect(pushMock).toHaveBeenCalledWith("?status=operational");
  });

  it("clears the status filter when Total Sites is clicked", async () => {
    searchParams = new URLSearchParams("status=operational");
    vi.mocked(useSiteStatistics).mockReturnValue({
      summary: { total_sites: 1, operational: 1, transmitting: 0, not_transmitting: 0, data_available: 0 },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSiteStatistics>);
    const user = userEvent.setup();
    render(<SiteStatsCards />);

    await user.click(screen.getByRole("button", { name: "View total sites" }));
    expect(pushMock).toHaveBeenCalledWith("?");
  });
});
