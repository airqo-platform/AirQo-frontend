import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  it("catches errors and displays fallback", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const preventError = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener("error", preventError);
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Sorry.. there was an error")).toBeInTheDocument();
    
    window.removeEventListener("error", preventError);
    consoleError.mockRestore();
  });
});
