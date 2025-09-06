"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { useDevices } from "@/core/hooks/useDevices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { toast } from "sonner";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermission } from "@/core/hooks/usePermissions";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import CreateDeviceModal from "@/components/features/devices/create-device-modal";
import DevicesTable from "@/components/features/devices/device-list-table";
import ReusableButton from "@/components/shared/button/ReusableButton";

export default function DevicesPage() {
  const { devices, isLoading, error } = useDevices();
  const { isAirQoInternal, isExternalOrg } = useUserContext();
  const [isCreateDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);

  // Permission checks
  const canUpdateDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Devices</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your devices.
            </p>
          </div>
          <div className="flex gap-2">
            {isAirQoInternal && (
              <>
                <ReusableButton
                  disabled={isLoading || !!error || !canUpdateDevice}
                  onClick={() => setCreateDeviceOpen(true)}
                  Icon={Plus}
                  permission={PERMISSIONS.DEVICE.UPDATE}
                >
                  Add AirQo Device
                </ReusableButton>

                <ReusableButton
                  variant="outlined"
                  disabled={isLoading || !!error || !canUpdateDevice}
                  onClick={() => setImportDeviceOpen(true)}
                  Icon={Upload}
                  permission={PERMISSIONS.DEVICE.UPDATE}
                >
                  Import Existing Device
                </ReusableButton>
              </>
            )}
            {isExternalOrg && (
              <ReusableButton
                disabled={isLoading || !!error}
                onClick={() => toast.error("This feature is not available yet for external organizations.")}
              >
                Claim Device
              </ReusableButton>
            )}
          </div>
        </div>

        {/* Modal Components */}
        <ImportDeviceModal
          open={isImportDeviceOpen}
          onOpenChange={setImportDeviceOpen}
        />
        <CreateDeviceModal
          open={isCreateDeviceOpen}
          onOpenChange={setCreateDeviceOpen}
        />

        <DevicesTable
          devices={devices}
          isLoading={isLoading}
          error={error}
          multiSelect={true}
        />
      </div>
    </RouteGuard>
  );
}
