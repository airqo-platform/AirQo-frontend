import React from "react";
import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import { FeedbackLauncher } from "./feedback-launcher";
import { openFeedbackDialog } from "./feedback-dialog";
import { feedbackService } from "@/core/apis/feedback";

const showBanner = vi.fn();

vi.mock("@/core/apis/feedback", () => ({
  feedbackService: { submitFeedback: vi.fn() },
}));

vi.mock("@/core/apis/cloudinary", () => ({
  uploadToCloudinary: vi.fn(),
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: () => ({ userDetails: { email: "user@example.com" } }),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner, hideBanner: vi.fn() }),
  BannerSlot: () => null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/devices",
}));

const submitFeedback = vi.mocked(feedbackService.submitFeedback);

/** Opens the dialog and fills in a complete issue report. */
const fillIssueReport = () => {
  render(<FeedbackLauncher />);

  act(() => {
    openFeedbackDialog();
  });

  fireEvent.click(screen.getByText("Report an issue"));
  fireEvent.click(screen.getByLabelText(/what were you trying to do/i));
  fireEvent.click(screen.getByText("Claiming devices"));
  fireEvent.change(screen.getByLabelText(/describe the issue/i), {
    target: { value: "The devices table does not load after filtering." },
  });
};

const send = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await act(async () => {
    await Promise.resolve();
  });
};

/** The thank-you banner is shown a beat after the dialog closes. */
const flushThankYou = async () => {
  await act(async () => {
    await new Promise(resolve => {
      setTimeout(resolve, 350);
    });
  });
};

describe("FeedbackLauncher contact consent", () => {
  beforeAll(() => {
    // jsdom has no SVG layout engine, and the star rating measures itself.
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      writable: true,
      value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    submitFeedback.mockResolvedValue({ success: true, message: "ok" });
  });

  afterEach(() => {
    cleanup();
  });

  it("offers to contact the submitter by default", async () => {
    fillIssueReport();

    const consent = screen.getByRole("checkbox", {
      name: /ok to contact me about this/i,
    });
    expect(consent).toBeChecked();

    await send();

    expect(submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ category: "bug", contact_consent: true })
    );
  });

  it("promises a reply when the submitter keeps consent on", async () => {
    fillIssueReport();
    await send();

    await flushThankYou();

    expect(showBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "Thanks — we'll email you if we need more details or when it's resolved.",
      })
    );
  });

  it("honours an unticked box and says so", async () => {
    fillIssueReport();

    fireEvent.click(
      screen.getByRole("checkbox", { name: /ok to contact me about this/i })
    );
    await send();

    expect(submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ contact_consent: false })
    );

    await flushThankYou();

    expect(showBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Thanks — we've received it. We won't contact you about this.",
      })
    );
  });
});
