import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-primary");
  });

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error").className).toContain("bg-destructive");
  });
});
