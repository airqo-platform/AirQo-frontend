import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("handles user input", async () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    
    await userEvent.type(input, "test@example.com");
    expect(input).toHaveValue("test@example.com");
  });

  it("can be disabled", () => {
    render(<Input placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
  });
});
