import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toaster } from "./toaster";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toasts: [
      { id: "1", title: "Test Toast", description: "Test Description" }
    ]
  })
}));

describe("Toaster", () => {
  it("renders toasts from hook", () => {
    render(<Toaster />);
    expect(screen.getByText("Test Toast")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });
});
