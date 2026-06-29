import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renders properly", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveClass("bg-border");
  });
});
