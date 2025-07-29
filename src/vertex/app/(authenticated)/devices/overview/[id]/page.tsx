"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeviceDetails, useDeviceStatusFeed } from "@/core/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export default function DeviceDetailsPage() {
    const params = useParams();
    const deviceId = params?.id as string;
    const { data: deviceResponse, isLoading, error } = useDeviceDetails(deviceId);
    const device = deviceResponse?.data;
    const router = useRouter();

    // Real permission checks
    const canRecall = usePermission(PERMISSIONS.DEVICE.RECALL);
    const canDeploy = usePermission(PERMISSIONS.DEVICE.DEPLOY);
    const canAddLog = usePermission(PERMISSIONS.DEVICE.MAINTAIN);

    // Determine deployment status
    const deploymentStatus = device?.status || "unknown";
    let statusIcon = <AlertTriangle className="text-yellow-500" />;
    let statusText = "Unknown";
    let statusColor = "bg-yellow-100 text-yellow-800";
    if (deploymentStatus === "deployed") {
        statusIcon = <CheckCircle className="text-green-600" />;
        statusText = "Deployed";
        statusColor = "bg-green-100 text-green-800";
    } else if (deploymentStatus === "recalled") {
        statusIcon = <AlertTriangle className="text-orange-600" />;
        statusText = "Recalled";
        statusColor = "bg-orange-100 text-orange-800";
    } else if (deploymentStatus === "not deployed") {
        statusIcon = <XCircle className="text-red-600" />;
        statusText = "Not Deployed";
        statusColor = "bg-red-100 text-red-800";
    }
    
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRecallDialog, setShowRecallDialog] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error || !device) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
                <XCircle className="w-10 h-10 text-red-500" />
                <p className="text-lg font-semibold">Unable to load device details</p>
                <p className="text-sm text-muted-foreground">{error?.message || "Device not found."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="flex gap-2 mb-6 justify-between items-center">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Devices
                </Button>
                <TooltipProvider>
                    <div className="flex gap-1">
                        {/* Action buttons */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    {deploymentStatus === "deployed" && (
                                        <Button
                                            variant="default"
                                            disabled={!canRecall}
                                            size="sm"
                                            className="bg-yellow-800 hover:bg-yellow-700"
                                            onClick={() => setShowRecallDialog(true)}
                                        >
                                            Recall Device
                                        </Button>
                                    )}
                                </span>
                            </TooltipTrigger>
                            {!canRecall && deploymentStatus === "deployed" && (
                                <TooltipContent>Insufficient permissions to recall device</TooltipContent>
                            )}
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    {deploymentStatus !== "deployed" && (
                                        <Button
                                            variant="default"
                                            disabled={!canDeploy}
                                            size="sm"
                                            className="bg-green-900 hover:bg-green-700"
                                            onClick={() => setShowDeployModal(true)}
                                        >
                                            Deploy Device
                                        </Button>
                                    )}
                                </span>
                            </TooltipTrigger>
                            {!canDeploy && deploymentStatus !== "deployed" && (
                                <TooltipContent>Insufficient permissions to deploy device</TooltipContent>
                            )}
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button variant="outline" disabled={!canAddLog} size="sm">
                                        Add Maintenance Log
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!canAddLog && (
                                <TooltipContent>Insufficient permissions to add maintenance log</TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
                <DeviceDetailsCard deviceId={deviceId} onShowDetailsModal={() => setShowDetailsModal(true)} />
                <DeviceMeasurementsApiCard deviceId={deviceId} />
                <OnlineStatusCard deviceId={deviceId} />
                <RunDeviceTestCard deviceNumber={device.device_number} getElapsedDurationMapper={getElapsedDurationMapper} />
            </div>
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
        </div>
    );
} 