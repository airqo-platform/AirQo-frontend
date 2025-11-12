'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Header } from '@/shared/components/header';
import { Sidebar } from '@/shared/components/sidebar';
import { GlobalSidebar } from '@/shared/components/global-sidebar';
import { BottomNavigation } from '@/shared/components/ui/bottom-navigation';
import { useAppSelector } from '@/shared/hooks/redux';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { useUser } from '@/shared/hooks/useUser';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBottomNav?: boolean;
}

export const MapLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  showBottomNav = true,
}) => {
  const theme = useAppSelector(state => state.theme);
  const { isLoading: userLoading, isLoggingOut } = useUser();

  return (
    <>
      {/* Full-screen loading overlay during logout */}
      <LoadingOverlay isVisible={isLoggingOut} />

      {!isLoggingOut && (
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
                animate={{ width: 64 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Sidebar isCollapsed={true} hideToggle={true} />
              </motion.aside>
            )}

            {/* Main Content Area - Full Height for Map */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 flex flex-col">
                {userLoading ? (
                  <div className="flex items-center justify-center flex-1">
                    <LoadingSpinner size={28} />
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation - Mobile Only */}
          {showBottomNav && (
            <div className="md:hidden shrink-0">
              <BottomNavigation />
            </div>
          )}
        </div>
      )}

      {/* Global Sidebar */}
      <GlobalSidebar />
    </>
  );
};
