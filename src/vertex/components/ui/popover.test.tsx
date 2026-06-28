import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { setupPointerEventMock } from "@/test/utils/domMocks";

setupPointerEventMock();

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
