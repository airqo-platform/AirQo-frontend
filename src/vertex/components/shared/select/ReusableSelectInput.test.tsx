import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import ReusableSelectInput from "./ReusableSelectInput";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ReusableSelectInput", () => {
  it("renders placeholder correctly", () => {
    render(
      <ReusableSelectInput label="Fruit" placeholder="Pick fruit">
        <option value="apple">Apple</option>
      </ReusableSelectInput>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Pick fruit")).toBeInTheDocument();
  });

  it("shows options and handles selection", async () => {
    const handleChange = vi.fn();
    render(
      <ReusableSelectInput label="Fruit" onChange={handleChange}>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </ReusableSelectInput>
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const bananaOption = screen.getByText("Banana");
    
    await userEvent.click(bananaOption);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "banana" })
      })
    );
  });

  it("handles keyboard navigation", async () => {
    render(
      <ReusableSelectInput label="Fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </ReusableSelectInput>
    );

    const button = screen.getByRole("button");
    button.focus();
    
    // Open with arrow down
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
