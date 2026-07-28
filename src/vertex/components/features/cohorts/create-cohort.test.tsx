import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateCohortDialog } from "./create-cohort";
import { useCreateCohortWithDevices } from "@/core/hooks/useCohorts";
import { useDevices } from "@/core/hooks/useDevices";
import { useNetworks } from "@/core/hooks/useNetworks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useAppSelector } from "@/core/redux/hooks";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useCreateCohortWithDevices: vi.fn(),
}));

vi.mock("@/core/hooks/useDevices", () => ({
  useDevices: vi.fn(),
}));

vi.mock("@/core/hooks/useNetworks", () => ({
  useNetworks: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("@/core/redux/hooks", () => ({
  useAppSelector: vi.fn(),
}));

const pushMock = vi.fn();
let pathnameMock = "/admin/cohorts";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerMock = vi.fn();

// DeviceNameParser (CSV/XLSX import + column mapping) has its own concerns
// unrelated to this wizard's branching — stub it to a single trigger so this
// file can focus on CreateCohortDialog's own steps/payload logic.
vi.mock("./device-name-parser", () => ({
  DeviceNameParser: ({
    onDevicesParsed,
  }: {
    onDevicesParsed: (names: string[]) => void;
  }) => (
    <button type="button" onClick={() => onDevicesParsed(["AirQo G1"])}>
      Import devices
    </button>
  ),
}));

// jsdom doesn't implement scrollIntoView, which ReusableSelectInput uses.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

function dialog() {
  return within(screen.getByRole("dialog"));
}

// ReusableDialog auto-focuses the first focusable element 100ms after
// opening; typing that straddles that window gets its focus yanked back
// mid-field. Wait it out before typing.
async function settleDialogFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

async function selectTag(user: ReturnType<typeof userEvent.setup>, tag: string) {
  await user.click(dialog().getAllByRole("combobox")[0]);
  await user.click(screen.getByRole("option", { name: tag }));
  await user.keyboard("{Escape}");
}

async function selectNetwork(user: ReturnType<typeof userEvent.setup>, netName: string) {
  await user.click(dialog().getByRole("button", { name: /Sensor Manufacturer/ }));
  await user.click(dialog().getByRole("option", { name: netName }));
  await waitFor(() =>
    expect(dialog().getByRole("button", { name: /Sensor Manufacturer/ })).toHaveTextContent(
      netName
    )
  );
}

const DEVICE_A = { _id: "device-1", name: "airqo_g1", long_name: "AirQo G1" };

function mockCreateCohort(
  spy: (variables: unknown, options: unknown) => void,
  overrides: Partial<ReturnType<typeof useCreateCohortWithDevices>> = {}
) {
  vi.mocked(useCreateCohortWithDevices).mockImplementation((options) =>
    ({
      mutate: (variables: unknown) => spy(variables, options),
      isPending: false,
      ...overrides,
    }) as unknown as ReturnType<typeof useCreateCohortWithDevices>
  );
}

describe("CreateCohortDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathnameMock = "/admin/cohorts";
    vi.mocked(useUserContext).mockReturnValue({
      isExternalOrg: false,
      activeGroup: null,
    } as unknown as ReturnType<typeof useUserContext>);
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({ user: { userDetails: { _id: "user-1" } } } as never)
    );
    vi.mocked(useNetworks).mockReturnValue({
      networks: [{ net_name: "airqo" }, { net_name: "mairqo" }],
      isLoading: false,
    } as unknown as ReturnType<typeof useNetworks>);
    vi.mocked(useDevices).mockReturnValue({
      devices: [DEVICE_A],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useDevices>);
  });

  it("requires a cohort name and network before advancing to confirmation", async () => {
    mockCreateCohort(vi.fn());
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await user.click(dialog().getByRole("button", { name: "Review & Create" }));

    expect(dialog().getByText("Cohort name is required.")).toBeInTheDocument();
    expect(dialog().getByText("Please select a Sensor Manufacturer.")).toBeInTheDocument();
  });

  it("walks through form -> confirmation -> success for a plain (non-organizational) cohort", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onSuccess?.({ cohort: { _id: "new-cohort", name: variables.name } });
    });
    mockCreateCohort(createSpy);
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} onSuccess={onSuccess} />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");

    await user.click(dialog().getByRole("button", { name: "Review & Create" }));

    expect(
      dialog().getByText(/You are about to create a cohort named/)
    ).toBeInTheDocument();
    expect(dialog().getByText("Combined Cohort")).toBeInTheDocument();

    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        { name: "Combined Cohort", network: "airqo", deviceIds: [] },
        expect.anything()
      );
    });
    expect(dialog().getByText("Success!")).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("Back returns from confirmation to the form step without submitting", async () => {
    mockCreateCohort(vi.fn());
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));

    await user.click(dialog().getByRole("button", { name: "Back" }));

    expect(dialog().getByLabelText(/^Cohort name/)).toHaveValue("Combined Cohort");
  });

  it("switches to structured city/project fields and derives the name for organizational cohorts", async () => {
    const createSpy = vi.fn();
    mockCreateCohort(createSpy);
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await selectTag(user, "organizational");
    await user.type(dialog().getByLabelText(/^City/), "Nairobi");
    await user.type(dialog().getByLabelText(/^Project name/), "WRI");
    await selectNetwork(user, "airqo");

    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    expect(dialog().getByText("nairobi_wri")).toBeInTheDocument();

    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: "nairobi_wri", cohort_tags: ["organizational"] }),
        expect.anything()
      );
    });
  });

  it("sanitizes special characters out of the structured-name fields", async () => {
    mockCreateCohort(vi.fn());
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await selectTag(user, "organizational");
    await user.type(dialog().getByLabelText(/^City/), "Nai@robi!");

    expect(dialog().getByLabelText(/^City/)).toHaveValue("Nairobi");
    expect(screen.getAllByText("Special character ignored").length).toBeGreaterThan(0);
  });

  it("imports devices via the DeviceNameParser and merges them into the selection", async () => {
    mockCreateCohort(vi.fn());
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Import devices" }));

    await waitFor(() => {
      expect(dialog().getByText("AirQo G1")).toBeInTheDocument();
    });
  });

  it("routes groupId for external orgs", async () => {
    vi.mocked(useUserContext).mockReturnValue({
      isExternalOrg: true,
      activeGroup: { _id: "group-1" },
    } as unknown as ReturnType<typeof useUserContext>);
    const createSpy = vi.fn();
    mockCreateCohort(createSpy);
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: "group-1" }),
        expect.anything()
      );
    });
    const [payload] = createSpy.mock.calls[0];
    expect(payload.userId).toBeUndefined();
  });

  it("routes userId for non-admin, non-external-org pages", async () => {
    pathnameMock = "/user/cohorts";
    const createSpy = vi.fn();
    mockCreateCohort(createSpy);
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1" }),
        expect.anything()
      );
    });
    const [payload] = createSpy.mock.calls[0];
    expect(payload.groupId).toBeUndefined();
  });

  it("preselects devices and network passed in, and skips them from the base payload key when unused", async () => {
    mockCreateCohort(vi.fn());
    render(
      <CreateCohortDialog
        open
        onOpenChange={vi.fn()}
        preselectedDevices={[{ value: "device-1", label: "AirQo G1" }]}
        preselectedNetwork="airqo"
      />
    );
    await settleDialogFocus();

    expect(dialog().getByText("AirQo G1")).toBeInTheDocument();
  });

  it("in embedded mode (andNavigate=false, hideDeviceSelection=true), closes immediately on success without a success step", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onSuccess?.({ cohort: { _id: "new-cohort", name: variables.name } });
    });
    mockCreateCohort(createSpy);
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <CreateCohortDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        andNavigate={false}
        hideDeviceSelection
        preselectedNetwork="airqo"
      />
    );
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("shows an error banner when creation fails", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onError?.(new Error("Network Error"));
    });
    mockCreateCohort(createSpy);
    const onError = vi.fn();
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} onError={onError} />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to create cohort: Network Error",
        scoped: true,
      });
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("navigates to the created cohort from the success step when andNavigate is true", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onSuccess?.({ cohort: { _id: "new-cohort", name: variables.name } });
    });
    mockCreateCohort(createSpy);
    const user = userEvent.setup();
    render(<CreateCohortDialog open onOpenChange={vi.fn()} andNavigate />);
    await settleDialogFocus();

    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Review & Create" }));
    await user.click(dialog().getByRole("button", { name: "Confirm & Create" }));

    await waitFor(() => {
      expect(dialog().getByText("Success!")).toBeInTheDocument();
    });
    await user.click(dialog().getByRole("button", { name: "Go to Cohort Details" }));

    expect(pushMock).toHaveBeenCalledWith("/admin/cohorts/new-cohort");
  });
});
