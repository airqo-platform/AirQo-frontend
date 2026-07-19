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
import { NotificationBanner } from '@/shared/components/NotificationBanner';
import { useAppSelector } from '@/shared/hooks/redux';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { useUser } from '@/shared/hooks/useUser';
import { MaintenanceBanner } from '../components';
import { FeedbackLauncher } from '@/modules/feedback';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showBottomNav?: boolean;
  showHeaderAuthControlsOnlyWhenAuthenticated?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  showBottomNav = true,
  showHeaderAuthControlsOnlyWhenAuthenticated = false,
}) => {
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  const theme = useAppSelector(state => state.theme);
  const { isLoading: userLoading, isLoggingOut } = useUser();

  return (
    <>
      {/* Full-screen loading overlay during logout */}
      <LoadingOverlay isVisible={isLoggingOut} delayMs={0} />

      {!isLoggingOut && (
        <>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100000] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Skip to main content
          </a>

          <div
            className={cn(
              'flex flex-col h-screen gap-2 px-1.5 pt-1.5 pb-0.5 overflow-hidden',
              theme.interfaceStyle === 'bordered' && 'border border-border'
            )}
          >
            {/* Fixed Header */}
            <Header
              hideOnScroll={false}
              showAuthControlsOnlyWhenAuthenticated={
                showHeaderAuthControlsOnlyWhenAuthenticated
              }
            />

            {/* Secondary Navigation - Mobile Only */}
            <SecondaryNavigation className="z-30 md:hidden" />

            {/* Main Container with Sidebar and Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar - Desktop */}
              {showSidebar && (
                <motion.aside
                  className="hidden md:block shrink-0"
                  style={{ width: sidebarCollapsed ? 64 : 256 }}
                  animate={{ width: sidebarCollapsed ? 64 : 256 }}
                  initial={false}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Sidebar />
                </motion.aside>
              )}

              {/* Scrollable Main Content Area */}
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <main
                  id="main-content"
                  className={cn(
                    'flex-1 overflow-y-auto overflow-x-hidden flex flex-col',
                    className
                  )}
                >
                  <MaintenanceBanner />
                  {/* Content Container with proper padding */}
                  <div className="flex-grow w-full max-w-full">
                    <div
                      className={cn(
                        'container px-1 py-6 mx-auto md:px-6 lg:px-8 w-full max-w-full',
                        theme.contentLayout === 'compact'
                          ? 'max-w-5xl'
                          : 'max-w-7xl'
                      )}
                    >
                      {userLoading ? (
                        // Show a subtle skeleton while user data loads rather than
                        // replacing children entirely, which would cause a content flash.
                        <div className="space-y-4 animate-pulse" aria-hidden>
                          <div className="h-8 bg-secondary rounded-md w-48" />
                          <div className="h-4 bg-secondary rounded w-72" />
                          <div className="h-4 bg-secondary rounded w-64" />
                          <div className="h-32 bg-secondary rounded-lg w-full mt-6" />
                        </div>
                      ) : (
                        <>
                          <NotificationBanner
                            type="pending-invites"
                            className="mb-6"
                          />
                          {children}
                        </>
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

            <FeedbackLauncher />
          </div>

          <GlobalSidebar />
        </>
      )}

      {showSidebar && <MobileSidebar />}
    </>
  );
};
