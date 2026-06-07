import { Card } from "@/components/ui/card";
import React from "react";
import { format, parseISO, isValid, isBefore, startOfToday } from 'date-fns';
import { AqTool01 } from "@airqo/icons-react";
import { cn } from "@/lib/utils";

interface MaintenanceStatusCardProps {
  nextMaintenance: string | undefined;
}

const MaintenanceStatusCard: React.FC<MaintenanceStatusCardProps> = ({
  nextMaintenance,
}) => {
  const maintenanceDate =
    typeof nextMaintenance === "string" ? parseISO(nextMaintenance) : null;
  const hasValidMaintenanceDate =
    maintenanceDate !== null && isValid(maintenanceDate);

  const isMissed = hasValidMaintenanceDate && isBefore(maintenanceDate, startOfToday());

  return (
    <Card className="w-full rounded-lg overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Next Maintenance</h2>
        {hasValidMaintenanceDate && (
          <span className={cn(
            "text-xs flex items-center gap-1 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
            isMissed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          )}>
            <AqTool01 className={cn(
              "w-3 h-3",
              isMissed ? "text-red-500" : "text-green-600"
            )} />
            <span className="ml-1">{isMissed ? "Missed" : "Upcoming"}</span>
          </span>
        )}
      </div>

      <div className="px-4 py-4">
        {hasValidMaintenanceDate ? (
          <div className="space-y-1">
            <div className={cn(
              "text-2xl font-bold tracking-tight",
              isMissed ? "text-red-600" : "text-foreground"
            )}>
              {format(maintenanceDate, "MMM d, yyyy")}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex flex-col items-center justify-center py-4 text-center">
            <AqTool01 className="w-8 h-8 opacity-20 mb-2" />
            <p>No upcoming maintenance scheduled.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MaintenanceStatusCard;
