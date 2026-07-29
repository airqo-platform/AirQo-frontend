import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShippingPage from "./page";
import { useShippingStatus } from "@/core/hooks/useDevices";
import type { ShippingStatusResponse } from "@/app/types/devices";

// RBAC wiring (RouteGuard) is covered by the e2e RBAC suite; this page's own
// behavior — the status summary and the Prepare New Batch trigger — is the
// unit under test here, so RouteGuard is a boundary mock.
vi.mock("@/components/layout/accessConfig/route-guard", () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/core/hooks/useDevices", () => ({
  useShippingStatus: vi.fn(),
}));

vi.mock("@/components/features/shipping/ShippingBatchesTable", () => ({
  default: () => <div data-testid="batches-table" />,
}));

vi.mock("@/components/features/shipping/PrepareShippingModal", () => ({
  PrepareShippingModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="prepare-modal" /> : null,
}));

function mockStatus(overrides: Partial<{ data: ShippingStatusResponse; isLoading: boolean }>) {
  vi.mocked(useShippingStatus).mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
  } as ReturnType<typeof useShippingStatus>);
}

describe("ShippingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render summary numbers while the status is loading", () => {
    mockStatus({ isLoading: true });
    render(<ShippingPage />);

    expect(screen.queryByText("Total Devices")).not.toBeInTheDocument();
  });

  it("renders the status summary with the correct counts and labels", () => {
    mockStatus({
      isLoading: false,
      data: {
        success: true,
        message: "",
        shipping_status: {
          devices: [],
          summary: {
            total_devices: 40,
            prepared_for_shipping: 15,
            claimed_devices: 20,
            deployed_devices: 5,
          },
          categorized: { prepared_for_shipping: [], claimed_devices: [], deployed_devices: [] },
        },
      },
    });
    render(<ShippingPage />);

    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Total Devices")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Prepared")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Claimed")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Deployed")).toBeInTheDocument();
  });

  it("renders neither skeletons nor the summary grid when the response has no summary", () => {
    mockStatus({ isLoading: false, data: { success: true, message: "" } as ShippingStatusResponse });
    render(<ShippingPage />);

    expect(screen.queryByText("Total Devices")).not.toBeInTheDocument();
  });

  it("opens the Prepare New Batch modal from the header button", async () => {
    const user = userEvent.setup();
    mockStatus({ isLoading: false });
    render(<ShippingPage />);

    expect(screen.queryByTestId("prepare-modal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Prepare New Batch" }));
    expect(screen.getByTestId("prepare-modal")).toBeInTheDocument();
  });
});
