import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the organizations list page tests); the shared UI barrel re-exports the
// Dialog, which imports its Tooltip.
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
  useParams: () => ({ id: 'org-1' }),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

// Passthrough by default so every test renders content; the guard shell is
// not the subject here (the list page tests already cover the withheld-
// children case for the same guard).
let mockGuardAllows = true;

jest.mock('@/shared/components', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) =>
    mockGuardAllows ? <>{children}</> : null,
}));

// Button calls useMediaQuery(), which needs matchMedia (absent in jsdom).
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// The shared Dialog portals through framer-motion; the page (via
// DeleteOrganizationDialog and the unassign confirm) only needs its
// role="dialog" shell, title and action wiring.
jest.mock('@/shared/components/ui/dialog', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    subtitle,
    children,
    primaryAction,
    secondaryAction,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    primaryAction?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
    secondaryAction?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
        {children}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </button>
        )}
      </div>
    ) : null,
}));

// Card reads the redux theme slice; tests render without the store Provider,
// so the selector is answered with a fixed state instead.
jest.mock('@/shared/hooks/redux', () => ({
  useAppSelector: (
    selector: (state: { theme: { interfaceStyle: string } }) => unknown
  ) => selector({ theme: { interfaceStyle: '' } }),
  useAppDispatch: () => jest.fn(),
}));

// Mutable per-test permission list and hook returns; the `mock` prefix keeps
// them referenceable from the hoisted module factories.
let mockPermissions: string[];
let mockGroupResult: {
  data: { group: typeof groupFixture } | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: jest.Mock;
};
let mockRolesResult: {
  data: { roles: unknown[] } | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: jest.Mock;
};

const mockUseGroupDetails = jest.fn();
const mockUseRolesByGroup = jest.fn();

jest.mock('@/shared/hooks', () => ({
  useRBAC: () => ({
    hasAnyPermission: (perms: string[]) =>
      perms.some(permission => mockPermissions.includes(permission)),
  }),
  useGroupDetails: (groupId: string | null) => mockUseGroupDetails(groupId),
  useRolesByGroup: (groupId: string | undefined) =>
    mockUseRolesByGroup(groupId),
  useSetGroupManager: () => ({ trigger: jest.fn(), isMutating: false }),
}));

const mockUseAssignedUsers = jest.fn();
const mockUnassignTrigger = jest.fn();
const mockUpdateTrigger = jest.fn();
const mockDeleteTrigger = jest.fn();

jest.mock('@/shared/hooks/useOrganizations', () => ({
  useOrganizationAssignedUsers: (groupId: string | null) =>
    mockUseAssignedUsers(groupId),
  useUnassignUsersFromGroup: () => ({
    trigger: mockUnassignTrigger,
    isMutating: false,
  }),
  useUpdateOrganizationDetails: () => ({
    trigger: mockUpdateTrigger,
    isMutating: false,
  }),
  useDeleteOrganization: () => ({
    trigger: mockDeleteTrigger,
    isMutating: false,
  }),
}));

// The real members card drives selection through the full server table; for
// the page's wiring only `onRequestUnassign` matters, so a button standing in
// for "user selected + Unassign clicked" is enough.
jest.mock(
  '@/modules/system-organizations/components/OrganizationMembersCard',
  () => ({
    __esModule: true,
    default: ({
      onRequestUnassign,
    }: {
      onRequestUnassign: (ids: string[]) => void;
    }) => (
      <div>
        <h3>Members</h3>
        <button type="button" onClick={() => onRequestUnassign(['user-2'])}>
          Unassign user-2
        </button>
      </div>
    ),
  })
);

import OrganizationDetailPage from '../page';

const groupFixture = {
  _id: 'org-1',
  grp_title: 'Kampala Clean Air',
  organization_slug: 'kampala-clean-air',
  grp_status: 'ACTIVE',
  numberOfGroupUsers: 2,
  grp_manager: {
    _id: 'manager-1',
    firstName: 'M',
    lastName: 'One',
    email: 'm@x.com',
  },
  grp_users: [],
};

