"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeviceDetails } from "@/core/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { usePermission } from "@/core/hooks/usePermissions";
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
import PermissionTooltip from "@/components/ui/permission-tooltip";

// Loading skeleton for action buttons
const ActionButtonsSkeleton = () => (
    <div className="flex gap-1">
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
    </div>
);

// Loading skeleton for content grid
const ContentGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
    </div>
);

export default function DeviceDetailsPage() {
    const params = useParams();
    const deviceId = params?.id as string;
    const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
    const device = deviceResponse?.data as Device;
    const router = useRouter();

    // Real permission checks
    const canRecall = usePermission(PERMISSIONS.DEVICE.RECALL);
    const canDeploy = usePermission(PERMISSIONS.DEVICE.DEPLOY);
    const canAddLog = usePermission(PERMISSIONS.DEVICE.MAINTAIN);

    // Determine deployment status
    const deploymentStatus = device?.status || "unknown";

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRecallDialog, setShowRecallDialog] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [showMaintenanceLogModal, setShowMaintenanceLogModal] = useState(false);

    // Show error state if there's an error and we're not loading
    if (!isLoading && error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
                <XCircle className="w-10 h-10 text-red-500" />
                <p className="text-lg font-semibold">Unable to load device details</p>
                <p className="text-sm text-muted-foreground">{error?.message || "Device not found."}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2 mb-6 justify-between items-center">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Devices
                </Button>

                {/* Action buttons - show skeleton while loading */}
                {isLoading ? (
                    <ActionButtonsSkeleton />
                ) : (
                    <div className="flex gap-1">
                        {/* Action buttons */}
                        {deploymentStatus === "deployed" && (
                            canRecall ? (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-yellow-800 hover:bg-yellow-700"
                                    onClick={() => setShowRecallDialog(true)}
                                >
                                    Recall Device
                                </Button>
                            ) : (
                                <PermissionTooltip permission={PERMISSIONS.DEVICE.RECALL}>
                                    <span>
                                        <Button
                                            variant="default"
                                            disabled
                                            size="sm"
                                            className="bg-yellow-800 hover:bg-yellow-700 opacity-50"
                                        >
                                            Recall Device
                                        </Button>
                                    </span>
                                </PermissionTooltip>
                            )
                        )}

                        {deploymentStatus !== "deployed" && (
                            canDeploy ? (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-green-900 hover:bg-green-700"
                                    onClick={() => setShowDeployModal(true)}
                                >
                                    Deploy Device
                                </Button>
                            ) : (
                                <PermissionTooltip permission={PERMISSIONS.DEVICE.DEPLOY}>
                                    <span>
                                        <Button
                                            variant="default"
                                            disabled
                                            size="sm"
                                            className="bg-green-900 hover:bg-green-700 opacity-50"
                                        >
                                            Deploy Device
                                        </Button>
                                    </span>
                                </PermissionTooltip>
                            )
                        )}

                        {canAddLog ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMaintenanceLogModal(true)}
                            >
                                Add Maintenance Log
                            </Button>
                        ) : (
                            <PermissionTooltip permission={PERMISSIONS.DEVICE.MAINTAIN}>
                                <span>
                                    <Button
                                        variant="outline"
                                        disabled
                                        size="sm"
                                        className="opacity-50"
                                    >
                                        Add Maintenance Log
                                    </Button>
                                </span>
                            </PermissionTooltip>
                        )}
                    </div>
                )}
            </div>

            {/* Content grid - show skeleton while loading */}
            {isLoading ? (
                <ContentGridSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
                    <DeviceDetailsCard deviceId={deviceId} onShowDetailsModal={() => setShowDetailsModal(true)} />
                    <DeviceMeasurementsApiCard deviceId={deviceId} />
                    <OnlineStatusCard deviceId={deviceId} />
                    <RunDeviceTestCard deviceNumber={Number(device.device_number)} getElapsedDurationMapper={getElapsedDurationMapper} />
                </div>
            )}

            {/* Modals - only render when device data is available */}
            {device && (
                <>
                    <DeviceDetailsModal
                        open={showDetailsModal}
                        onOpenChange={setShowDetailsModal}
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
