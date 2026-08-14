'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Header } from '@/shared/components/header';
import { Sidebar } from '@/shared/components/sidebar';
import { GlobalSidebar } from '@/shared/components/global-sidebar';
import { FeedbackLauncher } from '@/modules/feedback';
import { useAppSelector } from '@/shared/hooks/redux';
import { useGlobalLoading } from '@/shared/providers/global-loading-provider';
import { useUser } from '@/shared/hooks/useUser';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBottomNav?: boolean;
}

export const MapLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  showBottomNav = false,
}) => {
  const theme = useAppSelector(state => state.theme);
  const { isLoggingOut } = useUser();
  useGlobalLoading(isLoggingOut, { priority: 100, delayMs: 0 });

  return (
    <>
      <div
        className={cn(
          'flex flex-col h-screen gap-2 px-1.5 pt-1.5 pb-0.5 overflow-hidden',
          theme.interfaceStyle === 'bordered' && 'border border-border'
        )}
      >
        {/* Fixed Header */}
        <Header hideOnScroll={false} />

        {/* Main Container with Sidebar and Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Desktop */}
          {showSidebar && (
            <motion.aside
              className="hidden md:block shrink-0"
              style={{ width: 64 }}
              animate={{ width: 64 }}
              initial={false}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Sidebar isCollapsed={true} hideToggle={true} />
            </motion.aside>
          )}

          {/* Main Content Area - Full Height for Map */}
          <div
            className={cn(
              'flex flex-col flex-1 min-h-0 min-w-0',
              showBottomNav && 'pb-[65px] md:pb-0'
            )}
          >
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
          {/* Footer at the end of the main container */}
          <FeedbackLauncher />
        </div>

        {/* Bottom Navigation intentionally hidden on map pages to avoid
            interfering with map and sidebar layouts on small screens. */}
      </div>

      {/* Global Sidebar */}
      <GlobalSidebar />
      {/*
       * MobileSidebar intentionally NOT rendered on map pages: the map's own
       * mobile layout already provides a dedicated 60dvh sidebar pane below
       * the map, and the full-screen MobileSidebar overlay would cover and
       * block the entire map on small screens.
       */}
    </>
  );
};
