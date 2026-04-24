'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { AqMessageNotificationSquare } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { NavItem } from './nav-item';
import { getSidebarConfig } from '../config';
import { SidebarContentProps } from '../types';
import { useRBAC } from '@/shared/hooks';
import { openFeedbackDialog } from '@/modules/feedback/utils/feedbackDialog';

export const SidebarContent: React.FC<SidebarContentProps> = ({
  flow = 'user',
  orgSlug,
  isCollapsed = false,
  onItemClick,
  className,
}) => {
  const pathname = usePathname();
  const {
    isAirQoSuperAdminWithEmail,
    hasAnyPermission,
    hasAnyPermissionInActiveGroup,
  } = useRBAC();

  // Get the appropriate sidebar configuration
  const sidebarConfig = React.useMemo(() => {
    let config = getSidebarConfig(flow);

    // Filter admin items based on permissions
    if (flow === 'admin') {
      config = config
        .map(group => ({
          ...group,
          items: group.items.filter(item => {
            // Hide admin dashboard if user doesn't have AIRQO_SUPER_ADMIN role
            if (item.id === 'admin-dashboard') {
              return isAirQoSuperAdminWithEmail();
            }
            // Hide statistics and org-requests if user doesn't have AIRQO_SUPER_ADMIN role
            if (['admin-statistics', 'admin-org-requests'].includes(item.id)) {
              return isAirQoSuperAdminWithEmail();
            }
            return true;
          }),
        }))
        .filter(group => group.items.length > 0); // Filter out empty groups
    }

    // Filter organization management items based on permissions
    if (flow === 'organization') {
      config = config
        .map(group => {
          // Only filter the management group
          if (group.id === 'management') {
            return {
              ...group,
              items: group.items.filter(item => {
                // Members and Member Requests require MEMBER_VIEW
                if (['org-members', 'org-member-requests'].includes(item.id)) {
                  return hasAnyPermissionInActiveGroup(['MEMBER_VIEW']);
                }
                // Roles & Permissions require ROLE_VIEW
                if (item.id === 'org-roles') {
                  return hasAnyPermissionInActiveGroup(['ROLE_VIEW']);
                }
                // Organization Settings require GROUP_MANAGEMENT
                if (item.id === 'org-settings') {
                  return hasAnyPermissionInActiveGroup(['GROUP_MANAGEMENT']);
                }
                return true;
              }),
            };
          }
          return group;
        })
        .filter(group => group.items.length > 0); // Filter out empty groups
    }

    // Filter system items based on permissions
    if (flow === 'system') {
      config = config
        .map(group => ({
          ...group,
          items: group.items.filter(item => {
            if (item.id === 'system-feedback') {
              return (
                hasAnyPermission(['SYSTEM_ADMIN', 'SUPER_ADMIN']) ||
                isAirQoSuperAdminWithEmail()
              );
            }

            // Hide system-clients, system-org-requests, and system-user-statistics if user doesn't have AIRQO_SUPER_ADMIN role
            if (
              [
                'system-clients',
                'system-org-requests',
                'system-user-statistics',
              ].includes(item.id)
            ) {
              return isAirQoSuperAdminWithEmail();
            }
            return true;
          }),
        }))
        .filter(group => group.items.length > 0); // Filter out empty groups
    }

    // If org flow and orgSlug provided, replace placeholders with actual slug
    if (flow === 'organization' && orgSlug) {
      return config.map(group => ({
        ...group,
        items: group.items.map(item => ({
          ...item,
          href: item.href.replace('/org/', `/org/${orgSlug}/`),
        })),
      }));
    }

    return config;
  }, [
    flow,
    orgSlug,
    isAirQoSuperAdminWithEmail,
    hasAnyPermission,
    hasAnyPermissionInActiveGroup,
  ]);

  const shouldShowFeedbackAction = !pathname.startsWith('/system/feedback');

  const handleFeedbackClick = React.useCallback(() => {
    openFeedbackDialog();
    onItemClick?.();
  }, [onItemClick]);

  return (
    <div className={cn('flex h-full flex-col py-6', className)}>
      <div className="flex-1 px-3">
        {sidebarConfig.map((group, index) => (
          <React.Fragment key={group.id}>
            {index > 0 && isCollapsed && (
              <div className="my-4 border-t border-border" />
            )}
            <div
              className={cn(
                'space-y-2',
                index < sidebarConfig.length - 1 ? 'mb-4' : ''
              )}
            >
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-3"
                  >
                    <h3 className="px-3 text-xs font-normal tracking-wide text-muted-foreground capitalize">
                      {group.label}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={cn('space-y-1', isCollapsed && 'space-y-2')}>
                {group.items.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    onClick={onItemClick}
                  />
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {shouldShowFeedbackAction && (
        <div
          className={cn(
            'px-3 pt-4 border-t border-border',
            // keep a bit tighter vertical spacing when collapsed
            isCollapsed ? 'py-2' : ''
          )}
        >
          <button
            type="button"
            onClick={handleFeedbackClick}
            title="Share feedback"
            aria-label="Share feedback"
            className={cn(
              // group so we can expand the truncated text on hover
              'group flex w-full items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3 text-left shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              // collapsed state: center the icon and use slightly larger padding
              isCollapsed &&
                'items-center justify-center gap-0 border-none px-0 py-0 bg-none'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center transition-colors text-primary',
                !isCollapsed
                  ? 'h-10 w-10 shrink-0 rounded-full bg-primary/10 group-hover:bg-primary/15'
                  : 'h-9 w-9 bg-transparent rounded-none'
              )}
              aria-hidden="true"
            >
              <AqMessageNotificationSquare className="h-5 w-5" />
            </span>

            {!isCollapsed && (
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Share feedback
                </span>
                <span
                  className={cn(
                    'mt-0.5 block text-xs leading-relaxed text-muted-foreground truncate',
                    // on hover (group-hover) allow the text to wrap and show all lines
                    'group-hover:whitespace-normal group-hover:overflow-visible'
                  )}
                >
                  Tell us what is working well, what could be better, or any
                  problems you&apos;ve faced.
                </span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
