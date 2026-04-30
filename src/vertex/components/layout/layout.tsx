'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/core/redux/hooks';
import { motion } from 'framer-motion';
import Topbar from './topbar';
import PrimarySidebar from './primary-sidebar';
import SecondarySidebar from './secondary-sidebar';
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
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const [activeModule, setActiveModule] = useState<'devices' | 'admin'>(
    pathname?.startsWith('/admin/') ? 'admin' : 'devices',
  );
  const router = useRouter();

  const { isSwitching } = useAppSelector(
    state => state.user.organizationSwitching
  );

  const isLoggingOut = useAppSelector(state => state.user.isLoggingOut);
  const userDetails = useAppSelector(state => state.user.userDetails);

  useEffect(() => {
    if (!pathname) return;

    // Reset navigation shimmer on path change
    setIsNavigating(false);

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

  useEffect(() => {
    // Warm key routes so sidebar navigation resolves near-instantly.
    const routesToPrefetch = [
      '/home',
      '/devices/my-devices',
      '/devices/claim',
      '/cohorts',
      '/admin/networks',
      '/admin/networks/requests',
      '/admin/cohorts',
      '/admin/sites',
      '/admin/grids',
      '/admin/shipping',
    ];

    routesToPrefetch.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  const handleModuleChange = (module: string, targetPath?: string) => {
    const targetModule = module as 'devices' | 'admin';
    if (targetModule === activeModule && !targetPath) {
      setIsPrimarySidebarOpen(false);
      return;
    }

    // Keep module switch path-driven to avoid nav/content mismatch during transitions.
    setIsPrimarySidebarOpen(false);

    // Navigate to module default route or specific target
    const defaultRoutes: Record<string, string> = {
      devices: '/home',
      admin: '/admin/networks',
    };

    const nextPath = targetPath || defaultRoutes[module] || '/home';
    setIsNavigating(true);
    router.prefetch(nextPath);
    router.push(nextPath);
  };

  const toggleSecondarySidebar = () => {
    setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed);
  };

  return (
    <>
      {isLoggingOut ? (
        <div className="flex justify-center items-center overflow-hidden min-h-screen h-screen bg-background">
          <SessionLoadingState />
        </div>
      ) : (
        <div className="flex overflow-hidden min-h-screen h-screen bg-background">
          {(isSwitching || isNavigating) && (
             <div className="fixed top-0 left-0 right-0 z-[10001]">
                <div className="h-1 bg-primary/20 w-full overflow-hidden">
                   <div className="h-full bg-primary animate-shimmer"></div>
                </div>
             </div>
          )}
          <OrganizationSetupBanner />
          <Topbar onMenuClick={() => setIsPrimarySidebarOpen(true)} />
          <PrimarySidebar
            isOpen={isPrimarySidebarOpen}
            onClose={() => setIsPrimarySidebarOpen(false)}
            activeModule={activeModule}
            onModuleChange={handleModuleChange}
            onNavigate={() => setIsNavigating(true)}
          />
          <SecondarySidebar
            isCollapsed={isSecondarySidebarCollapsed}
            toggleSidebar={toggleSecondarySidebar}
            activeModule={activeModule}
            onNavigate={() => setIsNavigating(true)}
          />
          <main
            data-vertex-main
            className={`flex-1 transition-[margin-left] duration-300 ease-in-out bg-background w-full flex flex-col ${isSecondarySidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'} overflow-y-auto mt-[calc(50px+var(--vertex-ui-top-offset))] md:mt-[calc(50px+var(--vertex-ui-top-offset))] lg:mt-[calc(48px+var(--vertex-ui-top-offset))] pb-20 md:pb-0`}
          >
            <div
              className={`flex-1 w-full bg-background max-w-7xl mx-auto flex flex-col gap-4 md:gap-8 px-3 py-3 md:px-2 lg:py-6 lg:px-6`}
            >
              <ErrorBoundary>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex-1 w-full flex flex-col"
                >
                  {children}
                </motion.div>
              </ErrorBoundary>
            </div>
            <Footer />
          </main>
        </div>
      )}
    </>
  );
}
