import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReusableTable from "./ReusableTable";

const nav = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => "/test-path",
  useSearchParams: () => nav.searchParams,
}));

vi.mock("@/context/banner-context", () => ({
  useBanner: () => ({ showBanner: vi.fn(), hideBanner: vi.fn() }),
}));

describe("ReusableTable", () => {
  beforeEach(() => {
    nav.replace.mockClear();
    nav.searchParams = new URLSearchParams();
  });

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

  describe("URL-synced pagination (tableId)", () => {
    const columns = [{ key: "name", render: (val: unknown) => String(val) }];

    it("does not rewrite the URL for an empty table (regression for #4000)", () => {
      render(<ReusableTable columns={columns as never} data={[]} tableId="devices" />);

      expect(screen.getByText("No data available")).toBeInTheDocument();
      expect(nav.replace).not.toHaveBeenCalled();
    });

    it("still corrects an out-of-range page in the URL", () => {
      nav.searchParams = new URLSearchParams("devices_page=5");
      render(
        <ReusableTable columns={columns as never} data={[{ id: 1, name: "Alice" }]} tableId="devices" />
      );

      expect(nav.replace).toHaveBeenCalledTimes(1);
      expect(nav.replace).toHaveBeenCalledWith("/test-path?", { scroll: false });
    });
  });
});
