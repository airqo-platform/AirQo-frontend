"use client";

import { useDeviceCount } from "@/core/hooks/useDevices";
import { useRouter } from "next/navigation";
import {
  AqMonitor,
  AqCollocation,
  AqWifiOff,
  AqData,
} from "@airqo/icons-react";
import { useMemo } from "react";
import { useUserContext } from "@/core/hooks/useUserContext";
import { getStatusExplanation } from "@/core/utils/status";
import { StatCard } from "./StatCard";

export const DashboardStatsCards = () => {
  const { userScope, userDetails } = useUserContext();

  const isPersonalScope = userScope === 'personal';

  const personalCohortIds = userDetails?.cohort_ids || [];
  const shouldEnable = isPersonalScope ? personalCohortIds.length > 0 : true;

  // Use useDeviceCount for both scopes
  // For personal scope, pass the user's cohort IDs
  // If personal scope and no cohorts, the hook is disabled
  const deviceCountQuery = useDeviceCount({
    enabled: shouldEnable,
    cohortIds: isPersonalScope ? personalCohortIds : undefined,
  });

  const isLoading = shouldEnable ? deviceCountQuery.isLoading : false;

  const metrics = useMemo(() => {
    const summary = deviceCountQuery.data?.summary;
    if (summary) {
      return {
        total: summary.total_monitors,
        operational: summary.operational,
        transmitting: summary.transmitting,
        notTransmitting: summary.not_transmitting,
        dataAvailable: summary.data_available,
      };
    }

    return {
      total: 0,
      operational: 0,
      transmitting: 0,
      notTransmitting: 0,
      dataAvailable: 0,
    };
  }, [deviceCountQuery.data]);

  const router = useRouter();

  const handleNavigation = (queryString: string) => {
    const basePath = isPersonalScope ? "/devices/my-devices" : "/devices/overview";
    router.push(`${basePath}${queryString}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatCard
          title="Total Devices"
          value={metrics.total}
          description={`All devices assigned to ${isPersonalScope ? "your" : "organization"
            } account.`}
          icon={<AqCollocation className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('')}
          variant="primary"
          size="md"
        />

        <StatCard
          title="Operational"
          value={metrics.operational}
          description={getStatusExplanation("Operational")}
          icon={<AqMonitor className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=operational')}
          variant="success"
          size="md"
        />

        <StatCard
          title="Transmitting"
          value={metrics.transmitting ?? "N/A"}
          description={getStatusExplanation("Transmitting")}
          icon={<AqMonitor className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=transmitting')}
          variant="info"
          size="md"
        />

        <StatCard
          title="Not Transmitting"
          value={metrics.notTransmitting}
          description={getStatusExplanation("Not Transmitting")}
          icon={<AqWifiOff className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=not_transmitting')}
          variant="default"
          size="md"
        />

        <StatCard
          title="Data Available"
          value={metrics.dataAvailable}
          description={getStatusExplanation("Data Available")}
          icon={<AqData className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=data_available')}
          variant="warning"
          size="md"
        />
      </div>
    </div>
  );
};
