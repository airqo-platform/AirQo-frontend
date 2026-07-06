import { describe, it, expect } from 'vitest';
import { ADMIN_PANEL_PERMISSIONS } from '@/core/permissions/adminAccess';
import { PERMISSIONS } from '@/core/permissions/constants';

/**
 * These tests assert that the admin panel access policy matches the documented
 * requirement. They exist so CI fails if someone weakens the policy (e.g. removes
 * allowedContexts or widens/narrows the permission list) without a deliberate review.
 */
describe('ADMIN_PANEL_PERMISSIONS', () => {
    it('requires SYSTEM.SUPER_ADMIN', () => {
        expect(ADMIN_PANEL_PERMISSIONS).toContain(PERMISSIONS.SYSTEM.SUPER_ADMIN);
    });

    it('requires SYSTEM.SYSTEM_ADMIN', () => {
        expect(ADMIN_PANEL_PERMISSIONS).toContain(PERMISSIONS.SYSTEM.SYSTEM_ADMIN);
    });

    it('requires ORGANIZATION.VIEW', () => {
        expect(ADMIN_PANEL_PERMISSIONS).toContain(PERMISSIONS.ORGANIZATION.VIEW);
    });

    it('requires NETWORK.VIEW', () => {
        expect(ADMIN_PANEL_PERMISSIONS).toContain(PERMISSIONS.NETWORK.VIEW);
    });

    it('contains exactly 4 permissions — no accidental widening', () => {
        expect(ADMIN_PANEL_PERMISSIONS).toHaveLength(4);
    });
});
