import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stepper, Step, StepTitle, StepDescription } from "./stepper";

describe("Stepper", () => {
  it("renders steps based on index", () => {
    render(
      <Stepper index={1}>
        <Step>
          <StepTitle>Step 1</StepTitle>
          <StepDescription>Desc 1</StepDescription>
        </Step>
        <Step>
          <StepTitle>Step 2</StepTitle>
        </Step>
      </Stepper>
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });
});
