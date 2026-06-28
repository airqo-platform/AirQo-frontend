import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getMacArchitecture } from "./platform";

describe("getMacArchitecture", () => {
  let originalNavigator: any;

  beforeEach(() => {
    originalNavigator = { ...window.navigator };
    // @ts-ignore
    delete window.navigator;
    window.navigator = { ...originalNavigator } as any;
  });

  afterEach(() => {
    window.navigator = originalNavigator;
    vi.restoreAllMocks();
  });

  it("returns unknown when running outside browser", async () => {
    const origWindow = global.window;
    // @ts-ignore
    delete (global as any).window;

    try {
      const arch = await getMacArchitecture();
      expect(arch).toBe("unknown");
    } finally {
      global.window = origWindow;
    }
  });

  it("detects arm64 using userAgentData API", async () => {
    (window.navigator as any).userAgentData = {
      getHighEntropyValues: vi.fn().mockResolvedValue({ architecture: "arm" }),
    };

    const arch = await getMacArchitecture();
    expect(arch).toBe("arm64");
  });

  it("detects x64 using userAgentData API", async () => {
    (window.navigator as any).userAgentData = {
      getHighEntropyValues: vi.fn().mockResolvedValue({ architecture: "x86" }),
    };

    const arch = await getMacArchitecture();
    expect(arch).toBe("x64");
  });

  it("detects arm64 using WebGL Apple renderer fallback", async () => {
    const mockGetExtension = vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: "UNMASKED_RENDERER_WEBGL" });
    const mockGetParameter = vi.fn().mockReturnValue("Apple M1");
    
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        getExtension: mockGetExtension,
        getParameter: mockGetParameter,
      }),
    };
    
    vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as any);

    const arch = await getMacArchitecture();
    expect(arch).toBe("arm64");
  });

  it("returns unknown when no detection method matches", async () => {
    const mockGetExtension = vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: "UNMASKED_RENDERER_WEBGL" });
    const mockGetParameter = vi.fn().mockReturnValue("Intel Iris");
    
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        getExtension: mockGetExtension,
        getParameter: mockGetParameter,
      }),
    };
    
    vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as any);

    const arch = await getMacArchitecture();
    expect(arch).toBe("unknown");
  });
});
