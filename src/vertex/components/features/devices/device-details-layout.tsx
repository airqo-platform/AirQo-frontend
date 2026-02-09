"use client";

import { useRouter } from "next/navigation";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { XCircle } from "lucide-react";
import { PERMISSIONS } from "@/core/permissions/constants";
import { getElapsedDurationMapper } from "@/lib/utils";
import { useState } from "react";
import DeviceDetailsModal from "@/components/features/devices/device-details-modal";
import DeployDeviceModal from "@/components/features/devices/deploy-device-modal";
import DeviceDetailsCard from "@/components/features/devices/device-details-card";
import DeviceMeasurementsApiCard from "@/components/features/devices/device-measurements-api-card";
import OnlineStatusCard from "@/components/features/devices/online-status-card";
import RunDeviceTestCard from "@/components/features/devices/run-device-test-card";
import RecallDeviceDialog from "@/components/features/devices/recall-device-dialog";
import AddMaintenanceLogModal from "@/components/features/devices/add-maintenance-log-modal";
import { Device } from "@/app/types/devices";
import { DeviceLocationCard } from "@/components/features/devices/device-location-card";
import MaintenanceStatusCard from "@/components/features/devices/maintenance-status-card";
import DeviceCategoryCard from "@/components/features/devices/device-category-card";
import DeviceHistoryCard from "@/components/features/devices/device-history-card";
import { AqArrowLeft, AqSignal02, AqTool01 } from "@airqo/icons-react";

const ActionButtonsSkeleton = () => (
    <div className="flex gap-1">
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
    </div>
);

const ContentGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
    </div>
);

interface DeviceDetailsLayoutProps {
    deviceId: string;
}

export default function DeviceDetailsLayout({ deviceId }: DeviceDetailsLayoutProps) {
    const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
    const device = (deviceResponse?.data as Device | undefined) ?? undefined;
    const router = useRouter();

    const deploymentStatus = device?.status || "unknown";

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRecallDialog, setShowRecallDialog] = useState(false);

    const [showDeployModal, setShowDeployModal] = useState(false);
    const [showMaintenanceLogModal, setShowMaintenanceLogModal] = useState(false);

    const deviceNum = Number(device?.device_number);

    if (!isLoading && error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
                <XCircle className="w-10 h-10 text-red-500" />
                <p className="text-lg font-semibold">Unable to load device details</p>
                <p className="text-sm text-muted-foreground">
                    {error?.message || "Device not found."}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2 mb-6 justify-between items-center">
                <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
                    Back
                </ReusableButton>

                {isLoading ? (
                    <ActionButtonsSkeleton />
                ) : !device ? null : (
                    <div className="flex gap-1">
                        {deploymentStatus === "deployed" &&
                            <ReusableButton
                                variant="filled"
                                padding="px-3 py-1.5"
                                className="bg-yellow-800 hover:bg-yellow-700 text-sm font-medium"
                                onClick={() => setShowRecallDialog(true)}
                                permission={PERMISSIONS.DEVICE.RECALL}
                            >
                                Recall Device
                            </ReusableButton>
                        }

                        {deploymentStatus !== "deployed" &&
                            <ReusableButton
                                variant="filled"
                                padding="px-3 py-1.5"
                                className="bg-green-900 hover:bg-green-700 text-sm font-medium"
                                onClick={() => setShowDeployModal(true)}
                                Icon={AqSignal02}
                                permission={PERMISSIONS.DEVICE.DEPLOY}
                            >
                                Deploy Device
                            </ReusableButton>}

                        <ReusableButton
                            variant="outlined"
                            padding="px-3 py-1.5"
                            className="text-sm font-medium"
                            onClick={() => setShowMaintenanceLogModal(true)}
                            Icon={AqTool01}
                            permission={PERMISSIONS.DEVICE.MAINTAIN}
                        >
                            Add Maintenance Log
                        </ReusableButton>
                    </div>
                )}
            </div>

            {isLoading ? (
                <ContentGridSkeleton />
            ) : !device ? (
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Device not found.
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 mt-6">
                    <div className="break-inside-avoid mb-4 inline-block w-full order-1">
                        <DeviceDetailsCard
                            deviceId={deviceId}
                            onShowDetailsModal={() => setShowDetailsModal(true)}
                        />
                    </div>
                    <div className="break-inside-avoid mb-4 inline-block w-full order-2">
                        <DeviceLocationCard device={device} />
                    </div>
                    <div className="break-inside-avoid mb-4 inline-block w-full order-3">
                        <OnlineStatusCard deviceId={deviceId} />
                    </div>
                    {Number.isFinite(deviceNum) && <div className="break-inside-avoid mb-4 inline-block w-full order-5">
                        <RunDeviceTestCard
                            deviceNumber={deviceNum}
                            getElapsedDurationMapper={getElapsedDurationMapper}
                        />
                    </div>}
                    <div className="break-inside-avoid mb-4 inline-block w-full order-4">
                        <DeviceMeasurementsApiCard deviceId={deviceId} />
                    </div>
                    <div className="break-inside-avoid mb-4 inline-block w-full order-4">
                        <MaintenanceStatusCard deviceId={deviceId} />
                    </div>
                    <div className="break-inside-avoid mb-4 inline-block w-full order-4">
                        <DeviceHistoryCard
                            deviceName={device.name}
                        />
                    </div>
                    <div className="break-inside-avoid mb-4 inline-block w-full order-3">
                        <DeviceCategoryCard device={device} />
                    </div>
                </div>
            )}

            {device && (
                <>
                    <DeviceDetailsModal
                        open={showDetailsModal}
                        device={device}
                        onClose={() => setShowDetailsModal(false)}
                    />
                    <DeployDeviceModal
                        open={showDeployModal}
                        onOpenChange={setShowDeployModal}
                        device={device}
                    />
                    <RecallDeviceDialog
                        open={showRecallDialog}
                        onOpenChange={setShowRecallDialog}
                        deviceName={device.name}
                        deviceDisplayName={device.long_name || device.name}
                    />
                    <AddMaintenanceLogModal
                        open={showMaintenanceLogModal}
                        onOpenChange={setShowMaintenanceLogModal}
                        deviceName={device.name}
                    />
                </>
            )}
        </div>
    );
}
