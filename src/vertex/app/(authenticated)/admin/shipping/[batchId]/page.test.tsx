import { useState } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BatchDetailsPage from "./page";
import { useShippingBatchDetails } from "@/core/hooks/useDevices";
import type { GenerateLabelsResponse, ShippingBatchDetailsResponse } from "@/app/types/devices";
import { renderWithProviders as render } from "@/test/utils/renderWithProviders";

// jsdom doesn't implement scrollIntoView, which some shared UI primitives use.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ batchId: "batch-42" }),
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/shipping/batch-42",
  useSearchParams: () => new URLSearchParams(),
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: showBannerMock }),
}));

vi.mock("@/context/page-title-context", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("@/components/features/shipping/ShippingLabelPrintModal", () => ({
  default: ({ isOpen, labels }: { isOpen: boolean; labels: unknown[] }) =>
    isOpen ? <div data-testid="print-modal">{labels.length} labels ready</div> : null,
}));

// The real hook takes onSuccess/onError as mutate-time options; this fake
// mirrors that contract with real React state so the component's actual
// data flow (mutate -> onSuccess -> hook `data` -> print modal mount) is
// exercised, not just a canned return value.
let generateLabelsSpy = vi.fn();
let generateOutcome: "success" | "error" = "success";
let generateResponse: GenerateLabelsResponse | null = null;

vi.mock("@/core/hooks/useDevices", () => ({
  useShippingBatchDetails: vi.fn(),
  useGenerateShippingLabels: (options?: {
    onSuccess?: (data: GenerateLabelsResponse) => void;
    onError?: (error: Error) => void;
  }) => {
    const [data, setData] = useState<GenerateLabelsResponse | undefined>(undefined);
    const [isPending, setIsPending] = useState(false);

    return {
      data,
      isPending,
      mutate: (deviceNames: string[]) => {
        generateLabelsSpy(deviceNames);
        setIsPending(true);
        Promise.resolve().then(() => {
          setIsPending(false);
          if (generateOutcome === "success" && generateResponse) {
            setData(generateResponse);
            options?.onSuccess?.(generateResponse);
          } else {
            options?.onError?.(new Error("Label generation failed"));
          }
        });
      },
    };
  },
}));

function mockBatchDetails(overrides: Partial<ShippingBatchDetailsResponse> = {}, isLoading = false, error: Error | null = null) {
  vi.mocked(useShippingBatchDetails).mockReturnValue({
    data: overrides,
    isLoading,
    error,
  } as never);
}

function labelsResponse(deviceNames: string[]): GenerateLabelsResponse {
  return {
    success: true,
    message: "Labels generated",
    shipping_labels: {
      total_labels: deviceNames.length,
      labels: deviceNames.map((name) => ({
        device_name: name,
        device_id: name,
        device_long_name: name,
        claim_token: `token-${name}`,
        qr_code_image: "data:image/png;base64,abc",
        qr_code_data: {},
        instructions: ["Scan the QR code"],
      })),
    },
  };
}

describe("BatchDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateOutcome = "success";
    generateResponse = null;
  });

  it("shows an error state when the batch is not found", () => {
    mockBatchDetails({ batch: undefined }, false, new Error("Batch not found"));
    render(<BatchDetailsPage />);

    expect(
      screen.getByText("Error loading batch details: Batch not found")
    ).toBeInTheDocument();
  });

  it("renders the batch name, id, and devices table", () => {
    mockBatchDetails({
      success: true,
      message: "",
      batch: {
        _id: "batch-42",
        batch_name: "Madagascar batch 01",
        device_count: 2,
        device_names: [],
        createdAt: "2026-06-01T10:30:00.000Z",
        updatedAt: "2026-06-01T10:30:00.000Z",
        devices: [
          {
            id: "d1",
            _id: "d1",
            name: "airqo_g1",
            long_name: "airqo_g1",
            claim_status: "claimed",
            claim_token: "TOK-1",
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "2026-06-02T10:30:00.000Z",
          },
          {
            id: "d2",
            _id: "d2",
            name: "airqo_g2",
            long_name: "airqo_g2",
            claim_status: "prepared",
            claim_token: null,
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "",
          },
        ],
      },
    });
    render(<BatchDetailsPage />);

    expect(screen.getByText("Madagascar batch 01")).toBeInTheDocument();
    expect(screen.getByText("batch-42")).toBeInTheDocument();
    expect(screen.getByText("airqo_g1")).toBeInTheDocument();
    expect(screen.getByText("TOK-1")).toBeInTheDocument();
    expect(screen.getByText("Claimed")).toBeInTheDocument();
    expect(screen.getByText("Prepared")).toBeInTheDocument();
    // Devices with no claim token yet render a dash, not "null".
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("generates labels for unclaimed devices and opens the print modal on success", async () => {
    const user = userEvent.setup();
    generateResponse = labelsResponse(["airqo_g2"]);
    mockBatchDetails({
      success: true,
      message: "",
      batch: {
        _id: "batch-42",
        batch_name: "Batch",
        device_count: 2,
        device_names: [],
        createdAt: "2026-06-01T10:30:00.000Z",
        updatedAt: "2026-06-01T10:30:00.000Z",
        devices: [
          {
            id: "d1",
            _id: "d1",
            name: "airqo_g1",
            long_name: "airqo_g1",
            claim_status: "claimed",
            claim_token: "TOK-1",
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "2026-06-02T10:30:00.000Z",
          },
          {
            id: "d2",
            _id: "d2",
            name: "airqo_g2",
            long_name: "airqo_g2",
            claim_status: "prepared",
            claim_token: null,
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "",
          },
        ],
      },
    });
    render(<BatchDetailsPage />);

    await user.click(screen.getByRole("button", { name: "Generate Labels" }));

    // Only the unclaimed device is sent — an already-claimed device doesn't
    // need a new label.
    expect(generateLabelsSpy).toHaveBeenCalledWith(["airqo_g2"]);

    await waitFor(() => {
      expect(screen.getByTestId("print-modal")).toHaveTextContent("1 labels ready");
    });
  });

  it("shows an error and never calls the mutation when every device is already claimed", async () => {
    const user = userEvent.setup();
    mockBatchDetails({
      success: true,
      message: "",
      batch: {
        _id: "batch-42",
        batch_name: "Batch",
        device_count: 1,
        device_names: [],
        createdAt: "2026-06-01T10:30:00.000Z",
        updatedAt: "2026-06-01T10:30:00.000Z",
        devices: [
          {
            id: "d1",
            _id: "d1",
            name: "airqo_g1",
            long_name: "airqo_g1",
            claim_status: "claimed",
            claim_token: "TOK-1",
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "2026-06-02T10:30:00.000Z",
          },
        ],
      },
    });
    render(<BatchDetailsPage />);

    await user.click(screen.getByRole("button", { name: "Generate Labels" }));

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "No unclaimed devices found with valid names in this batch",
      scoped: false,
    });
    expect(generateLabelsSpy).not.toHaveBeenCalled();
  });

  it("shows an error banner when label generation fails", async () => {
    const user = userEvent.setup();
    generateOutcome = "error";
    mockBatchDetails({
      success: true,
      message: "",
      batch: {
        _id: "batch-42",
        batch_name: "Batch",
        device_count: 1,
        device_names: [],
        createdAt: "2026-06-01T10:30:00.000Z",
        updatedAt: "2026-06-01T10:30:00.000Z",
        devices: [
          {
            id: "d1",
            _id: "d1",
            name: "airqo_g1",
            long_name: "airqo_g1",
            claim_status: "prepared",
            claim_token: "TOK-1",
            shipping_prepared_at: "2026-06-01T10:30:00.000Z",
            owner_id: "u1",
            claimed_at: "",
          },
        ],
      },
    });
    render(<BatchDetailsPage />);

    await user.click(screen.getByRole("button", { name: "Generate Labels" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Label Generation Failed: Label generation failed",
        scoped: false,
      });
    });
    expect(screen.queryByTestId("print-modal")).not.toBeInTheDocument();
  });
});
