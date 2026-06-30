import { describe, it, expect } from 'vitest';
import { ACCESS_MATRIX } from './accessMatrix';
import { PERMISSIONS } from './constants';
import { ADMIN_PANEL_PERMISSIONS } from './adminAccess';

/**
 * Validates that every entry in ACCESS_MATRIX references real PERMISSIONS.* values.
 * This is the "consumed by tests" half of the accessMatrix contract — it ensures the
 * human-readable feature/permission matrix and the enforced code cannot silently diverge.
 *
 * If you add a new feature to ACCESS_MATRIX, add the corresponding assertion here.
 * If you rename a PERMISSIONS.* constant, TypeScript will catch it at compile time AND
 * this test will catch it at runtime — two layers of protection.
 */

const ALL_PERMISSION_VALUES = new Set<string>(
    (Object.values(PERMISSIONS) as Array<Record<string, string>>).flatMap(
        (group) => Object.values(group)
    )
);

describe('ACCESS_MATRIX — every permission is a known PERMISSIONS.* value', () => {
    Object.entries(ACCESS_MATRIX).forEach(([feature, entry]) => {
        const perms = entry.any as readonly string[];

        it(`${feature}: has at least one permission`, () => {
            expect(perms.length).toBeGreaterThan(0);
        });

        perms.forEach((p) => {
            it(`${feature}: "${p}" exists in PERMISSIONS.*`, () => {
                expect(ALL_PERMISSION_VALUES.has(p)).toBe(true);
            });
        });
    });
});

describe('ACCESS_MATRIX — admin panel entry', () => {
    // The individual permission assertions live in admin-route-guard.test.tsx
    // (which tests ADMIN_PANEL_PERMISSIONS directly). Here we only assert the two
    // things the matrix adds on top: that it spreads the full constant (length match)
    // and that it enforces the personal context requirement.
    it('adminPanel.any has the same length as ADMIN_PANEL_PERMISSIONS', () => {
        expect(ACCESS_MATRIX.adminPanel.any.length).toBe(ADMIN_PANEL_PERMISSIONS.length);
    });

    it('adminPanel.context is personal', () => {
        expect(ACCESS_MATRIX.adminPanel.context).toBe('personal');
    });
});

describe('ACCESS_MATRIX — feature entries reference correct permissions', () => {
    it('networks requires NETWORK.VIEW', () => {
        expect(ACCESS_MATRIX.networks.any).toContain(PERMISSIONS.NETWORK.VIEW);
    });

    it('networkCreate requires NETWORK.CREATE', () => {
        expect(ACCESS_MATRIX.networkCreate.any).toContain(PERMISSIONS.NETWORK.CREATE);
    });

    it('sites requires SITE.VIEW', () => {
        expect(ACCESS_MATRIX.sites.any).toContain(PERMISSIONS.SITE.VIEW);
    });

    it('grids requires SITE.VIEW', () => {
        expect(ACCESS_MATRIX.grids.any).toContain(PERMISSIONS.SITE.VIEW);
    });

    it('devices requires DEVICE.VIEW', () => {
        expect(ACCESS_MATRIX.devices.any).toContain(PERMISSIONS.DEVICE.VIEW);
    });

    it('cohorts requires DEVICE.VIEW', () => {
        expect(ACCESS_MATRIX.cohorts.any).toContain(PERMISSIONS.DEVICE.VIEW);
    });

    it('shipping requires SHIPPING.VIEW or NETWORK.VIEW', () => {
        const perms = ACCESS_MATRIX.shipping.any as readonly string[];
        const hasEither =
            perms.includes(PERMISSIONS.SHIPPING.VIEW) ||
            perms.includes(PERMISSIONS.NETWORK.VIEW);
        expect(hasEither).toBe(true);
    });
});
