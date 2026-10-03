import React from "react";
import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PageSatisfactionBanner } from "./page-satisfaction-banner";
import { feedbackService } from "@/core/apis/feedback";
import {
  claimFeedbackPromptSlot,
  releaseFeedbackPromptSlot,
} from "./feedback-prompt-slot";

const DWELL_BEFORE_ASKING_MS = 30_000;
const INTERACTION_MIN_DWELL_MS = 5_000;

const showBanner = vi.fn();

vi.mock("@/core/apis/feedback", () => ({
  feedbackService: {
    submitSatisfactionFeedback: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("@/core/hooks/useUserContext", () => ({
  useUserContext: () => ({ userDetails: { email: "user@example.com" } }),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner, hideBanner: vi.fn() }),
  BannerSlot: () => null,
}));

vi.mock("@/context/page-title-context", () => ({
  usePageTitleContext: () => ({ title: "Devices", section: "Network" }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/devices",
}));

const submitSatisfactionFeedback = vi.mocked(
  feedbackService.submitSatisfactionFeedback
);

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

/** Lets a click's submission promise settle. */
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const question = () => screen.queryByText(/how satisfied are you with Devices/i);

describe("PageSatisfactionBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    submitSatisfactionFeedback.mockResolvedValue({
      success: true,
      message: "ok",
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    releaseFeedbackPromptSlot("login-experience");
    vi.useRealTimers();
  });

  it("waits until the user has settled on the page before asking", () => {
    render(<PageSatisfactionBanner />);

    expect(question()).not.toBeInTheDocument();

    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).toBeInTheDocument();
  });

  it("ignores an interaction from someone who just arrived", () => {
    render(<PageSatisfactionBanner />);

    advance(INTERACTION_MIN_DWELL_MS - 1_000);
    fireEvent.pointerDown(window);

    expect(question()).not.toBeInTheDocument();

    advance(2_000);
    fireEvent.pointerDown(window);

    expect(question()).toBeInTheDocument();
  });

  it("stays out of the way while the login popup owns the corner", () => {
    claimFeedbackPromptSlot("login-experience");
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).not.toBeInTheDocument();

    act(() => {
      releaseFeedbackPromptSlot("login-experience");
    });

    expect(question()).toBeInTheDocument();
  });

  it("sends a bare rating for a one-click 👍 and thanks the user", async () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    fireEvent.click(screen.getByRole("button", { name: "Satisfied" }));
    await settle();

    expect(submitSatisfactionFeedback).toHaveBeenCalledTimes(1);
    expect(submitSatisfactionFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        subject: "Page Satisfaction: Devices",
        rating: 5,
        description: undefined,
        page: "/devices",
      })
    );
    expect(screen.getByText(/thanks for rating this page/i)).toBeInTheDocument();
  });

  it("asks about a page once per cooldown, answered or not", () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);
    expect(question()).toBeInTheDocument();

    cleanup();
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).not.toBeInTheDocument();
  });

  it("does not spend the page's turn while the popup holds the banner back", () => {
    claimFeedbackPromptSlot("login-experience");
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    cleanup();
    releaseFeedbackPromptSlot("login-experience");
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).toBeInTheDocument();
  });

  it("does not ask again on a page that has been rated", async () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);
    fireEvent.click(screen.getByRole("button", { name: "Satisfied" }));
    await settle();

    cleanup();
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).not.toBeInTheDocument();
  });

  it("sends nothing when dismissed, and keeps quiet afterwards", () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(submitSatisfactionFeedback).not.toHaveBeenCalled();
    expect(question()).not.toBeInTheDocument();

    cleanup();
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    expect(question()).not.toBeInTheDocument();
  });

  it("lets a 👎 go through with no reason at all", async () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    fireEvent.click(screen.getByRole("button", { name: "Not satisfied" }));
    expect(
      screen.getByText(/why did you choose this rating/i)
    ).toBeInTheDocument();
    expect(submitSatisfactionFeedback).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: /send without a reason/i })
    );
    await settle();

    expect(submitSatisfactionFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 1, description: undefined })
    );
  });

  it("sends the chosen reason as the 👎 description", async () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    fireEvent.click(screen.getByRole("button", { name: "Not satisfied" }));
    fireEvent.click(screen.getByLabelText("Confusing"));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await settle();

    expect(submitSatisfactionFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 1, description: "Confusing" })
    );
  });

  it("keeps asking when the reason dialog is closed instead of sent", () => {
    render(<PageSatisfactionBanner />);
    advance(DWELL_BEFORE_ASKING_MS);

    fireEvent.click(screen.getByRole("button", { name: "Not satisfied" }));
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(submitSatisfactionFeedback).not.toHaveBeenCalled();
    expect(question()).toBeInTheDocument();
  });
});
