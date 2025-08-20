"use client";

import { useState } from "react";
import { Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevices } from "@/core/hooks/useDevices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { toast } from "sonner";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermission } from "@/core/hooks/usePermissions";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import CreateDeviceModal from "@/components/features/devices/create-device-modal";
import DevicesTable from "@/components/features/devices/device-list-table";
import PermissionTooltip from "@/components/ui/permission-tooltip";

const ITEMS_PER_PAGE = 8;

export default function DevicesPage() {
  const { devices, isLoading, error } = useDevices();
  const { isAirQoInternal, isExternalOrg } = useUserContext();
  const [isCreateDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);

  // Permission checks
  const canUpdateDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Devices Overview</h1>
          <div className="flex gap-2">
            {isAirQoInternal && (
              <>
                {canUpdateDevice ? (
                  <Button disabled={isLoading || !!error} onClick={() => setCreateDeviceOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add AirQo Device
                  </Button>
                ) : (
                  <PermissionTooltip permission={PERMISSIONS.DEVICE.UPDATE}>
                    <span>
                      <Button disabled className="opacity-50">
                        <Plus className="mr-2 h-4 w-4" />
                        Add AirQo Device
                      </Button>
                    </span>
                  </PermissionTooltip>
                )}
                
                {canUpdateDevice ? (
                  <Button variant="outline" disabled={isLoading || !!error} onClick={() => setImportDeviceOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Existing Device
                  </Button>
                ) : (
                  <PermissionTooltip permission={PERMISSIONS.DEVICE.UPDATE}>
                    <span>
                      <Button variant="outline" disabled className="opacity-50">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Existing Device
                      </Button>
                    </span>
                  </PermissionTooltip>
                )}
              </>
            )}
            {isExternalOrg && (
              <Button
                disabled={isLoading || !!error}
                onClick={() => toast.error("This feature is not available yet for external organizations.")}
              >
                Claim Device
              </Button>
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
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </RouteGuard>
  );
}
