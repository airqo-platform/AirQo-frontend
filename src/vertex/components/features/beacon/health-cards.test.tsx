import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/utils/renderWithProviders";
import { beacon } from "@/core/apis/beacon";
import type {
  BeaconDeviceIssue,
  BeaconDeviceIssueSummary,
  BeaconDiagnosticsSummary,
  BeaconHealthDevice,
} from "@/app/types/beacon";
import CohortHealthCard from "./cohort-health-card";
import DeviceHealthCard from "./device-health-card";
import LazyCohortHealthCard from "./lazy-cohort-health-card";
import LazyDeviceHealthCard from "./lazy-device-health-card";
import LazySiteHealthCard from "./lazy-site-health-card";
import SiteHealthCard from "./site-health-card";

const navigation = vi.hoisted(() => ({ pathname: "/admin/networks/n1/devices/d1" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("@/core/apis/beacon", () => ({
  beacon: {
    getDeviceIssueSummary: vi.fn(),
    getDevicePerformance: vi.fn(),
    getSiteHealth: vi.fn(),
    getCohortHealth: vi.fn(),
  },
}));

const api = vi.mocked(beacon);

const issue = (title: string, overrides: Partial<BeaconDeviceIssue> = {}): BeaconDeviceIssue => ({
  issue_code: title,
  title,
  subsystem: "battery",
  severity: "HIGH",
  days_observed: 5,
  first_seen: "2026-10-23",
  last_seen: "2026-11-05",
  is_active: true,
  current_streak_days: 5,
  ...overrides,
});

const deviceSummary = (overrides: Partial<BeaconDeviceIssueSummary> = {}): BeaconDeviceIssueSummary => ({
  device_id: "d1",
  days_diagnosed: 11,
  latest_diagnosis_date: "2026-11-05",
  latest_lifecycle_state: "HEALTHY",
  latest_headline: "Healthy (100/100)",
  issues: [],
  health_trend: [
    { diagnosis_date: "2026-11-05", overall_health_score: 100, lifecycle_state: "HEALTHY", issue_count: 0 },
  ],
  ...overrides,
});

const httpError = (status: number) =>
  new AxiosError("Failed", "ERR_BAD_RESPONSE", undefined, null, {
    status,
    statusText: "",
    data: {},
    headers: {},
    config: {} as never,
  });

const preloadedState = { user: { activeGroup: { grp_title: "kcca" } } };

const beaconLink = () => screen.getByRole("link", { name: /open in beacon/i });

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 6, 9, 0, 0));
  navigation.pathname = "/admin/networks/n1/devices/d1";
  api.getDevicePerformance.mockResolvedValue({ device_name: "g1", uptime: 64.48, data: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DeviceHealthCard", () => {
  const renderCard = () =>
    renderWithProviders(<DeviceHealthCard deviceId="d1" deviceName="g1" />, { preloadedState });

  it("shows uptime, the diagnosis and the top issues of a failing device", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(
      deviceSummary({
        latest_lifecycle_state: "LIKELY_FAILURE",
        latest_headline: "Likely failure (25/100): device_battery (battery) fault (97%)",
        health_trend: [
          { diagnosis_date: "2026-11-05", overall_health_score: 25.3, lifecycle_state: "LIKELY_FAILURE", issue_count: 3 },
        ],
        issues: [
          issue("Battery discharging", { severity: "CRITICAL", current_streak_days: 13 }),
          issue("Outages after low battery", { current_streak_days: 1 }),
          issue("No Sensor 1 readings"),
          issue("Offline time increasing", { is_active: false }),
        ],
      })
    );

    renderCard();

    expect(await screen.findByText("Likely failure")).toBeInTheDocument();
    expect(screen.getByText("64%")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Battery fault (97% confidence)")).toBeInTheDocument();
    expect(screen.getByText("Open issues (3)")).toBeInTheDocument();
    expect(screen.getByText("Battery discharging")).toBeInTheDocument();
    expect(screen.getByText("Critical, 13 days")).toBeInTheDocument();
    expect(screen.getByText("High, 1 day")).toBeInTheDocument();
    expect(screen.queryByText("No Sensor 1 readings")).not.toBeInTheDocument();
    expect(screen.getByText("and 1 more")).toBeInTheDocument();
    expect(screen.getByText("Diagnosed 5 Nov")).toBeInTheDocument();
  });

  it("opens the device's diagnostics in Beacon in a new tab, as airqo from an admin page", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary());

    renderCard();

    await screen.findByText("Healthy");
    expect(beaconLink()).toHaveAttribute(
      "href",
      "https://staging-beacon.airqo.net/dashboard/devices/d1/diagnostics?group=airqo"
    );
    expect(beaconLink()).toHaveAttribute("target", "_blank");
  });

  it("links with the active organisation away from admin pages", async () => {
    navigation.pathname = "/devices/overview/d1";
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary());

    renderCard();

    await screen.findByText("Healthy");
    expect(beaconLink().getAttribute("href")).toContain("?group=kcca");
  });

  it("says when a healthy device has nothing open, and what cleared lately", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(
      deviceSummary({ issues: [issue("Data gaps", { is_active: false, last_seen: "2026-11-01" })] })
    );

    renderCard();

    expect(await screen.findByText("None")).toBeInTheDocument();
    expect(screen.getByText("Data gaps cleared after 1 Nov.")).toBeInTheDocument();
  });

  it("doesn't call a device healthy from a diagnosis made before it stopped sending", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(
      deviceSummary({
        latest_diagnosis_date: "2026-10-29",
        latest_headline: "Healthy (97/100)",
        health_trend: [
          { diagnosis_date: "2026-10-29", overall_health_score: 97, lifecycle_state: "HEALTHY", issue_count: 0 },
        ],
      })
    );
    api.getDevicePerformance.mockResolvedValue({
      device_name: "g1",
      uptime: 47.76,
      data: [{ datetime: new Date(2026, 9, 29, 8, 0).toISOString() }],
    });

    renderCard();

    expect(await screen.findByText("No recent diagnosis")).toBeInTheDocument();
    expect(screen.getByText("No readings in Beacon since 29 Oct")).toBeInTheDocument();
    expect(screen.getByText("Its last diagnosis was Healthy (97/100). That may be out of date.")).toBeInTheDocument();
    expect(screen.queryByText("Healthy")).not.toBeInTheDocument();
  });

  it("blames the diagnosis, not the device, when data is still arriving", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary({ latest_diagnosis_date: "2026-10-29" }));
    api.getDevicePerformance.mockResolvedValue({
      device_name: "g1",
      uptime: 90,
      data: [{ datetime: new Date(2026, 10, 5, 8, 0).toISOString() }],
    });

    renderCard();

    expect(await screen.findByText("No diagnosis since 29 Oct")).toBeInTheDocument();
  });

  it("explains a device Beacon has never diagnosed", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(
      deviceSummary({ days_diagnosed: 0, latest_diagnosis_date: null, health_trend: [] })
    );
    api.getDevicePerformance.mockResolvedValue({ device_name: "g1", uptime: 0, data: [] });

    renderCard();

    expect(await screen.findByText("Not diagnosed")).toBeInTheDocument();
    expect(screen.getByText("No diagnosis in the last 14 days")).toBeInTheDocument();
    expect(screen.queryByText("Uptime, 14 days")).not.toBeInTheDocument();
    expect(beaconLink()).toBeInTheDocument();
  });

  it("still shows the diagnosis when only uptime fails", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary());
    api.getDevicePerformance.mockRejectedValue(httpError(500));

    renderCard();

    expect(await screen.findByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });

  it("offers a retry when Beacon can't be reached, without signing anyone out", async () => {
    const onExpired = vi.fn();
    window.addEventListener("auth-token-expired", onExpired);
    api.getDeviceIssueSummary.mockRejectedValueOnce(httpError(401));
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary());

    renderCard();

    expect(await screen.findByText("Couldn't load health from Beacon")).toBeInTheDocument();
    expect(beaconLink()).toBeInTheDocument();
    expect(onExpired).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Healthy")).toBeInTheDocument();
    window.removeEventListener("auth-token-expired", onExpired);
  });
});

