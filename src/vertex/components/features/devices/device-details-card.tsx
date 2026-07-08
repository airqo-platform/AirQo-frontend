"use client";

import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { useDeviceDetails, useUpdateDeviceLocal } from "@/core/hooks/useDevices";
import { Loader2, MapPin } from "lucide-react";
import React, { useState, useEffect } from "react";

const MiniMap = lazy(() => import("@/components/features/mini-map/mini-map"));
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Badge } from "@/components/ui/badge";
import { AqEdit01 } from "@airqo/icons-react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";

interface DeviceDetailsCardProps {
  deviceId: string;
  onShowDetailsModal: () => void;
}

const DeviceDetailsCard: React.FC<DeviceDetailsCardProps> = ({ deviceId, onShowDetailsModal }) => {
  const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
  const device = deviceResponse?.data;
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { mutate: updateDevice, isPending } = useUpdateDeviceLocal();

  useEffect(() => {
    setSelectedTags(device?.tags ?? []);
  }, [device?.tags]);

  const handleConfirmTagsUpdate = () => {
    updateDevice(
      { deviceId, deviceData: { tags: selectedTags } },
      {
        onSuccess: () => {
          setIsTagsDialogOpen(false);
        },
      }
    );
  };

  const toNumberOrNull = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(String(v));
    return Number.isFinite(n) ? n : null;
  };

  if (isLoading) {
    return <Card className="w-full rounded-lg flex flex-col justify-between items-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></Card>;
  }
  if (error || !device) {
    return <Card className="w-full rounded-lg flex flex-col justify-between items-center p-8 text-sm text-center text-muted-foreground">Error loading device details.</Card>;
  }

  const lat = toNumberOrNull(device?.latitude);
  const lon = toNumberOrNull(device?.longitude);
  const hasCoordinates = lat !== null && lon !== null;

  return (
    <Card className="w-full rounded-lg flex flex-col justify-between overflow-hidden">
      <div className="px-3 py-2 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Device Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Device Name</div>
            <div className="text-base font-normal break-all">{device.long_name || device.name}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
                Tags
              </div>
              <ReusableButton
                variant="text"
                onClick={() => setIsTagsDialogOpen(true)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-fit w-fit"
                Icon={AqEdit01}
                aria-label="Edit tags"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {device.tags && device.tags.length > 0 ? (
                device.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal capitalize">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-base font-normal text-muted-foreground">
                  None
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Deployment Status</div>
            <span className={`inline-block text-base font-mono break-all capitalize px-2 py-1 rounded-md ${device.status === "deployed" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>{device.status}</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Sensor Manufacturer</div>
            <div className="text-base font-normal break-all">{device.network || 'N/A'}</div>
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

      <div className="border-t px-2 flex justify-end">
        <ReusableButton variant="text" className="p-1 text-xs m-1" onClick={onShowDetailsModal}>
          View more details
        </ReusableButton>
      </div>

      <ReusableDialog
        isOpen={isTagsDialogOpen}
        onClose={() => !isPending && setIsTagsDialogOpen(false)}
        title="Edit Device Tags"
        size="md"
        customFooter={
          <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ReusableButton
              variant="outlined"
              onClick={() => setIsTagsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </ReusableButton>
            <ReusableButton
              onClick={handleConfirmTagsUpdate}
              disabled={isPending}
              variant="filled"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Updating..." : "Save Changes"}
            </ReusableButton>
          </div>
        }
      >
        <div className="space-y-4 py-4 px-1">
          <MultiSelectCombobox
            options={DEFAULT_DEVICE_TAGS}
            placeholder="Select or create tags..."
            emptyMessage="No tags found."
            value={selectedTags}
            onValueChange={setSelectedTags}
            allowCreate={true}
          />
        </div>
      </ReusableDialog>
    </Card>
  );
};

export default DeviceDetailsCard; 