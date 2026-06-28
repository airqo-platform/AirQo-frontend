import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiSelectCombobox } from "./multi-select";

import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

describe("MultiSelectCombobox", () => {
  it("renders correctly with placeholder", () => {
    render(<MultiSelectCombobox options={[]} value={[]} onValueChange={vi.fn()} placeholder="Select tags" />);
    expect(screen.getByText("Select tags")).toBeInTheDocument();
  });
});
