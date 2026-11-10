import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { beacon } from "../apis/beacon";
import { useAppSelector } from "../redux/hooks";
import { getHealthWindow } from "../utils/beaconHealth";

// Diagnoses change daily. Failures aren't retried: the card offers Try again, and a Beacon outage
// shouldn't multiply requests from every open page.
const HEALTH_QUERY_OPTIONS = {
  staleTime: 10 * 60 * 1000,
  retry: false,
  refetchOnWindowFocus: false,
} as const;

/**
 * Which organisation a health card speaks for. /admin pages cover every organisation, which Beacon
 * grants through the airqo group, while its API takes no group at all for the same scope.
 */
export const useHealthScope = () => {
  const pathname = usePathname();
  const activeGroupTitle = useAppSelector((state) => state.user.activeGroup?.grp_title);
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return {
    isAdminRoute,
    linkGroup: isAdminRoute ? "airqo" : activeGroupTitle,
    apiGroup: isAdminRoute ? undefined : activeGroupTitle,
  };
};

export const useDeviceHealth = (deviceId: string, deviceName?: string) => {
  const window = getHealthWindow();

  const issues = useQuery({
    queryKey: ["beacon-health", "device-issues", deviceId],
    queryFn: ({ signal }) => beacon.getDeviceIssueSummary(deviceId, signal),
    enabled: !!deviceId,
    ...HEALTH_QUERY_OPTIONS,
  });

  const performance = useQuery({
    queryKey: ["beacon-health", "device-performance", deviceName, window.startDateTime],
    queryFn: ({ signal }) => beacon.getDevicePerformance(deviceName as string, window, signal),
    enabled: !!deviceName,
    ...HEALTH_QUERY_OPTIONS,
  });

  return { issues, performance, window };
};

export const useSiteHealth = (siteId: string, group: string | undefined, isAdminRoute: boolean) => {
  const window = getHealthWindow();

  const site = useQuery({
    queryKey: ["beacon-health", "site", siteId, group, window.startDateTime],
    queryFn: ({ signal }) => beacon.getSiteHealth(siteId, window, group, signal),
    // Without a group the API answers for every organisation, which only /admin pages should see
    enabled: !!siteId && (isAdminRoute || !!group),
    ...HEALTH_QUERY_OPTIONS,
  });

  return { site, window };
};

export const useCohortHealth = (cohortId: string) => {
  const window = getHealthWindow();

  return useQuery({
    queryKey: ["beacon-health", "cohort", cohortId, window.startDateTime],
    queryFn: ({ signal }) => beacon.getCohortHealth(cohortId, window, signal),
    enabled: !!cohortId,
    ...HEALTH_QUERY_OPTIONS,
  });
};
