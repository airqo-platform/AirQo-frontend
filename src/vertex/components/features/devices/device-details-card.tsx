import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface DeviceDetailsCardProps {
  deviceId: string;
  onShowDetailsModal: () => void;
}

const DeviceDetailsCard: React.FC<DeviceDetailsCardProps> = ({ deviceId, onShowDetailsModal }) => {
  const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;

  if (isLoading) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  if (error || !device) {
    return <Card className="w-full rounded-lg bg-white flex flex-col justify-between items-center p-8 text-red-500">Error loading device details.</Card>;
  }

  return (
    <Card className="w-full rounded-lg bg-white flex flex-col justify-between">
      <div className="px-3 py-2 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Device Details</h2>
        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Device Name</div>
          <div className="text-base font-normal break-all">{device.long_name || device.name}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Deployment Status</div>
          <span className={`inline-block text-base font-mono break-all capitalize px-2 py-1 rounded-md ${device.status === "deployed" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>{device.status}</span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Write Key</div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>{device.writeKey || "-"}</div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              onClick={() => {
                navigator.clipboard.writeText(device.writeKey);
                toast.success("Device Write Key copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Read Key</div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>{device.readKey || "-"}</div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              onClick={() => {
                navigator.clipboard.writeText(device.readKey);
                toast.success("Device Read Key copied!");
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t px-2 flex justify-end">
        <Button variant="ghost" onClick={onShowDetailsModal} className="hover:bg-transparent">
          View more details
        </Button>
      </div>
    </Card>
  );
};

export default DeviceDetailsCard; 