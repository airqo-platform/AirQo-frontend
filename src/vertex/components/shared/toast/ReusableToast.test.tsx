import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Toaster, toast } from "./ReusableToast";
import ReusableToast from "./ReusableToast";

describe("ReusableToast", () => {
  it("can render the Toaster component", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });

  it("exports toast methods", () => {
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof ReusableToast).toBe("function");
  });
});
