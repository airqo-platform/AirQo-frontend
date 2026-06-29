import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import SelectField from "./select-field";

window.HTMLElement.prototype.scrollIntoView = () => {};

describe("SelectField", () => {
  it("renders with options and triggers onChange", async () => {
    const handleChange = vi.fn();
    render(
      <SelectField onChange={handleChange} label="My Field">
        <option value="1">One</option>
        <option value="2">Two</option>
      </SelectField>
    );

    expect(screen.getByText("My Field")).toBeInTheDocument();
    
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("One"));
    
    expect(handleChange).toHaveBeenCalled();
  });
});
