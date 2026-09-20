import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MyDevicesPage from "./page";
import { useMyDevices, useDevices } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useAppSelector } from "@/core/redux/hooks";
import type { Device } from "@/app/types/devices";

const nav = vi.hoisted(() => ({ searchParams: new URLSearchParams(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.searchParams,
  useRouter: () => ({ replace: nav.replace, push: vi.fn() }),
  usePathname: () => "/devices/my-devices",
}));

vi.mock("next/dynamic", () => ({ default: () => () => null }));

vi.mock("@/core/hooks/useDevices", () => ({
  useMyDevices: vi.fn(),
  useDevices: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({ useUserContext: vi.fn() }));
vi.mock("@/core/redux/hooks", () => ({ useAppSelector: vi.fn() }));
vi.mock("@/core/hooks/usePermissions", () => ({ usePermission: () => true }));

vi.mock("@/components/layout/accessConfig/route-guard", () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/features/devices/device-assignment-modal", () => ({
  DeviceAssignmentModal: () => null,
}));
vi.mock("@/components/features/devices/import-device-modal", () => ({ default: () => null }));
vi.mock("@/components/features/devices/orphaned-devices-alert", () => ({
  OrphanedDevicesAlert: () => null,
}));

// Capture what the table is handed: the devices it must render and whether
// pagination is driven by the server.
const tableProps = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));
vi.mock("@/components/features/devices/client-paginated-devices-table", () => ({
  default: (props: Record<string, unknown>) => {
    tableProps.current = props;
    return <div data-testid="devices-table" />;
  },
}));

function device(name: string, overrides: Partial<Device> = {}): Device {
  return {
    _id: name,
    name,
    long_name: name,
    isOnline: false,
    rawOnlineStatus: false,
    ...overrides,
  } as unknown as Device;
}

/** Two devices that a client-side "transmitting" filter would reject. */
const SERVER_FILTERED = [
  device("aq_1", { rawOnlineStatus: false, isOnline: false }),
  device("aq_2", { rawOnlineStatus: false, isOnline: false }),
];

function mockPersonal(data: Record<string, unknown> | undefined) {
  vi.mocked(useUserContext).mockReturnValue({
    userScope: "personal",
  } as unknown as ReturnType<typeof useUserContext>);
  vi.mocked(useMyDevices).mockReturnValue({
    data,
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useMyDevices>);
  vi.mocked(useDevices).mockReturnValue({
    devices: [],
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useDevices>);
}

describe("MyDevicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.searchParams = new URLSearchParams();
    tableProps.current = undefined;
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        user: { userDetails: { _id: "user-1" }, activeGroup: { _id: "group-1" } },
      } as never)
    );
  });

  it("asks the server for the status filter and the first page (#4019)", () => {
    nav.searchParams = new URLSearchParams("status=transmitting");
    mockPersonal({
      devices: SERVER_FILTERED,
      total_devices: 2,
      meta: { total: 2, skip: 0, limit: 25, page: 1, totalPages: 1 },
    });

    render(<MyDevicesPage />);

    expect(useMyDevices).toHaveBeenCalledWith(
      "user-1",
      "group-1",
      expect.objectContaining({ enabled: true, status: "transmitting", limit: 25, skip: 0 })
    );
  });

  it("renders every device the server returned, without re-filtering them", () => {
    nav.searchParams = new URLSearchParams("status=transmitting");
    mockPersonal({
      devices: SERVER_FILTERED,
      total_devices: 2,
      meta: { total: 2, skip: 0, limit: 25, page: 1, totalPages: 1 },
    });

    render(<MyDevicesPage />);

    expect(tableProps.current?.devices).toEqual(SERVER_FILTERED);
  });

  it("paginates against the server's total rather than the returned page", () => {
    mockPersonal({
      devices: SERVER_FILTERED,
      total_devices: 64,
      meta: { total: 64, skip: 0, limit: 25, page: 1, totalPages: 3 },
    });

    render(<MyDevicesPage />);

    expect(tableProps.current?.serverSidePagination).toBe(true);
    expect(tableProps.current?.pageCount).toBe(3);
    // The endpoint cannot search, and the table would only hold one page.
    expect(tableProps.current?.searchable).toBe(false);
    expect(screen.getByText(/64 devices/)).toBeInTheDocument();
  });

  it("ignores a status value the endpoint does not accept", () => {
    nav.searchParams = new URLSearchParams("status=bogus");
    mockPersonal({
      devices: SERVER_FILTERED,
      total_devices: 2,
      meta: { total: 2, skip: 0, limit: 25, page: 1, totalPages: 1 },
    });

    render(<MyDevicesPage />);

    expect(useMyDevices).toHaveBeenCalledWith(
      "user-1",
      "group-1",
      expect.objectContaining({ status: undefined })
    );
    expect(screen.queryByText(/^Filtered:/)).not.toBeInTheDocument();
  });

  it("leaves organisation scope on its existing client-side filter", () => {
    nav.searchParams = new URLSearchParams("status=transmitting");
    vi.mocked(useUserContext).mockReturnValue({
      userScope: "organisation",
    } as unknown as ReturnType<typeof useUserContext>);
    vi.mocked(useMyDevices).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMyDevices>);
    const transmitting = device("aq_on", { rawOnlineStatus: true, isOnline: false });
    vi.mocked(useDevices).mockReturnValue({
      devices: [transmitting, device("aq_off")],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useDevices>);

    render(<MyDevicesPage />);

    expect(useMyDevices).toHaveBeenCalledWith(
      "user-1",
      "group-1",
      expect.objectContaining({ enabled: false })
    );
    expect(tableProps.current?.devices).toEqual([transmitting]);
    expect(tableProps.current?.serverSidePagination).toBe(false);
    expect(tableProps.current?.searchable).toBe(true);
  });
});
