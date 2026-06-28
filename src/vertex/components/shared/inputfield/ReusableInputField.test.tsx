import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import ReusableInputField from "./ReusableInputField";

// Mock toast to avoid missing canvas/window functions in jsdom sometimes or to just isolate
vi.mock("../toast/ReusableToast", () => ({
  default: vi.fn(),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("ReusableInputField", () => {
  it("renders basic input", () => {
    render(<ReusableInputField label="Email" placeholder="Enter email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<ReusableInputField label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    render(<ReusableInputField label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    await userEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
    
    await userEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("calls custom action", async () => {
    const handleAction = vi.fn();
    const MockIcon = () => <div data-testid="custom-icon" />;
    
    render(
      <ReusableInputField 
        label="Search" 
        customActionIcon={MockIcon} 
        onCustomAction={handleAction} 
        customActionLabel="Do search"
      />
    );
    
    const actionBtn = screen.getByRole("button", { name: "Do search" });
    await userEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
