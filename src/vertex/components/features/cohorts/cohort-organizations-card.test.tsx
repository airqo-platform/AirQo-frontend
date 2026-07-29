import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CohortOrganizationsCard } from "./cohort-organizations-card";
import { useGroupsByCohort } from "@/core/hooks/useGroups";
import type { Group } from "@/app/types/groups";

vi.mock("@/core/hooks/useGroups", () => ({
  useGroupsByCohort: vi.fn(),
}));

vi.mock("@/core/hooks/useClipboard", () => ({
  useClipboard: () => ({ handleCopy: vi.fn() }),
}));

vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/cohorts/cohort-1",
  useSearchParams: () => new URLSearchParams(),
}));

// UnassignCohortFromGroupDialog has its own dedicated test file — stub it
// here so this file stays focused on the card's own list/table wiring.
vi.mock("./unassign-cohort-from-group", () => ({
  UnassignCohortFromGroupDialog: ({ open, organization }: { open: boolean; organization: Group | null }) =>
    open ? <div data-testid="unassign-dialog">{organization?.grp_title}</div> : null,
}));

function makeOrgs(count: number): Group[] {
  return Array.from({ length: count }, (_, i) => ({
    _id: `org-${i + 1}`,
    grp_title: `airqo_org_${i + 1}`,
    grp_country: "Uganda",
  })) as Group[];
}

function mockGroups(overrides: Partial<ReturnType<typeof useGroupsByCohort>> = {}) {
  vi.mocked(useGroupsByCohort).mockReturnValue({
    groups: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useGroupsByCohort>);
}

describe("CohortOrganizationsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty message when no organizations are assigned", () => {
    mockGroups({ groups: [] });
    render(<CohortOrganizationsCard cohortId="cohort-1" cohortName="Kampala Cohort" />);

    expect(
      screen.getByText("No organizations assigned to this cohort.")
    ).toBeInTheDocument();
  });

  it("renders up to 3 organizations with formatted titles", () => {
    mockGroups({ groups: makeOrgs(2) });
    render(<CohortOrganizationsCard cohortId="cohort-1" cohortName="Kampala Cohort" />);

    expect(screen.getByText("airqo_org_1")).toBeInTheDocument();
    expect(screen.getByText("airqo_org_2")).toBeInTheDocument();
    expect(screen.queryByText(/View more organizations/)).not.toBeInTheDocument();
  });

  it("shows a View more link and the full table when there are more than 3 organizations", async () => {
    mockGroups({ groups: makeOrgs(5) });
    const user = userEvent.setup();
    render(<CohortOrganizationsCard cohortId="cohort-1" cohortName="Kampala Cohort" />);

    const viewMore = screen.getByRole("button", { name: /View more organizations \(2\)/ });
    await user.click(viewMore);

    const tableDialog = screen.getByRole("dialog", {
      name: "All Assigned Organizations (5)",
    });
    expect(within(tableDialog).getByText("AIRQO ORG 1")).toBeInTheDocument();
  });

  it("opens the unassign dialog when Unassign is clicked and unassigning is allowed", async () => {
    mockGroups({ groups: makeOrgs(1) });
    const user = userEvent.setup();
    render(
      <CohortOrganizationsCard cohortId="cohort-1" cohortName="Kampala Cohort" canUnassign />
    );

    await user.click(screen.getByRole("button", { name: "Unassign" }));
    expect(screen.getByTestId("unassign-dialog")).toHaveTextContent("airqo_org_1");
  });

  it("disables the Unassign button when canUnassign is false", () => {
    mockGroups({ groups: makeOrgs(1) });
    render(
      <CohortOrganizationsCard
        cohortId="cohort-1"
        cohortName="Kampala Cohort"
        canUnassign={false}
      />
    );

    expect(screen.getByRole("button", { name: "Unassign" })).toBeDisabled();
  });
});
