import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the invoices page tests); the shared UI barrel re-exports the Dialog, which
// imports its Tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Stub every icon name so tests do not depend on the icon package; the ui
// barrel imports icons the page itself never renders.
jest.mock('@airqo/icons-react', () => {
  const IconStub = () => null;
  const base = { __esModule: true };
  return new Proxy(base, {
    get: (target, prop) => {
      if (typeof prop !== 'string') return undefined;
      return prop in target
        ? (target as Record<string, unknown>)[prop]
        : IconStub;
    },
  });
});

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

// Passthrough by default so every existing test still renders content;
// flipping `mockGuardAllows` simulates a non-admin (guard withholds children)
// to prove the data hook never runs before permission resolution.
let mockGuardAllows = true;

jest.mock('@/shared/components', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) =>
    mockGuardAllows ? <>{children}</> : null,
}));

// Button calls useMediaQuery(), which needs matchMedia (absent in jsdom).
// Same stub as the invoices page tests — always false (desktop).
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Minimal stand-in for the real table: renders one row per item, pipes each
// column's `render` output into the matching cell, and forwards row clicks —
// enough to verify the page's wiring without the full table implementation.
jest.mock('@/shared/components/ui/server-side-table', () => ({
  ServerSideTable: ({
    columns,
    data,
    onRowClick,
  }: {
    columns: Array<{
      key: string;
      render?: (value: unknown, item: never) => React.ReactNode;
    }>;
    data: Array<Record<string, unknown>>;
    onRowClick?: (item: never) => void;
  }) => (
    <table>
      <tbody>
        {data.map(row => (
          <tr
            key={String(row.id)}
            onClick={() => onRowClick?.(row as never)}
          >
            {columns.map(column => (
              <td key={column.key}>
                {column.render?.(row[column.key], row as never)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const mockUseOrganizationsSummary = jest.fn();

jest.mock('@/shared/hooks/useOrganizations', () => ({
  useOrganizationsSummary: () => mockUseOrganizationsSummary(),
}));

import OrganizationsPage from '../page';

const organizations = [
  {
    _id: 'org-1',
    grp_title: 'AirQo Kampala',
    organization_slug: 'kampala-city',
    grp_status: 'ACTIVE',
    grp_profile_picture: '',
    numberOfGroupUsers: 12,
  },
  {
    _id: 'org-2',
    grp_title: 'AirQo Nairobi',
    organization_slug: 'nairobi-county',
    grp_status: 'INACTIVE',
    grp_profile_picture: '',
    numberOfGroupUsers: 3,
  },
];

// Mutable per-test hook return; the `mock` prefix keeps it referenceable
// from the hoisted module factory.
let mockHookResult: {
  groups: typeof organizations;
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  mutate: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGuardAllows = true;
  mockHookResult = {
    groups: organizations,
    isLoading: false,
    isValidating: false,
    error: null,
    mutate: jest.fn(),
  };
  mockUseOrganizationsSummary.mockImplementation(() => mockHookResult);
});

describe('System → Organizations list page', () => {
  it('renders the heading and one row per organization', () => {
    render(<OrganizationsPage />);

    expect(
      screen.getByRole('heading', { name: 'Organizations' })
    ).toBeInTheDocument();

    expect(screen.getByText('AirQo Kampala')).toBeInTheDocument();
    expect(screen.getByText('kampala-city')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('AirQo Nairobi')).toBeInTheDocument();
    expect(screen.getByText('nairobi-county')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('links each row to its organization detail page', () => {
    render(<OrganizationsPage />);

    const manageLinks = screen.getAllByRole('link', { name: 'Manage' });
    expect(manageLinks).toHaveLength(2);
    expect(manageLinks[0]).toHaveAttribute(
      'href',
      '/system/organizations/org-1'
    );
    expect(manageLinks[1]).toHaveAttribute(
      'href',
      '/system/organizations/org-2'
    );
  });

  it('navigates to the organization details when a row is clicked', () => {
    render(<OrganizationsPage />);

    fireEvent.click(screen.getByText('AirQo Kampala'));

    expect(mockPush).toHaveBeenCalledWith('/system/organizations/org-1');
  });

  it('shows an error banner with a retry action when loading fails', () => {
    mockHookResult = {
      ...mockHookResult,
      error: new Error('summary endpoint down'),
    };

    render(<OrganizationsPage />);

    expect(
      screen.getByText('Failed to load organizations')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Retry' })
    ).toBeInTheDocument();
  });

  it('renders Access Denied when the summary request is forbidden', () => {
    mockHookResult = {
      ...mockHookResult,
      // Axios-shaped 403 so isForbiddenError takes its real detection path.
      error: {
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden' } },
      },
    };

    render(<OrganizationsPage />);

    const banner = screen.getByRole('alert');
    expect(within(banner).getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Organizations' })
    ).not.toBeInTheDocument();
  });

  it('issues no summary request until PermissionGuard allows rendering', () => {
    // Non-admin deep link: the guard withholds children entirely, so the
    // content component (and its hook) must never mount.
    mockGuardAllows = false;

    render(<OrganizationsPage />);

    expect(mockUseOrganizationsSummary).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Organizations' })
    ).not.toBeInTheDocument();
  });
});
