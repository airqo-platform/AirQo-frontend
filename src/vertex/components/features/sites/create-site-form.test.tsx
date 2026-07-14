import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateSiteForm } from "./create-site-form";
import { useApproximateCoordinates, useCreateSite } from "@/core/hooks/useSites";
import { useNetworks } from "@/core/hooks/useNetworks";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/core/hooks/useSites", () => ({
  useApproximateCoordinates: vi.fn(),
  useCreateSite: vi.fn(),
}));

vi.mock("@/core/hooks/useNetworks", () => ({
  useNetworks: vi.fn(),
}));

vi.mock("@/components/features/mini-map/mini-map", () => ({
  default: () => <div data-testid="mini-map" />,
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

// jsdom doesn't implement scrollIntoView, which ReusableSelectInput uses.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const DIALOG_TITLE = "Create Site";
const PRELOADED_STATE = { user: { activeGroup: { grp_title: "airqo" } } };

// ReusableInputField appends the required-marker "*" directly to the label
// text with no separator (e.g. "Site Name*"), so exact-string label queries
// fail — see create-network-form.test.tsx for the same pattern.
const requiredLabel = (text: string) => new RegExp(`^${text}\\*?$`);

function dialog() {
  return within(screen.getByRole("dialog"));
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add Site" }));
  await screen.findByTestId("mini-map");
  // ReusableDialog auto-focuses its first field 100ms after opening; typing
  // that straddles that window gets keystrokes redirected mid-field (see
  // create-grid.test.tsx for the directly-observed repro).
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function mockCreateSite(createSpy: (data: unknown, hookOptions: unknown, callOptions: unknown) => void) {
  vi.mocked(useCreateSite).mockImplementation((hookOptions) =>
    ({
      mutate: (data: unknown, callOptions: unknown) => createSpy(data, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useCreateSite>
  );
}

function mockApproximateCoordinates(
  optimizeSpy: (data: unknown, hookOptions: unknown, callOptions: unknown) => void
) {
  vi.mocked(useApproximateCoordinates).mockImplementation((hookOptions) =>
    ({
      getApproximateCoordinates: (data: unknown, callOptions: unknown) =>
        optimizeSpy(data, hookOptions, callOptions),
      approximateCoordinates: undefined,
      isPending: false,
      error: null,
    }) as unknown as ReturnType<typeof useApproximateCoordinates>
  );
}

describe("CreateSiteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNetworks).mockReturnValue({
      networks: [{ net_name: "airqo" }, { net_name: "mairqo" }],
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useNetworks>);
  });

  it("opens the dialog in coordinates mode by default", async () => {
    mockCreateSite(vi.fn());
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openDialog(user);
    expect(dialog().getByRole("heading", { name: DIALOG_TITLE })).toBeInTheDocument();
    expect(dialog().getByLabelText(requiredLabel("Site Name"))).toBeInTheDocument();
    expect(dialog().getByLabelText(requiredLabel("Latitude"))).toBeInTheDocument();
    expect(dialog().getByLabelText(requiredLabel("Longitude"))).toBeInTheDocument();
    expect(dialog().getByRole("button", { name: /Sensor Manufacturer/ })).toBeInTheDocument();
    expect(dialog().getByRole("button", { name: "Switch to Site Name" })).toBeInTheDocument();
  });

  it("switches to site-name mode and back", async () => {
    mockCreateSite(vi.fn());
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    await user.click(dialog().getByRole("button", { name: "Switch to Site Name" }));

    expect(dialog().queryByLabelText(requiredLabel("Latitude"))).not.toBeInTheDocument();
    expect(dialog().getByPlaceholderText("Search for a location")).toBeInTheDocument();
    expect(dialog().getByRole("button", { name: "Switch to Coordinates" })).toBeInTheDocument();
  });

  it("blocks submission when required fields are empty", async () => {
    const createSpy = vi.fn();
    mockCreateSite(createSpy);
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    await user.click(dialog().getByRole("button", { name: "Create Site" }));

    await waitFor(() => {
      expect(
        dialog().getByText("Site name must be at least 2 characters.")
      ).toBeInTheDocument();
    });
    expect(
      dialog().getByText("Latitude must be a valid number between -90 and 90")
    ).toBeInTheDocument();
    expect(
      dialog().getByText("Longitude must be a valid number between -180 and 180")
    ).toBeInTheDocument();
    expect(dialog().getByText("Please select a network.")).toBeInTheDocument();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("disables Optimize Coordinates until both latitude and longitude are filled", async () => {
    mockCreateSite(vi.fn());
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    const optimizeButton = dialog().getByRole("button", { name: /Optimize Coordinates/ });
    expect(optimizeButton).toBeDisabled();

    await user.type(dialog().getByLabelText(requiredLabel("Latitude")), "0.3476");
    expect(optimizeButton).toBeDisabled();

    await user.type(dialog().getByLabelText(requiredLabel("Longitude")), "32.5825");
    expect(optimizeButton).toBeEnabled();
  });

  it("optimizes coordinates and fills in the approximate values", async () => {
    const optimizeSpy = vi.fn((_data, _hookOptions, callOptions) =>
      callOptions?.onSuccess?.({
        success: true,
        message: "ok",
        approximate_coordinates: {
          approximate_latitude: 0.35,
          approximate_longitude: 32.58,
        },
      })
    );
    mockCreateSite(vi.fn());
    mockApproximateCoordinates(optimizeSpy);
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    await user.type(dialog().getByLabelText(requiredLabel("Latitude")), "0.3476");
    await user.type(dialog().getByLabelText(requiredLabel("Longitude")), "32.5825");
    await user.click(dialog().getByRole("button", { name: /Optimize Coordinates/ }));

    expect(optimizeSpy).toHaveBeenCalledWith(
      { latitude: "0.3476", longitude: "32.5825" },
      expect.anything(),
      expect.anything()
    );
    await waitFor(() => {
      expect(dialog().getByLabelText(requiredLabel("Latitude"))).toHaveValue("0.35");
    });
    expect(dialog().getByLabelText(requiredLabel("Longitude"))).toHaveValue("32.58");
  });

  it("submits the form with the active group and navigates to the new site", async () => {
    const createSpy = vi.fn((_data, hookOptions, callOptions) => {
      const response = { success: true, message: "ok", site: { _id: "site-1" } };
      hookOptions?.onSuccess?.(response, _data);
      callOptions?.onSuccess?.(response);
    });
    mockCreateSite(createSpy);
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    await user.type(dialog().getByLabelText(requiredLabel("Site Name")), "Kampala Road");
    await user.type(dialog().getByLabelText(requiredLabel("Latitude")), "0.3476");
    await user.type(dialog().getByLabelText(requiredLabel("Longitude")), "32.5825");
    await user.click(dialog().getByRole("button", { name: /Sensor Manufacturer/ }));
    await user.click(dialog().getByRole("option", { name: "airqo" }));

    await user.click(dialog().getByRole("button", { name: "Create Site" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        {
          name: "Kampala Road",
          network: "airqo",
          latitude: "0.3476",
          longitude: "32.5825",
          group: "airqo",
        },
        expect.anything(),
        expect.anything()
      );
    });
    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Site 'Kampala Road' created successfully",
        scoped: false,
      });
    });
    expect(pushMock).toHaveBeenCalledWith("/admin/sites/site-1");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error banner and keeps the dialog open when creation fails", async () => {
    const createSpy = vi.fn((_data, hookOptions) =>
      hookOptions?.onError?.(new Error("Network Error"))
    );
    mockCreateSite(createSpy);
    mockApproximateCoordinates(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateSiteForm />, { preloadedState: PRELOADED_STATE });

    await openDialog(user);
    await user.type(dialog().getByLabelText(requiredLabel("Site Name")), "Kampala Road");
    await user.type(dialog().getByLabelText(requiredLabel("Latitude")), "0.3476");
    await user.type(dialog().getByLabelText(requiredLabel("Longitude")), "32.5825");
    await user.click(dialog().getByRole("button", { name: /Sensor Manufacturer/ }));
    await user.click(dialog().getByRole("option", { name: "airqo" }));
    await user.click(dialog().getByRole("button", { name: "Create Site" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to create site: Network Error",
        scoped: true,
      });
    });
    expect(dialog().getByRole("heading", { name: DIALOG_TITLE })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
