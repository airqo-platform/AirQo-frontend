'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { SidebarContent } from './components';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';
import { useUserActions } from '@/shared/hooks';
import { SidebarProps } from './types';
import { useMediaQuery } from 'react-responsive';

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  hideToggle = false,
  isCollapsed: propIsCollapsed,
}) => {
  const dispatch = useAppDispatch();
  const globalIsCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  const isCollapsed =
    propIsCollapsed !== undefined ? propIsCollapsed : globalIsCollapsed;
  const { activeGroup } = useUserActions();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleToggle = React.useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleItemClick = React.useCallback(() => {
    // No longer auto-close on mobile since it's handled by global MobileSidebar
  }, []);

  // Determine flow type and org slug - memoized to prevent unnecessary re-renders
  const { flow, orgSlug } = React.useMemo(() => {
    if (!activeGroup) {
      return { flow: 'user' as const, orgSlug: undefined };
    }

    const isAirQoGroup =
      // Check if title matches AIRQO (case insensitive)
      activeGroup.title?.toLowerCase() === 'airqo' ||
      // Check if organization slug is airqo
      activeGroup.organizationSlug?.toLowerCase() === 'airqo' ||
      // Check if no organization slug (default user flow)
      !activeGroup.organizationSlug ||
      // Fallback: check if title contains airqo
      activeGroup.title?.toLowerCase().includes('airqo');

    return {
      flow: isAirQoGroup ? ('user' as const) : ('organization' as const),
      orgSlug: activeGroup.organizationSlug || undefined,
    };
  }, [activeGroup]);

  return (
    <>
      <motion.div
        className={cn('flex h-full flex-col relative', className)}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* allow the toggle button to visually overflow outside the Card by NOT clipping on the outer container */}
        <Card className="flex flex-col h-full mb-[2px] overflow-x-hidden overflow-y-auto">
          <motion.div
            className="absolute z-50 top-4 right-[-12px]"
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            {!hideToggle && !isMobile && (
              <div className="z-50 flex items-center justify-center w-6 h-6 border rounded-full">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="flex items-center justify-center w-full h-full p-1 transition-all duration-200 bg-background border border-border rounded-full shadow-md focus:outline-none hover:shadow-lg"
                  aria-label={
                    isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                  }
                >
                  {isCollapsed ? (
                    <AqChevronRight className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <AqChevronLeft className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <SidebarContent
            flow={flow}
            orgSlug={orgSlug}
            isCollapsed={isCollapsed}
            onItemClick={handleItemClick}
          />
        </Card>
      </motion.div>
    </>
  );
};
