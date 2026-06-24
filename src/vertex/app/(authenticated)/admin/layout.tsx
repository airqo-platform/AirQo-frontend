"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

/**
 * Admin Layout
 *
 * Wraps all /admin/* pages with a RouteGuard that enforces two conditions:
 *   1. The user must be in the personal (AirQo) context — never an external org.
 *   2. The user must hold at least one of the system/org/network admin permissions.
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard
            permissions={[
                PERMISSIONS.SYSTEM.SUPER_ADMIN,
                PERMISSIONS.SYSTEM.SYSTEM_ADMIN,
                PERMISSIONS.ORGANIZATION.VIEW,
                PERMISSIONS.NETWORK.VIEW,
            ]}
            allowedContexts={['personal']}
        >
            {children}
        </RouteGuard>
    );
}
