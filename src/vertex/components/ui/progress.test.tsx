import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
  it("renders without crashing", () => {
    const { container } = render(<Progress value={45} />);
    expect(container).toBeInTheDocument();
  });
});
