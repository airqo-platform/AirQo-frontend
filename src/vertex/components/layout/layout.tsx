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
import Footer from './Footer';
import { OrganizationSetupBanner } from './OrganizationSetupBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] =
    useState(false);
  const [activeModule, setActiveModule] = useState('devices');
  const pathname = usePathname();
  const router = useRouter();

  const { isSwitching, switchingTo } = useAppSelector(
    state => state.user.organizationSwitching
  );

  const isLoggingOut = useAppSelector(state => state.user.isLoggingOut);

  useEffect(() => {
    // Determine active module based on current pathname
    if (
      pathname.startsWith('/admin/')
    ) {
      setActiveModule('admin');
    } else {
      // Default to devices module (home, my-devices, claim)
      setActiveModule('devices');
    }
  }, [pathname]);

  const handleModuleChange = (module: string) => {
    if (module === activeModule) {
      setIsPrimarySidebarOpen(false);
      return;
    }
    setActiveModule(module);
    setIsPrimarySidebarOpen(false);

    // Navigate to module default route
    const moduleRoutes: Record<string, string> = {
      devices: '/home',
      admin: '/admin/shipping',
    };

    router.push(moduleRoutes[module] || '/home');
  };

  const toggleSecondarySidebar = () => {
    setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
  };

  // Only show loading state when explicitly logging out
  // We trust AuthWrapper to handle authentication state
  // and we show skeletons for missing data instead of blocking the whole UI
  if (isLoggingOut) {
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
      {/* Organization Setup Banner - Fixed at bottom */}
      <OrganizationSetupBanner />

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
        <Footer />
      </main>
    </div>
  );
}
