import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// react-popper positions via DOM measurement that jsdom cannot provide. Stub
// it so the lists render inline; the group/role scoping logic under test is
// independent of positioning.
jest.mock('react-popper', () => ({
  usePopper: () => ({
    styles: { popper: { position: 'relative' } },
    attributes: { popper: {} },
    update: jest.fn(),
  }),
}));

// The real Dialog portals via framer-motion's AnimatePresence; every existing
// suite stubs it, so this test does the same and renders the actions inline.
jest.mock('@/shared/components/ui/dialog', () => {
  const MockDialog = ({
    isOpen,
    title,
    subtitle,
    children,
    primaryAction,
    secondaryAction,
  }: {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    primaryAction?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
      loading?: boolean;
    };
    secondaryAction?: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    };
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
        <button
          type="button"
          onClick={primaryAction?.onClick}
          disabled={primaryAction?.disabled || primaryAction?.loading}
        >
          {primaryAction?.label}
        </button>
        <button
          type="button"
          onClick={secondaryAction?.onClick}
          disabled={secondaryAction?.disabled}
        >
          {secondaryAction?.label}
        </button>
      </div>
    ) : null;

  return { __esModule: true, default: MockDialog };
});

const mockTrigger = jest.fn();

jest.mock('@/shared/hooks/useAdmin', () => ({
  useUpdateUserRole: () => ({ trigger: mockTrigger, isMutating: false }),
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import UserRoleAssignmentDialog from '../UserRoleAssignmentDialog';
import type { User, UserRoleSummary } from '@/shared/types/api';

const groupA = {
  _id: 'ga',
  grp_title: 'Group A',
  organization_slug: 'group-a',
};

const groupB = {
  _id: 'gb',
  grp_title: 'Group B',
  organization_slug: 'group-b',
};

// A1 is the user's current role and deliberately inactive, so the disabled
// option state can be asserted on the preselected group's list.
const roles = [
  {
    _id: 'a1',
    role_name: 'Role A1',
    role_status: 'INACTIVE',
    role_permissions: [],
    user_count: 0,
    group: groupA,
  },
  {
    _id: 'a2',
    role_name: 'Role A2',
    role_status: 'ACTIVE',
    role_permissions: [],
    user_count: 0,
    group: groupA,
  },
  {
    _id: 'b1',
    role_name: 'Role B1',
    role_status: 'ACTIVE',
    role_permissions: [],
    user_count: 0,
    group: groupB,
  },
  {
    // Roles without a group cannot be assigned through this dialog.
    _id: 'n1',
    role_name: 'Solo Role',
    role_status: 'ACTIVE',
    role_permissions: [],
    user_count: 0,
  },
] as unknown as UserRoleSummary[];

const user = {
  _id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  groups: [
    {
      _id: 'ga',
      grp_title: 'Group A',
      organization_slug: 'group-a',
      grp_profile_picture: '',
      createdAt: '',
      status: 'ACTIVE',
      userType: 'group',
      role: { _id: 'a1', role_name: 'Role A1', role_permissions: [] },
    },
  ],
} as unknown as User;

const Harness: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [open, setOpen] = useState(true);
  return (
    <UserRoleAssignmentDialog
      isOpen={open}
      onClose={() => setOpen(false)}
      user={user}
      roles={roles}
      onSuccess={onSuccess}
    />
  );
};

const groupTrigger = () =>
  screen.getByRole('button', { name: /^organization/i });
const roleTrigger = () =>
  screen.getByRole('button', { name: /role in this organization/i });
const optionNames = () =>
  screen.getAllByRole('option').map(node => node.textContent);

describe('UserRoleAssignmentDialog', () => {
  beforeEach(() => {
    mockTrigger.mockReset();
    mockTrigger.mockResolvedValue(undefined);
  });

  it('preselects the group of the user current role and hides groupless roles', async () => {
    const userEventSetup = userEvent.setup();
    render(<Harness />);

    expect(groupTrigger()).toHaveTextContent('Group A (2 roles)');

    await userEventSetup.click(groupTrigger());

    expect(optionNames()).toEqual(['Group A (2 roles)', 'Group B (1 roles)']);
    expect(screen.queryByText(/solo role/i)).not.toBeInTheDocument();
  });

  it('lists only the selected group roles and disables inactive ones', async () => {
    const userEventSetup = userEvent.setup();
    render(<Harness />);

    await userEventSetup.click(roleTrigger());

    expect(optionNames()).toEqual(['Role A1 (inactive)', 'Role A2']);
    expect(
      screen.getByRole('option', { name: 'Role A1 (inactive)' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('option', { name: 'Role A2' })
    ).toHaveAttribute('aria-disabled', 'false');
  });

  it('keeps Update Role disabled until a role is chosen', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: 'Update Role' })).toBeDisabled();
  });

  it('submits the chosen role, closes and calls onSuccess', async () => {
    const userEventSetup = userEvent.setup();
    const onSuccess = jest.fn();
    render(<Harness onSuccess={onSuccess} />);

    await userEventSetup.click(roleTrigger());
    await userEventSetup.click(screen.getByRole('option', { name: 'Role A2' }));
    await userEventSetup.click(screen.getByRole('button', { name: 'Update Role' }));

    await waitFor(() =>
      expect(mockTrigger).toHaveBeenCalledWith({ userId: 'u1', roleId: 'a2' })
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switching the group shows only that group roles', async () => {
    const userEventSetup = userEvent.setup();
    render(<Harness />);

    await userEventSetup.click(groupTrigger());
    await userEventSetup.click(
      screen.getByRole('option', { name: 'Group B (1 roles)' })
    );

    await userEventSetup.click(roleTrigger());

    expect(optionNames()).toEqual(['Role B1']);
    // No role picked for the new group yet.
    expect(screen.getByRole('button', { name: 'Update Role' })).toBeDisabled();
  });
});
