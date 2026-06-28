import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stepper, Step } from "./stepper";

describe("Stepper", () => {
  it("renders steps based on index", () => {
    render(
      <Stepper index={1}>
        <Step>
          <span>Step 1</span>
          <span>Desc 1</span>
        </Step>
        <Step>
          <span>Step 2</span>
        </Step>
      </Stepper>
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });
});
