import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Card from "./CardWrapper";

describe("CardWrapper", () => {
  it("renders with basic content", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders with headers and footers", () => {
    render(
      <Card header={<div data-testid="header">Header</div>} footer={<div data-testid="footer">Footer</div>}>
        Content
      </Card>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("handles clicks", async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick} testId="clickable-card">Content</Card>);
    await userEvent.click(screen.getByTestId("clickable-card"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
