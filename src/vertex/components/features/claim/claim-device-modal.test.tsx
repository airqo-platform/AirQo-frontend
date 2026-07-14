import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClaimDeviceModal from "./claim-device-modal";
import { renderWithProviders as render } from "@/test/utils/renderWithProviders";
import { useClaimDevice, useBulkClaimDevices } from "@/core/hooks/useDevices";
import {
  useGroupCohorts,
  useVerifyCohort,
  useAssignCohortsToGroup,
  useAssignCohortsToUser,
} from "@/core/hooks/useCohorts";
import { useUserContext } from "@/core/hooks/useUserContext";

/**
 * Only the cohort-import path is reachable from the UI right now — manual/
 * QR/bulk claim entry points are commented out of MethodSelectStep's
 * ALL_METHODS array (see MethodSelectStep.tsx, git commit 1f19d80ac) — so
 * that's the only path tested here. The e2e suite
 * (device-lifecycle.spec.ts) already covers the full happy path, an
 * invalid-cohort verification error, and the empty-input validation error
 * end to end; this file covers what that spec doesn't reach: step
 * back/cancel navigation, both isExternalOrg confirm-step variants, the two
 * different failure shapes (verification vs. assignment), and the
 * onSuccess/reset contract.
 */

vi.mock("@/core/hooks/useDevices", () => ({
  useClaimDevice: vi.fn(),
  useBulkClaimDevices: vi.fn(),
}));

vi.mock("@/core/hooks/useCohorts", () => ({
  useGroupCohorts: vi.fn(),
  useVerifyCohort: vi.fn(),
  useAssignCohortsToGroup: vi.fn(),
  useAssignCohortsToUser: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

function dialog() {
  return screen.getByRole("dialog");
}

function mockPersonalContext() {
  vi.mocked(useUserContext).mockReturnValue({
    isPersonalContext: true,
    isExternalOrg: false,
    activeGroup: null,
    userScope: "personal",
  } as unknown as ReturnType<typeof useUserContext>);
}

function mockExternalOrgContext() {
  vi.mocked(useUserContext).mockReturnValue({
    isPersonalContext: false,
    isExternalOrg: true,
    activeGroup: { _id: "group-1", grp_title: "AirQo Uganda" },
    userScope: "organisation",
  } as unknown as ReturnType<typeof useUserContext>);
}

function mockVerifyCohort(mutateAsync: (cohortId: string) => Promise<unknown>) {
  vi.mocked(useVerifyCohort).mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useVerifyCohort>);
}

function mockAssignToUser(
  spy: (variables: unknown, callOptions: unknown) => void
) {
  vi.mocked(useAssignCohortsToUser).mockReturnValue({
    mutate: (variables: unknown, callOptions: unknown) => spy(variables, callOptions),
  } as unknown as ReturnType<typeof useAssignCohortsToUser>);
}

function mockAssignToGroup(
  spy: (variables: unknown, callOptions: unknown) => void
) {
  vi.mocked(useAssignCohortsToGroup).mockReturnValue({
    mutate: (variables: unknown, callOptions: unknown) => spy(variables, callOptions),
  } as unknown as ReturnType<typeof useAssignCohortsToGroup>);
}

async function goToCohortImportStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /Import from Cohort/ }));
  await screen.findByText("Enter the Cohort ID to automatically load its devices.");
}

async function verifyAndReachConfirmStep(
  user: ReturnType<typeof userEvent.setup>,
  cohortId = "cohort-123"
) {
  await goToCohortImportStep(user);
  await user.type(dialog().querySelector("input")!, cohortId);
  await user.click(screen.getByRole("button", { name: "Import" }));
  await screen.findByText("Continue to import this cohort?");
}

