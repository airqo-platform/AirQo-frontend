import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ComboBox } from "./combobox";

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
window.PointerEvent = MockPointerEvent as never;
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.releasePointerCapture = () => {};

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("ComboBox", () => {
  it("renders and selects", async () => {
    const handleChange = vi.fn();
    const options = [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ];

    render(<ComboBox options={options} onValueChange={handleChange} placeholder="Select fruit" />);

    const button = screen.getByRole("combobox");
    expect(screen.getByText("Select fruit")).toBeInTheDocument();
    
    await userEvent.click(button);
    await userEvent.click(screen.getByText("Banana"));

    expect(handleChange).toHaveBeenCalledWith("banana");
  });
});
