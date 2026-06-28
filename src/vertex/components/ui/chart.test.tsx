import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChartContainer } from "./chart";
import { BarChart, Bar } from "recharts";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("ChartContainer", () => {
  it("renders without crashing", () => {
    const config = { desktop: { label: "Desktop", color: "blue" } };
    const { container } = render(
      <ChartContainer config={config}>
        <BarChart data={[{ x: 1, y: 2 }]}>
          <Bar dataKey="y" />
        </BarChart>
      </ChartContainer>
    );
    expect(container).toBeInTheDocument();
  });
});
