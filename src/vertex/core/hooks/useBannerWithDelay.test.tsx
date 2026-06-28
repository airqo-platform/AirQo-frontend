import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBannerWithDelay } from "./useBannerWithDelay";
import { useBanner } from "@/context/banner-context";
import { AFTER_DIALOG_CLOSE_MS } from "@/core/constants/ui";

vi.mock("@/context/banner-context", () => ({
  useBanner: vi.fn(),
}));

describe("useBannerWithDelay", () => {
  let showBannerMock: any;

  beforeEach(() => {
    showBannerMock = vi.fn();
    (useBanner as any).mockReturnValue({ showBanner: showBannerMock });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("calls showBanner after delay", () => {
    const { result } = renderHook(() => useBannerWithDelay());
    
    act(() => {
      result.current.showBannerWithDelay({ message: "Test", severity: "success" });
    });

    expect(showBannerMock).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(AFTER_DIALOG_CLOSE_MS);
    });

    expect(showBannerMock).toHaveBeenCalledWith({ message: "Test", severity: "success" });
  });

  it("clears previous timer on multiple calls", () => {
    const { result } = renderHook(() => useBannerWithDelay());
    
    act(() => {
      result.current.showBannerWithDelay({ message: "First", severity: "info" });
      result.current.showBannerWithDelay({ message: "Second", severity: "info" });
    });

    act(() => {
      vi.advanceTimersByTime(AFTER_DIALOG_CLOSE_MS);
    });

    expect(showBannerMock).toHaveBeenCalledTimes(1);
    expect(showBannerMock).toHaveBeenCalledWith({ message: "Second" });
  });
});
