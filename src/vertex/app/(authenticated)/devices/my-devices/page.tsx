"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AqCollocation, AqPlus } from "@airqo/icons-react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMyDevices, useDevices } from "@/core/hooks/useDevices";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";
import { MY_DEVICES_STATUS_FILTERS, type MyDevicesStatusFilter } from "@/app/types/devices";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { DeviceAssignmentModal } from "@/components/features/devices/device-assignment-modal";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import { PERMISSIONS } from "@/core/permissions/constants";
import { usePermission } from "@/core/hooks/usePermissions";
import dynamic from "next/dynamic";

const ClaimDeviceModal = dynamic(
  () => import("@/components/features/claim/claim-device-modal"),
  { ssr: false }
);
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";

import { OrphanedDevicesAlert } from "@/components/features/devices/orphaned-devices-alert";
import ReusableButton from "@/components/shared/button/ReusableButton";

const MyDevicesPage = () => {
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const { userScope } = useUserContext();
  const canClaimDevice = usePermission(PERMISSIONS.DEVICE.CLAIM);
  const canImportDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);
  const isPersonalScope = userScope === 'personal';

  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const statusFilter = MY_DEVICES_STATUS_FILTERS.includes(rawStatus as MyDevicesStatusFilter)
    ? (rawStatus as MyDevicesStatusFilter)
    : null;

  const { pagination, setPagination } = useServerSideTableState({ initialPageSize: 25 });

  // A different status is a different result set, so go back to its first
  // page. Only on an actual change: resetting on mount too would throw away a
  // page the URL asked for.
  const previousStatusFilter = useRef(statusFilter);
  useEffect(() => {
    if (previousStatusFilter.current === statusFilter) return;
    previousStatusFilter.current = statusFilter;
    setPagination((previous) =>
      previous.pageIndex === 0 ? previous : { ...previous, pageIndex: 0 }
    );
  }, [statusFilter, setPagination]);

  // Personal scope filters and paginates on the server: the endpoint returns
  // one capped page, so filtering it in the browser hides devices that the cap
  // left out and makes a non-zero dashboard card open an empty table (#4019).
  const {
    data: myDevicesData,
    isLoading: isLoadingMyDevices,
    error: myDevicesError,
  } = useMyDevices(userDetails?._id || "", activeGroup?._id, {
    enabled: isPersonalScope,
    status: statusFilter ?? undefined,
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
  });

  const {
    devices: orgDevices,
    isLoading: isLoadingOrgDevices,
    error: orgDevicesError,
  } = useDevices({
    enabled: userScope === 'organisation',
  });

  const devices = React.useMemo(() => {
    return isPersonalScope
      ? myDevicesData?.devices || []
      : orgDevices;
  }, [isPersonalScope, myDevicesData?.devices, orgDevices]);
  const isLoading = isPersonalScope ? isLoadingMyDevices : isLoadingOrgDevices;
  const error = isPersonalScope ? myDevicesError : orgDevicesError;

  const totalDevices = isPersonalScope
    ? myDevicesData?.meta?.total ?? myDevicesData?.total_devices
    : undefined;
  const pageCount =
    myDevicesData?.meta?.totalPages ??
    (totalDevices !== undefined ? Math.ceil(totalDevices / pagination.pageSize) : 0);

  const filteredDevices = React.useMemo(() => {
    if (!devices) return [];
    // Personal scope is already filtered by the server.
    if (!statusFilter || isPersonalScope) return devices;

    return devices.filter((device) => {
      if (statusFilter === "operational") {
        return device.rawOnlineStatus === true && device.isOnline === true;
      }

      if (statusFilter === "transmitting") {
        return device.rawOnlineStatus === true && device.isOnline === false;
      }

      if (statusFilter === "not_transmitting") {
        return device.rawOnlineStatus === false && device.isOnline === false;
      }

      if (statusFilter === "data_available") {
        return device.rawOnlineStatus === false && device.isOnline === true;
      }

      return true;
    });
  }, [devices, statusFilter, isPersonalScope]);

  if (error) {
    return (
      <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">My Devices</h1>
              <p className="text-muted-foreground">
                Manage your personal and shared devices
                {activeGroup && (
                  <span className="ml-2 text-sm">
                    • Viewing in {activeGroup.grp_title}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <ReusableButton
                onClick={() => setIsClaimModalOpen(true)}
                disabled={!canClaimDevice}
                Icon={AqPlus}
                permission={PERMISSIONS.DEVICE.CLAIM}
              >
                Claim AirQo Device
              </ReusableButton>
              <ReusableButton
                variant="outlined"
                onClick={() => setImportDeviceOpen(true)}
                disabled={!canImportDevice}
                Icon={Upload}
                permission={PERMISSIONS.DEVICE.UPDATE}
              >
                Register Non-AirQo Device
              </ReusableButton>
            </div>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <AqCollocation className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Unable to load devices
                </h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading your devices. Please try again or
                  contact support if the problem persists.
                </p>
                <div className="flex gap-2 justify-center">
                  <ReusableButton onClick={() => window.location.reload()}>
                    Retry
                  </ReusableButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard permission={PERMISSIONS.DEVICE.VIEW}>
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">My Devices</h1>
              {statusFilter && (
                <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Filtered: {statusFilter.replace("_", " ")}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Manage your personal and shared devices
              {totalDevices !== undefined && !isLoading && (
                <span className="ml-2 text-sm">
                  • {totalDevices} device{totalDevices === 1 ? "" : "s"}
                  {statusFilter ? ` ${statusFilter.replace("_", " ")}` : ""}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <ReusableButton
              onClick={() => setIsClaimModalOpen(true)}
              disabled={isLoading || !canClaimDevice}
              Icon={AqPlus}
              permission={PERMISSIONS.DEVICE.CLAIM}
            >
              Claim AirQo Device
            </ReusableButton>
            <ReusableButton
              variant="outlined"
              onClick={() => setImportDeviceOpen(true)}
              disabled={isLoading || !canImportDevice}
              Icon={Upload}
              permission={PERMISSIONS.DEVICE.UPDATE}
            >
              Register Non-AirQo Device
            </ReusableButton>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  <AqDotsHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowAssignmentModal(true)}>
                  Share Device
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>

        {userDetails?._id && <OrphanedDevicesAlert userId={userDetails._id} />}

        <ClientPaginatedDevicesTable
          devices={filteredDevices}
          isLoading={isLoading}
          error={error}
          multiSelect={true}
          hiddenColumns={['groups']}
          // /devices/my-devices has no search parameter, so with server-side
          // paging the box could only search the current page.
          searchable={!isPersonalScope}
          serverSidePagination={isPersonalScope}
          pageCount={isPersonalScope ? pageCount : undefined}
          pagination={isPersonalScope ? pagination : undefined}
          onPaginationChange={isPersonalScope ? setPagination : undefined}
        />

        {/* Modals */}
        <ImportDeviceModal
          open={isImportDeviceOpen}
          onOpenChange={setImportDeviceOpen}
        />
        <ClaimDeviceModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
        />
        <DeviceAssignmentModal
          devices={devices}
          isLoadingDevices={isLoading}
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
          }}
          onSuccess={() => {
            setShowAssignmentModal(false);
          }}
        />
      </div>
    </RouteGuard>
  );
};

export default MyDevicesPage;
