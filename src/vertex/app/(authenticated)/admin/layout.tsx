"use client";

import { AdminRouteGuard } from "@/components/layout/accessConfig/admin-route-guard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminRouteGuard>
            {children}
        </AdminRouteGuard>
    );
}
