import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import React from "react";

interface OnlineStatusCardProps {
  deviceId: string;
}

const OnlineStatusCard: React.FC<OnlineStatusCardProps> = ({ deviceId }) => {
  const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;

  if (isLoading) {
    return <Card className="w-full rounded-lg overflow-hidden flex flex-col items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  if (error || !device) {
    return <Card className="w-full rounded-lg overflow-hidden flex flex-col items-center p-8 text-red-500">Error loading online status.</Card>;
  }

  return (
    <Card className="w-full rounded-lg overflow-hidden">
      <div className={`h-3 ${device.isOnline ? "bg-green-600" : "bg-red-600"}`}></div>
      <div className="flex flex-col items-center justify-center p-8">
        {device.isOnline ? (
          <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
        ) : (
          <XCircle className="w-12 h-12 text-red-600 mb-2" />
        )}
        <div className={`text-lg font-semibold mb-1 ${device.isOnline ? "text-green-700" : "text-red-700"}`}>{device.isOnline ? "Active" : "Offline"}</div>
        <div className="text-sm text-muted-foreground">Device is currently {device.isOnline ? "online" : "offline"}.</div>
      </div>
    </Card>
  );
};

export default OnlineStatusCard; 