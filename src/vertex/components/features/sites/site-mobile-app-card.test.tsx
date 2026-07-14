import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SiteMobileAppCard } from "./site-mobile-app-card";

describe("SiteMobileAppCard", () => {
  it("renders the site's mobile app fields", () => {
    render(
      <SiteMobileAppCard
        site={{
          search_name: "Kampala Rd",
          location_name: "Near the roundabout",
          city: "Kampala",
          country: "Uganda",
        }}
      />
    );

    expect(screen.getByText("Kampala Rd")).toBeInTheDocument();
    expect(screen.getByText("Near the roundabout")).toBeInTheDocument();
    expect(screen.getByText("Kampala")).toBeInTheDocument();
    expect(screen.getByText("Uganda")).toBeInTheDocument();
  });

  it("falls back to N/A for missing fields", () => {
    render(<SiteMobileAppCard site={{}} />);

    expect(screen.getAllByText("N/A")).toHaveLength(4);
  });

  it("hides the Edit button when onEdit isn't provided", () => {
    render(<SiteMobileAppCard site={{}} />);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<SiteMobileAppCard site={{}} onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
