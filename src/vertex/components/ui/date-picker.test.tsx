import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./date-picker";

import { setupPointerEventMock } from "@/test/utils/domMocks";

setupPointerEventMock();

describe("DatePicker", () => {
  it("opens calendar", async () => {
    render(<DatePicker onChange={vi.fn()} />);
    const button = screen.getByRole("button", { name: /pick a date/i });
    
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(button);
    
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });
});
