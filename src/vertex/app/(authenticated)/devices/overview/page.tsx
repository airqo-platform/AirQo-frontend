"use client";

import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import { useUserContext } from "@/core/hooks/useUserContext";
import { usePermission } from "@/core/hooks/usePermissions";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import CreateDeviceModal from "@/components/features/devices/create-device-modal";
import DevicesTable from "@/components/features/devices/device-list-table";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useRouter, useSearchParams } from "next/navigation";

export default function DevicesPage() {
  const { isPersonalContext, isExternalOrg } = useUserContext();
  const [isCreateDeviceOpen, setCreateDeviceOpen] = useState(false);
  const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

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
          {status && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800 ml-4">
              <span>
                Status: <span className="capitalize">{status.replace(/_/g, " ")}</span>
              </span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  router.push(`?${params.toString()}`);
                }}
                className="p-0.5 hover:bg-yellow-200 rounded-full transition-colors"
              >
                <span className="sr-only">Clear filter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1" />
          <div className="flex gap-2">
            {isPersonalContext && (
              <>
                <ReusableButton
                  disabled={!canUpdateDevice}
                  onClick={() => setCreateDeviceOpen(true)}
                  Icon={Plus}
                  permission={PERMISSIONS.DEVICE.UPDATE}
                >
                  Claim AirQo Device
                </ReusableButton>

                <ReusableButton
                  variant="outlined"
                  disabled={!canUpdateDevice}
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
                onClick={() => router.push("/devices/claim")}
                permission={PERMISSIONS.DEVICE.CLAIM}
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

        <DevicesTable multiSelect={true} />
      </div>
    </RouteGuard>
  );
}
