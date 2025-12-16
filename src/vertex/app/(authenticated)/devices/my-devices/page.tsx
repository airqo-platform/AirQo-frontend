"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AqCollocation, AqPlus } from "@airqo/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyDevices, useDevices } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { DeviceAssignmentModal } from "@/components/features/devices/device-assignment-modal";
import { PERMISSIONS } from "@/core/permissions/constants";
import ClientPaginatedDevicesTable from "@/components/features/devices/client-paginated-devices-table";

import { OrphanedDevicesAlert } from "@/components/features/devices/orphaned-devices-alert";
import ReusableButton from "@/components/shared/button/ReusableButton";

const MyDevicesPage = () => {
  const router = useRouter();
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const { userScope } = useUserContext();

  const {
    data: myDevicesData,
    isLoading: isLoadingMyDevices,
    error: myDevicesError,
  } = useMyDevices(userDetails?._id || "", activeGroup?._id, {
    enabled: userScope === 'personal',
  });

  const {
    devices: orgDevices,
    isLoading: isLoadingOrgDevices,
    error: orgDevicesError,
  } = useDevices({
    enabled: userScope === 'organisation',
  });

  const devices = React.useMemo(() => {
    return userScope === 'personal'
      ? myDevicesData?.devices || []
      : orgDevices;
  }, [userScope, myDevicesData?.devices, orgDevices]);
  const isLoading = userScope === 'personal' ? isLoadingMyDevices : isLoadingOrgDevices;
  const error = userScope === 'personal' ? myDevicesError : orgDevicesError;
  const searchParams = useSearchParams();
  const rawStatus = searchParams.get("status");
  const statusFilter = ["operational", "transmitting", "not_transmitting", "data_available"].includes(rawStatus || "")
    ? rawStatus
    : null;

  const filteredDevices = React.useMemo(() => {
    if (!devices) return [];
    if (!statusFilter) return devices;

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
  }, [devices, statusFilter]);

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
            <Button onClick={() => router.push("/devices/claim")}>
              <AqPlus className="mr-2 h-4 w-4" />
              Claim Device
            </Button>
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
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-800">
                  <span>
                    Status: <span className="capitalize">{statusFilter.replace(/_/g, " ")}</span>
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
            </div>
            <p className="text-muted-foreground">
              Manage your personal and shared devices
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => router.push("/devices/claim")}
              disabled={isLoading}
            >
              <AqPlus className="mr-2 h-4 w-4" />
              Claim Device
            </Button>
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
        />

        {/* Device Assignment Modal */}
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
