import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import React from "react";
import { useClipboard } from "@/core/hooks/useClipboard";

interface DeviceMeasurementsApiCardProps {
  deviceId: string;
}

// Official partner-facing guide for the historical measurements endpoint
// (parameters, pagination, date ranges). Linked next to the copyable URL so
// partners don't have to guess at the query contract from the URL alone.
export const HISTORICAL_DATA_DOCS_URL =
  "https://platform.airqo.net/docs/api/for-partners/historical-data/";

const DeviceMeasurementsApiCard: React.FC<DeviceMeasurementsApiCardProps> = ({ deviceId }) => {
  const { handleCopy } = useClipboard();

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
            onClick={() => handleCopy(`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/recent?token=YOUR_TOKEN`)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Historical Measurements */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Historical Measurements API</div>
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
            {`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/historical?token=YOUR_TOKEN`}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => handleCopy(`https://api.airqo.net/api/v2/devices/measurements/devices/${deviceId}/historical?token=YOUR_TOKEN`)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DeviceMeasurementsApiCard; 