"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import { usePermission } from "@/core/hooks/usePermissions";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import DevicesTable from "@/components/features/devices/device-list-table";
import ReusableButton from "@/components/shared/button/ReusableButton";

export default function DevicesPage() {
  const router = useRouter();
  const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);

  // Permission checks
  const canUpdateDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-semibold">Devices</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your devices.
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <ReusableButton
              disabled={!canUpdateDevice}
              onClick={() => router.push("/devices/claim")}
              Icon={Plus}
              permission={PERMISSIONS.DEVICE.CLAIM}
            >
              Claim AirQo Device
            </ReusableButton>

            <ReusableButton
              variant="outlined"
              disabled={!canUpdateDevice}
              onClick={() => setImportDeviceOpen(true)}
              Icon={Upload}
              permission={PERMISSIONS.DEVICE.CLAIM}
            >
              Import External Device
            </ReusableButton>
          </div>
        </div>

        {/* Modal Components */}
        <ImportDeviceModal
          open={isImportDeviceOpen}
          onOpenChange={setImportDeviceOpen}
        />

        <DevicesTable multiSelect={true} />
      </div>
    </RouteGuard>
  );
}
