import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { useRouter, usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { Device, DeviceSite } from "@/app/types/devices";
import ReusableButton from "@/components/shared/button/ReusableButton";

const MiniMap = lazy(() => import("@/components/features/mini-map/mini-map"));

interface DeviceLocationCardProps {
  device: Device;
}

export function DeviceLocationCard({ device }: DeviceLocationCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminMode = pathname.startsWith("/admin");

  const toNumberOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v));
    return Number.isFinite(n) ? n : null;
  };

  const lat = toNumberOrNull(device.latitude);
  const lon = toNumberOrNull(device.longitude);
  const hasCoordinates = lat !== null && lon !== null;

  const siteId = Array.isArray(device.site)
    ? device.site[0]?._id
    : (device.site as { _id: string })?._id;

  const handleEditLocation = () => {
    if (siteId) {
      const basePath = isAdminMode ? "/admin/sites" : "/sites";
      router.push(`${basePath}/${siteId}`);
    }
  };

  return (
    <Card className="w-full rounded-lg flex flex-col justify-between overflow-hidden">
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

      <div className="px-3 pb-3">
        {hasCoordinates ? (
          <Suspense fallback={<div className="h-48 rounded-md bg-muted animate-pulse" />}>
            <MiniMap
              latitude={String(lat)}
              longitude={String(lon)}
              readOnly
              scrollZoom={false}
              height="h-48"
              zoom={13}
            />
          </Suspense>
        ) : (
          <div className="h-48 rounded-md border border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/30">
            <MapPin className="h-6 w-6 opacity-40" />
            <p className="text-sm text-center px-4">
              Location data is currently unavailable for this device
            </p>
          </div>
        )}
      </div>

      {siteId && (
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
