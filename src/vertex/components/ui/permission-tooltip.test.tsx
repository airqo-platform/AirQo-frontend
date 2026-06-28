import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PermissionTooltip from "./permission-tooltip";

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>
}));

describe("PermissionTooltip", () => {
  it("renders tooltip with permissions", () => {
    render(
      <PermissionTooltip permissions={["admin:read"]}>
        <button>Restricted Action</button>
      </PermissionTooltip>
    );

    expect(screen.getByText("admin:read")).toBeInTheDocument();
  });
});
