'use client';

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Header } from '@/shared/components/header';
import { Sidebar } from '@/shared/components/sidebar';
import { BottomNavigation } from '@/shared/components/ui/bottom-navigation';
import { SecondaryNavigation } from '@/shared/components/ui/secondary-navigation';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux';
import { toggleSidebar } from '@/shared/store/uiSlice';
import ThemeManager from '@/modules/themes/components/ThemeManager';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showBottomNav?: boolean;
}

export const MapLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  showBottomNav = true,
}) => {
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector(state => state.ui.sidebarCollapsed);
  const theme = useAppSelector(state => state.theme);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen gap-2 px-1.5 py-1.5 overflow-hidden',
        theme.interfaceStyle === 'bordered' && 'border border-border'
      )}
    >
      {/* Fixed Header */}
      <Header hideOnScroll={false} />

      {/* Secondary Navigation - Mobile Only */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-center justify-between h-12 px-4">
          <SecondaryNavigation />
        </div>
      </div>

      {/* Main Container with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        {showSidebar && (
          <motion.aside
            className="hidden md:block shrink-0"
            animate={{ width: true ? 64 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Sidebar isCollapsed={true} hideToggle={true} />
          </motion.aside>
        )}

        {/* Scrollable Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main
            className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden flex flex-col',
              className
            )}
          >
            {/* Content Container with proper padding */}
            <div className="flex-grow py-0.5 px-1">
              <div className="py-2 px-2 h-full rounded-md overflow-hidden">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {showBottomNav && (
        <div className="md:hidden shrink-0">
          <BottomNavigation />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && !sidebarCollapsed && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleSidebarToggle}
          />

          {/* Mobile Sidebar */}
          <motion.aside
            className="fixed top-0 left-0 z-50 h-full bg-background md:hidden"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ width: 256 }}
          >
            <div className="h-full overflow-y-auto border-r">
              <Sidebar />
            </div>
          </motion.aside>
        </>
      )}
      <ThemeManager />
    </div>
  );
};
