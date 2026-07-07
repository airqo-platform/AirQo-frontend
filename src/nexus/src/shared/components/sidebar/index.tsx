'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { SidebarContent, SidebarSkeleton } from './components';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';
import { useUserActions } from '@/shared/hooks';
import { useRBAC } from '@/shared/hooks';
import { SidebarProps } from './types';
import { useMediaQuery } from 'react-responsive';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  hideToggle = false,
  isCollapsed: propIsCollapsed,
  isLoading: propIsLoading,
}) => {
  const dispatch = useAppDispatch();
  const globalIsCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  const isCollapsed =
    propIsCollapsed !== undefined ? propIsCollapsed : globalIsCollapsed;
  const { activeGroup } = useUserActions();
  const { isLoading: rbacLoading } = useRBAC();
  const { status: sessionStatus } = useSession();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const pathname = usePathname();
  const isLoading = propIsLoading ?? rbacLoading;

  const handleToggle = React.useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleItemClick = React.useCallback(() => {
    // Close sidebar on mobile when navigation item is clicked
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  }, [isMobile, dispatch]);

  // Determine flow type and org slug - memoized to prevent unnecessary re-renders
  const { flow, orgSlug } = React.useMemo(() => {
    // Check if on system pages
    if (pathname.startsWith('/system')) {
      return { flow: 'system' as const, orgSlug: undefined };
    }

    // Check if on admin pages
    if (pathname.startsWith('/admin')) {
      return { flow: 'admin' as const, orgSlug: undefined };
    }

    if (!activeGroup) {
      return { flow: 'user' as const, orgSlug: undefined };
    }

    // Enhanced logic: Check organization slug first (more reliable than title)
    // If organizationSlug exists and is not 'airqo', it's an organization flow
    // Otherwise, it's a user flow (default AirQo group)
    const hasOrgSlug =
      activeGroup.organizationSlug &&
      activeGroup.organizationSlug.toLowerCase() !== 'airqo';

    return {
      flow: hasOrgSlug ? ('organization' as const) : ('user' as const),
      orgSlug: hasOrgSlug ? activeGroup.organizationSlug : undefined,
    };
  }, [activeGroup, pathname]);
  // Treat base and nested admin/system/org routes as protected so
  // exact base paths like '/admin' and '/system' are handled consistently
  // with the flow detection above (which uses startsWith('/admin')/('/system')).
  const isProtectedSidebarRoute =
    pathname.startsWith('/org') ||
    pathname.startsWith('/system') ||
    pathname.startsWith('/admin');
  const shouldWaitForActiveGroup = pathname.startsWith('/org/');
  const shouldShowLoadingSkeleton =
    isProtectedSidebarRoute &&
    (sessionStatus === 'loading' ||
      isLoading ||
      (shouldWaitForActiveGroup && !activeGroup));

  return (
    <div className={cn('flex h-full w-full flex-col relative', className)}>
      {!hideToggle && !isMobile && (
        <motion.div
          className="absolute z-50 top-4 right-[-12px]"
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="z-50 flex items-center justify-center w-6 h-6 border rounded-full">
            <button
              type="button"
              onClick={handleToggle}
              className="flex items-center justify-center w-full h-full p-1 transition-all duration-200 bg-background border border-border rounded-full shadow-md focus:outline-none hover:shadow-lg"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <AqChevronRight className="w-3 h-3 text-muted-foreground" />
              ) : (
                <AqChevronLeft className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* allow the toggle button to visually overflow outside the Card by NOT clipping on the outer container */}
      <Card
        className={cn(
          'flex h-full w-full flex-col',
          isCollapsed ? 'overflow-visible' : 'overflow-x-hidden overflow-y-auto'
        )}
      >
        {/* Navigation */}
        {shouldShowLoadingSkeleton ? (
          <SidebarSkeleton isCollapsed={isCollapsed} />
        ) : (
          <SidebarContent
            flow={flow}
            orgSlug={orgSlug}
            isCollapsed={isCollapsed}
            onItemClick={handleItemClick}
          />
        )}
      </Card>
    </div>
  );
};
