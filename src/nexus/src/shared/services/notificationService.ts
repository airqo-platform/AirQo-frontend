import type { AxiosRequestConfig } from 'axios';
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  NotificationListResponse,
  NotificationMutationResponse,
  NotificationUnreadCountResponse,
} from '@/shared/types/notifications';

export const NOTIFICATIONS_PAGE_SIZE = 20;
export const NOTIFICATIONS_INBOX_QUERY_KEY = [
  'notifications',
  'inbox',
] as const;
export const NOTIFICATIONS_UNREAD_QUERY_KEY = [
  'notifications',
  'unread-count',
] as const;

type NotificationRequestConfig = Pick<AxiosRequestConfig, 'signal'> & {
  suppressErrorLogging?: boolean;
};

export interface ListNotificationsOptions {
  read?: boolean;
  category?: string;
  limit?: number;
  skip?: number;
  signal?: AbortSignal;
}

export class NotificationService {
  private readonly authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated(): Promise<void> {
    await syncClientSessionToken(this.authenticatedClient);
  }

  private requestConfig(
    signal?: AbortSignal
  ): NotificationRequestConfig | undefined {
    if (!signal) {
      return { suppressErrorLogging: true };
    }

    return { signal, suppressErrorLogging: true };
  }

  private createSafeError(
    fallbackMessage: string,
    error: unknown
  ): Error & { status?: number; code?: string } {
    const candidate = error as {
      response?: { status?: unknown };
      status?: unknown;
      code?: unknown;
    } | null;
    const safeError = new Error(fallbackMessage) as Error & {
      status?: number;
      code?: string;
    };

    const status = candidate?.response?.status ?? candidate?.status;
    if (typeof status === 'number') safeError.status = status;
    if (typeof candidate?.code === 'string') safeError.code = candidate.code;

    // Keep diagnostics available to debuggers without exposing backend error
    // payloads through the user-facing error message or enumerable fields.
    Object.defineProperty(safeError, 'cause', {
      value: error,
      enumerable: false,
      configurable: true,
    });

    return safeError;
  }

  private assertSuccess<T extends { success: boolean; message?: string }>(
    data: T,
    fallbackMessage: string
  ): T {
    if (!data.success) {
      throw new Error(fallbackMessage);
    }

    return data;
  }

  async listNotifications(
    options: ListNotificationsOptions = {}
  ): Promise<NotificationListResponse> {
    await this.ensureAuthenticated();

    // ApiClient normalizes this relative users path against the configured
    // versioned API base. Keeping the version out of the feature service
    // avoids duplicating environment/version routing here.
    const params = new URLSearchParams();
    if (typeof options.read === 'boolean')
      params.set('read', String(options.read));
    if (options.category) params.set('category', options.category);
    params.set('limit', String(options.limit ?? NOTIFICATIONS_PAGE_SIZE));
    params.set('skip', String(options.skip ?? 0));

    try {
      const response =
        await this.authenticatedClient.get<NotificationListResponse>(
          `/users/notifications?${params.toString()}`,
          this.requestConfig(options.signal)
        );
      return this.assertSuccess(
        response.data,
        'We could not load your notifications.'
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'We could not load your notifications.'
      ) {
        throw error;
      }
      throw this.createSafeError(
        'We could not load your notifications.',
        error
      );
    }
  }

  async getUnreadCount(signal?: AbortSignal): Promise<number> {
    await this.ensureAuthenticated();

    try {
      const response =
        await this.authenticatedClient.get<NotificationUnreadCountResponse>(
          '/users/notifications/unread-count',
          this.requestConfig(signal)
        );
      const data = this.assertSuccess(
        response.data,
        'We could not load your notification count.'
      );
      const unread = Number(data.data?.unread ?? 0);
      return Number.isFinite(unread) ? Math.max(0, unread) : 0;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'We could not load your notification count.'
      ) {
        throw error;
      }
      throw this.createSafeError(
        'We could not load your notification count.',
        error
      );
    }
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<NotificationMutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response =
        await this.authenticatedClient.patch<NotificationMutationResponse>(
          `/users/notifications/${encodeURIComponent(notificationId)}/read`,
          undefined,
          { suppressErrorLogging: true }
        );
      return this.assertSuccess(
        response.data,
        'We could not mark this notification as read.'
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'We could not mark this notification as read.'
      ) {
        throw error;
      }
      throw this.createSafeError(
        'We could not mark this notification as read.',
        error
      );
    }
  }

  async markAllNotificationsAsRead(): Promise<NotificationMutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response =
        await this.authenticatedClient.patch<NotificationMutationResponse>(
          '/users/notifications/read-all',
          undefined,
          { suppressErrorLogging: true }
        );
      return this.assertSuccess(
        response.data,
        'We could not mark all notifications as read.'
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'We could not mark all notifications as read.'
      ) {
        throw error;
      }
      throw this.createSafeError(
        'We could not mark all notifications as read.',
        error
      );
    }
  }

  async deleteNotification(
    notificationId: string
  ): Promise<NotificationMutationResponse> {
    await this.ensureAuthenticated();

    try {
      const response =
        await this.authenticatedClient.delete<NotificationMutationResponse>(
          `/users/notifications/${encodeURIComponent(notificationId)}`,
          { suppressErrorLogging: true }
        );
      return this.assertSuccess(
        response.data,
        'We could not delete this notification.'
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'We could not delete this notification.'
      ) {
        throw error;
      }
      throw this.createSafeError(
        'We could not delete this notification.',
        error
      );
    }
  }
}

export const notificationService = new NotificationService();
