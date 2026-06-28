import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";

describe("Collapsible", () => {
  it("expands and collapses", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
