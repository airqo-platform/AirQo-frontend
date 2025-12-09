"use client";

import { useParams } from "next/navigation";
import DeviceDetailsLayout from "@/components/features/devices/device-details-layout";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

export default function AdminNetworkDeviceDetailsPage() {
    const params = useParams();
    // Ensure we extract deviceId correctly matching the folder structure [deviceId]
    const deviceId = params?.deviceId as string;

    return (
        <RouteGuard permission={PERMISSIONS.NETWORK.VIEW}>
            <DeviceDetailsLayout deviceId={deviceId} />
        </RouteGuard>
    );
}
