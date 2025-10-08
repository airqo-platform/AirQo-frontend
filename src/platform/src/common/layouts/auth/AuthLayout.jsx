'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';

/**
 * Auth Layout Component
 * Provides a specialized layout for authentication routes
 * Auth pages don't use the main dashboard layout with sidebar
 */
export default function AuthLayout({ children }) {
  const pathname = usePathname();

  // Get route configuration based on current pathname
  const routeConfig = LAYOUT_CONFIGS.AUTH[pathname] || DEFAULT_CONFIGS.AUTH;

  return (
    <div className="auth-layout min-h-screen">
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>

      {/* Auth pages will handle their own layout internally */}
      {children}
    </div>
  );
}
