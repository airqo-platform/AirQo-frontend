import { PERMISSIONS } from './constants';
import { ADMIN_PANEL_PERMISSIONS } from './adminAccess';

/**
 * Feature-level permission matrix — single source of truth for what permission
 * a user needs to access each feature area. Consumed by both tests and (optionally)
 * documentation tooling so the human-readable policy and enforced code cannot drift.
 *
 * Rules:
 * - Use PERMISSIONS.* constants, never magic strings.
 * - `any` means the user needs at least one of the listed permissions.
 * - `all` means the user needs every listed permission.
 * - Add a new entry whenever a new guarded route or action is introduced.
 */
export const ACCESS_MATRIX = {
    adminPanel: {
        description: 'Access to /admin/** — AirQo personal context only',
        context: 'personal' as const,
        any: [...ADMIN_PANEL_PERMISSIONS],
    },
    networks: {
        description: 'View sensor manufacturers (networks)',
        any: [PERMISSIONS.NETWORK.VIEW],
    },
    networkCreate: {
        description: 'Create a new sensor manufacturer',
        any: [PERMISSIONS.NETWORK.CREATE],
    },
    sites: {
        description: 'View site information',
        any: [PERMISSIONS.SITE.VIEW],
    },
    grids: {
        description: 'View grid information',
        any: [PERMISSIONS.SITE.VIEW],
    },
    devices: {
        description: 'View device information',
        any: [PERMISSIONS.DEVICE.VIEW],
    },
    cohorts: {
        description: 'View cohort information',
        any: [PERMISSIONS.DEVICE.VIEW],
    },
    shipping: {
        description: 'View shipping information',
        any: [PERMISSIONS.SHIPPING.VIEW, PERMISSIONS.NETWORK.VIEW],
    },
} as const;

export type FeatureKey = keyof typeof ACCESS_MATRIX;
