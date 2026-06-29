import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ReusableButton from "./ReusableButton";

describe("ReusableButton", () => {
  it("renders as a button by default", () => {
    render(<ReusableButton>Click me</ReusableButton>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders as an anchor when path is provided", () => {
    render(<ReusableButton path="/home">Go Home</ReusableButton>);
    expect(screen.getByRole("link", { name: "Go Home" })).toBeInTheDocument();
  });

  it("handles loading state", () => {
    render(<ReusableButton loading>Submit</ReusableButton>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });

  it("renders tooltip span when disabled with permission", () => {
    render(<ReusableButton disabled permission="CREATE_USER">Action</ReusableButton>);
    const actionText = screen.getByText("Action");
    expect(actionText).toBeInTheDocument();
  });
});
