import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SecondarySidebar from './secondary-sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/home',
}));

vi.mock('@/core/hooks/useDetectedPlatform', () => ({
  useDetectedPlatform: () => ({ isElectron: false }),
}));

const mockUseUserContext = vi.fn();
vi.mock('@/core/hooks/useUserContext', () => ({
  useUserContext: () => mockUseUserContext(),
}));

// Per-permission visibility of the org links (MEMBER_VIEW → Members,
// ROLE_VIEW → Roles & Permissions). Defaults to granted; individual tests
// revoke to cover the denied states.
const grantedPermissions = new Set<string>(['MEMBER_VIEW', 'ROLE_VIEW']);
vi.mock('@/core/hooks/usePermissions', () => ({
  usePermission: (permission: string) => grantedPermissions.has(permission),
}));

const userContextValue = (overrides: Record<string, unknown> = {}) => ({
  isExternalOrg: true,
  activeGroup: { _id: 'grp-1', grp_title: 'KAMPALA_MARCH BABIES' },
  getContextPermissions: () => ({
    canViewDevices: true,
    canViewSites: true,
    canViewUserManagement: true,
    canViewAccessControl: true,
    canViewNetworks: false,
    canViewShipping: false,
  }),
  ...overrides,
});

const renderSidebar = () =>
  render(
    <SecondarySidebar
      isCollapsed={false}
      toggleSidebar={() => {}}
      activeModule="devices"
    />
  );

describe('SecondarySidebar organization links', () => {
  it('links Members and Roles & Permissions to the analytics org pages using a dashed lowercase slug', () => {
    mockUseUserContext.mockReturnValue(userContextValue());
    renderSidebar();

    const members = screen.getByRole('link', { name: /members/i });
    const roles = screen.getByRole('link', { name: /roles & permissions/i });

    expect(members.getAttribute('href')).toMatch(
      /\/org\/kampala-march-babies\/members$/
    );
    expect(roles.getAttribute('href')).toMatch(
      /\/org\/kampala-march-babies\/roles$/
    );
  });

  it('opens the organization links in a new tab', () => {
    mockUseUserContext.mockReturnValue(userContextValue());
    renderSidebar();

    for (const name of [/members/i, /roles & permissions/i]) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('hides the organization section when no active group is set', () => {
    mockUseUserContext.mockReturnValue(userContextValue({ activeGroup: null }));
    renderSidebar();

    expect(screen.queryByRole('link', { name: /members/i })).toBeNull();
    expect(screen.queryByText('Organization')).toBeNull();
  });

  it('hides only the Members link without MEMBER_VIEW', () => {
    grantedPermissions.delete('MEMBER_VIEW');
    try {
      mockUseUserContext.mockReturnValue(userContextValue());
      renderSidebar();

      expect(screen.queryByRole('link', { name: /members/i })).toBeNull();
      expect(
        screen.getByRole('link', { name: /roles & permissions/i })
      ).toBeInTheDocument();
    } finally {
      grantedPermissions.add('MEMBER_VIEW');
    }
  });

  it('hides only the Roles & Permissions link without ROLE_VIEW', () => {
    grantedPermissions.delete('ROLE_VIEW');
    try {
      mockUseUserContext.mockReturnValue(userContextValue());
      renderSidebar();

      expect(
        screen.queryByRole('link', { name: /roles & permissions/i })
      ).toBeNull();
      expect(screen.getByRole('link', { name: /members/i })).toBeInTheDocument();
    } finally {
      grantedPermissions.add('ROLE_VIEW');
    }
  });

  it('hides the whole organization section without both view permissions', () => {
    grantedPermissions.clear();
    try {
      mockUseUserContext.mockReturnValue(userContextValue());
      renderSidebar();

      expect(screen.queryByText('Organization')).toBeNull();
      expect(screen.queryByRole('link', { name: /members/i })).toBeNull();
      expect(
        screen.queryByRole('link', { name: /roles & permissions/i })
      ).toBeNull();
    } finally {
      grantedPermissions.add('MEMBER_VIEW');
      grantedPermissions.add('ROLE_VIEW');
    }
  });
});
