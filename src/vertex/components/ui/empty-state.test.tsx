import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders with correct text and action", () => {
    render(
      <EmptyState
        icon={<div data-testid="test-icon" />}
        title="No Data"
        description="There is no data to show."
        action={<button>Add Data</button>}
      />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "No Data" })).toBeInTheDocument();
    expect(screen.getByText("There is no data to show.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Data" })).toBeInTheDocument();
  });
});
