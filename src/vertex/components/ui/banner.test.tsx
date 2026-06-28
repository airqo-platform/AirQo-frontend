import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Banner, SuccessBanner, ErrorBanner, WarningBanner, InfoBanner } from "./banner";

describe("Banner", () => {
  it("renders success banner correctly", () => {
    render(<SuccessBanner title="Success" message="Action was successful" />);
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Action was successful")).toBeInTheDocument();
  });

  it("handles dismiss click", async () => {
    const handleDismiss = vi.fn();
    render(<InfoBanner message="Information" dismissible onDismiss={handleDismiss} />);
    
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
