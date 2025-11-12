'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { NavItem } from './nav-item';
import { getSidebarConfig } from '../config';
import { SidebarContentProps } from '../types';
import { useRBAC } from '@/shared/hooks';

export const SidebarContent: React.FC<SidebarContentProps> = ({
  flow = 'user',
  orgSlug,
  isCollapsed = false,
  onItemClick,
  className,
}) => {
  const { hasRole } = useRBAC();

  // Get the appropriate sidebar configuration
  const sidebarConfig = React.useMemo(() => {
    let config = getSidebarConfig(flow);

    // Filter admin items based on permissions
    if (flow === 'admin') {
      config = config.map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Hide Organization Requests if user doesn't have AIRQO_SUPER_ADMIN role
          if (item.id === 'admin-dashboard') {
            return hasRole('AIRQO_SUPER_ADMIN');
          }
          return true;
        }),
      }));
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
  }, [flow, orgSlug, hasRole]);

  return (
    <div className={cn('flex-1 py-6', className)}>
      <div className={cn('', isCollapsed ? 'px-3' : 'px-3')}>
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
    </div>
  );
};
