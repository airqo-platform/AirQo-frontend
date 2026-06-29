import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders and handles input", async () => {
    render(<Textarea placeholder="Enter comment" />);
    
    const textarea = screen.getByPlaceholderText("Enter comment");
    expect(textarea).toBeInTheDocument();
    
    await userEvent.type(textarea, "Hello world");
    expect(textarea).toHaveValue("Hello world");
  });
});
