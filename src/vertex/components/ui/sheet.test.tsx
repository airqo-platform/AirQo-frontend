import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "./sheet";

describe("Sheet", () => {
  it("opens the sheet", async () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet Desc</SheetDescription>
        </SheetContent>
      </Sheet>
    );

    expect(screen.queryByText("Sheet Title")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Open Sheet"));
    expect(await screen.findByText("Sheet Title")).toBeInTheDocument();
  });
});
