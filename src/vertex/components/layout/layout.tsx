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
import { OrganizationSetupBanner } from './organization-setup-banner';

import { setLastActiveModule } from '@/core/utils/userPreferences';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isPrimarySidebarOpen, setIsPrimarySidebarOpen] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] =
    useState(false);
  const pathname = usePathname();
  const [activeModule, setActiveModule] = useState<'devices' | 'admin'>(
    pathname?.startsWith('/admin/') ? 'admin' : 'devices',
  );
  const router = useRouter();

  const { isSwitching, switchingTo } = useAppSelector(
    state => state.user.organizationSwitching
  );

  const isLoggingOut = useAppSelector(state => state.user.isLoggingOut);
  const userDetails = useAppSelector(state => state.user.userDetails);

  useEffect(() => {
    if (!pathname) return;

    const newModule: 'devices' | 'admin' = pathname.startsWith('/admin/')
      ? 'admin'
      : 'devices';

    // Only update state if it's actually changing
    setActiveModule(prev => (prev === newModule ? prev : newModule));

    // Save preference when module changes
    const email = userDetails?.email || userDetails?.userName;
    if (email) {
      setLastActiveModule(newModule, email);
    }
  }, [pathname, userDetails]);

  const handleModuleChange = (module: string) => {
    if (module === activeModule) {
      setIsPrimarySidebarOpen(false);
      return;
    }
    // Don't set state here - let the URL change drive it
    setIsPrimarySidebarOpen(false);

    // Navigate to module default route
    const moduleRoutes: Record<string, string> = {
      devices: '/home',
      admin: '/admin/networks',
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
        className={`flex-1 transition-all duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'} overflow-y-auto mt-[calc(50px+var(--vertex-ui-top-offset))] md:mt-[calc(50px+var(--vertex-ui-top-offset))] lg:mt-[calc(48px+var(--vertex-ui-top-offset))] pb-20 md:pb-0`}
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
