import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the page tests); the shared UI barrel re-exports the Dialog, which imports
// its Tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Button (pulled in by the ui barrel) measures the viewport; jsdom cannot.
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

// Button calls useRouter(); the app router is not mounted in jsdom. Same stub
// as the organizations page tests.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

// The shared Card reads state.theme through useAppSelector; render without a
// react-redux Provider. Same stub as the invoices page tests.
jest.mock('@/shared/hooks/redux', () => ({
  useAppSelector: (
    selector: (state: { theme: { interfaceStyle: string } }) => unknown
  ) => selector({ theme: { interfaceStyle: 'plain' } }),
  useAppDispatch: () => jest.fn(),
}));

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

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Render rows straight from the column definitions so the bulk action under
// test is exercised without pulling in the full table implementation.
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

import { toast } from '@/shared/components/ui/toast';
import OrganizationMembersCard from '../components/OrganizationMembersCard';
import type { GroupAssignedUser } from '@/shared/types/api';

const MANAGER: GroupAssignedUser = {
  _id: 'manager-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@airqo.net',
  userName: 'ada',
  isActive: true,
  role_name: 'Org Manager',
};

const MEMBER_2: GroupAssignedUser = {
  _id: 'user-2',
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@airqo.net',
  userName: 'grace',
  isActive: true,
  role_name: 'Analyst',
};

const MEMBER_3: GroupAssignedUser = {
  _id: 'user-3',
  firstName: 'Alan',
  lastName: 'Turing',
  email: 'alan@airqo.net',
  userName: 'alan',
  isActive: false,
};

const renderCard = (
  overrides: Partial<
    React.ComponentProps<typeof OrganizationMembersCard>
  > = {}
) => {
  const onRequestUnassign = jest.fn();
  const onSelectedChange = jest.fn();

  render(
    <OrganizationMembersCard
      users={[MANAGER, MEMBER_2, MEMBER_3]}
      managerId={MANAGER._id}
      canRemove
      isLoading={false}
      selectedIds={[]}
      onSelectedChange={onSelectedChange}
      onRequestUnassign={onRequestUnassign}
      {...overrides}
    />
  );

  return { onRequestUnassign, onSelectedChange };
};

describe('OrganizationMembersCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests an unassign of the selection with the manager removed', async () => {
    const user = userEvent.setup();
    const { onRequestUnassign } = renderCard({
      selectedIds: [MANAGER._id, MEMBER_2._id, MEMBER_3._id, MEMBER_2._id],
    });

    await user.click(
      screen.getByRole('button', { name: /unassign \(4\)/i })
    );

    expect(onRequestUnassign).toHaveBeenCalledTimes(1);
    expect(onRequestUnassign).toHaveBeenCalledWith([
      MEMBER_2._id,
      MEMBER_3._id,
    ]);
  });

  it('shows an error toast instead of requesting when only the manager is selected', async () => {
    const user = userEvent.setup();
    const { onRequestUnassign } = renderCard({
      selectedIds: [MANAGER._id],
    });

    await user.click(screen.getByRole('button', { name: /unassign \(1\)/i }));

    expect(onRequestUnassign).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('hides the bulk action and never requests an unassign without the permission', () => {
    const { onRequestUnassign } = renderCard({
      canRemove: false,
      selectedIds: [MEMBER_2._id],
    });

    expect(
      screen.queryByRole('button', { name: /unassign/i })
    ).not.toBeInTheDocument();
    expect(onRequestUnassign).not.toHaveBeenCalled();
  });

  it('badges the manager row and lists the members', () => {
    renderCard();

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('ada@airqo.net')).toBeInTheDocument();
    expect(screen.getByText('No role')).toBeInTheDocument();
  });
});
