import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

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

describe("Popover", () => {
  it("shows popover content on click", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover Text</PopoverContent>
      </Popover>
    );

    expect(screen.queryByText("Popover Text")).not.toBeInTheDocument();
    
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    
    expect(await screen.findByText("Popover Text")).toBeInTheDocument();
  });
});
