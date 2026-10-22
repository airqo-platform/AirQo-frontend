import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { GroupActivity } from '@/shared/types/api';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the organizations page tests); the shared UI barrel re-exports the Dialog,
// which imports its Tooltip.
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
const mockBack = jest.fn();
const mockReplace = jest.fn();
// Mutable per-test query string: the page reads it for the selected group.
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

// Passthrough by default so every existing test still renders content;
// flipping `mockGuardAllows` simulates a non-admin (guard withholds children)
// to prove no activity/summary/member request runs before permission
// resolution.
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

// Minimal stand-in for the shared table: renders one row per activity and
// pipes each column's `render` output into the matching cell. The real table
// pulls in the redux-backed Card, which no test here needs.
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
    <table>
      <tbody>
        {data.map(row => (
          <tr key={String(row.id)}>
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
const mockUseOrganizationAssignedUsers = jest.fn();
const mockUseOrganizationActivityLog = jest.fn();

jest.mock('@/shared/hooks/useOrganizations', () => ({
  useOrganizationsSummary: () => mockUseOrganizationsSummary(),
  useOrganizationAssignedUsers: (groupId: string | null) =>
    mockUseOrganizationAssignedUsers(groupId),
  useOrganizationActivityLog: (groupId: string | null, params: unknown) =>
    mockUseOrganizationActivityLog(groupId, params),
}));

import ActivityLogPage from '../page';
import {
  getDefaultActivityDateRange,
  toActivityApiEndDate,
} from '../dateRange';

interface SummaryGroup {
  _id: string;
  grp_title: string;
  organization_slug: string;
}

interface AssignedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ActivityHookResult {
  activities: GroupActivity[];
  groupName: string | undefined;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: jest.Mock;
}

const groups: SummaryGroup[] = [
  {
    _id: 'group-1',
    grp_title: 'AirQo Kampala',
    organization_slug: 'kampala-city',
  },
  {
    _id: 'group-2',
    grp_title: 'AirQo Nairobi',
    organization_slug: 'nairobi-county',
  },
];

const members: AssignedUser[] = [
  {
    _id: 'user-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  },
];

const activity = (overrides: Partial<GroupActivity> = {}): GroupActivity => ({
  id: 'activity-1',
  activity_type: 'MEMBER_ADDED',
  actor: { user_id: 'admin-1', email: 'admin@example.com' },
  target_user: { user_id: 'user-1', name: 'Ada Lovelace' },
  timestamp: '2026-01-15T10:30:00',
  ...overrides,
});

// Mutable per-test hook returns; the `mock` prefix keeps them referenceable
// from the hoisted module factories.
let mockMutate: jest.Mock;
let mockSummaryResult: { groups: SummaryGroup[]; isLoading: boolean };
let mockAssignedResult: { users: AssignedUser[]; isLoading: boolean };
let mockActivityResult: ActivityHookResult;

beforeEach(() => {
  jest.clearAllMocks();
  mockGuardAllows = true;
  mockSearchParams = new URLSearchParams('group_id=group-1');
  mockMutate = jest.fn();
  mockSummaryResult = { groups, isLoading: false };
  mockAssignedResult = { users: members, isLoading: false };
  mockActivityResult = {
    activities: [],
    groupName: 'AirQo Kampala',
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: mockMutate,
  };
  mockUseOrganizationsSummary.mockImplementation(() => mockSummaryResult);
  mockUseOrganizationAssignedUsers.mockImplementation(() => mockAssignedResult);
  mockUseOrganizationActivityLog.mockImplementation(() => mockActivityResult);
});

const selectOption = (controlName: string, optionName: string) => {
  fireEvent.click(screen.getByRole('button', { name: controlName }));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
};

// The page seeds its date inputs from getDefaultActivityDateRange() and sends
// end_date through toActivityApiEndDate() (+1 day), so expectations are built
// with the same helpers instead of hard-coded dates that break at midnight.
const defaultActivityParams = () => {
  const { startDate, endDate } = getDefaultActivityDateRange();
  return {
    limit: 20,
    skip: 0,
    start_date: startDate,
    end_date: toActivityApiEndDate(endDate),
  };
};

describe('System → Activity Log page', () => {
  it('shows the exact empty state until an organization is selected', () => {
    mockSearchParams = new URLSearchParams();

    render(<ActivityLogPage />);

    expect(
      screen.getByText('Select an organization to view its activity log.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next' })
    ).not.toBeInTheDocument();
  });

  it('renders each activity type, actor, target and timestamp', () => {
    mockActivityResult = {
      ...mockActivityResult,
      activities: [activity()],
    };

    render(<ActivityLogPage />);

    expect(screen.getByText('Member added')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2026 10:30')).toBeInTheDocument();
  });

  it('reads the selected group from the query string and writes it back on change', () => {
    mockSearchParams = new URLSearchParams();

    render(<ActivityLogPage />);
    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith(
      null,
      defaultActivityParams()
    );

    selectOption('Organization', 'AirQo Nairobi (nairobi-county)');

    expect(mockReplace).toHaveBeenCalledWith(
      '/system/activity-log?group_id=group-2'
    );
    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith(
      'group-2',
      defaultActivityParams()
    );
  });

  it('passes member and date filters through to the activity-log hook', () => {
    render(<ActivityLogPage />);
    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith(
      'group-1',
      defaultActivityParams()
    );

    selectOption('Member', 'Ada Lovelace (ada@example.com)');
    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2026-02-01' },
    });

    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith('group-1', {
      limit: 20,
      skip: 0,
      user_id: 'user-1',
      start_date: '2026-01-01',
      // The inclusive "To" date is shifted +1 day for the API (whole final day).
      end_date: toActivityApiEndDate('2026-02-01'),
    });

    // Resetting restores the default 7-day window instead of empty params.
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith(
      'group-1',
      defaultActivityParams()
    );
  });

  it('disables Next when the returned window is shorter than a full page', () => {
    mockActivityResult = {
      ...mockActivityResult,
      activities: [
        activity({ id: 'a1' }),
        activity({ id: 'a2' }),
        activity({ id: 'a3' }),
      ],
    };

    render(<ActivityLogPage />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next when exactly a full page of activities came back', () => {
    mockActivityResult = {
      ...mockActivityResult,
      activities: Array.from({ length: 20 }, (_, index) =>
        activity({ id: `a${index}` })
      ),
    };

    render(<ActivityLogPage />);

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('requests the next window (skip=20) when Next is clicked on a full page', () => {
    mockActivityResult = {
      ...mockActivityResult,
      activities: Array.from({ length: 20 }, (_, index) =>
        activity({ id: `a${index}` })
      ),
    };

    render(<ActivityLogPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith('group-1', {
      ...defaultActivityParams(),
      skip: 20,
    });
  });

  it('returns to skip=0 when a filter changes while on page 2', () => {
    mockActivityResult = {
      ...mockActivityResult,
      activities: Array.from({ length: 20 }, (_, index) =>
        activity({ id: `a${index}` })
      ),
    };

    render(<ActivityLogPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith('group-1', {
      ...defaultActivityParams(),
      skip: 20,
    });

    selectOption('Member', 'Ada Lovelace (ada@example.com)');

    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith('group-1', {
      limit: 20,
      skip: 0,
      user_id: 'user-1',
      start_date: getDefaultActivityDateRange().startDate,
      end_date: toActivityApiEndDate(getDefaultActivityDateRange().endDate),
    });
  });

  it('omits start_date and end_date once both date inputs are cleared', () => {
    render(<ActivityLogPage />);

    fireEvent.change(screen.getByLabelText('Start date'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '' },
    });

    expect(mockUseOrganizationActivityLog).toHaveBeenLastCalledWith(
      'group-1',
      {
        limit: 20,
        skip: 0,
      }
    );
  });

  it('renders Access Denied when the activity log request is forbidden', () => {
    mockActivityResult = {
      ...mockActivityResult,
      // Axios-shaped 403 so isForbiddenError takes its real detection path.
      error: {
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden' } },
      },
    };

    render(<ActivityLogPage />);

    const banner = screen.getByRole('alert');
    expect(within(banner).getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.queryByText('Failed to load activity log')
    ).not.toBeInTheDocument();
  });

  it('shows the backend message and a Retry action on any other error', () => {
    mockActivityResult = {
      ...mockActivityResult,
      error: new Error('activity endpoint down'),
    };

    render(<ActivityLogPage />);

    expect(screen.getByText('Failed to load activity log')).toBeInTheDocument();
    expect(screen.getByText('activity endpoint down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('issues no requests until PermissionGuard allows rendering', () => {
    // Non-admin deep link: the guard withholds children, so the content
    // component — with useSearchParams and every hook — must never mount.
    mockGuardAllows = false;

    render(<ActivityLogPage />);

    expect(mockUseOrganizationsSummary).not.toHaveBeenCalled();
    expect(mockUseOrganizationAssignedUsers).not.toHaveBeenCalled();
    expect(mockUseOrganizationActivityLog).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Activity Log' })
    ).not.toBeInTheDocument();
  });
});