describe("ClaimDeviceModal — cohort import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClaimDevice).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useClaimDevice>);
    vi.mocked(useBulkClaimDevices).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useBulkClaimDevices>);
    vi.mocked(useGroupCohorts).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useGroupCohorts>);
    mockVerifyCohort(vi.fn());
    mockAssignToUser(vi.fn());
    mockAssignToGroup(vi.fn());
    mockPersonalContext();
  });

  it("only offers Import from Cohort — manual/QR/bulk entry points are not reachable", async () => {
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    expect(
      await screen.findByRole("button", { name: /Import from Cohort/ })
    ).toBeInTheDocument();
    expect(screen.queryByText("Add Single Device")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Multiple Devices")).not.toBeInTheDocument();
  });

  it("Back from the cohort-import step returns to method-select", async () => {
    mockVerifyCohort(vi.fn());
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await goToCohortImportStep(user);
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(
      await screen.findByRole("button", { name: /Import from Cohort/ })
    ).toBeInTheDocument();
  });

  it("requires a cohort ID before Import can proceed", async () => {
    const verifyCohort = vi.fn();
    mockVerifyCohort(verifyCohort);
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await goToCohortImportStep(user);
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(await screen.findByText("Please enter a valid Cohort ID")).toBeInTheDocument();
    expect(verifyCohort).not.toHaveBeenCalled();
  });

  it("shows the backend's verification message inline and stays on the import step", async () => {
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: false, message: "Cohort not found" })
    );
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await goToCohortImportStep(user);
    await user.type(dialog().querySelector("input")!, "does-not-exist");
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(await screen.findByText("Cohort not found")).toBeInTheDocument();
    expect(screen.queryByText("Continue to import this cohort?")).not.toBeInTheDocument();
  });

  it("falls back to a generic message when verification throws instead of resolving", async () => {
    mockVerifyCohort(vi.fn().mockRejectedValue(new Error("boom")));
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await goToCohortImportStep(user);
    await user.type(dialog().querySelector("input")!, "cohort-123");
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(await screen.findByText("boom")).toBeInTheDocument();
  });

  it("Cancel from cohort-confirm returns to cohort-import with the input preserved", async () => {
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await verifyAndReachConfirmStep(user, "cohort-123");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await screen.findByText("Enter the Cohort ID to automatically load its devices.");
    expect(dialog().querySelector("input")).toHaveValue("cohort-123");
  });

  it("shows the personal-assets wording on the confirm step for a personal-context user", async () => {
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await verifyAndReachConfirmStep(user);

    expect(
      screen.getByText(/This will add the devices from this cohort to your personal assets\./)
    ).toBeInTheDocument();
  });

  it("shows the organization-assets wording on the confirm step for an external-org user", async () => {
    mockExternalOrgContext();
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await verifyAndReachConfirmStep(user);

    expect(
      screen.getByText(
        /This will add the devices from this cohort to your organization assets\./
      )
    ).toBeInTheDocument();
  });

  it("assigns the cohort to the personal user and shows success after the transition delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const assignSpy = vi.fn((_variables, callOptions) => callOptions?.onSuccess?.());
    mockAssignToUser(assignSpy);
    const onSuccess = vi.fn();
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);

    await verifyAndReachConfirmStep(user);
    await user.click(screen.getByRole("button", { name: "Confirm & Import" }));

    expect(assignSpy).toHaveBeenCalledWith(
      { userId: "user-1", cohortIds: ["cohort-123"] },
      expect.anything()
    );
    expect(onSuccess).toHaveBeenCalledWith({
      deviceId: "",
      deviceName: "",
      cohortId: "cohort-123",
      isCohortImport: true,
    });

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(await screen.findByText("Cohort Assigned Successfully!")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("assigns the cohort to the active group for an external-org user", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockExternalOrgContext();
    const user = userEvent.setup();
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const assignSpy = vi.fn((_variables, callOptions) => callOptions?.onSuccess?.());
    mockAssignToGroup(assignSpy);
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await verifyAndReachConfirmStep(user);
    await user.click(screen.getByRole("button", { name: "Confirm & Import" }));

    expect(assignSpy).toHaveBeenCalledWith(
      { groupId: "group-1", cohortIds: ["cohort-123"] },
      expect.anything()
    );

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(await screen.findByText("Cohort Assigned Successfully!")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows the assignment failure inline and returns to the import step", async () => {
    const user = userEvent.setup();
    mockVerifyCohort(
      vi.fn().mockResolvedValue({ success: true, cohort: { name: "Kampala Cohort" } })
    );
    const assignSpy = vi.fn((_variables, callOptions) =>
      callOptions?.onError?.(new Error("Network Error"))
    );
    mockAssignToUser(assignSpy);
    render(<ClaimDeviceModal isOpen onClose={vi.fn()} />);

    await verifyAndReachConfirmStep(user);
    await user.click(screen.getByRole("button", { name: "Confirm & Import" }));

    await screen.findByText("Enter the Cohort ID to automatically load its devices.");
    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("clears the cohort input and step state on close, so reopening starts fresh", async () => {
    // The isOpen prop toggling alone doesn't clear this local state — only
    // resetState (run inside handleClose, wired to the dialog's own close
    // affordances) does. Simulating close by flipping the isOpen prop via
    // rerender, without going through handleClose, would misrepresent real
    // usage: in production isOpen only ever goes false as a result of
    // onClose firing, so resetState has always already run by then.
    mockVerifyCohort(vi.fn());
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ClaimDeviceModal isOpen onClose={onClose} />);

    await goToCohortImportStep(user);
    await user.type(dialog().querySelector("input")!, "leftover-input");

    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await goToCohortImportStep(user);
    expect(dialog().querySelector("input")).toHaveValue("");
  });
});