const assignedUsers = [
  {
    _id: 'manager-1',
    firstName: 'M',
    lastName: 'One',
    email: 'm@x.com',
    role_name: 'Manager',
  },
  {
    _id: 'user-2',
    firstName: 'U',
    lastName: 'Two',
    email: 'u@x.com',
    role_name: 'Member',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGuardAllows = true;
  mockPermissions = [
    'SYSTEM_ADMIN',
    'ORG_UPDATE',
    'ORG_DELETE',
    'SUPER_ADMIN',
    'MEMBER_REMOVE',
    'MEMBER_VIEW',
  ];
  mockGroupResult = {
    data: { group: groupFixture },
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  };
  mockRolesResult = {
    data: { roles: [] },
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  };
  mockUseGroupDetails.mockImplementation(() => mockGroupResult);
  mockUseRolesByGroup.mockImplementation(() => mockRolesResult);
  mockUseAssignedUsers.mockImplementation(() => ({
    users: assignedUsers,
    error: null,
    isLoading: false,
    mutate: jest.fn(),
  }));
  mockDeleteTrigger.mockResolvedValue(undefined);
  mockUnassignTrigger.mockResolvedValue({ message: 'Members unassigned' });
});

describe('System → Organization detail page', () => {
  it('keeps the delete dialog open and shows the backend message when deletion is refused (501)', async () => {
    mockDeleteTrigger.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 501,
        data: { message: 'Group deletion temporarily disabled' },
      },
    });

    render(<OrganizationDetailPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete organization' }));

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/to confirm/), {
      target: { value: 'Kampala Clean Air' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Delete organization' })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Group deletion temporarily disabled')
      ).toBeInTheDocument();
    });

    expect(mockDeleteTrigger).toHaveBeenCalledWith({ groupId: 'org-1' });
    // The parent only closes the dialog after a successful delete.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('hides the delete card for the protected default organization', () => {
    mockGroupResult = {
      ...mockGroupResult,
      data: {
        group: {
          ...groupFixture,
          grp_title: 'AirQo',
          organization_slug: 'airqo',
        },
      },
    };

    render(<OrganizationDetailPage />);

    expect(
      screen.queryByRole('button', { name: 'Delete organization' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Delete organization')).not.toBeInTheDocument();
    // The rest of the page still renders.
    expect(
      screen.getByRole('heading', { name: 'AirQo' })
    ).toBeInTheDocument();
  });

  it('opens the confirm dialog from the members card and unassigns the requested users', async () => {
    render(<OrganizationDetailPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Unassign user-2' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Unassign members' })
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Unassign' }));

    await waitFor(() => {
      expect(mockUnassignTrigger).toHaveBeenCalledWith({
        groupId: 'org-1',
        user_ids: ['user-2'],
      });
    });
    // Confirming closes the dialog once the mutation succeeds.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Access Denied when the group read is forbidden', () => {
    mockGroupResult = {
      ...mockGroupResult,
      data: undefined,
      // Axios-shaped 403 so isForbiddenError takes its real detection path.
      error: {
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden' } },
      },
    };

    render(<OrganizationDetailPage />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Kampala Clean Air')).not.toBeInTheDocument();
    expect(mockUseGroupDetails).toHaveBeenCalledWith('org-1');
  });

  it('shows the not-found message when the group read returns 404', () => {
    mockGroupResult = {
      ...mockGroupResult,
      data: undefined,
      error: {
        isAxiosError: true,
        response: { status: 404, data: { message: 'Not found' } },
      },
    };

    render(<OrganizationDetailPage />);

    expect(
      screen.getByText('Organization not found. It may have been removed.')
    ).toBeInTheDocument();
    // A 404 is terminal — no retry offered.
    expect(
      screen.queryByRole('button', { name: 'Retry' })
    ).not.toBeInTheDocument();
  });

  it('never requests assigned users and hides manager/members without MEMBER_VIEW', () => {
    mockPermissions = mockPermissions.filter(
      permission => permission !== 'MEMBER_VIEW'
    );

    render(<OrganizationDetailPage />);

    // A null key means "no request" — the assigned-users read must not fire.
    expect(mockUseAssignedUsers).toHaveBeenCalledWith(null);
    expect(
      screen.getByText('You do not have permission to view organization members.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Manager' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Unassign user-2' })
    ).not.toBeInTheDocument();
  });
});
