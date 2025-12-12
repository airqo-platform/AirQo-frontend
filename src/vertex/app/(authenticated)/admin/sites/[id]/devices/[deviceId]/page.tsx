"use client";

import { useParams } from "next/navigation";
import DeviceDetailsLayout from "@/components/features/devices/device-details-layout";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

export default function AdminSiteDeviceDetailsPage() {
    const params = useParams();
    const deviceId = params?.deviceId;

    if (!deviceId || typeof deviceId !== 'string') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Invalid device ID</p>
            </div>
        );
    }

    return (
        <RouteGuard permission={PERMISSIONS.SITE.VIEW}>
            <DeviceDetailsLayout deviceId={deviceId} />
        </RouteGuard>
    );
}
