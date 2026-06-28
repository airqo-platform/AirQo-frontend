import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ForbiddenPage } from "./forbidden-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() })
}));
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn()
}));

describe("ForbiddenPage", () => {
  it("renders with custom message", () => {
    render(<ForbiddenPage message="Custom forbidden message" />);
    expect(screen.getByText("Custom forbidden message")).toBeInTheDocument();
  });
});
