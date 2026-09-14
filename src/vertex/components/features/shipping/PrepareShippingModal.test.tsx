import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrepareShippingModal } from "./PrepareShippingModal";
import { useCreateShippingBatch } from "@/core/hooks/useDevices";
import type { CreateShippingBatchResponse } from "@/app/types/devices";

vi.mock("@/core/hooks/useDevices", () => ({
  useCreateShippingBatch: vi.fn(),
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

type MutationOptions = NonNullable<Parameters<typeof useCreateShippingBatch>[0]>;
type MutationError = Parameters<NonNullable<MutationOptions["onError"]>>[0];

function dialog() {
  return within(screen.getByRole("dialog"));
}

function batchResponse(failedCount = 0): CreateShippingBatchResponse {
  return {
    success: true,
    message: `Shipping batch 'Batch A' created successfully. 2 devices prepared, ${failedCount} failed.`,
    batch_creation_results: {
      batch: {
        _id: "batch-1",
        batch_name: "Batch A",
        device_count: 2,
        device_names: ["airqo_1", "airqo_2"],
        createdAt: "2026-09-01T00:00:00.000Z",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
      successful_preparations: [],
      failed_preparations: [],
      summary: { total_requested: 2, successful_count: 2 - failedCount, failed_count: failedCount },
    },
  };
}

/**
 * Captures the hook-level options the modal registers so a test can drive
 * the success/error paths, and records what `mutate` was called with.
 */
function mockCreateBatch(isPending = false) {
  const mutate = vi.fn();
  let hookOptions: MutationOptions | undefined;
  vi.mocked(useCreateShippingBatch).mockImplementation((options?: MutationOptions) => {
    hookOptions = options;
    return { mutate, isPending } as unknown as ReturnType<typeof useCreateShippingBatch>;
  });
  return { mutate, hookOptions: () => hookOptions };
}

async function addDevice(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.type(dialog().getByPlaceholderText(/Enter device name/), name);
  await user.click(dialog().getByRole("button", { name: /^Add$/ }));
}

describe("PrepareShippingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the submit button disabled until devices and a batch name are provided", async () => {
    mockCreateBatch();
    const user = userEvent.setup();
    render(<PrepareShippingModal isOpen onClose={vi.fn()} />);

    const submit = () => dialog().getByRole("button", { name: /^Prepare \d+ Device/ });
    expect(submit()).toBeDisabled();

    await addDevice(user, "airqo_1");
    expect(submit()).toBeDisabled();

    await user.type(dialog().getByPlaceholderText("Madagascar batch 01"), "   ");
    expect(submit()).toBeDisabled();

    await user.type(dialog().getByPlaceholderText("Madagascar batch 01"), "Batch A");
    expect(submit()).toBeEnabled();
  });

  it("creates the batch through the atomic endpoint with the trimmed batch name", async () => {
    const { mutate } = mockCreateBatch();
    const user = userEvent.setup();
    render(<PrepareShippingModal isOpen onClose={vi.fn()} />);

    await addDevice(user, "airqo_1");
    await addDevice(user, "airqo_2");
    await user.type(dialog().getByPlaceholderText("Madagascar batch 01"), "  Batch A  ");
    await user.click(dialog().getByRole("radio", { name: "Hex" }));
    await user.click(dialog().getByRole("button", { name: "Prepare 2 Devices" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { deviceNames: ["airqo_1", "airqo_2"], tokenType: "hex", batchName: "Batch A" },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
  });

  it("shows the backend message as a success banner and closes when every device was prepared", async () => {
    const { mutate, hookOptions } = mockCreateBatch();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<PrepareShippingModal isOpen onClose={onClose} />);

    await addDevice(user, "airqo_1");
    await user.type(dialog().getByPlaceholderText("Madagascar batch 01"), "Batch A");
    await user.click(dialog().getByRole("button", { name: "Prepare 1 Device" }));

    const response = batchResponse(0);
    hookOptions()?.onSuccess?.(response);
    const [, callOptions] = mutate.mock.calls[0] as [unknown, MutationOptions];
    callOptions.onSuccess?.(response);

    expect(showBannerWithDelayMock).toHaveBeenCalledWith({
      severity: "success",
      message: response.message,
      scoped: false,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("downgrades the banner to a warning when some devices failed to prepare", async () => {
    const { hookOptions } = mockCreateBatch();
    render(<PrepareShippingModal isOpen onClose={vi.fn()} />);

    const response = batchResponse(1);
    hookOptions()?.onSuccess?.(response);

    expect(showBannerWithDelayMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning", message: response.message })
    );
  });

  it("surfaces a duplicate batch name rejection as an error banner", async () => {
    const { hookOptions } = mockCreateBatch();
    render(<PrepareShippingModal isOpen onClose={vi.fn()} />);

    hookOptions()?.onError?.(
      new Error("A shipping batch with the name 'Batch A' already exists.") as MutationError
    );

    expect(showBannerMock).toHaveBeenCalledWith({
      severity: "error",
      message:
        "Batch Preparation Failed: A shipping batch with the name 'Batch A' already exists.",
      scoped: true,
    });
  });
});
