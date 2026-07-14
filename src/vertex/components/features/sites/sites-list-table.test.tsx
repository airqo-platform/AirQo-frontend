import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SitesTable from "./sites-list-table";
import { useSites } from "@/core/hooks/useSites";
import type { Site } from "@/app/types/sites";

vi.mock("@/core/hooks/useSites", () => ({
  useSites: vi.fn(),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/admin/sites",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

function mockSites(overrides: Partial<ReturnType<typeof useSites>> = {}) {
  vi.mocked(useSites).mockReturnValue({
    sites: [],
    meta: undefined,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useSites>);
}

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

describe("SitesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no sites", () => {
    mockSites();
    render(<SitesTable />);
    expect(screen.getByText("No sites available")).toBeInTheDocument();
  });

  it("shows an error message when the sites query fails", () => {
    mockSites({ error: { message: "Network Error" } as never });
    render(<SitesTable />);

    expect(screen.getByText("Unable to load sites")).toBeInTheDocument();
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("renders a site row with its status", () => {
    mockSites({ sites: [SITE_A] });
    render(<SitesTable />);

    expect(screen.getByText("kampala road")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("navigates to the site detail page when a row is clicked", async () => {
    mockSites({ sites: [SITE_A] });
    const user = userEvent.setup();
    render(<SitesTable />);

    await user.click(screen.getByText("kampala road"));
    expect(pushMock).toHaveBeenCalledWith("/admin/sites/site-1");
  });

  it("uses a custom base path when provided", async () => {
    mockSites({ sites: [SITE_A] });
    const user = userEvent.setup();
    render(<SitesTable basePath="/sites/overview" />);

    await user.click(screen.getByText("kampala road"));
    expect(pushMock).toHaveBeenCalledWith("/sites/overview/site-1");
  });

  it("calls onSiteClick instead of navigating when provided", async () => {
    mockSites({ sites: [SITE_A] });
    const onSiteClick = vi.fn();
    const user = userEvent.setup();
    render(<SitesTable onSiteClick={onSiteClick} />);

    await user.click(screen.getByText("kampala road"));
    expect(onSiteClick).toHaveBeenCalledWith(expect.objectContaining({ _id: "site-1" }));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
