'use client';
import { usePathname, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import AuthenticatedSideBar from '@/common/layouts/SideBar/AuthenticatedSidebar';
import GlobalTopbar from '@/common/layouts/GlobalTopbar';
import GlobalSideBarDrawer from '@/common/layouts/GlobalTopbar/sidebar';
import { UnifiedSideBarDrawer, UnifiedSidebarContent } from '../SideBar';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import Footer from '@/common/layouts/components/Footer';
import useUserPreferences from '@/core/hooks/useUserPreferences';
import useInactivityLogout from '@/core/hooks/useInactivityLogout';
import useMaintenanceStatus from '@/core/hooks/useMaintenanceStatus';
import {
  useGetActiveGroup,
  useOrganization,
} from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { ThemeCustomizer } from '@/common/features/theme-customizer/components/ThemeCustomizer';
import { THEME_LAYOUT } from '@/common/features/theme-customizer/constants/themeConstants';
import { LAYOUT_CONFIGS, DEFAULT_CONFIGS } from '../layoutConfigs';
import { motion } from 'framer-motion';

export default function UnifiedPagesLayout({ children }) {
  'use client';
  const pathname = usePathname();
  const params = useParams();
  const { userID } = useGetActiveGroup();

  // Guarded call to useOrganization to prevent runtime errors on non-/org routes
  let organization = null;
  try {
    const orgResult = useOrganization();
    organization = orgResult.organization;
  } catch {
    // not an org route, ignore
  }

  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const { maintenance } = useMaintenanceStatus();
  const isMapPage = ['/user/map', '/map'].includes(pathname);
  const isOrganizationContext = pathname.startsWith('/org/');
  const orgSlug = params?.org_slug || '';

  const getRouteConfig = () => {
    if (isOrganizationContext) {
      const normalized = pathname.replace(`/org/${orgSlug}`, '/org/[org_slug]');
      return (
        LAYOUT_CONFIGS.ORGANIZATION?.[normalized] ||
        DEFAULT_CONFIGS.ORGANIZATION
      );
    }

    if (LAYOUT_CONFIGS.DASHBOARD?.[pathname])
      return LAYOUT_CONFIGS.DASHBOARD[pathname];
    if (LAYOUT_CONFIGS.MAP?.[pathname]) return LAYOUT_CONFIGS.MAP[pathname];
    return DEFAULT_CONFIGS.DASHBOARD;
  };
  const routeConfig = getRouteConfig();

  useUserPreferences();
  useInactivityLogout(userID);

  const { layout } = useTheme();
  const containerClasses = isMapPage
    ? ''
    : layout === THEME_LAYOUT.COMPACT
      ? 'max-w-7xl mx-auto flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8'
      : 'w-full flex flex-col gap-8 px-4 py-4 md:px-6 lg:py-8 lg:px-8';

  const logoComponent =
    isOrganizationContext && organization?.logo ? (
      <img
        src={organization.logo}
        alt={`${organization.name} Logo`}
        className="w-[46.56px] h-8 object-contain"
        onError={(e) => {
          e.target.src = '/icons/airqo_logo.svg';
        }}
      />
    ) : null;

  const homeNavPath = isOrganizationContext
    ? `/org/${orgSlug}/dashboard`
    : '/user/Home';

  return (
    <div className="flex overflow-hidden min-h-screen h-screen bg-background">
      <Head>
        <title>{routeConfig.pageTitle}</title>
        <meta property="og:title" content={routeConfig.pageTitle} key="title" />
      </Head>

      <GlobalTopbar
        topbarTitle={routeConfig.topbarTitle}
        logoComponent={logoComponent}
        homeNavPath={homeNavPath}
      />

      <aside className="fixed left-0 top-36 lg:top-[60px] z-50 text-sidebar-text transition-all duration-300 ease-in-out">
        <AuthenticatedSideBar>
          <UnifiedSidebarContent
            userType={isOrganizationContext ? 'organization' : 'user'}
            isCollapsed={isCollapsed}
          />
        </AuthenticatedSideBar>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ease-in-out pt-36 lg:pt-16 bg-background w-full flex flex-col
          ${isMapPage ? 'overflow-hidden' : 'overflow-y-auto'}
          ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[256px]'}`}
      >
        <div className={`flex-1 w-full bg-background ${containerClasses}`}>
          {maintenance && <MaintenanceBanner maintenance={maintenance} />}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-text h-full"
          >
            {children}
          </motion.div>
        </div>

        {!isMapPage && <Footer />}
      </main>

      <UnifiedSideBarDrawer
        userType={isOrganizationContext ? 'organization' : 'user'}
      />
      <GlobalSideBarDrawer />
      <ThemeCustomizer />
    </div>
  );
}
