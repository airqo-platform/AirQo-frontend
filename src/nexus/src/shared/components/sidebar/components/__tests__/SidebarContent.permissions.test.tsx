import React from 'react';
import { render, screen } from '@testing-library/react';
import { SidebarContent } from '../SidebarContent';

// ---------------------------------------------------------------------------
// Controllable permission set for the RBAC mock. Read lazily inside the mock
// implementations, so it is safe to reassign before each render.
// ---------------------------------------------------------------------------
let mockCurrentPermissions: string[] = [];

const mockCanAccessAdminPanel = jest.fn();
const mockHasAnyPermission = jest.fn();
const mockHasAnyPermissionInActiveGroup = jest.fn();

jest.mock('@/shared/hooks', () => ({
  useRBAC: () => ({
    canAccessAdminPanel: mockCanAccessAdminPanel,
    hasAnyPermission: mockHasAnyPermission,
    hasAnyPermissionInActiveGroup: mockHasAnyPermissionInActiveGroup,
  }),
}));

// The sidebar filter itself is what we assert on — render nav items as plain
// links so the test does not depend on router, tooltip, or portal behavior.
jest.mock('../nav-item', () => ({
  NavItem: ({
    item,
  }: {
    item: { href: string; label: string };
  }) => <a href={item.href}>{item.label}</a>,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/org/demo/member-requests',
}));

jest.mock('@/modules/feedback/utils/feedbackDialog', () => ({
  openFeedbackDialog: jest.fn(),
}));

describe('SidebarContent organization permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentPermissions = [];
    mockCanAccessAdminPanel.mockReturnValue(false);
    mockHasAnyPermission.mockImplementation((required: string[]) =>
      required.some(permission => mockCurrentPermissions.includes(permission))
    );
    mockHasAnyPermissionInActiveGroup.mockImplementation(
      (required: string[]) =>
        required.some(permission => mockCurrentPermissions.includes(permission))
    );
  });

  const renderWithPermissions = (permissions: string[]) => {
    mockCurrentPermissions = permissions;
    return render(<SidebarContent flow="organization" orgSlug="demo" />);
  };

  it('shows Member Requests when the user only has MEMBER_VIEW', () => {
    renderWithPermissions(['MEMBER_VIEW']);

    expect(
      screen.getByRole('link', { name: 'Member Requests' })
    ).toBeInTheDocument();
  });

  it('hides Member Requests when the user only has MEMBER_INVITE', () => {
    // The page guard is MEMBER_VIEW, so a view-less user cannot open the page
    // and must not see a sidebar entry that leads nowhere.
    renderWithPermissions(['MEMBER_INVITE']);

    expect(
      screen.queryByRole('link', { name: 'Member Requests' })
    ).not.toBeInTheDocument();
  });

  it('shows Member Requests when the user has both permissions', () => {
    renderWithPermissions(['MEMBER_VIEW', 'MEMBER_INVITE']);

    expect(
      screen.getByRole('link', { name: 'Member Requests' })
    ).toBeInTheDocument();
  });
});