const summary = (overrides: Partial<BeaconDiagnosticsSummary> = {}): BeaconDiagnosticsSummary => ({
  devices_total: 37,
  devices_diagnosed: 29,
  devices_not_diagnosed: 8,
  devices_with_issues: 27,
  lifecycle_state_counts: { DEGRADING: 16, HEALTHY: 8, LIKELY_FAILURE: 4, SUSPICIOUS: 1 },
  max_severity: "CRITICAL",
  latest_diagnosis_date: "2026-11-05",
  top_issues: [
    { issue_code: "a", title: "Data gaps", severity: "HIGH", subsystem: "connectivity", device_count: 25 },
    { issue_code: "b", title: "Outages", severity: "CRITICAL", subsystem: "battery", device_count: 1 },
    { issue_code: "c", title: "Third issue", severity: "LOW", subsystem: "sensor", device_count: 5 },
  ],
  ...overrides,
});

describe("lazy-loaded cards", () => {
  it("shows a placeholder, then the device card", async () => {
    api.getDeviceIssueSummary.mockResolvedValue(deviceSummary());

    const { container } = renderWithProviders(<LazyDeviceHealthCard deviceId="d1" deviceName="g1" />, {
      preloadedState,
    });

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Device Health" })).toBeInTheDocument();
  });

  it("loads the cohort card", async () => {
    api.getCohortHealth.mockResolvedValue({ name: "hw_kcca", diagnostics_summary: summary() });

    renderWithProviders(<LazyCohortHealthCard cohortId="c1" />, { preloadedState });

    expect(await screen.findByRole("heading", { name: "Cohort Health" })).toBeInTheDocument();
  });

  it("loads the site card", async () => {
    api.getSiteHealth.mockRejectedValue(httpError(404));

    renderWithProviders(<LazySiteHealthCard siteId="s1" getDeviceHref={(id) => `/devices/overview/${id}`} />, {
      preloadedState,
    });

    expect(await screen.findByRole("heading", { name: "Site Health" })).toBeInTheDocument();
  });
});

