'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AqBell01,
  AqCheckDone01,
  AqRefreshCcw01,
  AqTrash01,
  AqXClose,
} from '@airqo/icons-react';
import { boundedRetryPolicy } from '@/shared/lib/retryPolicy';
import { toast } from '@/shared/components/ui/toast';
import {
  NOTIFICATIONS_INBOX_QUERY_KEY,
  NOTIFICATIONS_PAGE_SIZE,
  NOTIFICATIONS_UNREAD_QUERY_KEY,
  notificationService,
} from '@/shared/services/notificationService';
import type {
  Notification,
  NotificationListResponse,
} from '@/shared/types/notifications';

const formatUnreadCount = (count: number): string =>
  count > 99 ? '99+' : String(count);

const getNotificationTime = (createdAt: string): string => {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return '';

  const differenceInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(differenceInSeconds);
  if (absoluteSeconds < 60) return 'Just now';

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
  });
  const [unit, secondsPerUnit] =
    units.find(([, seconds]) => absoluteSeconds >= seconds) ?? units.at(-1)!;

  return formatter.format(
    Math.round(differenceInSeconds / secondsPerUnit),
    unit
  );
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    access_request: 'Access request',
    announcement: 'Announcement',
    data: 'Data update',
    activity: 'Activity',
    system: 'System',
  };
  return labels[category] ?? 'Notification';
};

const getCategoryStyles = (category: string): string => {
  const styles: Record<string, string> = {
    access_request:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    announcement:
      'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    data: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    activity:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    system: 'bg-muted text-muted-foreground',
  };
  return styles[category] ?? styles.system;
};

const getSafeNotificationLink = (link?: string | null): string | null => {
  if (!link) return null;
  const trimmedLink = link.trim();
  if (/^\/(?!\/)/.test(trimmedLink) || /^https:\/\//i.test(trimmedLink)) {
    return trimmedLink;
  }
  return null;
};

const updateNotificationPages = (
  data: InfiniteData<NotificationListResponse, number> | undefined,
  updater: (notification: Notification) => Notification | null
): InfiniteData<NotificationListResponse, number> | undefined => {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      notifications: page.notifications
        .map(updater)
        .filter((notification): notification is Notification => !!notification),
    })),
  };
};

const NotificationRow = ({
  notification,
  onOpen,
  onDelete,
  isDeleting,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isDeleting: boolean;
}) => (
  <li
    className={`group relative flex gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 ${
      notification.read ? 'bg-card' : 'bg-primary/[0.04]'
    }`}
  >
    <button
      type="button"
      className="min-w-0 flex-1 rounded-md pr-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => onOpen(notification)}
      aria-label={`${notification.read ? 'Open' : 'Read'} notification: ${notification.title}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getCategoryStyles(notification.category)}`}
          aria-hidden="true"
        >
          <AqBell01 className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span
              className={`line-clamp-2 text-sm ${
                notification.read
                  ? 'font-medium text-foreground'
                  : 'font-semibold text-foreground'
              }`}
            >
              {notification.title}
            </span>
            {!notification.read && (
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-label="Unread"
              />
            )}
          </span>
          <span className="mt-1 line-clamp-3 block text-sm leading-5 text-muted-foreground">
            {notification.message}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`rounded-full px-2 py-0.5 ${getCategoryStyles(notification.category)}`}
            >
              {getCategoryLabel(notification.category)}
            </span>
            <span>{getNotificationTime(notification.createdAt)}</span>
            {notification.priority === 'high' && (
              <span className="font-medium text-red-600 dark:text-red-400">
                High priority
              </span>
            )}
          </span>
        </span>
      </div>
    </button>
    <button
      type="button"
      className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover:opacity-100"
      onClick={() => onDelete(notification)}
      disabled={isDeleting}
      aria-label={`Delete notification: ${notification.title}`}
      title="Delete notification"
    >
      <AqTrash01 className="h-4 w-4" />
    </button>
  </li>
);

