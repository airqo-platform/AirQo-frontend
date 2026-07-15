import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShippingBatchesTable from "./ShippingBatchesTable";
import { useShippingBatches } from "@/core/hooks/useDevices";

vi.mock("@/core/hooks/useDevices", () => ({
  useShippingBatches: vi.fn(),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/admin/shipping",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

function mockBatches(overrides: Partial<ReturnType<typeof useShippingBatches>> = {}) {
  vi.mocked(useShippingBatches).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useShippingBatches>);
}

describe("ShippingBatchesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state when there are no batches", () => {
    mockBatches({ data: { success: true, message: "", batches: [], meta: {} as never } });
    render(<ShippingBatchesTable />);

    expect(
      screen.getByText(
        "No shipping batches found. Create a new batch by preparing devices for shipping."
      )
    ).toBeInTheDocument();
  });

  it("shows an error message when the batches query fails", () => {
    mockBatches({ error: { message: "Network Error" } as never });
    render(<ShippingBatchesTable />);

    expect(screen.getByText("Error loading batches: Network Error")).toBeInTheDocument();
  });

  it("renders batch name, device count, and created date, falling back to 'Unnamed Batch'", () => {
    mockBatches({
      data: {
        success: true,
        message: "",
        batches: [
          {
            _id: "batch-1",
            batch_name: "Madagascar batch 01",
            device_count: 12,
            device_names: [],
            createdAt: "2026-06-01T10:30:00.000Z",
            updatedAt: "2026-06-01T10:30:00.000Z",
          },
          {
            _id: "batch-2",
            batch_name: "",
            device_count: 1,
            device_names: [],
            createdAt: "2026-06-02T08:00:00.000Z",
            updatedAt: "2026-06-02T08:00:00.000Z",
          },
        ],
        meta: {} as never,
      },
    });
    render(<ShippingBatchesTable />);

    expect(screen.getByText("Madagascar batch 01")).toBeInTheDocument();
    expect(screen.getByText("12 devices")).toBeInTheDocument();
    expect(screen.getByText("Unnamed Batch")).toBeInTheDocument();
    expect(screen.getByText("1 devices")).toBeInTheDocument();
  });

  it("navigates to the batch detail page when a row or its View Details action is clicked", async () => {
    const user = userEvent.setup();
    mockBatches({
      data: {
        success: true,
        message: "",
        batches: [
          {
            _id: "batch-42",
            batch_name: "Row Click Batch",
            device_count: 3,
            device_names: [],
            createdAt: "2026-06-01T10:30:00.000Z",
            updatedAt: "2026-06-01T10:30:00.000Z",
          },
        ],
        meta: {} as never,
      },
    });
    render(<ShippingBatchesTable />);

    await user.click(screen.getByText("Row Click Batch"));
    expect(pushMock).toHaveBeenCalledWith("/admin/shipping/batch-42");

    pushMock.mockClear();
    await user.click(screen.getByRole("button", { name: "View Details" }));
    expect(pushMock).toHaveBeenCalledWith("/admin/shipping/batch-42");
  });
});
