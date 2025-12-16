"use client";

import { useDeviceCount } from "@/core/hooks/useDevices";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  AqMonitor,
  AqCollocation,
  AqWifiOff,
  AqData,
} from "@airqo/icons-react";
import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useCallback } from "react";
import { useUserContext } from "@/core/hooks/useUserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusExplanation } from "@/core/utils/status";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "primary";
  onClick?: () => void;
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  isLoading,
  variant = "default",
  onClick,
}: StatCardProps) => {
  const getContainerStyles = useCallback(() => {
    const baseStyles = "rounded-lg border bg-white dark:bg-gray-800 relative overflow-hidden p-0";
    const interactiveStyles = onClick ? "cursor-pointer transition-all hover:shadow-md hover:border-primary/20" : "";
    return `${baseStyles} ${interactiveStyles}`;
  }, [onClick]);

  const getIconColor = useCallback(() => {
    switch (variant) {
      case "success":
        return "text-green-500 bg-green-50 dark:bg-green-900/10";
      case "warning":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "destructive":
        return "text-red-500 bg-red-50 dark:bg-red-900/10";
      case "info":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/10";
      case "primary":
        return "text-primary bg-primary/10";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  }, [variant]);

  if (isLoading) {
    return (
      <div className="md:col-span-1 lg:col-span-1">
        <Card className={getContainerStyles()}>
          <CardContent className="flex flex-col h-full justify-between p-6 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {description && <Skeleton className="h-4 w-4 rounded-full" />}
            </div>
            <Skeleton className="h-10 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const cardContent = (
    <div className="md:col-span-1 lg:col-span-1">
      <Card
        className={getContainerStyles()}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View ${title.toLowerCase()} devices` : undefined}
      >
        <CardContent className="flex flex-col h-full justify-between p-4 gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h5 className="text-md">
                {title}
              </h5>
              {description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-primary transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-primary">
              {value}
            </span>
            <div className={`p-2 rounded-xl ${getIconColor()}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return cardContent;
};

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
        />

        <StatCard
          title="Operational"
          value={metrics.operational}
          description={getStatusExplanation("Operational")}
          icon={<AqMonitor className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=operational')}
          variant="success"
        />

        <StatCard
          title="Transmitting"
          value={metrics.transmitting ?? "N/A"}
          description={getStatusExplanation("Transmitting")}
          icon={<AqMonitor className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=transmitting')}
          variant="info"
        />

        <StatCard
          title="Not Transmitting"
          value={metrics.notTransmitting}
          description={getStatusExplanation("Not Transmitting")}
          icon={<AqWifiOff className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=not_transmitting')}
          variant="default"
        />

        <StatCard
          title="Data Available"
          value={metrics.dataAvailable}
          description={getStatusExplanation("Data Available")}
          icon={<AqData className="w-6 h-6" />}
          isLoading={isLoading}
          onClick={() => handleNavigation('?status=data_available')}
          variant="warning"
        />
      </div>
    </div>
  );
};
