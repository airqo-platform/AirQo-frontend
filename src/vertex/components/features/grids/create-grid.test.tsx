import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateGridForm } from "./create-grid";
import { useCreateGrid } from "@/core/hooks/useGrids";
import { useNetworks } from "@/core/hooks/useNetworks";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import type { CreateGrid } from "@/app/types/grids";

vi.mock("@/core/hooks/useGrids", () => ({
  useCreateGrid: vi.fn(),
}));

vi.mock("@/core/hooks/useNetworks", () => ({
  useNetworks: vi.fn(),
}));

vi.mock("@/components/features/mini-map/mini-map", () => ({
  default: () => <div data-testid="mini-map" />,
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

const DIALOG_TITLE = "Create Grid";

const VALID_POLYGON = {
  type: "Polygon" as const,
  coordinates: [
    [
      [32.5, 0.3],
      [32.6, 0.3],
      [32.6, 0.4],
      [32.5, 0.3],
    ],
  ],
};

function mockCreateGrid(createGridSpy: (data: CreateGrid, options: unknown) => void) {
  vi.mocked(useCreateGrid).mockImplementation(
    (options: Parameters<typeof useCreateGrid>[0]) => ({
      createGrid: (data: CreateGrid) => createGridSpy(data, options),
      isLoading: false,
      error: null,
    })
  );
}

// Re-queries the live dialog element on every call rather than reusing a
// captured reference — the trigger button's own label is also "Create Grid",
// so unscoped queries are ambiguous, and a stored element reference risks
// going stale if the dialog's subtree is ever swapped mid-test.
function dialog() {
  return within(screen.getByRole("dialog"));
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Create Grid" }));
  await screen.findByTestId("mini-map");
  // ReusableDialog auto-focuses the first focusable element 100ms after
  // opening. Typing that straddles that window gets its focus yanked back
  // mid-field, interleaving keystrokes across inputs (observed directly:
  // "Kampala Grid" + "City" landed as name="Kampala Gridity", admin="C").
  // Waiting out the timer first avoids racing it.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

/** Selects a network option and waits for the trigger to reflect it before continuing. */
async function selectNetwork(user: ReturnType<typeof userEvent.setup>, netName: string) {
  await user.click(dialog().getByRole("button", { name: /Sensor Manufacturer/ }));
  await user.click(dialog().getByRole("option", { name: netName }));
  await waitFor(() =>
    expect(dialog().getByRole("button", { name: /Sensor Manufacturer/ })).toHaveTextContent(
      netName
    )
  );
}

describe("CreateGridForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNetworks).mockReturnValue({
      networks: [{ net_name: "airqo" }, { net_name: "mairqo" }],
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useNetworks>);
  });

  it("opens the dialog with every field when the trigger is clicked", async () => {
    mockCreateGrid(vi.fn());
    const user = userEvent.setup();
    renderWithProviders(<CreateGridForm />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openDialog(user);
    expect(dialog().getByText(DIALOG_TITLE)).toBeInTheDocument();
    expect(dialog().getByLabelText(/Grid name/)).toBeInTheDocument();
    expect(dialog().getByRole("button", { name: /Sensor Manufacturer/ })).toBeInTheDocument();
    expect(dialog().getByLabelText(/Administrative level/)).toBeInTheDocument();
    expect(dialog().getByLabelText(/Shapefile/)).toBeInTheDocument();
  });

  it("blocks submission until a polygon has been drawn on the map", async () => {
    const createGridSpy = vi.fn();
    mockCreateGrid(createGridSpy);
    const user = userEvent.setup();
    // Default Redux state: grids.polygon.coordinates is null (nothing drawn yet).
    renderWithProviders(<CreateGridForm />);

    await openDialog(user);
    await user.type(dialog().getByLabelText(/Grid name/), "Kampala Grid");
    await user.type(dialog().getByLabelText(/Administrative level/), "City");
    await selectNetwork(user, "airqo");

    await user.click(dialog().getByRole("button", { name: "Submit" }));

    // Schema validation blocks the submit, and the message is rendered
    // manually alongside the (readOnly) Shapefile field — ReusableInputField
    // itself suppresses error text for readOnly fields, which would
    // otherwise leave the user with no feedback for why Submit did nothing.
    await waitFor(() => {
      expect(createGridSpy).not.toHaveBeenCalled();
    });
    expect(
      dialog().getByText("A polygon must be drawn on the map.")
    ).toBeInTheDocument();
    expect(dialog().getByText(DIALOG_TITLE)).toBeInTheDocument();
  });

  it("submits the name, network, admin level, and the drawn polygon", async () => {
    const createGridSpy = vi.fn();
    mockCreateGrid(createGridSpy);
    const user = userEvent.setup();
    renderWithProviders(<CreateGridForm />, {
      preloadedState: { grids: { polygon: VALID_POLYGON } },
    });

    await openDialog(user);
    await user.type(dialog().getByLabelText(/Grid name/), "Kampala Grid");
    await user.type(dialog().getByLabelText(/Administrative level/), "City");
    await selectNetwork(user, "mairqo");

    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(createGridSpy).toHaveBeenCalledWith(
        {
          name: "Kampala Grid",
          admin_level: "City",
          network: "mairqo",
          shape: VALID_POLYGON,
        },
        expect.anything()
      );
    });
  });

  it("shows a success banner and closes the dialog when creation succeeds", async () => {
    const createGridSpy = vi.fn((_data, options) => options?.onSuccess?.());
    mockCreateGrid(createGridSpy);
    const user = userEvent.setup();
    renderWithProviders(<CreateGridForm />, {
      preloadedState: { grids: { polygon: VALID_POLYGON } },
    });

    await openDialog(user);
    await user.type(dialog().getByLabelText(/Grid name/), "Kampala Grid");
    await user.type(dialog().getByLabelText(/Administrative level/), "City");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        message: "New grid added!",
        severity: "success",
        scoped: false,
      });
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error banner and keeps the dialog open when creation fails", async () => {
    const createGridSpy = vi.fn((_data, options) =>
      options?.onError?.(new Error("Network Error"))
    );
    mockCreateGrid(createGridSpy);
    const user = userEvent.setup();
    renderWithProviders(<CreateGridForm />, {
      preloadedState: { grids: { polygon: VALID_POLYGON } },
    });

    await openDialog(user);
    await user.type(dialog().getByLabelText(/Grid name/), "Kampala Grid");
    await user.type(dialog().getByLabelText(/Administrative level/), "City");
    await selectNetwork(user, "airqo");
    await user.click(dialog().getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Failed to create grid: Network Error",
        severity: "error",
        scoped: true,
      });
    });
    expect(dialog().getByText(DIALOG_TITLE)).toBeInTheDocument();
  });
});
