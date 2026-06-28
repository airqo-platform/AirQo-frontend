import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useWindowSize } from "./useWindow";

describe("useWindowSize", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 1024);
    vi.stubGlobal("innerHeight", 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns initial window dimensions", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 1024, height: 768 });
  });

  it("updates dimensions on resize", () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      vi.stubGlobal("innerWidth", 800);
      vi.stubGlobal("innerHeight", 600);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toEqual({ width: 800, height: 600 });
  });
});
