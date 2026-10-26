import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// react-popper positions via DOM measurement that jsdom cannot provide.
jest.mock('react-popper', () => ({
  usePopper: () => ({
    styles: { popper: { position: 'relative' } },
    attributes: { popper: {} },
    update: jest.fn(),
  }),
}));

// Stub the portal-based Dialog so its children render inline.
jest.mock('@/shared/components/ui/dialog', () => {
  const MockDialog = ({
    isOpen,
    title,
    subtitle,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
      </div>
    ) : null;

  return { __esModule: true, default: MockDialog };
});

jest.mock('@airqo/icons-react', () => {
  // Stub every icon name so tests do not depend on the icon package; the
  // ui barrel imports icons the page itself never renders.
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/shared/components', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockMutate = jest.fn();
const mockTrigger = jest.fn();

// Mutable so a test can simulate a roles 403 without re-mocking the module.
const mockRolesSummary: {
  data: unknown;
  isLoading: boolean;
  error: unknown;
  mutate: typeof mockMutate;
} = {
  data: {
    roles: [
      {
        _id: 'a1',
        role_name: 'Role A1',
        role_status: 'ACTIVE',
        role_permissions: [],
        user_count: 0,
        group: { _id: 'ga', grp_title: 'Group A' },
      },
    ],
  },
  isLoading: false,
  error: null as unknown,
  mutate: mockMutate,
};

jest.mock('@/shared/hooks/useAdmin', () => ({
  useUsers: () => ({
    data: {
      users: [
        {
          _id: 'u1',
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@airqo.net',
          userName: 'ada',
          isActive: true,
          verified: true,
          loginCount: 3,
          lastLogin: '',
          organization: 'AirQo',
          country: 'Uganda',
          jobTitle: 'Engineer',
          groups: [],
        },
      ],
    },
    isLoading: false,
    isValidating: false,
    error: null,
    mutate: mockMutate,
  }),
  useRolesSummary: () => mockRolesSummary,
  useUpdateUserRole: () => ({ trigger: mockTrigger, isMutating: false }),
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Render rows straight from the column definitions so the row actions under
// test are exercised without pulling in the full table implementation.
jest.mock('@/shared/components/ui/server-side-table', () => ({
  ServerSideTable: ({
    columns,
    data,
  }: {
    columns: Array<{
      key: string;
      render?: (value: unknown, item: never) => React.ReactNode;
    }>;
    data: Array<Record<string, unknown>>;
  }) => (
    <div>
      {data.map((row, index) => (
        <div key={index}>
          {columns.map(column => (
            <div key={column.key}>{column.render?.(null, row as never)}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

import UserManagementPage from '../page';

describe('User Management page role dialog wiring', () => {
  beforeEach(() => {
    // Restore the healthy roles response for every test.
    mockRolesSummary.data = {
      roles: [
        {
          _id: 'a1',
          role_name: 'Role A1',
          role_status: 'ACTIVE',
          role_permissions: [],
          user_count: 0,
          group: { _id: 'ga', grp_title: 'Group A' },
        },
      ],
    };
    mockRolesSummary.isLoading = false;
    mockRolesSummary.error = null;
  });

  it('opens the group-scoped UserRoleAssignmentDialog instead of the old flat dialog', async () => {
    const userEventSetup = userEvent.setup();
    render(<UserManagementPage />);

    await userEventSetup.click(
      screen.getByRole('button', { name: /update user role/i })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /update role: ada lovelace/i })
    ).toBeInTheDocument();
    // Group-scoped fields from UserRoleAssignmentDialog...
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Role in this organization')).toBeInTheDocument();
    // ...and none of the old flat dialog's controls. ("Select Role" was the
    // old dialog's field label; the new placeholder is "Select a role".)
    expect(screen.queryByText('Select Role')).not.toBeInTheDocument();
    expect(screen.queryByText('Choose a role...')).not.toBeInTheDocument();
  });

  it('renders the roles ErrorBanner on a roles 403 while users still render', () => {
    // Axios-style 403 so isForbiddenError/getUserFriendlyErrorMessage map it.
    mockRolesSummary.data = undefined;
    mockRolesSummary.error = Object.assign(
      new Error('Request failed with status code 403'),
      { isAxiosError: true, response: { status: 403 } }
    );

    render(<UserManagementPage />);

    expect(screen.getByText('Failed to load roles')).toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    // The users table is unaffected by the roles failure.
    expect(screen.getByText('ada@airqo.net')).toBeInTheDocument();
  });
});
