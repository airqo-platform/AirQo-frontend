import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import { setupPointerEventMock } from "@/test/utils/domMocks";

setupPointerEventMock();

describe("DropdownMenu", () => {

  it("opens menu and shows items", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open Menu" }));

    const menu = await screen.findByRole("menu");
    expect(menu).toBeInTheDocument();

    expect(screen.getByRole("menuitem", { name: "Item 1" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Item 2" })).toBeInTheDocument();
  });
});
