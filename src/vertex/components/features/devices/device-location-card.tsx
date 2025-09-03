import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Device } from "@/app/types/devices";

interface DeviceLocationCardProps {
  device: Device;
}

export function DeviceLocationCard({ device }: DeviceLocationCardProps) {
  const router = useRouter();

  const handleEditLocation = () => {
    if (device.site_id) {
      router.push(`/sites/${device.site_id}`);
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
          {device.description && (
            <div className="text-base font-normal break-all">
              {device.description}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
              Latitude
            </div>
            <div className="text-base font-mono">
              {device.latitude ? Number(device.latitude).toFixed(6) : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
              Longitude
            </div>
            <div className="text-base font-mono">
              {device.longitude ? Number(device.longitude).toFixed(6) : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {device.site_id && (
        <div className="border-t px-2 flex justify-end">
          <Button
            variant="ghost"
            onClick={handleEditLocation}
            className="hover:bg-transparent"
          >
            View site details
          </Button>
        </div>
      )}
    </Card>
  );
}
