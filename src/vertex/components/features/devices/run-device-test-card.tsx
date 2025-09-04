import { Card } from "@/components/ui/card";
import { Loader2, RotateCw } from "lucide-react";
import { useDeviceStatusFeed } from "@/core/hooks/useDevices";
import React from "react";

interface RunDeviceTestCardProps {
  deviceNumber: number;
  getElapsedDurationMapper: (dateTimeStr: string) => [number, { [key: string]: number }];
}

const RunDeviceTestCard: React.FC<RunDeviceTestCardProps> = ({ deviceNumber, getElapsedDurationMapper }) => {
  const statusFeed = useDeviceStatusFeed(deviceNumber);

  return (
    <Card className="w-full rounded-lg bg-white md:col-span-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-lg font-semibold">Run Device Test</h2>
        <button
          className="ml-2 p-2 rounded hover:bg-muted disabled:opacity-50"
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
        <div className="text-red-500">{statusFeed.error.message || "Failed to load status."}</div>
      ) : statusFeed.data ? (
        <>
          <div className="text-sm text-muted-foreground mb-1 px-3 py-2">
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
              const daysOffline =
                (elapsed.year ?? 0) * 365 +
                (elapsed.month ?? 0) * 30 +
                (elapsed.week ?? 0) * 7 +
                (elapsed.day ?? 0);
              let colorClass = "text-green-600";
              if (daysOffline >= 5 && daysOffline <= 10) colorClass = "text-yellow-600";
              else if (daysOffline >= 11 && daysOffline <= 20) colorClass = "text-orange-600";
              else if (daysOffline > 20) colorClass = "text-red-600";
              return (
                <>
                  Device last pushed data{" "}
                  <span className={`font-bold ${colorClass}`}>
                    {relativeString}
                  </span>{" "}
                  ago.
                </>
              );
            })()}
          </div>
          <div className="px-3">
            {Object.entries(statusFeed.data)
              .filter(([key]) => !["created_at", "isCache", "satellites", "DeviceType", "undefined"].includes(key))
              .map(([key, value]) => {
                const displayKey = key.length > 20 ? key.slice(0, 20) + "..." : key;
                return (
                  <div key={key} className="flex gap-4 items-center justify-between">
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