'use client';

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Header } from '@/shared/components/header';
import { Sidebar } from '@/shared/components/sidebar';
import { GlobalSidebar } from '@/shared/components/global-sidebar';
import { MobileSidebar } from '@/shared/components/ui/mobile-sidebar';
import { BottomNavigation } from '@/shared/components/ui/bottom-navigation';
import { SecondaryNavigation } from '@/shared/components/ui/secondary-navigation';
import { Footer } from '@/shared/components/ui/footer';
import { useAppSelector } from '@/shared/hooks/redux';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { useUser } from '@/shared/hooks/useUser';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showBottomNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  showBottomNav = true,
}) => {
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
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

          {/* Secondary Navigation - Mobile Only */}
          <SecondaryNavigation className="z-30 md:hidden" />

          {/* Main Container with Sidebar and Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Desktop */}
            {showSidebar && (
              <motion.aside
                className="hidden md:block shrink-0"
                animate={{ width: sidebarCollapsed ? 64 : 256 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <Sidebar />
              </motion.aside>
            )}

            {/* Scrollable Main Content Area */}
            <div className="flex flex-col flex-1 min-h-0">
              <main
                className={cn(
                  'flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-16 md:pb-0',
                  className
                )}
              >
                {/* Content Container with proper padding */}
                <div className="flex-grow">
                  <div
                    className={cn(
                      'container px-1 py-6 mx-auto md:px-6 lg:px-8',
                      theme.contentLayout === 'compact'
                        ? 'max-w-5xl'
                        : 'max-w-7xl'
                    )}
                  >
                    {userLoading ? (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner size={28} />
                      </div>
                    ) : (
                      children
                    )}
                  </div>
                </div>
                {/* Footer at the end of the main container */}
                <Footer />
              </main>
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
      {showSidebar && <MobileSidebar />}
    </>
  );
};
