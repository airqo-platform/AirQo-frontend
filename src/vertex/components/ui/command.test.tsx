import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "./command";

window.HTMLElement.prototype.scrollIntoView = () => {};

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Command", () => {
  it("renders structure", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Fruits">
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Fruits")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });
});