const NotificationSkeleton = () => (
  <div className="space-y-4 px-4 py-5" aria-hidden="true">
    {[0, 1, 2].map(item => (
      <div key={item} className="flex gap-3">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);

export const NotificationsCenter: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalReady, setIsPortalReady] = useState(false);
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const unreadQuery = useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: ({ signal }) => notificationService.getUnreadCount(signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  const inboxQuery = useInfiniteQuery({
    queryKey: NOTIFICATIONS_INBOX_QUERY_KEY,
    enabled: isAuthenticated && isOpen,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      notificationService.listNotifications({
        limit: NOTIFICATIONS_PAGE_SIZE,
        skip: Number(pageParam),
        signal,
      }),
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.meta.skip + lastPage.meta.limit;
      return nextSkip < lastPage.meta.total ? nextSkip : undefined;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...boundedRetryPolicy,
  });

  const notifications = useMemo(
    () => inboxQuery.data?.pages.flatMap(page => page.notifications) ?? [],
    [inboxQuery.data?.pages]
  );

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markNotificationAsRead(notificationId),
    onSuccess: (_response, notificationId) => {
      const currentData = queryClient.getQueryData<
        InfiniteData<NotificationListResponse, number>
      >(NOTIFICATIONS_INBOX_QUERY_KEY);
      const wasUnread = currentData?.pages.some(page =>
        page.notifications.some(
          notification =>
            notification._id === notificationId && !notification.read
        )
      );

      queryClient.setQueryData<InfiniteData<NotificationListResponse, number>>(
        NOTIFICATIONS_INBOX_QUERY_KEY,
        updateNotificationPages(currentData, notification =>
          notification._id === notificationId
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      if (wasUnread) {
        queryClient.setQueryData<number>(
          NOTIFICATIONS_UNREAD_QUERY_KEY,
          count => (typeof count === 'number' ? Math.max(0, count - 1) : count)
        );
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
        });
      }
    },
    onError: error => {
      toast.error('Notification update failed', error.message);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllNotificationsAsRead(),
    onSuccess: () => {
      const currentData = queryClient.getQueryData<
        InfiniteData<NotificationListResponse, number>
      >(NOTIFICATIONS_INBOX_QUERY_KEY);
      queryClient.setQueryData<InfiniteData<NotificationListResponse, number>>(
        NOTIFICATIONS_INBOX_QUERY_KEY,
        updateNotificationPages(currentData, notification => ({
          ...notification,
          read: true,
          read_at: notification.read_at ?? new Date().toISOString(),
        }))
      );
      queryClient.setQueryData<number>(NOTIFICATIONS_UNREAD_QUERY_KEY, 0);
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
      });
    },
    onError: error => {
      toast.error('Could not mark notifications as read', error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: (_response, notificationId) => {
      const currentData = queryClient.getQueryData<
        InfiniteData<NotificationListResponse, number>
      >(NOTIFICATIONS_INBOX_QUERY_KEY);
      const deletedNotification = currentData?.pages
        .flatMap(page => page.notifications)
        .find(notification => notification._id === notificationId);

      queryClient.setQueryData<InfiniteData<NotificationListResponse, number>>(
        NOTIFICATIONS_INBOX_QUERY_KEY,
        updateNotificationPages(currentData, notification =>
          notification._id === notificationId ? null : notification
        )
      );

      if (deletedNotification && !deletedNotification.read) {
        queryClient.setQueryData<number>(
          NOTIFICATIONS_UNREAD_QUERY_KEY,
          count => (typeof count === 'number' ? Math.max(0, count - 1) : count)
        );
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
        });
      }
    },
    onError: error => {
      toast.error('Could not delete notification', error.message);
    },
  });

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openNotification = useCallback(
    async (notification: Notification) => {
      if (!notification.read) {
        try {
          await markReadMutation.mutateAsync(notification._id);
        } catch {
          // The mutation already presents a safe error message. Navigation is
          // still allowed so a notification link never traps the user.
        }
      }

      const link = getSafeNotificationLink(notification.link);
      if (!link) return;
      if (link.startsWith('/')) {
        closeDrawer();
        router.push(link);
        return;
      }

      window.open(link, '_blank', 'noopener,noreferrer');
    },
    [closeDrawer, markReadMutation, router]
  );

  const unreadCount = unreadQuery.data ?? 0;
  const hasUnread = unreadCount > 0;

  const drawer =
    isOpen && isPortalReady
      ? createPortal(
          <div className="fixed inset-0 z-[10001] flex justify-end">
            <button
              type="button"
              className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[1px] motion-reduce:backdrop-blur-none"
              onClick={closeDrawer}
              aria-label="Close notifications"
            />
            <aside
              ref={drawerRef}
              id="notifications-drawer"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-drawer-title"
              className="relative flex h-full w-full max-w-[420px] flex-col border-l border-border bg-card shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-200 motion-reduce:animate-none"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                  <h2
                    id="notifications-drawer-title"
                    className="text-base font-semibold text-foreground"
                  >
                    Notifications
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {hasUnread
                      ? `${unreadCount} unread`
                      : 'You are all caught up'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={!hasUnread || markAllReadMutation.isPending}
                    aria-label="Mark all notifications as read"
                    title="Mark all as read"
                  >
                    <AqCheckDone01 className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={closeDrawer}
                    aria-label="Close notifications"
                  >
                    <AqXClose className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {inboxQuery.isLoading ? (
                  <NotificationSkeleton />
                ) : inboxQuery.isError ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <AqBell01 className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Notifications are unavailable
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We could not load your notifications right now.
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => void inboxQuery.refetch()}
                    >
                      <AqRefreshCcw01 className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <AqBell01 className="h-6 w-6" />
                    </span>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      No notifications yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Important updates and access requests will appear here.
                    </p>
                  </div>
                ) : (
                  <ul aria-label="Notifications">
                    {notifications.map(notification => (
                      <NotificationRow
                        key={notification._id}
                        notification={notification}
                        onOpen={notificationToOpen =>
                          void openNotification(notificationToOpen)
                        }
                        onDelete={notificationToDelete =>
                          deleteMutation.mutate(notificationToDelete._id)
                        }
                        isDeleting={
                          deleteMutation.isPending &&
                          deleteMutation.variables === notification._id
                        }
                      />
                    ))}
                  </ul>
                )}

                {inboxQuery.hasNextPage && (
                  <div className="border-t border-border p-4">
                    <button
                      type="button"
                      className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void inboxQuery.fetchNextPage()}
                      disabled={inboxQuery.isFetchingNextPage}
                    >
                      {inboxQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="relative rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen(open => !open)}
        aria-label={
          hasUnread ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        aria-expanded={isOpen}
        aria-controls="notifications-drawer"
        title="Notifications"
      >
        <AqBell01 className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute right-1 top-1 flex min-h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground ring-2 ring-card">
            {formatUnreadCount(unreadCount)}
          </span>
        )}
      </button>
      {drawer}
    </>
  );
};

export default NotificationsCenter;
