import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateCohortFromSelectionDialog } from "./create-cohort-from-cohorts";
import { useCreateCohortFromCohorts } from "@/core/hooks/useCohorts";
import { useNetworks } from "@/core/hooks/useNetworks";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("@/core/hooks/useCohorts", () => ({
  useCreateCohortFromCohorts: vi.fn(),
}));

vi.mock("@/core/hooks/useNetworks", () => ({
  useNetworks: vi.fn(),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
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

function mockCreateFromCohorts(
  spy: (variables: unknown, options: unknown) => void
) {
  vi.mocked(useCreateCohortFromCohorts).mockReturnValue({
    mutate: (variables: unknown, options: unknown) => spy(variables, options),
    isPending: false,
  } as unknown as ReturnType<typeof useCreateCohortFromCohorts>);
}

describe("CreateCohortFromSelectionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNetworks).mockReturnValue({
      networks: [{ net_name: "airqo" }, { net_name: "mairqo" }],
      isLoading: false,
    } as unknown as ReturnType<typeof useNetworks>);
  });

  it("disables Create until required fields are filled", async () => {
    mockCreateFromCohorts(vi.fn());
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={vi.fn()}
        selectedCohortIds={["cohort-1", "cohort-2"]}
      />
    );
    await settleDialogFocus();

    expect(dialog().getByRole("button", { name: "Create" })).toBeDisabled();
    expect(dialog().getByText("2 cohort(s) selected")).toBeInTheDocument();
  });

  it("builds a structured name from city/project/funder for organizational cohorts", async () => {
    const createSpy = vi.fn();
    mockCreateFromCohorts(createSpy);
    const user = userEvent.setup();
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={vi.fn()}
        selectedCohortIds={["cohort-1"]}
      />
    );
    await settleDialogFocus();

    await selectTag(user, "organizational");
    await user.type(dialog().getByLabelText(/^City/), "Nairobi");
    await user.type(dialog().getByLabelText(/^Project name/), "WRI");
    await selectNetwork(user, "airqo");

    await user.click(dialog().getByRole("button", { name: "Create" }));

    expect(createSpy).toHaveBeenCalledWith(
      {
        name: "nairobi_wri",
        description: undefined,
        cohort_ids: ["cohort-1"],
        network: "airqo",
        cohort_tags: ["organizational"],
      },
      expect.anything()
    );
  });

  it("sanitizes special characters out of the structured-name fields", async () => {
    mockCreateFromCohorts(vi.fn());
    const user = userEvent.setup();
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={vi.fn()}
        selectedCohortIds={["cohort-1"]}
      />
    );
    await settleDialogFocus();

    await selectTag(user, "organizational");
    await user.type(dialog().getByLabelText(/^City/), "Nai@robi!");

    expect(dialog().getByLabelText(/^City/)).toHaveValue("Nairobi");
    expect(screen.getAllByText("Special character ignored").length).toBeGreaterThan(0);
  });

  it("uses the plain cohort name field for non-organizational cohorts", async () => {
    const createSpy = vi.fn();
    mockCreateFromCohorts(createSpy);
    const user = userEvent.setup();
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={vi.fn()}
        selectedCohortIds={["cohort-1"]}
      />
    );
    await settleDialogFocus();

    await selectTag(user, "individual");
    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "mairqo");

    await user.click(dialog().getByRole("button", { name: "Create" }));

    expect(createSpy).toHaveBeenCalledWith(
      {
        name: "Combined Cohort",
        description: undefined,
        cohort_ids: ["cohort-1"],
        network: "mairqo",
        cohort_tags: ["individual"],
      },
      expect.anything()
    );
  });

  it("navigates to the new cohort on success when andNavigate is true", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onSuccess?.({ data: { _id: "new-cohort" } });
    });
    mockCreateFromCohorts(createSpy);
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        selectedCohortIds={["cohort-1"]}
        andNavigate
      />
    );
    await settleDialogFocus();

    await selectTag(user, "individual");
    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Create" }));

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/admin/cohorts/new-cohort");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("closes the dialog on success when andNavigate is false", async () => {
    const createSpy = vi.fn((variables, options) => {
      options?.onSuccess?.({ data: { _id: "new-cohort" } });
    });
    mockCreateFromCohorts(createSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CreateCohortFromSelectionDialog
        open
        onOpenChange={onOpenChange}
        selectedCohortIds={["cohort-1"]}
        andNavigate={false}
      />
    );
    await settleDialogFocus();

    await selectTag(user, "individual");
    await user.type(dialog().getByLabelText(/^Cohort name/), "Combined Cohort");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Create" }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
