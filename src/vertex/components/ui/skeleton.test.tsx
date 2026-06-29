import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders correctly", () => {
    const { container } = render(<Skeleton className="w-[100px] h-[20px]" />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.className).toContain("animate-pulse");
    expect(element.className).toContain("w-[100px]");
    expect(element.className).toContain("h-[20px]");
  });
});
