import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditSiteDetailsDialog } from "./edit-site-details-dialog";
import { useUpdateSiteDetails } from "@/core/hooks/useSites";
import type { Site } from "@/app/types/sites";

vi.mock("@/core/hooks/useSites", () => ({
  useUpdateSiteDetails: vi.fn(),
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

const SITE: Site = {
  _id: "site-1",
  name: "Kampala Road",
  description: "Near the taxi park",
  latitude: 0.3476,
  longitude: 32.5825,
  parish: "Central",
  sub_county: "Kampala Central",
  district: "Kampala",
  region: "Central",
  altitude: 1190,
  search_name: "Kampala Rd",
  location_name: "Near the roundabout",
};

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

function mockUpdateSite(
  mutateSpy: (
    variables: { siteId: string; data: Record<string, unknown> },
    hookOptions: unknown,
    callOptions: unknown
  ) => void
) {
  vi.mocked(useUpdateSiteDetails).mockImplementation((hookOptions) =>
    ({
      mutate: (
        variables: { siteId: string; data: Record<string, unknown> },
        callOptions: unknown
      ) => mutateSpy(variables, hookOptions, callOptions),
      isPending: false,
    }) as unknown as ReturnType<typeof useUpdateSiteDetails>
  );
}

describe("EditSiteDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the general section pre-filled from the site", () => {
    mockUpdateSite(vi.fn());
    render(
      <EditSiteDetailsDialog open onOpenChange={vi.fn()} site={SITE} section="general" />
    );

    expect(dialog().getByText("Edit Site Details")).toBeInTheDocument();
    expect(dialog().getByLabelText(/Site Name/)).toHaveValue("Kampala Road");
    expect(dialog().getByLabelText(/Latitude/)).toHaveValue("0.3476");
    expect(dialog().getByLabelText(/Longitude/)).toHaveValue("32.5825");
    expect(dialog().getByLabelText("District")).toHaveValue("Kampala");
  });

  it("renders the mobile section pre-filled from the site", () => {
    mockUpdateSite(vi.fn());
    render(
      <EditSiteDetailsDialog open onOpenChange={vi.fn()} site={SITE} section="mobile" />
    );

    expect(dialog().getByText("Edit Mobile App Details")).toBeInTheDocument();
    expect(dialog().getByLabelText("Editable Name")).toHaveValue("Kampala Rd");
    expect(dialog().getByLabelText("Editable Description")).toHaveValue(
      "Near the roundabout"
    );
  });

  it("shows an error and does not call updateSite when nothing was changed", async () => {
    const mutateSpy = vi.fn();
    mockUpdateSite(mutateSpy);
    const user = userEvent.setup();
    render(
      <EditSiteDetailsDialog open onOpenChange={vi.fn()} site={SITE} section="general" />
    );

    await user.click(dialog().getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "No fields have been modified",
        scoped: true,
      });
    });
    expect(mutateSpy).not.toHaveBeenCalled();
  });

  it("saves only the changed field", async () => {
    const mutateSpy = vi.fn();
    mockUpdateSite(mutateSpy);
    const user = userEvent.setup();
    render(
      <EditSiteDetailsDialog open onOpenChange={vi.fn()} site={SITE} section="general" />
    );
    await settleDialogFocus();

    const nameInput = dialog().getByLabelText(/Site Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(dialog().getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledWith(
        { siteId: "site-1", data: { name: "New Name" } },
        expect.anything(),
        expect.anything()
      );
    });
  });

  it("converts latitude/longitude/altitude to numbers when changed", async () => {
    const mutateSpy = vi.fn();
    mockUpdateSite(mutateSpy);
    const user = userEvent.setup();
    render(
      <EditSiteDetailsDialog open onOpenChange={vi.fn()} site={SITE} section="general" />
    );
    await settleDialogFocus();

    const latInput = dialog().getByLabelText(/Latitude/);
    await user.clear(latInput);
    await user.type(latInput, "1.5");
    await user.click(dialog().getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledWith(
        { siteId: "site-1", data: { latitude: 1.5 } },
        expect.anything(),
        expect.anything()
      );
    });
  });

  it("shows a success banner and closes when the update succeeds", async () => {
    const mutateSpy = vi.fn((_variables, hookOptions, callOptions) => {
      hookOptions?.onSuccess?.();
      callOptions?.onSuccess?.();
    });
    mockUpdateSite(mutateSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditSiteDetailsDialog
        open
        onOpenChange={onOpenChange}
        site={SITE}
        section="general"
      />
    );
    await settleDialogFocus();

    const nameInput = dialog().getByLabelText(/Site Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(dialog().getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(showBannerWithDelayMock).toHaveBeenCalledWith({
        severity: "success",
        message: "Site details updated successfully",
        scoped: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error banner and keeps the dialog open when the update fails", async () => {
    const mutateSpy = vi.fn((_variables, options) =>
      options?.onError?.(new Error("Network Error"))
    );
    mockUpdateSite(mutateSpy);
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditSiteDetailsDialog
        open
        onOpenChange={onOpenChange}
        site={SITE}
        section="general"
      />
    );
    await settleDialogFocus();

    const nameInput = dialog().getByLabelText(/Site Name/);
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(dialog().getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Failed to update site: Network Error",
        scoped: true,
      });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
