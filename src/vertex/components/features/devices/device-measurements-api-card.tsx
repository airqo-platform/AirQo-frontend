import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import { toast } from "sonner";
import React from "react";

interface DeviceMeasurementsApiCardProps {
  deviceId: string;
}

const DeviceMeasurementsApiCard: React.FC<DeviceMeasurementsApiCardProps> = ({ deviceId }) => {
  const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;

  if (isLoading) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  if (error || !device) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8 text-red-500">Error loading device info.</Card>;
  }

  return (
    <Card className="w-full rounded-lg bg-white flex flex-col gap-4 px-3 py-2">
      <h2 className="text-lg font-semibold mb-2">Device Measurements API</h2>
      {/* Recent Measurements */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            {`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}?token=YOUR_TOKEN`}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => {
              navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}?token=YOUR_TOKEN`);
              toast.success("Recent measurements API URL copied!");
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
            {`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}/historical?token=YOUR_TOKEN`}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => {
              navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}/historical?token=YOUR_TOKEN`);
              toast.success("Historical measurements API URL copied!");
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