import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import React from "react";
import moment from "moment";

interface OnlineStatusCardProps {
  deviceId: string;
}

const OnlineStatusCard: React.FC<OnlineStatusCardProps> = ({ deviceId }) => {
  const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;

  if (isLoading) {
    return (
      <Card className="w-full rounded-lg overflow-hidden flex flex-col items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </Card>
    );
  }
  if (error || !device) {
    return (
      <Card className="w-full rounded-lg overflow-hidden flex flex-col items-center p-8 text-sm text-center text-muted-foreground">
        Error loading online status.
      </Card>
    );
  }

  const successPercentage = device.onlineStatusAccuracy?.successPercentage ?? 0;
  const lastUpdate = device.onlineStatusAccuracy?.lastUpdate
    ? new Date(device.onlineStatusAccuracy.lastUpdate)
    : null;

  return (
    <Card className="w-full rounded-lg overflow-hidden">
      <div
        className={`h-2 ${device.isOnline ? "bg-green-600" : "bg-red-600"}`}
      ></div>
      <div className="flex flex-col pt-6 px-6 pb-2 space-y-4">
        <div className="flex flex-col items-center text-center">
          <div
            className={`text-lg font-semibold ${
              device.isOnline ? "text-green-700" : "text-red-700"
            }`}
          >
            {device.isOnline ? "Active" : "Offline"}
          </div>
          <div className="text-sm text-muted-foreground">
            Device is currently {device.isOnline ? "online" : "offline"}.
          </div>
        </div>
      </div>
      <div className="border-t py-2 px-2">
        <div className="space-y-1">
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
            Accuracy Score is
            <span>{successPercentage}%</span>
          </div>
          {lastUpdate && (
            <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
              <span>
                Last updated: {moment(lastUpdate).format("D MMM YYYY, HH:mm A")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OnlineStatusCard;
