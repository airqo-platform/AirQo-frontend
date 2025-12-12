import { Card } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatDisplayDate,
  getDeviceStatus,
  getStatusExplanation,
} from "@/core/utils/status";

const statusColorClasses = {
  green: {
    bg: "bg-green-600",
    text: "text-green-700",
    border: "border-green-600",
  },
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-700",
    border: "border-blue-600",
  },
  yellow: {
    bg: "bg-yellow-500",
    text: "text-yellow-600",
    border: "border-yellow-500",
  },
  gray: {
    bg: "bg-gray-500",
    text: "text-gray-600",
    border: "border-gray-500",
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-600",
    border: "border-red-500",
  },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-700",
    border: "border-purple-600",
  },
};

interface OnlineStatusCardProps {
  deviceId: string;
}

const DateTooltipWrapper: React.FC<{ dateString: string; label: string }> = ({
  dateString,
  label,
}) => {
  const formattedDate = formatDisplayDate(dateString);

  if (formattedDate.isError) {
    const isFutureError = formattedDate.errorType === "future";

    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
        <span>
          {label}:{" "}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`font-medium underline decoration-dotted cursor-help inline-flex items-center gap-1 ${isFutureError ? "text-purple-600" : "text-red-500"
                  }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{formattedDate.message}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isFutureError ? (
                <>
                  <p className="text-sm font-medium mb-1">Device Level Issue</p>
                  <p className="text-xs max-w-xs">
                    The device reported an invalid future date:
                    <br />
                    <strong className="mt-1 block">
                      {formattedDate.message}
                    </strong>
                    <br />
                    This is likely due to a clock or configuration error.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">Data Error</p>
                  <p className="text-xs max-w-xs">
                    The date received from the device is unreadable or not a
                    valid date.
                  </p>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
      <span>
        {label}: <span>{formattedDate.message}</span>
      </span>
    </div>
  );
};

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

  const lastActiveCheck = device.lastActive
    ? formatDisplayDate(device.lastActive)
    : null;

  const status = getDeviceStatus(
    device.isOnline,
    device.rawOnlineStatus,
    lastActiveCheck
  );

  const colors = statusColorClasses[status.color];
  const detailedExplanation = getStatusExplanation(status.label, lastActiveCheck);

  const Icon = status.icon;

  return (
    <Card className="w-full rounded-lg overflow-hidden relative">
      <TooltipProvider>
        {/* --- Info Icon Tooltip --- */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="View device status details"
              type="button"
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p className="text-sm font-medium mb-1">{status.label}</p>
            <p className="text-xs">{detailedExplanation}</p>
          </TooltipContent>
        </Tooltip>
        {/* --- End Info Icon --- */}

        <div className={`h-2 ${colors.bg}`}></div>

        <div className="flex flex-col pt-6 px-6 pb-2 space-y-4">
          <div className="flex flex-col items-center text-center cursor-default">
            <div
              className={`flex items-center gap-1.5 text-lg font-semibold ${colors.text}`}
            >
              <Icon className="w-5 h-5" />
              <span>{status.label}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              {status.description}
            </div>
          </div>
        </div>

        <div className="border-t py-2 px-2">
          {device.lastActive ? (
            <DateTooltipWrapper
              dateString={device.lastActive}
              label="Last data"
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
              <span>No data received yet</span>
            </div>
          )}
        </div>
      </TooltipProvider>
    </Card>
  );
};

export default OnlineStatusCard;