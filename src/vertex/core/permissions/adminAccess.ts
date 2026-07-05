import { PERMISSIONS } from './constants';

/**
 * The canonical permission list for AirQo admin panel access.
 * Any surface that gates on "is this user an AirQo admin" should import this
 * constant rather than assembling the list inline, so policy can be updated in
 * one place and tests can assert against it.
 *
 * Use AdminRouteGuard (components/layout/accessConfig/admin-route-guard.tsx)
 * instead of hand-rolling RouteGuard with these permissions directly.
 */
export const ADMIN_PANEL_PERMISSIONS = [
    PERMISSIONS.SYSTEM.SUPER_ADMIN,
    PERMISSIONS.SYSTEM.SYSTEM_ADMIN,
    PERMISSIONS.ORGANIZATION.VIEW,
    PERMISSIONS.NETWORK.VIEW,
] as const;

export type AdminPanelPermission = typeof ADMIN_PANEL_PERMISSIONS[number];
