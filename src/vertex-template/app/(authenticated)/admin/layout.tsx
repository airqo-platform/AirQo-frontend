"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

/**
 * Admin Layout
 * 
 * This layout wraps all admin pages with a RouteGuard so that only
 * users holding the SYSTEM_ADMIN permission (SUPER_ADMIN overrides) in
 * the personal context can access admin features. Individual admin
 * pages keep their own granular permission guards.
 * 
 * Applies to all pages in the /admin/* routes.
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RouteGuard
            permission={PERMISSIONS.SYSTEM.SYSTEM_ADMIN}
            allowedContexts={['personal']}
        >
            {children}
        </RouteGuard>
    );
}
