import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import React from "react";
import { useClipboard } from "@/core/hooks/useClipboard";

interface DeviceMeasurementsApiCardProps {
  deviceId: string;
  /** Device name (e.g. airqo_g5241); the historical endpoint targets devices by name. */
  deviceName?: string;
}

// Official partner-facing guide for the historical data endpoint (body
// fields, date limits, pagination, rate limits).
export const HISTORICAL_DATA_DOCS_URL =
  "https://platform.airqo.net/docs/api/for-partners/historical-data/";

// Per the partner docs, historical data is served by the v3 analytics
// data-download endpoint (POST + JSON body), not a per-device GET route.
export const HISTORICAL_DATA_ENDPOINT =
  "https://api.airqo.net/api/v3/public/analytics/data-download?token=YOUR_TOKEN";

export const buildHistoricalRequestBody = (deviceName: string) =>
  JSON.stringify(
    {
      network: "airqo",
      datatype: "calibrated",
      downloadType: "json",
      frequency: "hourly",
      startDateTime: "2025-01-01T00:00:00Z",
      endDateTime: "2025-01-31T23:59:59Z",
      device_names: [deviceName],
      pollutants: ["pm2_5", "pm10"],
    },
    null,
    2
  );

const DeviceMeasurementsApiCard: React.FC<DeviceMeasurementsApiCardProps> = ({ deviceId, deviceName }) => {
  const { handleCopy } = useClipboard();

  const recentUrl = `https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/recent?token=YOUR_TOKEN`;
  const historicalBody = buildHistoricalRequestBody(deviceName || "DEVICE_NAME");

  return (
    <Card className="w-full rounded-lg flex flex-col gap-4 px-3 py-2">
      <h2 className="text-lg font-semibold mb-2">Device Measurements API</h2>
      {/* Recent Measurements */}
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            {recentUrl}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            aria-label="Copy recent measurements API URL"
            onClick={() => handleCopy(recentUrl)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Historical Data */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Historical Data API</div>
          <a
            href={HISTORICAL_DATA_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap"
          >
            Learn more
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span className="font-semibold">POST</span> {HISTORICAL_DATA_ENDPOINT}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            aria-label="Copy historical data API URL"
            onClick={() => handleCopy(HISTORICAL_DATA_ENDPOINT)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send <span className="font-mono">Content-Type: application/json</span> with a body like the one below. Date range is limited to 365 days per request.
        </p>
        <div className="flex items-start gap-2">
          <pre className="text-xs font-mono select-all overflow-x-auto scrollbar-hide max-w-full rounded-md bg-muted p-2 flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {historicalBody}
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            aria-label="Copy historical data request body"
            onClick={() => handleCopy(historicalBody)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DeviceMeasurementsApiCard;
