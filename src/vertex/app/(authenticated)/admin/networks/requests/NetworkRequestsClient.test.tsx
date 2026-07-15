import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import NetworkRequestsClient from "./NetworkRequestsClient";
import type { NetworkCreationRequest } from "@/core/apis/networks";
import { setupPointerEventMock, setupResizeObserverMock } from "@/test/utils/domMocks";

setupPointerEventMock();
setupResizeObserverMock();

vi.mock("axios", () => ({
  default: { put: vi.fn(), isAxiosError: () => false },
}));

const routerRefreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: routerRefreshMock }),
  usePathname: () => "/admin/networks/requests",
  useSearchParams: () => new URLSearchParams(),
}));

// RBAC wiring (RouteGuard) is covered by the e2e RBAC suite; this page's own
// approve/deny/review flow (not the permission gate itself) is the unit
// under test here, so RouteGuard is a boundary mock.
vi.mock("@/components/layout/accessConfig/route-guard", () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const showBannerMock = vi.fn();
vi.mock("@/context/banner-context", () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: showBannerMock }),
}));

function baseRequest(overrides: Partial<NetworkCreationRequest>): NetworkCreationRequest {
  return {
    _id: "req-1",
    requester_name: "Belinda Kobusingye",
    requester_email: "belinda@airqo.net",
    net_name: "Bosch AQ",
    net_email: "contact@bosch-aq.example",
    net_website: "https://bosch-aq.example",
    net_category: "sensor manufacturer",
    net_description: "Air quality sensor manufacturer",
    net_acronym: "BAQ",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as NetworkCreationRequest;
}

const PENDING = baseRequest({ _id: "req-1", net_name: "Bosch AQ", status: "pending" });
const UNDER_REVIEW = baseRequest({
  _id: "req-2",
  net_name: "Sensirion Labs",
  status: "under_review",
});
const APPROVED = baseRequest({ _id: "req-3", net_name: "PurpleAir", status: "approved" });

function row(name: RegExp) {
  return within(screen.getByRole("row", { name }));
}

async function openActionsMenu(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(row(name).getByRole("button"));
}

describe("NetworkRequestsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to the Pending tab and shows only pending requests", () => {
    render(
      <NetworkRequestsClient initialRequests={[PENDING, UNDER_REVIEW, APPROVED]} />
    );

    expect(screen.getByRole("tab", { name: "Pending (1)" })).toHaveAttribute(
      "data-state",
      "active"
    );
    expect(screen.getByText("Bosch AQ")).toBeInTheDocument();
    expect(screen.queryByText("Sensirion Labs")).not.toBeInTheDocument();
    expect(screen.queryByText("PurpleAir")).not.toBeInTheDocument();
  });

  it("switching to the All tab shows every request, with correct counts", async () => {
    const user = userEvent.setup();
    render(
      <NetworkRequestsClient initialRequests={[PENDING, UNDER_REVIEW, APPROVED]} />
    );

    await user.click(screen.getByRole("tab", { name: "All (3)" }));

    expect(screen.getByText("Bosch AQ")).toBeInTheDocument();
    expect(screen.getByText("Sensirion Labs")).toBeInTheDocument();
    expect(screen.getByText("PurpleAir")).toBeInTheDocument();
  });

  it("hides Approve/Deny/Review and shows 'No actions available' for an approved request", async () => {
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[APPROVED]} />);

    await user.click(screen.getByRole("tab", { name: "All (1)" }));
    await openActionsMenu(user, /PurpleAir/);

    expect(screen.getByRole("menuitem", { name: "No actions available" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Approve/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Deny/ })).not.toBeInTheDocument();
  });

  it("offers Mark Under Review only for pending requests, not under_review", async () => {
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);

    expect(screen.getByRole("menuitem", { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Deny/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Mark Under Review/ })).toBeInTheDocument();
  });

  it("does not offer Mark Under Review for a request already under review", async () => {
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[UNDER_REVIEW]} />);

    await user.click(screen.getByRole("tab", { name: "In Review (1)" }));
    await openActionsMenu(user, /Sensirion Labs/);

    expect(screen.getByRole("menuitem", { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Deny/ })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Mark Under Review/ })).not.toBeInTheDocument();
  });

  it("approves a request with reviewer notes, refreshing the list on success", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { message: "Request approved" } });
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);
    await user.click(screen.getByRole("menuitem", { name: /Approve/ }));

    const dialog = screen.getByRole("dialog", { name: "Approve Request" });
    expect(
      within(dialog).getByText(/You are about to approve the request for/)
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Bosch AQ")).toBeInTheDocument();

    await user.type(
      within(dialog).getByLabelText(/Reviewer Notes/),
      "Looks good, verified manually."
    );
    await user.click(within(dialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/devices/network-creation-requests/req-1/approve",
        { reviewer_notes: "Looks good, verified manually." }
      );
    });
    expect(showBannerMock).toHaveBeenCalledWith({
      message: "Request approved",
      severity: "success",
      scoped: false,
    });
    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows the denial-specific notice on the deny dialog and submits a deny action", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { message: "Request denied" } });
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);
    await user.click(screen.getByRole("menuitem", { name: /Deny/ }));

    const dialog = screen.getByRole("dialog", { name: "Deny Request" });
    expect(
      within(dialog).getByText(
        "Note: Denial notes will be included in the email notification to the requester."
      )
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/devices/network-creation-requests/req-1/deny",
        { reviewer_notes: "" }
      );
    });
  });

  it("marks a pending request under review", async () => {
    vi.mocked(axios.put).mockResolvedValue({ data: { message: "Marked under review" } });
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);
    await user.click(screen.getByRole("menuitem", { name: /Mark Under Review/ }));

    expect(screen.getByRole("dialog", { name: "Review Request" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/devices/network-creation-requests/req-1/review",
        { reviewer_notes: "" }
      );
    });
  });

  it("shows an error banner and keeps the dialog open when the action fails", async () => {
    vi.mocked(axios.put).mockRejectedValue(new Error("Network Error"));
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);
    await user.click(screen.getByRole("menuitem", { name: /Approve/ }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(showBannerMock).toHaveBeenCalledWith({
        message: "Action failed: Network Error",
        severity: "error",
        scoped: false,
      });
    });
    expect(screen.getByRole("dialog", { name: "Approve Request" })).toBeInTheDocument();
    expect(routerRefreshMock).not.toHaveBeenCalled();
  });

  it("Cancel closes the dialog without submitting", async () => {
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await openActionsMenu(user, /Bosch AQ/);
    await user.click(screen.getByRole("menuitem", { name: /Approve/ }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(axios.put).not.toHaveBeenCalled();
  });

  it("refetches the list via router.refresh when Refresh is clicked", async () => {
    const user = userEvent.setup();
    render(<NetworkRequestsClient initialRequests={[PENDING]} />);

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(routerRefreshMock).toHaveBeenCalledTimes(1);
  });
});
