import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClientPaginatedSitesTable from "./client-paginated-sites-table";
import type { Site } from "@/app/types/sites";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/admin/sites",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

const SITE_A: Site = {
  _id: "site-1",
  name: "kampala road",
  generated_name: "site_0001",
  description: "near the taxi park",
  country: "uganda",
  district: "kampala",
  isOnline: true,
  rawOnlineStatus: true,
};

const SITE_B: Site = {
  _id: "site-2",
  name: "entebbe road",
  generated_name: "site_0002",
  description: "",
  country: "uganda",
  district: "wakiso",
  isOnline: false,
  rawOnlineStatus: false,
};

describe("ClientPaginatedSitesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no sites", () => {
    render(<ClientPaginatedSitesTable sites={[]} />);
    expect(screen.getByText("No sites available")).toBeInTheDocument();
  });

  it("shows an error message when loading failed", () => {
    render(
      <ClientPaginatedSitesTable sites={[]} error={new Error("Network Error")} />
    );

    expect(screen.getByText("Unable to load sites")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("renders site rows with name, country, district, and status", () => {
    render(<ClientPaginatedSitesTable sites={[SITE_A, SITE_B]} />);

    expect(screen.getByText("kampala road")).toBeInTheDocument();
    expect(screen.getAllByText("uganda")).toHaveLength(2);
    expect(screen.getByText("kampala")).toBeInTheDocument();
    expect(screen.getByText("wakiso")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Not Transmitting")).toBeInTheDocument();
  });

  it("navigates to the site detail page when a row is clicked", async () => {
    const user = userEvent.setup();
    render(<ClientPaginatedSitesTable sites={[SITE_A]} />);

    await user.click(screen.getByText("kampala road"));
    expect(pushMock).toHaveBeenCalledWith("/admin/sites/site-1");
  });

  it("calls onSiteClick instead of navigating when provided", async () => {
    const onSiteClick = vi.fn();
    const user = userEvent.setup();
    render(<ClientPaginatedSitesTable sites={[SITE_A]} onSiteClick={onSiteClick} />);

    await user.click(screen.getByText("kampala road"));
    expect(onSiteClick).toHaveBeenCalledWith(expect.objectContaining({ _id: "site-1" }));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
