'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Banner } from './ui/banner';
import { usePendingInvitations } from '../hooks/useUser';
import { AqXClose as X } from '@airqo/icons-react';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'outlined' | 'text' | 'disabled' | 'filled' | 'ghost';
}

export interface BaseNotificationBannerProps {
  severity?: NotificationSeverity;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  /** GitHub-style layout: content left, action right */
  layout?: 'default' | 'github-style';
}

export interface CustomNotificationBannerProps
  extends BaseNotificationBannerProps {
  type: 'custom';
  title: string;
  message: string;
  action?: NotificationAction;
}

export interface PendingInvitesNotificationBannerProps
  extends BaseNotificationBannerProps {
  type: 'pending-invites';
}

export type NotificationBannerProps =
  | CustomNotificationBannerProps
  | PendingInvitesNotificationBannerProps;

// Animation configuration
const bannerAnimation = {
  initial: { opacity: 0, y: -20, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, y: -20, height: 0 },
  transition: { duration: 0.25 },
};

// Separate component for pending invites logic
const usePendingInvitesBanner = () => {
  const router = useRouter();
  const { data, isLoading } = usePendingInvitations();

  const handleViewInvites = useCallback(() => {
    router.push('/user/profile?tab=org-invites');
  }, [router]);

  return {
    isLoading,
    invitations: data?.invitations ?? [],
    handleViewInvites,
    hasInvites: (data?.invitations?.length ?? 0) > 0,
  };
};

// GitHub-style banner layout component
const GitHubStyleBanner: React.FC<{
  severity: NotificationSeverity;
  children: React.ReactNode;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}> = ({ severity, children, action, dismissible, onDismiss, className }) => {
  const severityStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div
      className={`border px-4 py-3 rounded-md ${severityStyles[severity]} ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-3 shrink-0">
          {action}
          {dismissible && (
            <button
              onClick={onDismiss}
              className="rounded p-1 hover:bg-black/5 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Content component for pending invites
const PendingInvitesContent: React.FC<{
  count: number;
  onView: () => void;
  layout: 'default' | 'github-style';
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({ count, onView, layout, dismissible, onDismiss }) => {
  const plural = count > 1 ? 's' : '';

  if (layout === 'github-style') {
    return (
      <GitHubStyleBanner
        severity="info"
        action={
          <Button size="sm" variant="outlined" onClick={onView}>
            View invitation{plural}
          </Button>
        }
        dismissible={dismissible}
        onDismiss={onDismiss}
      >
        <span className="text-sm">
          You have{' '}
          <strong>
            {count} pending invitation{plural}
          </strong>{' '}
          to join {count > 1 ? 'organizations' : 'an organization'}
        </span>
      </GitHubStyleBanner>
    );
  }

  return (
    <Banner
      severity="info"
      title={`Pending Organization Invitation${plural}`}
      message={`You have ${count} pending invitation${plural} to join an organization. Check your invitations to accept or decline.`}
      actions={
        <Button size="sm" variant="outlined" onClick={onView}>
          View Invitations
        </Button>
      }
      dense
    />
  );
};

// Content component for custom notifications
const CustomNotificationContent: React.FC<{
  title: string;
  message: string;
  severity: NotificationSeverity;
  action?: NotificationAction;
  layout: 'default' | 'github-style';
  dismissible?: boolean;
  onDismiss?: () => void;
}> = ({ title, message, severity, action, layout, dismissible, onDismiss }) => {
  if (layout === 'github-style') {
    return (
      <GitHubStyleBanner
        severity={severity}
        action={
          action && (
            <Button
              size="sm"
              variant={action.variant || 'outlined'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
        }
        dismissible={dismissible}
        onDismiss={onDismiss}
      >
        <div className="flex flex-col gap-0.5">
          {title && <span className="font-semibold text-sm">{title}</span>}
          <span className="text-sm opacity-90">{message}</span>
        </div>
      </GitHubStyleBanner>
    );
  }

  return (
    <Banner
      severity={severity}
      title={title}
      message={message}
      actions={
        action && (
          <Button
            size="sm"
            variant={action.variant || 'outlined'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      }
      dense
    />
  );
};

// Main component
export const NotificationBanner: React.FC<NotificationBannerProps> = props => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isLoading, invitations, handleViewInvites, hasInvites } =
    usePendingInvitesBanner();

  const { onDismiss } = props;

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Handle pending invites type
  if (props.type === 'pending-invites') {
    const { layout = 'github-style', dismissible = true, className } = props;

    if (isLoading || !hasInvites || isDismissed) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        {!isDismissed && (
          <motion.div
            key="pending-invites"
            {...bannerAnimation}
            className={className}
          >
            <PendingInvitesContent
              count={invitations.length}
              onView={handleViewInvites}
              layout={layout}
              dismissible={dismissible}
              onDismiss={handleDismiss}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Handle custom type
  const {
    title,
    message,
    severity = 'info',
    action,
    dismissible = true,
    layout = 'github-style',
    className,
  } = props;

  if (isDismissed) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="custom-notification"
        {...bannerAnimation}
        className={className}
      >
        <CustomNotificationContent
          title={title}
          message={message}
          severity={severity}
          action={action}
          layout={layout}
          dismissible={dismissible}
          onDismiss={handleDismiss}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Convenience hooks for specific use cases
export const useNotificationBanner = () => {
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  const isDismissed = useCallback(
    (key: string) => dismissedKeys.has(key),
    [dismissedKeys]
  );

  const dismiss = useCallback((key: string) => {
    setDismissedKeys(prev => new Set(prev).add(key));
  }, []);

  return { isDismissed, dismiss };
};

export default NotificationBanner;
