import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("renders properly", () => {
    render(<Calendar mode="single" selected={new Date(2026, 5, 15)} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
