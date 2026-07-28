import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SiteActivityCard from "./site-activity-card";
import { useSiteActivitiesInfinite } from "@/core/hooks/useSites";
import type { DeviceActivity } from "@/core/apis/devices";

vi.mock("@/core/hooks/useSites", () => ({
  useSiteActivitiesInfinite: vi.fn(),
}));

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: () => ({ handleCopy: vi.fn() }),
}));

// jsdom doesn't implement IntersectionObserver, which the infinite-scroll
// sentinel relies on.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

function mockActivities(overrides: Partial<ReturnType<typeof useSiteActivitiesInfinite>> = {}) {
  vi.mocked(useSiteActivitiesInfinite).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  } as unknown as ReturnType<typeof useSiteActivitiesInfinite>);
}

const ACTIVITY: DeviceActivity = {
  _id: "activity-1",
  device: "airqo_g1",
  date: "2026-06-01T10:00:00.000Z",
  description: "Device deployed",
  activityType: "deployment",
  createdAt: "2026-06-01T10:00:00.000Z",
};

describe("SiteActivityCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading message while activities are loading", () => {
    mockActivities({ isLoading: true });
    render(<SiteActivityCard siteId="site-1" />);

    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("shows an error message when the activities query fails", () => {
    mockActivities({ error: { message: "Network Error" } as never });
    render(<SiteActivityCard siteId="site-1" />);

    expect(screen.getByText("Failed to load history.")).toBeInTheDocument();
  });

  it("shows an empty state when there is no activity", () => {
    mockActivities({ data: { pages: [{ site_activities: [] }], pageParams: [1] } as never });
    render(<SiteActivityCard siteId="site-1" />);

    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("renders activity items from every page", () => {
    mockActivities({
      data: {
        pages: [{ site_activities: [ACTIVITY] }],
        pageParams: [1],
      } as never,
    });
    render(<SiteActivityCard siteId="site-1" />);

    expect(screen.getByText("Device deployed")).toBeInTheDocument();
  });
});
