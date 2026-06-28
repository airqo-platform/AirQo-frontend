import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChartContainer } from "./chart";
import { BarChart, Bar } from "recharts";

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("recharts", async () => {
  const OriginalRecharts = await vi.importActual<Record<string, unknown>>("recharts");
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 800 }}>{children}</div>
    ),
  };
});

describe("ChartContainer", () => {
  it("renders without crashing", () => {
    const config = { desktop: { label: "Desktop", color: "blue" } };
    const { container } = render(
      <div style={{ width: 100, height: 100 }}>
        <ChartContainer config={config}>
          <BarChart data={[{ x: 1, y: 2 }]}>
            <Bar dataKey="y" />
          </BarChart>
        </ChartContainer>
      </div>
    );
    expect(container).toBeInTheDocument();
  });
});
