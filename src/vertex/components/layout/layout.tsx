'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isSwitching, switchingTo } = useAppSelector(
    state => state.user.organizationSwitching
  );

  const isInitialized = useAppSelector(state => state.user.isInitialized);
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);
  const isLoggingOut = useAppSelector(state => state.user.isLoggingOut);

  useEffect(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (pathname.startsWith('/admin/')) {
      setActiveModule('admin');
    } else {
      setActiveModule('network');
    }
    setIsPageLoading(false);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [pathname]);

  const handleModuleChange = (module: string) => {
    if (module === activeModule) {
      setIsPrimarySidebarOpen(false);
      return;
    }
    setIsPageLoading(true);
    setActiveModule(module);
    setIsPrimarySidebarOpen(false);

    // Safety timeout in case navigation fails or is cancelled
    loadingTimeoutRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, 3000);

    if (module === 'admin') {
      router.push('/admin/networks');
    } else {
      router.push('/home');
    }
  };

  const toggleSecondarySidebar = () => {
    setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
  };

  if (!isInitialized || !isAuthenticated || isLoggingOut) {
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
        className={`flex-1 transition-all duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'} overflow-y-auto mt-[50px] md:mt-[50px] lg:mt-12 pb-20 md:pb-0
        }`}
      >
        <div
          className={`flex-1 w-full bg-background max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-6 lg:px-6`}
        >
          <ErrorBoundary>
            {isPageLoading ? (
              <div className="flex justify-center items-center h-full min-h-[60vh]">
                <SessionLoadingState />
              </div>
            ) : (
              children
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
