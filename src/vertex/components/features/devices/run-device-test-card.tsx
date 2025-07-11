import { Card } from "@/components/ui/card";
import { Loader2, RotateCw } from "lucide-react";
import { useDeviceStatusFeed } from "@/core/hooks/useDevices";
import React from "react";

interface RunDeviceTestCardProps {
  deviceNumber: number;
  getElapsedDurationMapper: any;
}

const RunDeviceTestCard: React.FC<RunDeviceTestCardProps> = ({ deviceNumber, getElapsedDurationMapper }) => {
  const statusFeed = useDeviceStatusFeed(deviceNumber);

  return (
    <Card className="w-full rounded-lg bg-white md:col-span-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-lg font-semibold">Run Device Test</h2>
        <button
          className="ml-2 p-2 rounded hover:bg-muted"
          onClick={() => statusFeed.refetch()}
          disabled={statusFeed.isLoading}
          title="Refresh"
        >
          <RotateCw className={statusFeed.isLoading ? "animate-spin" : ""} />
        </button>
      </div>
      {statusFeed.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : statusFeed.error ? (
        <div className="text-red-500">{statusFeed.error.message || "Failed to load status."}</div>
      ) : statusFeed.data ? (
        <>
          <div className="text-sm text-muted-foreground mb-4 px-3 py-2">
            {(() => {
              if (!statusFeed.data.created_at) return null;
              const [, elapsedUntyped] = getElapsedDurationMapper(statusFeed.data.created_at);
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
              return (
                <>
                  Device last pushed data{" "}
                  <span className="font-bold text-green-600">{relativeString}</span> ago.
                </>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-4 px-3 py-2">
            {Object.entries(statusFeed.data)
              .filter(([key]) => !["created_at", "isCache", "satellites", "DeviceType", "undefined"].includes(key))
              .map(([key, value]) => {
                const displayKey = key.length > 12 ? key.slice(0, 12) + "..." : key;
                return (
                  <div key={key} className="flex gap-4 items-center">
                    <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide" title={key}>{displayKey}</span>
                    <span className="text-base font-normal break-all">{String(value)}</span>
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