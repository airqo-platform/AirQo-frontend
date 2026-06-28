import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

describe("HoverCard", () => {
  it("renders content", () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Hover Content</HoverCardContent>
      </HoverCard>
    );

    expect(screen.getByText("Hover Content")).toBeInTheDocument();
  });
});
