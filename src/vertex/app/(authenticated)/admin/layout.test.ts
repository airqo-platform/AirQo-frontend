import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Guard-coverage tests for the admin directory.
 *
 * These tests walk the admin directory at the filesystem level so they catch
 * regressions that TypeScript alone cannot — e.g. someone replacing AdminRouteGuard
 * with a raw RouteGuard, or adding a role-based guard that bypasses permissions.
 *
 * They are intentionally simple filesystem reads, not component renders, so they
 * run instantly with no mocking overhead.
 */

const ADMIN_DIR = path.resolve(__dirname);
const ADMIN_LAYOUT = path.join(ADMIN_DIR, 'layout.tsx');

function getAllTsxFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return getAllTsxFiles(fullPath);
        }
        if (entry.isFile() && fullPath.endsWith('.tsx')) {
            return [fullPath];
        }
        return [];
    });
}

describe('admin/layout.tsx — AdminRouteGuard enforcement', () => {
    const layoutSource = fs.readFileSync(ADMIN_LAYOUT, 'utf-8');

    it('imports AdminRouteGuard', () => {
        expect(layoutSource).toContain('AdminRouteGuard');
    });

    it('does not fall back to raw RouteGuard', () => {
        expect(layoutSource).not.toContain("from \"@/components/layout/accessConfig/route-guard\"");
    });

    it('does not hand-roll permissions inline', () => {
        expect(layoutSource).not.toContain('PERMISSIONS.SYSTEM.SUPER_ADMIN');
    });
});

describe('admin/** pages — no role-based regressions', () => {
    const pages = getAllTsxFiles(ADMIN_DIR).filter((f) => f.endsWith('page.tsx'));

    it('finds admin pages to check', () => {
        expect(pages.length).toBeGreaterThan(0);
    });

    pages.forEach((pagePath) => {
        const rel = path.relative(ADMIN_DIR, pagePath);
        const source = fs.readFileSync(pagePath, 'utf-8');

        it(`${rel} — does not use deprecated role prop on RouteGuard`, () => {
            expect(source).not.toMatch(/RouteGuard[^/]*role=/);
        });

        it(`${rel} — does not use magic permission strings`, () => {
            expect(source).not.toMatch(/permission=["'][A-Z_]+["']/);
        });
    });
});
