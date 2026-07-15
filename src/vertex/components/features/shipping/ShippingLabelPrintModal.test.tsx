import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ShippingLabelPrintModal from "./ShippingLabelPrintModal";
import type { ShippingLabel } from "@/app/types/devices";

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

function makeLabel(overrides: Partial<ShippingLabel> = {}): ShippingLabel {
  return {
    device_name: "airqo_g1",
    device_id: "airqo_g1",
    device_long_name: "AirQo G1",
    claim_token: "TOKEN-1",
    qr_code_image: "data:image/png;base64,abc123",
    qr_code_data: {},
    instructions: ["Scan the QR code", "Mount the device"],
    ...overrides,
  };
}

/** Fake window good enough for the component's document.write/print/onload contract. */
function fakePrintWindow() {
  return {
    document: { write: vi.fn(), close: vi.fn() },
    print: vi.fn(),
    close: vi.fn(),
    onload: null as (() => void) | null,
  };
}

describe("ShippingLabelPrintModal", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    openSpy?.mockRestore();
  });

  it("renders every label's device info, QR image, and instructions, with a count subtitle", () => {
    render(
      <ShippingLabelPrintModal
        isOpen
        onClose={vi.fn()}
        labels={[makeLabel({ device_id: "airqo_g1" }), makeLabel({ device_id: "airqo_g2" })]}
      />
    );

    expect(screen.getByText("2 labels ready to print")).toBeInTheDocument();
    expect(screen.getByText("airqo_g1")).toBeInTheDocument();
    expect(screen.getByText("airqo_g2")).toBeInTheDocument();
    expect(screen.getAllByText("TOKEN-1")).toHaveLength(2);
    expect(screen.getAllByText("Scan the QR code")).toHaveLength(2);
  });

  it("uses singular label wording for exactly one label", () => {
    render(<ShippingLabelPrintModal isOpen onClose={vi.fn()} labels={[makeLabel()]} />);
    expect(screen.getByText("1 label ready to print")).toBeInTheDocument();
  });

  it("escapes device data before writing it into the print window's HTML", async () => {
    const user = userEvent.setup();
    const fakeWindow = fakePrintWindow();
    openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow as unknown as Window);

    render(
      <ShippingLabelPrintModal
        isOpen
        onClose={vi.fn()}
        labels={[
          makeLabel({
            device_id: '<img src=x onerror="alert(1)">',
            claim_token: "</script><script>alert(2)</script>",
          }),
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Print Labels" }));

    expect(fakeWindow.document.write).toHaveBeenCalledTimes(1);
    const html = fakeWindow.document.write.mock.calls[0][0] as string;

    // The raw markup must never appear unescaped in the popup document.
    expect(html).not.toContain('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script>alert(2)</script>");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("&lt;/script&gt;&lt;script&gt;alert(2)&lt;/script&gt;");

    fakeWindow.onload?.();
    await new Promise((resolve) => setTimeout(resolve, 260));
    expect(fakeWindow.print).toHaveBeenCalledTimes(1);
  });

  it("blocks printing and shows an error when the QR code image URL isn't a data: or http(s): URL", async () => {
    const user = userEvent.setup();
    const fakeWindow = fakePrintWindow();
    openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow as unknown as Window);

    render(
      <ShippingLabelPrintModal
        isOpen
        onClose={vi.fn()}
        labels={[makeLabel({ qr_code_image: "javascript:alert(1)" })]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Print Labels" }));

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "Some QR code images have invalid URLs",
      scoped: true,
    });
    expect(fakeWindow.close).toHaveBeenCalledTimes(1);
    expect(fakeWindow.document.write).not.toHaveBeenCalled();
  });

  it("shows an error instead of crashing when the pop-up is blocked", async () => {
    const user = userEvent.setup();
    openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    render(<ShippingLabelPrintModal isOpen onClose={vi.fn()} labels={[makeLabel()]} />);
    await user.click(screen.getByRole("button", { name: "Print Labels" }));

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "Please allow pop-ups for this site to print labels",
      scoped: true,
    });
  });

  it("calls onClose when Close is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShippingLabelPrintModal isOpen onClose={onClose} labels={[makeLabel()]} />);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
