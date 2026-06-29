import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders correctly", () => {
    render(
      <Alert>
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: "Error!" })).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Alert variant="destructive" data-testid="alert-dest" />);
    const alert = screen.getByTestId("alert-dest");
    expect(alert.className).toContain("destructive");
  });
});
