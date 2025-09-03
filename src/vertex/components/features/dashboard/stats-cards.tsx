"use client";

import { useDevices, useMyDevices } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { Card, CardContent } from "@/components/ui/card";
import {
  AqMonitor,
  AqCollocation,
  AqWifiOff,
  AqAlertCircle,
} from "@airqo/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useCallback } from "react";
import { Device } from "@/app/types/devices";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

const StatCard = ({
  title,
  value,
  subtitle,
  description,
  icon,
  isLoading,
  variant = "default",
}: StatCardProps) => {
  const getVariantStyles = useCallback(() => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800";
      case "destructive":
        return "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800";
      default:
        return "rounded-lg max-w-5xl mx-auto bg-[#E9F7EF] group border-0 bg-white dark:bg-gray-800 relative overflow-hidden p-0";
    }
  }, [variant]);

  if (isLoading) {
    return (
      <div className="md:col-span-1 lg:col-span-1">
        <Card className={getVariantStyles()}>
          <CardContent className="flex flex-col h-full justify-center p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                {subtitle && <Skeleton className="h-3 w-32" />}
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cardContent = (
    <div className="md:col-span-1 lg:col-span-1">
      <Card className={getVariantStyles()}>
        <CardContent className="flex flex-col h-full justify-center p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {title}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 max-w-24 w-full">
                  {description}
                </span>
              </div>
            </div>
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white text-right">
              {value}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return cardContent;
};

export const DashboardStatsCards = () => {
  const { userDetails, activeGroup, userContext } = useAppSelector(
    (state) => state.user
  );

  // Context-aware hook selection
  const isPersonalContext = userContext === "personal";

  // Use useMyDevices for personal context
  const myDevicesQuery = useMyDevices(userDetails?._id || "", activeGroup?._id);

  // Use useDevices for airqo-internal and external-org contexts
  const organizationDevicesQuery = useDevices();

  const currentDevicesData = isPersonalContext ? myDevicesQuery.data : null;

  const isLoading = isPersonalContext
    ? myDevicesQuery.isLoading
    : organizationDevicesQuery.isLoading;

  const calculateDeviceStats = useCallback((devices: Device[]) => {
    const online = devices.filter(
      (device) => device.isOnline || device.status === "online"
    ).length;
    const offline = devices.filter(
      (device) => !device.isOnline || device.status === "offline"
    ).length;

    return {
      total: devices.length,
      online,
      offline,
      maintenance: {
        due: devices.filter((device) => device.maintenance_status === "due")
          .length,
        overdue: devices.filter(
          (device) => device.maintenance_status === "overdue"
        ).length,
      },
    };
  }, []);

  const metrics = useMemo(() => {
    let totalMonitors = 0;
    let activeMonitors = 0;
    let pendingDeployments = 0;
    let recentAlerts = 0;

    if (isPersonalContext && currentDevicesData) {
      totalMonitors = currentDevicesData.total_devices || 0;

      const deviceStats = calculateDeviceStats(
        currentDevicesData.devices || []
      );
      activeMonitors = deviceStats.online;

      pendingDeployments =
        currentDevicesData.devices?.filter(
          (device) =>
            device.claim_status === "claimed" && device.status !== "deployed"
        ).length || 0;

      recentAlerts =
        deviceStats.offline +
        deviceStats.maintenance.due +
        deviceStats.maintenance.overdue;
    } else if (
      !isPersonalContext &&
      organizationDevicesQuery.devices?.length > 0
    ) {
      const orgDevices = organizationDevicesQuery.devices;

      const deviceStats = calculateDeviceStats(orgDevices);
      totalMonitors = deviceStats.total;
      activeMonitors = deviceStats.online;

      pendingDeployments = orgDevices.filter(
        (device) =>
          device.status === "not deployed" ||
          (device.claim_status === "claimed" && device.status !== "deployed")
      ).length;

      recentAlerts =
        deviceStats.offline +
        deviceStats.maintenance.due +
        deviceStats.maintenance.overdue;
    }

    return {
      totalMonitors,
      activeMonitors,
      pendingDeployments,
      recentAlerts,
    };
  }, [
    isPersonalContext,
    currentDevicesData,
    organizationDevicesQuery.devices,
    calculateDeviceStats,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <StatCard
          title="Total Devices"
          value={metrics.totalMonitors}
          description={`All ${
            isPersonalContext ? "your" : "organization"
          } devices`}
          icon={<AqCollocation className="w-6 h-6 text-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Active Devices"
          value={metrics.activeMonitors}
          description="Devices sending data"
          icon={<AqMonitor className="w-6 h-6 text-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Needs Deployment"
          value={metrics.pendingDeployments}
          description="Claimed devices not yet deployed"
          icon={<AqWifiOff className="w-6 h-6 text-primary" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Recent Alerts"
          value={metrics.recentAlerts}
          description="Devices needing attention"
          icon={<AqAlertCircle className="w-6 h-6 text-primary" />}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
