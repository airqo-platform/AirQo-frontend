import { Card } from "@/components/ui/card";
import React from "react";
import {format} from 'date-fns';
import {
  useDeviceDetails,
  useDeviceMaintenanceLogs,
} from "@/core/hooks/useDevices";
import ReusableButton from "@/components/shared/button/ReusableButton";

interface MaintenanceStatusCardProps {
  deviceId: string;
  onViewAllLogs?: () => void;
}

const MaintenanceStatusCard: React.FC<MaintenanceStatusCardProps> = ({
  deviceId,
  onViewAllLogs,
}) => {
  const {
    data: deviceResponse,
    isLoading: isDeviceLoading,
    error: deviceError,
  } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;

  const deviceName = device?.name || "";
  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    error: logsError,
  } = useDeviceMaintenanceLogs(deviceName);

  return (
    <Card className="w-full rounded-lg">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-lg font-semibold">Maintenance Activity</h2>
      </div>

      {isDeviceLoading ? (
        <div className="px-3 pb-3 text-sm text-muted-foreground">
          Loading device...
        </div>
      ) : deviceError || !device ? (
        <div className="px-3 pb-3 text-sm text-red-500">
          Failed to load maintenance details.
        </div>
      ) : (
        <div className="px-3 pb-3 space-y-3">
          {/* Next maintenance */}
          {device.nextMaintenance && (
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                Next Maintenance
              </div>
              <div className="text-base font-normal">
                {format(device.nextMaintenance, "MMM d yyyy, h:mm a")}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
              Recent Logs
            </div>
            {isLogsLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading logs...
              </div>
            ) : logsError ? (
              <div className="text-sm text-red-500">Failed to load logs.</div>
            ) : (logsResponse?.site_activities?.length || 0) === 0 ? (
              <div className="text-sm text-muted-foreground">
                No recent logs.
              </div>
            ) : (
              <ul className="space-y-2">
                {logsResponse!.site_activities.slice(0, 3).map((log) => (
                  <li
                    key={log._id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium break-all">
                        {log.description || "Maintenance activity"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(log.date, "MMM d yyyy, h:mm a")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap capitalize">
                      {log.activityType}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="border-t px-2 flex justify-end">
        <ReusableButton
          variant="text"
          onClick={onViewAllLogs}
          disabled={!onViewAllLogs}
          className="p-1 text-xs m-1"
        >
          View all logs
        </ReusableButton>
      </div>
    </Card>
  );
};

export default MaintenanceStatusCard;
