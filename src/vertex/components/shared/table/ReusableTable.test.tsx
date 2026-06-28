import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReusableTable from "./ReusableTable";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/test-path",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

describe("ReusableTable", () => {
  it("renders with empty data", () => {
    render(<ReusableTable columns={[]} data={[]} title="Test Table" />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders data correctly", () => {
    const columns = [
      { key: "name", render: (val: unknown) => String(val) },
    ];
    const data = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" }
    ];

    render(<ReusableTable columns={columns as never} data={data} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
