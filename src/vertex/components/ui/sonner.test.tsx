import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toaster } from "./sonner";

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ theme: "light" })
}));

describe("Sonner Toaster", () => {
  it("renders without crashing", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });
});
