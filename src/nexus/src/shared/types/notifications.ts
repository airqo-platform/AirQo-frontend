export type NotificationCategory =
  | 'access_request'
  | 'announcement'
  | 'data'
  | 'activity'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  _id: string;
  user_id?: string | null;
  category: NotificationCategory | string;
  event?: string | null;
  title: string;
  message: string;
  link?: string | null;
  priority: NotificationPriority | string;
  request_id?: string | null;
  group_id?: string | null;
  sender_id?: string | null;
  broadcast_id?: string | null;
  metadata?: Record<string, unknown> | null;
  read: boolean;
  read_at?: string | null;
  expires_at?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface NotificationListMeta {
  total: number;
  unread: number;
  skip: number;
  limit: number;
  page: number;
  pages: number;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  notifications: Notification[];
  meta: NotificationListMeta;
}

export interface NotificationUnreadCountResponse {
  success: boolean;
  message: string;
  data: { unread: number };
}

export interface NotificationMutationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
  data?: { modifiedCount?: number };
}
