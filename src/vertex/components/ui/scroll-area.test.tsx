import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScrollArea } from "./scroll-area";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("ScrollArea", () => {
  it("renders children inside scroll viewport", () => {
    render(
      <ScrollArea>
        <div>Scrollable Content</div>
      </ScrollArea>
    );
    expect(screen.getByText("Scrollable Content")).toBeInTheDocument();
  });
});
