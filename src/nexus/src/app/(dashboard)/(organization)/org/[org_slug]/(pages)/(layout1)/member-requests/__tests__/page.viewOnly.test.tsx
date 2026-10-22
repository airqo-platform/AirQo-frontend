import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ org_slug: 'airqo' }),
}));

jest.mock('@airqo/icons-react', () => {
  // Stub every icon name so tests do not depend on the icon package; the
  // shared Button/banner import icons the page itself never renders.
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

// The confirmation dialog is closed in these tests and its module pulls in
// flowbite-react (ESM-only), so stub it out.
jest.mock('@/shared/components/ui/dialog', () => {
  const MockDialog = ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title?: string;
    children?: React.ReactNode;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null;

  return { __esModule: true, default: MockDialog };
});

jest.mock('@/shared/components', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mutable per test so the same pending row can render with and without the
// MEMBER_INVITE permission.
let mockCanManageRequests = false;

jest.mock('@/shared/hooks', () => ({
  useRBAC: () => ({
    hasAnyPermissionInActiveGroup: () => mockCanManageRequests,
  }),
}));

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    groups: [
      { id: 'group-1', title: 'AirQo', organizationSlug: 'airqo' },
    ],
  }),
}));

const PENDING_REQUEST = {
  _id: 'req-1',
  status: 'pending',
  email: 'ada.lovelace@airqo.net',
  targetId: 'group-1',
  requestType: 'group',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
  user: {
    _id: 'u1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    lastLogin: '',
  },
};

const mockMutate = jest.fn();
const mockJoinRequests: {
  data: unknown;
  isLoading: boolean;
  error: unknown;
} = {
  data: { success: true, message: 'ok', requests: [PENDING_REQUEST] },
  isLoading: false,
  error: null as unknown,
};

jest.mock('@/shared/hooks/useGroups', () => ({
  useGroupJoinRequests: () => ({
    ...mockJoinRequests,
    mutate: mockMutate,
  }),
  useApproveGroupJoinRequest: () => ({
    trigger: jest.fn(),
    isMutating: false,
  }),
  useRejectGroupJoinRequest: () => ({
    trigger: jest.fn(),
    isMutating: false,
  }),
}));

// Render each row straight from the column definitions (plus the row data the
// table receives) so the row actions under test are exercised without pulling
// in the full table implementation.
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
        <div key={String(row.id ?? index)}>
          <div>row-id {String(row.id)}</div>
          {columns.map(column => (
            <div key={column.key}>{column.render?.(null, row as never)}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

import MemberRequestsPage from '../page';

describe('Member Requests row actions', () => {
  beforeEach(() => {
    mockCanManageRequests = false;
    mockJoinRequests.data = {
      success: true,
      message: 'ok',
      requests: [PENDING_REQUEST],
    };
    mockJoinRequests.isLoading = false;
    mockJoinRequests.error = null;
  });

  it('shows "View only" for a pending request without MEMBER_INVITE', () => {
    render(<MemberRequestsPage />);

    // The pending row is rendered at all (row data reaches the table)...
    expect(screen.getByText('row-id req-1')).toBeInTheDocument();
    expect(screen.getByText('ada.lovelace@airqo.net')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    // ...and its actions cell is read-only.
    expect(screen.getByText('View only')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reject' })
    ).not.toBeInTheDocument();
  });

  it('offers Approve/Reject for a pending request with MEMBER_INVITE', () => {
    mockCanManageRequests = true;

    render(<MemberRequestsPage />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Approve' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.queryByText('View only')).not.toBeInTheDocument();
  });
});
