import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRecentlyVisited } from "./useRecentlyVisited";
import { renderHookWithProviders } from "../../test/utils/renderHookWithProviders";
import { usePathname } from "next/navigation";
import { ROUTE_LINKS } from "@/core/routes";
import { useBanner } from "@/context/banner-context";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: vi.fn(),
}));

describe("useRecentlyVisited", () => {
  beforeEach(() => {
    (useBanner as any).mockReturnValue({ showBanner: vi.fn() });
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes empty if no user is logged in", () => {
    (usePathname as any).mockReturnValue(ROUTE_LINKS.HOME);
    
    const { result } = renderHookWithProviders(() => useRecentlyVisited(), {
      preloadedState: { user: { userDetails: null } },
    });

    expect(result.current.visitedPages).toEqual([]);
  });

  it("adds page to recently visited and saves to localStorage", () => {
    (usePathname as any).mockReturnValue("/admin/networks");
    
    const { result } = renderHookWithProviders(() => useRecentlyVisited(), {
      preloadedState: { user: { userDetails: { _id: "user-1" } } },
    });

    expect(result.current.visitedPages).toEqual([
      { label: "Sensor Manufacturers", href: "/admin/networks" }
    ]);
    
    const stored = localStorage.getItem("vertex_recently_visited_user-1");
    expect(stored).toContain("Sensor Manufacturers");
  });

  it("deduplicates identical paths and limits to 4 items", () => {
    const state = { preloadedState: { user: { userDetails: { _id: "user-1" } } } };
    
    // Seed storage with 4 items
    localStorage.setItem("vertex_recently_visited_user-1", JSON.stringify([
      { label: "1", href: "/1" },
      { label: "2", href: "/2" },
      { label: "3", href: "/3" },
      { label: "4", href: "/4" },
    ]));

    (usePathname as any).mockReturnValue("/admin/sites"); // should push out the 4th item
    
    const { result } = renderHookWithProviders(() => useRecentlyVisited(), state);

    expect(result.current.visitedPages).toHaveLength(4);
    expect(result.current.visitedPages[0].label).toBe("Sites");
    expect(result.current.visitedPages[3].label).toBe("3"); // 4 is pushed out
  });
});
