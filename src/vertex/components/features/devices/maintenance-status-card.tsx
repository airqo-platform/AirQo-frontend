import { Card } from "@/components/ui/card";
import React from "react";
import { format, parseISO, isValid } from 'date-fns';


interface MaintenanceStatusCardProps {
  nextMaintenance: string | undefined;
}

const MaintenanceStatusCard: React.FC<MaintenanceStatusCardProps> = ({
  nextMaintenance,
}) => {
  return (
    <Card className="w-full rounded-lg">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h2 className="text-lg font-semibold">Next Maintenance</h2>
      </div>

      <div className="px-3 py-0 space-y-3">
        {nextMaintenance && isValid(parseISO(nextMaintenance)) ? (
          <div className="pt-3 pb-3">
            <div className="text-base font-normal">
              {format(parseISO(nextMaintenance), "MMM d yyyy, h:mm a")}
            </div>
          </div>
        ) : (
          <div className="p-3 text-sm text-muted-foreground">
            No upcoming maintenance scheduled.
          </div>
        )}
      </div>
    </Card>
  );
};

export default MaintenanceStatusCard;
