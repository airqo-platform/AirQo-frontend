import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiSelectCombobox } from "./multi-select";

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

describe("MultiSelectCombobox", () => {
  it("renders correctly with placeholder", () => {
    render(<MultiSelectCombobox options={[]} value={[]} onValueChange={vi.fn()} placeholder="Select tags" />);
    expect(screen.getByText("Select tags")).toBeInTheDocument();
  });
});
