import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders as render } from "@/test/utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeployDeviceComponent from "./deploy-device-component";
import {
  useDeployDevice,
  useDeviceDetails,
  useDevices,
} from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useNetworks } from "@/core/hooks/useNetworks";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";
import type { Device } from "@/app/types/devices";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useDevices", () => ({
  useDevices: vi.fn(),
  useDeviceDetails: vi.fn(),
  useDeployDevice: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("@/core/hooks/useNetworks", () => ({
  useNetworks: vi.fn(),
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

// Map/geocoding widgets are out of scope for this component's own
// wizard/state logic — stub them to a minimal interactive surface.
vi.mock("@/components/features/mini-map/mini-map", () => ({
  default: () => <div data-testid="mini-map" />,
}));

const locationAutocompleteSpy = vi.fn();
vi.mock("@/components/features/location-autocomplete/LocationAutocomplete", () => ({
  default: (props: {
    value: string;
    onChange: (value: string) => void;
    onLocationSelect: (location: { name: string; latitude: number; longitude: number }) => void;
  }) => {
    locationAutocompleteSpy(props);
    return (
      <input
        aria-label="Site Name"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  },
}));

const claimDeviceModalSpy = vi.fn();
vi.mock("@/components/features/claim/claim-device-modal", () => ({
  default: (props: { isOpen: boolean; onClose: () => void }) => {
    claimDeviceModalSpy(props);
    return props.isOpen ? <div data-testid="claim-device-modal" /> : null;
  },
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const DEVICE_A = {
  _id: "device-1",
  name: "airqo_g1",
  long_name: "AirQo G1",
  network: "airqo",
} as Device;
const DEVICE_B = {
  _id: "device-2",
  name: "airqo_g2",
  long_name: "AirQo G2",
  network: "mairqo",
} as Device;

const USER_DETAILS = {
  _id: "user-1",
  firstName: "Belinda",
  lastName: "Kobusingye",
  email: "belinda@airqo.net",
  userName: "belinda",
};

function mockDeploy(
  spy: (variables: unknown, callOptions: unknown) => void
) {
  vi.mocked(useDeployDevice).mockReturnValue({
    mutate: (variables: unknown, callOptions: unknown) => spy(variables, callOptions),
    isPending: false,
  } as unknown as ReturnType<typeof useDeployDevice>);
}

function mockDeviceDetails(previousSites: unknown[] = []) {
  vi.mocked(useDeviceDetails).mockReturnValue({
    data: { data: { previous_sites: previousSites } },
  } as unknown as ReturnType<typeof useDeviceDetails>);
}

async function selectDevice(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: label }));
}

async function pickToday(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Pick a date" }));
  const today = String(new Date().getDate());
  await user.click(screen.getByRole("gridcell", { name: today }));
}

async function selectFromDropdown(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: RegExp,
  optionName: string
) {
  await user.click(screen.getByRole("button", { name: triggerName }));
  await user.click(screen.getByRole("option", { name: optionName }));
}

async function fillDeviceDetailsStep(user: ReturnType<typeof userEvent.setup>) {
  await selectDevice(user, "AirQo G1");
  await pickToday(user);
  await user.type(screen.getByLabelText("Height (meters)"), "3");
  await selectFromDropdown(user, /Mount Type/, "Pole");
  await selectFromDropdown(user, /Power Type/, "Solar");
}

describe("DeployDeviceComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserContext).mockReturnValue({
      userScope: "organisation",
      userDetails: USER_DETAILS,
    } as unknown as ReturnType<typeof useUserContext>);
    vi.mocked(useDevices).mockReturnValue({
      devices: [],
    } as unknown as ReturnType<typeof useDevices>);
    vi.mocked(useNetworks).mockReturnValue({
      networks: [{ net_name: "airqo" }, { net_name: "mairqo" }],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useNetworks>);
    mockDeviceDetails([]);
  });

  it("blocks advancing past device details until all required fields are filled", async () => {
    mockDeploy(vi.fn());
    const user = userEvent.setup();
    render(
      <DeployDeviceComponent availableDevices={[DEVICE_A, DEVICE_B]} />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message: "Incomplete Details: Please fill in all required device details.",
      scoped: true,
    });
    expect(screen.getByLabelText("Height (meters)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Deploy to/ })).not.toBeInTheDocument();
  });

  it("deploys to a new site end to end when the device has no previous sites", async () => {
    const deploySpy = vi.fn((_variables, callOptions) => callOptions?.onSuccess?.());
    mockDeploy(deploySpy);
    const onDeploymentSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <DeployDeviceComponent
        availableDevices={[DEVICE_A, DEVICE_B]}
        onDeploymentSuccess={onDeploymentSuccess}
        onClose={onClose}
      />
    );

    await fillDeviceDetailsStep(user);
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText("No previous sites available for this device.")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getByRole("button", { name: /Switch to Coordinates/ }));
    await user.type(screen.getByLabelText("Latitude"), "0.3476");
    await user.type(screen.getByLabelText("Longitude"), "32.5825");
    await user.type(screen.getByLabelText("Custom Site Name"), "E2E Deploy Site");

    const deployButton = screen.getByRole("button", { name: "Deploy" });
    await waitFor(() => expect(deployButton).not.toBeDisabled());
    await user.click(deployButton);

    await waitFor(() => {
      expect(deploySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceName: "airqo_g1",
          mountType: "pole",
          powerType: "solar",
          height: "3",
          latitude: "0.3476",
          longitude: "32.5825",
          site_name: "E2E Deploy Site",
          network: "airqo",
          user_id: "user-1",
        }),
        expect.anything()
      );
    });
    expect(showBannerWithDelayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        message: "airqo_g1 has been deployed successfully.",
      }),
      300
    );
    expect(onDeploymentSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    // State resets to a fresh wizard for the next deployment.
    expect(screen.getByText("Enter Device Details")).toBeInTheDocument();
  });

  it("uses the device's network when a device is selected", async () => {
    mockDeploy(vi.fn());
    const user = userEvent.setup();
    render(<DeployDeviceComponent availableDevices={[DEVICE_A, DEVICE_B]} />);

    await selectDevice(user, "AirQo G2");

    expect(screen.getByRole("button", { name: /Sensor Manufacturer/ })).toHaveTextContent(
      "mairqo"
    );
  });

  it("deploys directly from the deployment-type step when a previous site is selected", async () => {
    mockDeviceDetails([
      { _id: "site-1", name: "Kampala Site", latitude: 0.3, longitude: 32.5 },
    ]);
    const deploySpy = vi.fn();
    mockDeploy(deploySpy);
    const user = userEvent.setup();
    render(<DeployDeviceComponent availableDevices={[DEVICE_A]} />);

    await fillDeviceDetailsStep(user);
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.queryByText("No previous sites available for this device.")
    ).not.toBeInTheDocument();
    await selectFromDropdown(user, /Deploy to/, "Previous site");
    await selectFromDropdown(user, /Select previous site/, "Kampala Site");

    // No "Set Deployment Location" step for the previous-site path — Deploy
    // is reachable directly from this step.
    expect(screen.queryByText("Set Deployment Location")).not.toBeInTheDocument();
    const deployButton = screen.getByRole("button", { name: "Deploy" });
    await waitFor(() => expect(deployButton).not.toBeDisabled());
    await user.click(deployButton);

    await waitFor(() => {
      expect(deploySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          site_id: "site-1",
          site_name: "Kampala Site",
          latitude: "0.3",
          longitude: "32.5",
        }),
        expect.anything()
      );
    });
  });

  it("opens the claim-device modal from the device combobox's custom action", async () => {
    mockDeploy(vi.fn());
    const user = userEvent.setup();
    render(<DeployDeviceComponent availableDevices={[DEVICE_A]} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(
      screen.getByRole("option", { name: "Device not listed? Claim a new device" })
    );

    expect(screen.getByTestId("claim-device-modal")).toBeInTheDocument();
  });

  it("shows an error banner and does not reset the wizard when deployment fails", async () => {
    const deploySpy = vi.fn((_variables, callOptions) =>
      callOptions?.onError?.(new Error("Network Error"))
    );
    mockDeploy(deploySpy);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<DeployDeviceComponent availableDevices={[DEVICE_A]} onClose={onClose} />);

    await fillDeviceDetailsStep(user);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /Switch to Coordinates/ }));
    await user.type(screen.getByLabelText("Latitude"), "0.3476");
    await user.type(screen.getByLabelText("Longitude"), "32.5825");

    const deployButton = screen.getByRole("button", { name: "Deploy" });
    await waitFor(() => expect(deployButton).not.toBeDisabled());
    await user.click(deployButton);

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Deployment Failed: Network Error",
        scoped: true,
      });
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Set Deployment Location")).toBeInTheDocument();
  });
});
