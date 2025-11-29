'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/core/redux/hooks';
import Topbar from './topbar';
import PrimarySidebar from './primary-sidebar';
import SecondarySidebar from './secondary-sidebar';
import OrganizationLoadingState from './loading/org-loading';
import SessionLoadingState from './loading/session-loading';
import ErrorBoundary from '../shared/ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] =
    useState(false);
  const [activeModule, setActiveModule] = useState('network');
  const pathname = usePathname();
  const router = useRouter();

  const { isSwitching, switchingTo } = useAppSelector(
    state => state.user.organizationSwitching
  );

  const isInitialized = useAppSelector(state => state.user.isInitialized);
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);
  const isLoggingOut = useAppSelector(state => state.user.isLoggingOut);
  const isContextLoading = useAppSelector(state => state.user.isContextLoading);
  const userDetails = useAppSelector(state => state.user.userDetails);

  useEffect(() => {
    if (pathname.startsWith('/admin/')) {
      setActiveModule('admin');
    } else {
      setActiveModule('network');
    }
  }, [pathname]);

  const handleModuleChange = (module: string) => {
    if (module === activeModule) {
      setIsPrimarySidebarOpen(false);
      return;
    }
    setActiveModule(module);
    setIsPrimarySidebarOpen(false);

    if (module === 'admin') {
      router.push('/admin/networks');
    } else {
      router.push('/home');
    }
  };

  const toggleSecondarySidebar = () => {
    setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
  };

  // Show loading state when:
  // 1. Not initialized, not authenticated, or logging out
  // 2. Authenticated and initialized but context is still loading AND we don't have persisted user data
  // This prevents showing loading screen when user returns after inactivity,
  // as we have persisted data and can render immediately while background refetch happens
  const shouldShowInitialLoading =
    !isInitialized ||
    !isAuthenticated ||
    isLoggingOut ||
    (isAuthenticated && isInitialized && isContextLoading && !userDetails);

  if (shouldShowInitialLoading) {
    return (
      <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
        <SessionLoadingState />
      </div>
    );
  }

  if (isSwitching) {
    return (
      <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
        <OrganizationLoadingState organizationName={switchingTo} />
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden min-h-screen h-screen bg-background">
      <Topbar onMenuClick={() => setIsPrimarySidebarOpen(true)} />
      <PrimarySidebar
        isOpen={isPrimarySidebarOpen}
        onClose={() => setIsPrimarySidebarOpen(false)}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      <SecondarySidebar
        isCollapsed={isSecondarySidebarCollapsed}
        toggleSidebar={toggleSecondarySidebar}
        activeModule={activeModule}
      />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'} overflow-y-auto mt-[50px] md:mt-[50px] lg:mt-12 pb-20 md:pb-0`}
      >
        <div
          className={`flex-1 w-full bg-background max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-6 lg:px-6`}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
