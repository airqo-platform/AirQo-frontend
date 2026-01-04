import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface DeviceMeasurementsApiCardProps {
  deviceId: string;
}

const DeviceMeasurementsApiCard: React.FC<DeviceMeasurementsApiCardProps> = ({ deviceId }) => {
  return (
    <Card className="w-full rounded-lg flex flex-col gap-4 px-3 py-2">
      <h2 className="text-lg font-semibold mb-2">Device Measurements API</h2>
      {/* Recent Measurements */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            {`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/recent?token=YOUR_TOKEN`}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => {
              navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/recent?token=YOUR_TOKEN`);
              ReusableToast({ message: "Copied", type: "SUCCESS" });
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Historical Measurements */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Historical Measurements API</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            {`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/historical?token=YOUR_TOKEN`}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => {
              navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/historical?token=YOUR_TOKEN`);
              ReusableToast({ message: "Copied", type: "SUCCESS" });
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DeviceMeasurementsApiCard; 