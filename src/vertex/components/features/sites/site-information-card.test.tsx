import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SiteInformationCard } from "./site-information-card";
import { useClipboard } from "@/core/hooks/useClipboard";
import type { Site } from "@/app/types/sites";

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: vi.fn(),
}));

const SITE: Site = {
  _id: "site-1",
  name: "Kampala Road",
  description: "Near the taxi park",
  network: "airqo",
  latitude: 0.3476,
  longitude: 32.5825,
  parish: "Central",
  sub_county: "Kampala Central",
  district: "Kampala",
  region: "Central",
  altitude: 1190,
  distance_to_nearest_road: 12.345,
  isOnline: true,
  rawOnlineStatus: true,
};

describe("SiteInformationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy: vi.fn() });
  });

  it("renders the site's details", () => {
    render(<SiteInformationCard site={SITE} />);

    expect(screen.getByText("Kampala Road")).toBeInTheDocument();
    expect(screen.getByText("Near the taxi park")).toBeInTheDocument();
    expect(screen.getByText("airqo")).toBeInTheDocument();
    expect(screen.getByText("0.3476")).toBeInTheDocument();
    expect(screen.getByText("32.5825")).toBeInTheDocument();
    expect(screen.getAllByText("Central")).toHaveLength(2);
    expect(screen.getByText("Kampala")).toBeInTheDocument();
    expect(screen.getByText("site-1")).toBeInTheDocument();
    expect(screen.getByText("1190 m")).toBeInTheDocument();
    expect(screen.getByText("12.35 m")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("shows N/A for missing optional fields", () => {
    render(<SiteInformationCard site={{ _id: "site-2" }} />);

    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
    expect(screen.getByText("Not Transmitting")).toBeInTheDocument();
  });

  it("hides the Edit button when onEdit isn't provided", () => {
    render(<SiteInformationCard site={SITE} />);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<SiteInformationCard site={SITE} onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("copies the site id to clipboard", async () => {
    const handleCopy = vi.fn();
    vi.mocked(useClipboard).mockReturnValue({ handleCopy });
    const user = userEvent.setup();
    render(<SiteInformationCard site={SITE} />);

    await user.click(screen.getAllByRole("button")[0]);
    expect(handleCopy).toHaveBeenCalledWith("site-1");
  });
});
