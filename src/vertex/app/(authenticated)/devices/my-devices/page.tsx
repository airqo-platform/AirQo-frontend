"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AqCollocation, AqDotsHorizontal, AqPlus } from "@airqo/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyDevices } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { DeviceAssignmentModal } from "@/components/features/devices/device-assignment-modal";
import { PERMISSIONS } from "@/core/permissions/constants";
import DevicesTable from "@/components/features/devices/device-list-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 8;

const MyDevicesPage = () => {
  const router = useRouter();
  const { userDetails, activeGroup } = useAppSelector((state) => state.user);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const {
    data: devicesData,
    isLoading,
    error,
  } = useMyDevices(userDetails?._id || "", activeGroup?._id);

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
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/devices/claim")}
                  >
                    <AqPlus className="mr-2 h-4 w-4" />
                    Claim Device
                  </Button>
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
            <h1 className="text-2xl font-semibold">My Devices</h1>
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
          <DropdownMenu>
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
          </DropdownMenu>
          </div>
        </div>

        <DevicesTable
          devices={devicesData?.devices || []}
          isLoading={isLoading}
          error={error}
          itemsPerPage={ITEMS_PER_PAGE}
        />

        {/* Device Assignment Modal */}
        <DeviceAssignmentModal
          devices={devicesData?.devices || []}
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
