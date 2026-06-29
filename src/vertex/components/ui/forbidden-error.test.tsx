import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ForbiddenError } from "./forbidden-error";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() })
}));
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn()
}));

describe("ForbiddenError", () => {
  it("renders default message", () => {
    render(<ForbiddenError />);
    expect(screen.getByText("You don't have access rights to this page.")).toBeInTheDocument();
  });
});
