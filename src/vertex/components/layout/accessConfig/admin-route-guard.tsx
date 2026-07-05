"use client";

import React from "react";
import { RouteGuard } from "./route-guard";
import { ADMIN_PANEL_PERMISSIONS } from "@/core/permissions/adminAccess";

/**
 * AdminRouteGuard — wraps any AirQo-internal admin surface.
 *
 * Enforces both conditions required for admin access in one declarative call:
 *   1. The user must be in the personal (AirQo) context.
 *   2. The user must hold at least one of ADMIN_PANEL_PERMISSIONS.
 *
 * Use this instead of hand-assembling <RouteGuard permissions={[...]} allowedContexts={['personal']}>.
 * That way the policy lives in one place and tests can assert against it.
 */
export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <RouteGuard
        permissions={[...ADMIN_PANEL_PERMISSIONS]}
        allowedContexts={['personal']}
    >
        {children}
    </RouteGuard>
);
