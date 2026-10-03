import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReusableSatisfactionFeedbackToast } from "./reusable-satisfaction-feedback-toast";

const SHOW_DELAY_MS = 3000;
const AUTO_DISMISS_MS = 30000;

const renderToast = (
  props: Partial<
    React.ComponentProps<typeof ReusableSatisfactionFeedbackToast>
  > = {}
) => {
  const onPositiveSubmit = vi.fn();
  const onNegativeSubmit = vi.fn();
  const onDismiss = vi.fn();

  render(
    <ReusableSatisfactionFeedbackToast
      title="How was your login experience?"
      negativeReasons={["It took too long to load", "Other"]}
      onPositiveSubmit={onPositiveSubmit}
      onNegativeSubmit={onNegativeSubmit}
      onDismiss={onDismiss}
      {...props}
    />
  );

  return { onPositiveSubmit, onNegativeSubmit, onDismiss };
};

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("ReusableSatisfactionFeedbackToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("appears after the show delay", () => {
    renderToast();

    expect(
      screen.queryByText("How was your login experience?")
    ).not.toBeInTheDocument();

    advance(SHOW_DELAY_MS);

    expect(screen.getByText("How was your login experience?")).toBeInTheDocument();
  });

  it("closes from the ✕ without submitting anything", () => {
    const { onDismiss, onPositiveSubmit, onNegativeSubmit } = renderToast();
    advance(SHOW_DELAY_MS);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onDismiss).toHaveBeenCalledWith("close");
    expect(onPositiveSubmit).not.toHaveBeenCalled();
    expect(onNegativeSubmit).not.toHaveBeenCalled();
    expect(
      screen.queryByText("How was your login experience?")
    ).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const { onDismiss } = renderToast();
    advance(SHOW_DELAY_MS);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onDismiss).toHaveBeenCalledWith("close");
  });

  it("reports an auto-hide separately from a deliberate close", () => {
    const { onDismiss } = renderToast();
    advance(SHOW_DELAY_MS);

    advance(AUTO_DISMISS_MS);

    expect(onDismiss).toHaveBeenCalledWith("auto");
  });

  it("pauses the auto-hide while the pointer is over it", () => {
    const { onDismiss } = renderToast();
    advance(SHOW_DELAY_MS);

    fireEvent.mouseEnter(screen.getByRole("dialog"));
    advance(AUTO_DISMISS_MS * 2);

    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText("How was your login experience?")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole("dialog"));
    advance(AUTO_DISMISS_MS);

    expect(onDismiss).toHaveBeenCalledWith("auto");
  });

  it("leaves a half-typed reason alone instead of auto-hiding", () => {
    const { onDismiss } = renderToast();
    advance(SHOW_DELAY_MS);

    fireEvent.click(screen.getByRole("button", { name: /not great/i }));
    advance(AUTO_DISMISS_MS * 2);

    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText("It took too long to load")).toBeInTheDocument();
  });
});
