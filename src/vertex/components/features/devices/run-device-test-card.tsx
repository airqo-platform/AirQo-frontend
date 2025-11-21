import { Card } from "@/components/ui/card";
import { Loader2, RotateCw, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useDeviceStatusFeed } from "@/core/hooks/useDevices";
import React from "react";
import moment from "moment";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RunDeviceTestCardProps {
  deviceNumber: number;
  getElapsedDurationMapper: (dateTimeStr: string) => [number, { [key: string]: number }];
}

/**
 * Helper function to check for future dates.
 */
const isDateInFuture = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;

  const date = moment(dateString);
  const now = moment();

  if (!date.isValid()) return false;

  return date.isAfter(now.add(5, "minutes"));
};

const RunDeviceTestCard: React.FC<RunDeviceTestCardProps> = ({ deviceNumber, getElapsedDurationMapper }) => {
  const statusFeed = useDeviceStatusFeed(deviceNumber);

  return (
    <Card className="w-full rounded-lg bg-white md:col-span-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-lg font-semibold">Run Device Test</h2>
        <button
          className="ml-2 p-2 rounded-full hover:rounded-full hover:bg-muted disabled:opacity-50"
          onClick={() => statusFeed.refetch()}
          disabled={statusFeed.isFetching}
          aria-busy={statusFeed.isFetching}
          title="Refresh"
        >
          <RotateCw className={statusFeed.isFetching ? "animate-spin" : ""} />
        </button>
      </div>
      {statusFeed.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : statusFeed.error ? (
        <div className="p-6 text-sm text-center text-muted-foreground">
          Could not fetch device status. Please try refreshing.
        </div>
      ) : statusFeed.data ? (
        <>
          <div className="text-sm text-muted-foreground mb-1 px-3 py-2">
            {(() => {
              const createdAt = statusFeed.data.created_at;
              if (!createdAt) return null;

              // --- Future Date Check ---
              if (isDateInFuture(createdAt)) {
                const formattedDate = moment(createdAt).format(
                  "D MMM YYYY, HH:mm A"
                );
                return (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-purple-600 font-bold underline decoration-dotted cursor-help">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Invalid Date: {formattedDate}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs max-w-xs">
                          <strong>Device Level Issue</strong>
                          <br />
                          The device reported an invalid future date:
                          <br />
                          <strong className="mt-1 block">{formattedDate}</strong>
                          <br />
                          This is likely due to a clock or configuration error
                          on the device itself.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
              // --- END: Future Date Check ---

              const [, elapsedUntyped] = getElapsedDurationMapper(createdAt);
              const elapsed = elapsedUntyped as Record<string, number>;
              const units = [
                ["year", "years"],
                ["month", "months"],
                ["week", "weeks"],
                ["day", "days"],
                ["hour", "hours"],
                ["minute", "minutes"],
                ["second", "seconds"],
              ];
              const parts = [];
              for (const [unit, plural] of units) {
                if (elapsed[unit] > 0) {
                  parts.push(`${elapsed[unit]} ${elapsed[unit] === 1 ? unit : plural}`);
                }
                if (parts.length === 2) break;
              }
              const relativeString = parts.length ? parts.join(", ") : "just now";
              const totalHoursOffline =
                (elapsed.year ?? 0) * 365 * 24 +
                (elapsed.month ?? 0) * 30 * 24 +
                (elapsed.week ?? 0) * 7 * 24 +
                (elapsed.day ?? 0) * 24 +
                (elapsed.hour ?? 0);

              let colorClass: string;
              if (totalHoursOffline < 6) {
                colorClass = "text-green-600";
              } else if (totalHoursOffline < 24) {
                colorClass = "text-yellow-600";
              } else if (totalHoursOffline < 7 * 24) {
                colorClass = "text-orange-600";
              } else {
                colorClass = "text-red-600";
              }
              return (
                <>
                  Device last pushed data{" "}
                  <span className={`font-bold ${colorClass}`}>
                    {relativeString}
                  </span>{" "}
                  {parts.length ? " ago." : "."}
                </>
              );
            })()}
          </div>
          <div className="px-3">
            {Object.entries(statusFeed.data)
              .filter(
                ([key]) =>
                  !["created_at", "isCache", "satellites", "DeviceType", "undefined"].includes(
                    key
                  )
              )
              .map(([key, value]) => {
                const displayKey = key.length > 20 ? key.slice(0, 20) + "..." : key;
                return (
                  <div key={key} className="flex gap-4 items-center justify-between">
                    <span
                      className="text-xs text-muted-foreground uppercase font-medium tracking-wide"
                      title={key}
                    >
                      {displayKey}
                    </span>
                    <span className="text-base font-normal break-all">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      ) : (
        <div className="text-muted-foreground">No status data available.</div>
      )}
    </Card>
  );
};

export default RunDeviceTestCard;