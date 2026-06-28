import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;

    constructor(type: string, props: PointerEventInit) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.pointerType = props.pointerType || "mouse";
    }
  }
  window.PointerEvent = MockPointerEvent as any;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};

  it("renders and selects options", async () => {
    const handleValueChange = vi.fn();
    
    render(
      <Select onValueChange={handleValueChange}>
        <SelectTrigger aria-label="Food">
          <SelectValue placeholder="Select food" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox", { name: "Food" });
    expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
    
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();

    const appleOption = within(listbox).getByRole("option", { name: "Apple" });
    await userEvent.click(appleOption);

    expect(handleValueChange).toHaveBeenCalledWith("apple");
  });
});
