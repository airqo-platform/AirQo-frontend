import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsCenter } from '../notifications-center';

const mockPush = jest.fn();
const mockGetUnreadCount = jest.fn();
const mockListNotifications = jest.fn();
const mockMarkNotificationAsRead = jest.fn();
const mockMarkAllNotificationsAsRead = jest.fn();
const mockDeleteNotification = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated' }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/services/notificationService', () => ({
  NOTIFICATIONS_INBOX_QUERY_KEY: ['notifications', 'inbox'],
  NOTIFICATIONS_PAGE_SIZE: 20,
  NOTIFICATIONS_UNREAD_QUERY_KEY: ['notifications', 'unread-count'],
  notificationService: {
    getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
    listNotifications: (...args: unknown[]) => mockListNotifications(...args),
    markNotificationAsRead: (...args: unknown[]) =>
      mockMarkNotificationAsRead(...args),
    markAllNotificationsAsRead: (...args: unknown[]) =>
      mockMarkAllNotificationsAsRead(...args),
    deleteNotification: (...args: unknown[]) => mockDeleteNotification(...args),
  },
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: { error: jest.fn() },
}));

const notification = {
  _id: 'notification-1',
  category: 'access_request',
  event: 'access_request.approved',
  title: 'Access request approved',
  message: 'You can now access the organization.',
  link: '/analytics',
  priority: 'normal',
  read: false,
  createdAt: new Date().toISOString(),
};

const renderCenter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsCenter />
    </QueryClientProvider>
  );
};

describe('NotificationsCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUnreadCount.mockResolvedValue(1);
    mockListNotifications.mockResolvedValue({
      success: true,
      message: 'success',
      notifications: [notification],
      meta: { total: 1, unread: 1, skip: 0, limit: 20, page: 1, pages: 1 },
    });
    mockMarkNotificationAsRead.mockResolvedValue({
      success: true,
      message: 'read',
    });
    mockMarkAllNotificationsAsRead.mockResolvedValue({
      success: true,
      message: 'read all',
    });
    mockDeleteNotification.mockResolvedValue({
      success: true,
      message: 'deleted',
    });
  });

  it('shows the unread badge, opens the drawer once, and marks linked notifications read', async () => {
    const user = userEvent.setup();
    renderCenter();

    expect(
      await screen.findByRole('button', { name: 'Notifications, 1 unread' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Notifications, 1 unread' })
    );

    expect(
      await screen.findByRole('heading', { name: 'Notifications' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'Read notification: Access request approved',
      })
    ).toBeInTheDocument();
    expect(mockListNotifications).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', {
        name: 'Read notification: Access request approved',
      })
    );

    await waitFor(() => {
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('notification-1');
      expect(mockPush).toHaveBeenCalledWith('/analytics');
    });
  });
});
