import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles state", async () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} aria-label="Toggle feature" />);
    
    const switchElement = screen.getByRole("switch", { name: "Toggle feature" });
    expect(switchElement).toHaveAttribute("aria-checked", "false");
    
    await userEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
