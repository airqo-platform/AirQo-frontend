import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Device, DeviceSite } from "@/app/types/devices";
import ReusableButton from "@/components/shared/button/ReusableButton";

interface DeviceLocationCardProps {
  device: Device;
}

export function DeviceLocationCard({ device }: DeviceLocationCardProps) {
  const router = useRouter();

  const toNumberOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v));
    return Number.isFinite(n) ? n : null;
  };

  const lat = toNumberOrNull(device.latitude);
  const lon = toNumberOrNull(device.longitude);

  const handleEditLocation = () => {
    if (device.site_id) {
      router.push(`/admin/sites/${device.site_id}`);
    }
  };

  return (
    <Card className="w-full rounded-lg bg-white flex flex-col justify-between">
      <div className="px-3 py-2 flex flex-col gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Site Details
        </h2>

        <div>
          <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
            Site
          </div>
          <div className="text-base font-normal break-words w-[70%]">
            {(() => {
              if (!device?.site) return "N/A";
              if (Array.isArray(device.site) && device.site.length > 0) {
                const site = device.site[0];
                return site?.name || site?.description || site?.location_name || "N/A";
              }
              if (typeof device.site === 'object' && !Array.isArray(device.site)) {
                return (device.site as DeviceSite).name || (device.site as DeviceSite).description || (device.site as DeviceSite).location_name || "N/A";
              }
              return "N/A";
            })()}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
              Latitude
            </div>
            <div className="text-base font-mono">
              {lat ? lat.toFixed(6) : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
              Longitude
            </div>
            <div className="text-base font-mono">
              {lon ? lon.toFixed(6) : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {device.site_id && (
        <div className="border-t px-2 flex justify-end">
          <ReusableButton
            variant="text"
            onClick={handleEditLocation}
            className="p-1 text-xs m-1"
          >
            View site details
          </ReusableButton>
        </div>
      )}
    </Card>
  );
}
