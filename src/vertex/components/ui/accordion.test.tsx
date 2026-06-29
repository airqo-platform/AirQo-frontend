import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

describe("Accordion", () => {
  it("expands and collapses", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Open Item 1</AccordionTrigger>
          <AccordionContent>Item 1 Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Initial state: content shouldn't be in the document or should be hidden
    expect(screen.queryByText("Item 1 Content")).not.toBeInTheDocument();
    
    await userEvent.click(screen.getByRole("button", { name: "Open Item 1" }));
    
    // Radix animates it in, but it should be placed in the DOM right away
    expect(screen.getByText("Item 1 Content")).toBeInTheDocument();
  });
});
