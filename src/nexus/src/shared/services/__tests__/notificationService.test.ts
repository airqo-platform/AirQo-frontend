import { NotificationService } from '../notificationService';
import { createAuthenticatedClient } from '../apiClient';

const mockClient = {
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../apiClient', () => ({
  createAuthenticatedClient: jest.fn(),
}));

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    (createAuthenticatedClient as jest.Mock).mockReturnValue(mockClient);
    service = new NotificationService();
  });

  it('lists notifications using the backend pagination contract', async () => {
    mockClient.get.mockResolvedValue({
      data: {
        success: true,
        message: 'success',
        notifications: [],
        meta: { total: 0, unread: 0, skip: 20, limit: 20, page: 2, pages: 2 },
      },
    });
    const controller = new AbortController();

    await service.listNotifications({
      read: false,
      limit: 20,
      skip: 20,
      signal: controller.signal,
    });

    expect(mockClient.get).toHaveBeenCalledWith(
      '/users/notifications?read=false&limit=20&skip=20',
      { signal: controller.signal, suppressErrorLogging: true }
    );
  });

  it('reads the unread count from the lightweight endpoint', async () => {
    mockClient.get.mockResolvedValue({
      data: {
        success: true,
        message: 'success',
        data: { unread: 4 },
      },
    });

    await expect(service.getUnreadCount()).resolves.toBe(4);
    expect(mockClient.get).toHaveBeenCalledWith(
      '/users/notifications/unread-count',
      { suppressErrorLogging: true }
    );
  });

  it('uses the read and delete mutation endpoints without leaking server errors', async () => {
    mockClient.patch.mockResolvedValue({
      data: { success: true, message: 'notification marked as read' },
    });
    mockClient.delete.mockResolvedValue({
      data: { success: true, message: 'deleted' },
    });

    await service.markNotificationAsRead('notification/1');
    await service.deleteNotification('notification/1');

    expect(mockClient.patch).toHaveBeenCalledWith(
      '/users/notifications/notification%2F1/read',
      undefined,
      { suppressErrorLogging: true }
    );
    expect(mockClient.delete).toHaveBeenCalledWith(
      '/users/notifications/notification%2F1',
      { suppressErrorLogging: true }
    );
  });

  it('throws a stable user-facing error for an unsuccessful response', async () => {
    mockClient.get.mockResolvedValue({
      data: {
        success: false,
        message: 'database connection details should not reach the UI',
      },
    });

    await expect(service.getUnreadCount()).rejects.toThrow(
      'We could not load your notification count.'
    );
  });
});