describe("CohortHealthCard", () => {
  const renderCard = () => renderWithProviders(<CohortHealthCard cohortId="c1" />, { preloadedState });

  beforeEach(() => {
    navigation.pathname = "/admin/cohorts/c1";
  });

  it("summarises the cohort's diagnoses and links to Clustered Analysis", async () => {
    api.getCohortHealth.mockResolvedValue({ name: "hw_kcca", diagnostics_summary: summary() });

    renderCard();

    expect(await screen.findByText("27 of 37 with issues")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Device states/ })).toHaveAccessibleName(
      "Device states: 4 likely failure, 1 suspicious, 16 degrading, 8 healthy, 8 not diagnosed"
    );
    expect(screen.getByText("Data gaps")).toBeInTheDocument();
    expect(screen.getByText("High, 25 devices")).toBeInTheDocument();
    expect(screen.getByText("Critical, 1 device")).toBeInTheDocument();
    expect(screen.queryByText("Third issue")).not.toBeInTheDocument();
    expect(beaconLink()).toHaveAttribute(
      "href",
      "https://staging-beacon.airqo.net/dashboard/analytics/c1?group=airqo"
    );
  });

  it("leaves uptime out until Beacon can send it", async () => {
    api.getCohortHealth.mockResolvedValue({ name: "hw_kcca", diagnostics_summary: summary() });

    renderCard();

    await screen.findByText("27 of 37 with issues");
    expect(screen.queryByText("Uptime, 14 days")).not.toBeInTheDocument();
  });

  it("shows the cohort's uptime and spread when the response has them", async () => {
    const device = (uptime: number): BeaconHealthDevice => ({
      device_id: String(uptime),
      device_name: String(uptime),
      uptime,
    });
    api.getCohortHealth.mockResolvedValue({
      name: "hw_kcca",
      uptime: 48.79,
      devices: [device(90), device(60), device(10), device(0)],
      diagnostics_summary: summary(),
    });

    renderCard();

    expect(await screen.findByText("49%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Devices by uptime/ })).toHaveAccessibleName(
      "Devices by uptime: 1 good, 1 moderate, 1 critical, 1 no data"
    );
  });

  it("says so when Beacon hasn't synced the cohort, with nothing to open", async () => {
    api.getCohortHealth.mockRejectedValue(httpError(404));

    renderCard();

    expect(await screen.findByText("Beacon hasn't synced this cohort yet")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open in beacon/i })).not.toBeInTheDocument();
  });

  it("offers a retry on other failures", async () => {
    api.getCohortHealth.mockRejectedValue(httpError(500));

    renderCard();

    expect(await screen.findByText("Couldn't load health from Beacon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("SiteHealthCard", () => {
  const renderCard = () =>
    renderWithProviders(
      <SiteHealthCard siteId="s1" getDeviceHref={(deviceId) => `/devices/overview/${deviceId}`} />,
      { preloadedState }
    );

  const diagnosed = (
    name: string,
    score: number,
    uptime: number,
    state: "HEALTHY" | "DEGRADING" | "SUSPICIOUS"
  ): BeaconHealthDevice => ({
    device_id: name,
    device_name: name,
    uptime,
    diagnostics: {
      diagnosis_date: "2026-11-05",
      overall_health_score: score,
      lifecycle_state: state,
      issue_count: 0,
    },
  });

  beforeEach(() => {
    navigation.pathname = "/admin/sites/s1";
  });

  it("shows a one-device site's state, daily uptime and device", async () => {
    api.getSiteHealth.mockResolvedValue({
      name: "MOGAS",
      uptime: 71.94,
      data: [{ datetime: new Date(2026, 10, 1, 8, 0).toISOString() }],
      devices: [diagnosed("aq_67", 100, 71.94, "HEALTHY")],
      diagnostics_summary: summary({
        devices_total: 1,
        devices_diagnosed: 1,
        devices_not_diagnosed: 0,
        devices_with_issues: 0,
        lifecycle_state_counts: { HEALTHY: 1 },
        max_severity: null,
        top_issues: [],
      }),
    });

    renderCard();

    expect(await screen.findByText("72%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Daily uptime/ })).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();

    const row = screen.getByRole("link", { name: /aq_67/ });
    expect(row).toHaveAttribute("href", "/devices/overview/aq_67");
    expect(within(row).getByText("Healthy")).toBeInTheDocument();
    expect(within(row).getByText("100/100, 72%")).toBeInTheDocument();
    expect(beaconLink()).toHaveAttribute(
      "href",
      "https://staging-beacon.airqo.net/dashboard/sites/s1?group=airqo"
    );
  });

  it("lists several devices worst first, without daily bars", async () => {
    api.getSiteHealth.mockResolvedValue({
      name: "UN Avenue",
      uptime: 11.64,
      data: [{ datetime: new Date(2026, 10, 1, 8, 0).toISOString() }],
      devices: [
        { device_id: "none", device_name: "none", uptime: 0, diagnostics: null },
        diagnosed("fair", 75, 19.4, "DEGRADING"),
        diagnosed("bad", 53, 15.52, "SUSPICIOUS"),
        diagnosed("good", 95, 30, "HEALTHY"),
      ],
      diagnostics_summary: summary({
        devices_total: 4,
        devices_diagnosed: 3,
        devices_not_diagnosed: 1,
        devices_with_issues: 2,
      }),
    });

    renderCard();

    expect(await screen.findByText("2 of 4 with issues")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /^Daily uptime/ })).not.toBeInTheDocument();
    const rows = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/devices"));
    expect(rows.map((row) => row.getAttribute("href"))).toEqual([
      "/devices/overview/bad",
      "/devices/overview/fair",
      "/devices/overview/good",
    ]);
    expect(screen.getByText("Devices (4)")).toBeInTheDocument();
    expect(screen.getByText("and 1 more")).toBeInTheDocument();
  });

  it("marks an out-of-date site instead of repeating its old state", async () => {
    api.getSiteHealth.mockResolvedValue({
      name: "Old",
      uptime: 20,
      devices: [diagnosed("aq_1", 97, 20, "HEALTHY")],
      diagnostics_summary: summary({
        devices_total: 1,
        devices_diagnosed: 1,
        devices_not_diagnosed: 0,
        devices_with_issues: 0,
        lifecycle_state_counts: { HEALTHY: 1 },
        latest_diagnosis_date: "2026-10-29",
        top_issues: [],
      }),
    });

    renderCard();

    expect(await screen.findByText("No recent diagnosis")).toBeInTheDocument();
  });

  it("doesn't claim there are no issues when nothing was diagnosed", async () => {
    api.getSiteHealth.mockResolvedValue({
      name: "Silent",
      uptime: 15,
      devices: [{ device_id: "a", device_name: "aq_1", uptime: 15, diagnostics: null }],
      diagnostics_summary: summary({
        devices_total: 1,
        devices_diagnosed: 0,
        devices_not_diagnosed: 1,
        devices_with_issues: 0,
        lifecycle_state_counts: {},
        latest_diagnosis_date: null,
        top_issues: [],
      }),
    });

    renderCard();

    expect(await screen.findByText("Not diagnosed")).toBeInTheDocument();
    expect(screen.queryByText("None")).not.toBeInTheDocument();
    expect(screen.queryByText("Open issues")).not.toBeInTheDocument();
  });

  it("explains a site with no AirQo network devices", async () => {
    api.getSiteHealth.mockResolvedValue({ name: "Other", uptime: 0, devices: [], diagnostics_summary: summary() });

    renderCard();

    expect(await screen.findByText("No devices to summarise")).toBeInTheDocument();
  });

  it("asks for every device on admin pages and the organisation's elsewhere", async () => {
    api.getSiteHealth.mockRejectedValue(httpError(404));

    const { unmount } = renderCard();
    await screen.findByText("Beacon hasn't synced this site yet");
    expect(api.getSiteHealth.mock.calls[0][2]).toBeUndefined();
    unmount();

    navigation.pathname = "/sites/s1";
    renderCard();
    await waitFor(() => expect(api.getSiteHealth).toHaveBeenCalledTimes(2));
    expect(api.getSiteHealth.mock.calls[1][2]).toBe("kcca");
  });
});
