import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrganizationSelector } from '../organization-selector';

const mockUseUser = jest.fn();
const mockUseDiscoverGroups = jest.fn();
const mockUseRequestGroupAccess = jest.fn();
const mockDispatch = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

jest.mock('@/shared/hooks/useUserActions', () => ({
  useUserActions: () => ({ switchGroup: jest.fn() }),
}));

jest.mock('@/shared/hooks/useGroups', () => ({
  useDiscoverGroups: (...args: unknown[]) => mockUseDiscoverGroups(...args),
  useRequestGroupAccess: () => mockUseRequestGroupAccess(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => null,
}));

jest.mock('@/shared/utils/analytics', () => ({
  capturePostHogEvent: jest.fn(),
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/shared/components/ui/avatar', () => ({
  Avatar: ({ fallback }: { fallback?: string }) => <span>{fallback}</span>,
}));

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
      <div role="dialog">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
      </div>
    ) : null;

  return { __esModule: true, default: MockDialog };
});

const membership = {
  id: 'membership-1',
  title: 'My Group',
  organizationSlug: 'my-group',
  profilePicture: '',
  createdAt: '',
  status: 'ACTIVE',
  userType: 'group',
};

const discoveredOnly = {
  id: 'discovered-1',
  title: 'Discoverable Group',
  organizationSlug: 'discoverable-group',
  profilePicture: '',
  createdAt: '',
  status: 'ACTIVE',
  userType: '',
};

const getToastErrorMock = () =>
  (
    jest.requireMock('@/shared/components/ui/toast') as {
      toast: { error: jest.Mock };
    }
  ).toast.error;

describe('OrganizationSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockUseUser.mockReturnValue({
      user: { id: 'user-1' },
      groups: [membership],
      activeGroup: membership,
    });
    mockUseRequestGroupAccess.mockReturnValue({ trigger: jest.fn() });
  });

  it('shows the new badge for fourteen days and then hides it', () => {
    jest.useFakeTimers();
    mockUseDiscoverGroups.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    });
    render(<OrganizationSelector />);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open organizations (new)' })
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(14 * 24 * 60 * 60 * 1000);
    });

    expect(screen.queryByText('New')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Open organizations/ })
    ).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('shows memberships without an error banner when discovery fails', async () => {
    mockUseDiscoverGroups.mockReturnValue({
      data: { groups: [discoveredOnly] },
      error: new Error('discover unavailable'),
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<OrganizationSelector />);
    await user.click(
      screen.getByRole('button', { name: /Open organizations/ })
    );

    expect(
      screen.getByRole('button', { name: 'Switch to My Group' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Discoverable Group')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/couldn.t load organizations/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('1 of 1 available')).toBeInTheDocument();
  });

  it('keeps memberships visible while discovery is still loading', async () => {
    mockUseDiscoverGroups.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    const user = userEvent.setup();
    render(<OrganizationSelector />);
    await user.click(
      screen.getByRole('button', { name: /Open organizations/ })
    );

    expect(
      screen.getByRole('button', { name: 'Switch to My Group' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Loading organizations...')
    ).not.toBeInTheDocument();
  });

  it('hides internal request errors behind a concise retry message', async () => {
    const trigger = jest
      .fn()
      .mockRejectedValue(
        new Error("Cannot read properties of undefined (reading '_id')")
      );
    mockUseRequestGroupAccess.mockReturnValue({ trigger });
    mockUseDiscoverGroups.mockReturnValue({
      data: {
        groups: [
          {
            _id: discoveredOnly.id,
            grp_title: discoveredOnly.title,
            organization_slug: discoveredOnly.organizationSlug,
          },
        ],
      },
      error: undefined,
      isLoading: false,
    });

    const user = userEvent.setup();
    render(<OrganizationSelector />);
    await user.click(
      screen.getByRole('button', { name: /Open organizations/ })
    );
    await user.click(screen.getByRole('button', { name: 'Request Access' }));

    await waitFor(() => {
      expect(getToastErrorMock()).toHaveBeenCalledWith(
        'Request failed',
        'We couldn’t submit your request right now. Please try again.'
      );
    });
  });
});
