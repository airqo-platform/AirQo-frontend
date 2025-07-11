"use client";

import { useParams, useRouter } from "next/navigation";
import { useDeviceDetails, useDeviceStatusFeed } from "@/core/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, AlertTriangle, RotateCw, Copy, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermission } from "@/core/hooks/usePermissions";
import { PERMISSIONS } from "@/core/permissions/constants";
import { getElapsedDurationMapper } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

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

    const statusFeed = useDeviceStatusFeed(device?.device_number);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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
                {/* Device Details Card */}
                <Card className="w-full rounded-lg bg-white flex flex-col justify-between">
                    <div className="px-3 py-2 flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">Device Details</h2>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Device Name</div>
                            <div className="text-base font-normal break-all">{device.long_name || device.name}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Deployment Status</div>
                            <span className={`inline-block text-base font-mono break-all capitalize px-2 py-1 rounded-md ${device.status === "deployed" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>{device.status}</span>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Category</div>
                            <div className="text-base font-normal capitalize">{device.category || "-"}</div>
                        </div>
                    </div>
                    <div className="border-t px-2 flex justify-end">
                        <Button variant="ghost" onClick={() => setShowDetailsModal(true)} className="hover:bg-transparent">
                            View more details
                        </Button>
                    </div>
                </Card>
                {/* Device Measurements API Card */}
                <Card className="w-full rounded-lg bg-white flex flex-col gap-4 px-3 py-2">
                    <h2 className="text-lg font-semibold mb-2">Device Measurements API</h2>
                    {/* Recent Measurements */}
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Recent Measurements API</div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}?token=YOUR_TOKEN`}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-transparent"
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}?token=YOUR_TOKEN`);
                                    toast.success("Recent measurements API URL copied!");
                                }}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    {/* Historical Measurements */}
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">Historical Measurements API</div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-mono select-all overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}/historical?token=YOUR_TOKEN`}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-transparent"
                                onClick={() => {
                                    navigator.clipboard.writeText(`https://api.airqo.net/api/v2/devices/measurements/devices/${device.id}/historical?token=YOUR_TOKEN`);
                                    toast.success("Historical measurements API URL copied!");
                                }}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
                {/* Online Status Card */}
                <Card className="w-full rounded-lg overflow-hidden">
                    <div className={`h-3 ${device.isOnline ? "bg-green-600" : "bg-red-600"}`}></div>
                    <div className="flex flex-col items-center justify-center p-8">
                        {device.isOnline ? (
                            <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600 mb-2" />
                        )}
                        <div className={`text-lg font-semibold mb-1 ${device.isOnline ? "text-green-700" : "text-red-700"}`}>{device.isOnline ? "Active" : "Offline"}</div>
                        <div className="text-sm text-muted-foreground">Device is currently {device.isOnline ? "online" : "offline"}.</div>
                    </div>
                </Card>
                {/* Run Device Status Card (as before) */}
                <Card className="w-full rounded-lg bg-white md:col-span-2">
                    <div className="flex items-center justify-between px-3 py-2">
                        <h2 className="text-lg font-semibold">Run Device Status</h2>
                        <button
                            className="ml-2 p-2 rounded hover:bg-muted"
                            onClick={() => statusFeed.refetch()}
                            disabled={statusFeed.isLoading}
                            title="Refresh"
                        >
                            <RotateCw className={statusFeed.isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    {statusFeed.isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : statusFeed.error ? (
                        <div className="text-red-500">{statusFeed.error.message || "Failed to load status."}</div>
                    ) : statusFeed.data ? (
                        <>
                            <div className="text-sm text-muted-foreground mb-4 px-3 py-2">
                                {(() => {
                                    if (!statusFeed.data.created_at) return null;
                                    const [, elapsedUntyped] = getElapsedDurationMapper(statusFeed.data.created_at);
                                    const elapsed = elapsedUntyped as Record<string, number>;
                                    const units = [
                                        ["year", "years"],
                                        ["month", "months"],
                                        ["week", "weeks"],
                                        ["day", "days"],
                                        ["hour", "hours"],
                                        ["minute", "minutes"],
                                        ["second", "seconds"],
                                    ];
                                    const parts = [];
                                    for (const [unit, plural] of units) {
                                        if (elapsed[unit] > 0) {
                                            parts.push(`${elapsed[unit]} ${elapsed[unit] === 1 ? unit : plural}`);
                                        }
                                        if (parts.length === 2) break;
                                    }
                                    const relativeString = parts.length ? parts.join(", ") : "just now";
                                    return (
                                        <>
                                            Device last pushed data{" "}
                                            <span className="font-bold text-green-600">{relativeString}</span> ago.
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="grid grid-cols-2 gap-4 px-3 py-2">
                                {Object.entries(statusFeed.data)
                                    .filter(([key]) => !["created_at", "isCache", "satellites", "DeviceType", "undefined"].includes(key))
                                    .map(([key, value]) => {
                                        const displayKey = key.length > 12 ? key.slice(0, 12) + "..." : key;
                                        return (
                                            <div key={key} className="flex gap-4 items-center">
                                                <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide" title={key}>{displayKey}</span>
                                                <span className="text-base font-normal break-all">{String(value)}</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    ) : (
                        <div className="text-muted-foreground">No status data available.</div>
                    )}
                </Card>
            </div>
            {/* Device Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Device Details</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                        {Object.entries(device).map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                                <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">{key}</span>
                                <span className="text-base font-normal break-all">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 