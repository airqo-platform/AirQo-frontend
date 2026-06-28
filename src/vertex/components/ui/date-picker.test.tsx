import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./date-picker";

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

describe("DatePicker", () => {
  it("opens calendar", async () => {
    render(<DatePicker onChange={vi.fn()} />);
    const button = screen.getByRole("button", { name: /pick a date/i });
    
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(button);
    
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });
});
