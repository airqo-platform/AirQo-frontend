import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { CreateNetworkForm } from "./create-network-form";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { mockAxiosSuccess, mockAxiosError } from "@/test/factories/apiResponseFactory";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios") as any;
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  };
});

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

const showBannerWithDelayMock = vi.fn();
vi.mock("@/core/hooks/useBannerWithDelay", () => ({
  useBannerWithDelay: () => ({ showBannerWithDelay: showBannerWithDelayMock }),
}));

// ReusableSelectInput scrolls the highlighted option into view on open; jsdom
// doesn't implement scrollIntoView.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const DIALOG_TITLE = "Create a new Sensor Manufacturer";

// ReusableInputField appends the required-marker "*" directly to the label
// text with no separator (e.g. "Name*"), so exact-string label queries fail.
const requiredLabel = (text: string) => new RegExp(`^${text}\\*?$`);

// ReusableDialog auto-focuses the first focusable element 100ms after
// opening. Typing that straddles that window gets its focus yanked back
// mid-field, interleaving keystrokes across inputs — wait it out first.
async function settleDialogFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

/** Fills every required field with valid values; category is left at its "business" default. */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) {
  await user.type(within(dialog).getByLabelText(requiredLabel("Name")), "TestNet");
  await user.type(within(dialog).getByLabelText(requiredLabel("Acronym")), "TN");
  await user.type(within(dialog).getByLabelText(requiredLabel("Username")), "testnet_admin");
  await user.type(within(dialog).getByLabelText(requiredLabel("Email")), "support@testnet.com");
  await user.type(
    within(dialog).getByLabelText(requiredLabel("Website")),
    "https://www.testnet.com"
  );
  await user.type(
    within(dialog).getByLabelText(requiredLabel("Phone Number")),
    "+256771234567"
  );
  await user.type(
    within(dialog).getByLabelText(requiredLabel("Description")),
    "A test sensor manufacturer used for automated testing."
  );
  await user.type(
    within(dialog).getByLabelText(requiredLabel("Connection Endpoint")),
    "https://device.testnet.com/v2/"
  );
  await user.type(
    within(dialog).getByLabelText(requiredLabel("Connection String")),
    "https://device.testnet.com/v2/"
  );
}

describe("CreateNetworkForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("opens the dialog with every required field when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateNetworkForm />);

    expect(screen.queryByText(DIALOG_TITLE)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(DIALOG_TITLE)).toBeInTheDocument();
    for (const label of [
      "Name",
      "Acronym",
      "Username",
      "Email",
      "Website",
      "Phone Number",
      "Description",
      "Connection Endpoint",
      "Connection String",
    ]) {
      expect(within(dialog).getByLabelText(requiredLabel(label))).toBeInTheDocument();
    }
    expect(within(dialog).getByRole("button", { name: requiredLabel("Category") })).toHaveTextContent(
      "Business"
    );
  });

  it("shows validation errors and never calls the API when required fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateNetworkForm />);

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Create Sensor Manufacturer" }));

    await waitFor(() => {
      expect(
        within(dialog).getByText("Sensor Manufacturer name must be at least 2 characters.")
      ).toBeInTheDocument();
    });
    expect(
      within(dialog).getByText("Acronym must be at least 2 characters.")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Username must be at least 2 characters.")
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Invalid email address.")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Invalid URL.")).toHaveLength(3);
    expect(within(dialog).getByText("Phone number seems too short.")).toBeInTheDocument();
    expect(within(dialog).getByText("Description is too short.")).toBeInTheDocument();

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits valid data, posts the exact payload, shows a success banner, and closes the dialog", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce(mockAxiosSuccess({ success: true }));
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<CreateNetworkForm />);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));
    const dialog = screen.getByRole("dialog");
    await settleDialogFocus();
    await fillValidForm(user, dialog);

    // Exercise the category select explicitly rather than relying on its default.
    await user.click(within(dialog).getByRole("button", { name: requiredLabel("Category") }));
    await user.click(within(dialog).getByRole("option", { name: "Research" }));

    await user.click(within(dialog).getByRole("button", { name: "Create Sensor Manufacturer" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/network",
        expect.objectContaining({
          net_name: "TestNet",
          net_acronym: "TN",
          net_username: "testnet_admin",
          net_email: "support@testnet.com",
          net_website: "https://www.testnet.com",
          net_phoneNumber: "+256771234567",
          net_category: "research",
          net_description: "A test sensor manufacturer used for automated testing.",
          net_connection_endpoint: "https://device.testnet.com/v2/",
          net_connection_string: "https://device.testnet.com/v2/",
        }),
        expect.objectContaining({ headers: { "Content-Type": "application/json" } })
      );
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["networks"] });
    expect(showBannerWithDelayMock).toHaveBeenCalledWith({
      severity: "success",
      message: "Sensor Manufacturer created successfully!",
      scoped: false,
    });

    await waitFor(() => {
      expect(screen.queryByText(DIALOG_TITLE)).not.toBeInTheDocument();
    });
  });

  it("shows an error banner and keeps the dialog open with entered data on API failure", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(
      mockAxiosError(500, "Something went wrong", { message: "Something went wrong" })
    );
    const user = userEvent.setup();
    renderWithProviders(<CreateNetworkForm />);

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));
    const dialog = screen.getByRole("dialog");
    await settleDialogFocus();
    await fillValidForm(user, dialog);

    await user.click(within(dialog).getByRole("button", { name: "Create Sensor Manufacturer" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        severity: "error",
        message: "Something went wrong",
        scoped: true,
      });
    });

    // Failure must not silently discard what the user typed.
    expect(within(dialog).getByText(DIALOG_TITLE)).toBeInTheDocument();
    expect(within(dialog).getByLabelText(requiredLabel("Name"))).toHaveValue("TestNet");
    expect(showBannerWithDelayMock).not.toHaveBeenCalled();
  });

  it("resets the form when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateNetworkForm />);

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));
    let dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(requiredLabel("Name")), "Should be cleared");

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByText(DIALOG_TITLE)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Create Sensor Manufacturer" }));
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText(requiredLabel("Name"))).toHaveValue("");
    expect(axios.post).not.toHaveBeenCalled();
  });
});
