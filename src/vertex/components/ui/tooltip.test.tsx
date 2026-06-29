import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("shows tooltip on hover", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
    
    await userEvent.hover(screen.getByText("Hover me"));
    
    const tooltips = await screen.findAllByText("Tooltip text");
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
