"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";

/**
 * Admin Layout
 * 
 * This layout wraps all admin pages with a RouteGuard to ensure
 * that only AIRQO_SUPER_ADMIN users in the airqo-internal context
 * can access admin features.
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
            roles={["AIRQO_SUPER_ADMIN", "AIRQO_ADMIN"]}
            allowedContexts={['airqo-internal']}
        >
            {children}
        </RouteGuard>
    );
}
