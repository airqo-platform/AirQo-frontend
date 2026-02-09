"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AqArrowLeft } from "@airqo/icons-react";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import NetworkDetailsCard from "@/components/features/networks/network-detail-card";
import NetworkDevicesTable from "@/components/features/networks/network-device-list-table";
import { useNetworks } from "@/core/hooks/useNetworks";
import { PERMISSIONS } from "@/core/permissions/constants";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Plus, Upload } from "lucide-react";
import CreateDeviceModal from "@/components/features/devices/create-device-modal";
import ImportDeviceModal from "@/components/features/devices/import-device-modal";
import { useState } from "react";
import { usePermission } from "@/core/hooks/usePermissions";
import { NetworkStatsCards } from "@/components/features/networks/NetworkStatsCards";

// Loading skeleton for content grid
const ContentGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
    </div>
);

export default function NetworkDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const networkId = params?.id as string;

    const { networks, isLoading, error } = useNetworks();
    const [isCreateDeviceOpen, setCreateDeviceOpen] = useState(false);
    const [isImportDeviceOpen, setImportDeviceOpen] = useState(false);
    const canUpdateDevice = usePermission(PERMISSIONS.DEVICE.UPDATE);

    const network = useMemo(() => {
        return networks.find((n) => n._id === networkId);
    }, [networks, networkId]);

    const isAirQoNetwork = network?.net_name?.toLowerCase() === "airqo";

    return (
        <RouteGuard permission={PERMISSIONS.NETWORK.VIEW}>
            <div>
                <div className="flex justify-between items-center">
                    <ReusableButton variant="text" onClick={() => router.push("/admin/networks")} Icon={AqArrowLeft}>
                        Back
                    </ReusableButton>
                    <div className="flex gap-2">
                        {isAirQoNetwork ? (
                            <ReusableButton
                                disabled={!canUpdateDevice}
                                onClick={() => setCreateDeviceOpen(true)}
                                Icon={Plus}
                                permission={PERMISSIONS.DEVICE.UPDATE}
                            >
                                Add AirQo Device
                            </ReusableButton>
                        ) : (
                            <ReusableButton
                                disabled={!canUpdateDevice}
                                onClick={() => setImportDeviceOpen(true)}
                                Icon={Upload}
                                permission={PERMISSIONS.DEVICE.UPDATE}
                            >
                                Import Device
                            </ReusableButton>
                        )}
                    </div>
                </div>

                <CreateDeviceModal
                    open={isCreateDeviceOpen}
                    onOpenChange={setCreateDeviceOpen}
                    networkName={network?.net_name}
                />
                <ImportDeviceModal
                    open={isImportDeviceOpen}
                    onOpenChange={setImportDeviceOpen}
                    prefilledNetwork={network?.net_name}
                />

                {isLoading ? (
                    <ContentGridSkeleton />
                ) : error ? (
                    <div className="mt-6 text-sm text-muted-foreground">
                        Unable to load Sensor Manufacturer details:{" "}
                        {String((error as Error)?.message || "Unknown error")}
                    </div>
                ) : !network ? (
                    <div className="mt-6 text-sm text-muted-foreground">
                        Sensor Manufacturer not found
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Network basic info card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
                            <NetworkDetailsCard
                                name={network.net_name}
                                id={network._id}
                                loading={isLoading}
                            />
                        </div>

                        {/* Network Stats Cards */}
                        <div className="space-y-4">
                            <NetworkStatsCards
                                networkId={network._id}
                                networkName={network.net_name}
                            />
                        </div>

                        {/* Devices list */}
                        <div className="space-y-4">
                            <NetworkDevicesTable
                                networkName={network.net_name}
                                networkId={network._id}
                            />
                        </div>
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
