import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useServerSideTableState } from "./useServerSideTableState";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe("useServerSideTableState", () => {
  let routerReplaceMock: any;

  beforeEach(() => {
    routerReplaceMock = vi.fn();
    (useRouter as any).mockReturnValue({ replace: routerReplaceMock });
    (usePathname as any).mockReturnValue("/admin/devices");
    (useSearchParams as any).mockReturnValue(new URLSearchParams(""));
    vi.clearAllMocks();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useServerSideTableState({ initialPageSize: 50 }));
    
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 50 });
    expect(result.current.searchTerm).toBe("");
    expect(result.current.sorting).toEqual([]);
  });

  it("initializes from URL params", () => {
    (useSearchParams as any).mockReturnValue(new URLSearchParams("page=2&limit=10&search=airqo&sortBy=name&order=desc"));
    
    const { result } = renderHook(() => useServerSideTableState({}));
    
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 10 });
    expect(result.current.searchTerm).toBe("airqo");
    expect(result.current.sorting).toEqual([{ id: "name", desc: true }]);
  });

  it("updates router on state change", () => {
    const { result } = renderHook(() => useServerSideTableState({}));
    
    act(() => {
      result.current.setSearchTerm("new search");
    });

    expect(routerReplaceMock).toHaveBeenCalledWith(
      "/admin/devices?page=1&limit=25&search=new+search",
      { scroll: false }
    );
  });
});
