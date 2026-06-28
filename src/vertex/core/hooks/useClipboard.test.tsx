import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useClipboard } from "./useClipboard";
import { useBanner } from "@/context/banner-context";
import { toast } from "@/components/shared/toast/ReusableToast";

vi.mock("@/context/banner-context", () => ({
  useBanner: vi.fn(),
}));

vi.mock("@/components/shared/toast/ReusableToast", () => ({
  toast: { success: vi.fn() },
}));

describe("useClipboard", () => {
  let showBannerMock: any;

  beforeEach(() => {
    showBannerMock = vi.fn();
    (useBanner as any).mockReturnValue({ showBanner: showBannerMock });
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() },
    });
    vi.clearAllMocks();
  });

  it("copies text and shows success toast", async () => {
    (navigator.clipboard.writeText as any).mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.handleCopy("test text");
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
    expect(toast.success).toHaveBeenCalledWith("Copied");
    expect(showBannerMock).not.toHaveBeenCalled();
  });

  it("shows error banner if copy fails", async () => {
    (navigator.clipboard.writeText as any).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.handleCopy("test text");
    });

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "Failed to copy",
      scoped: false,
    });
    expect(toast.success).not.toHaveBeenCalled();
  });
});
