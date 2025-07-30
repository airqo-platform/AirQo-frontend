import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { setToggleDrawer } from '@/lib/store/services/sideBar/SideBarSlice';
import AirqoLogo from '@/icons/airqo_logo.svg';
import { AqXClose, AqLogOut01 } from '@airqo/icons-react';
import LogoutUser from '@/core/HOC/LogoutUser';
import Card from '@/components/CardWrapper';
import UnifiedSidebarContent from './UnifiedSidebarContent';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import {
  getUserTypeFromPath,
  getMobileNavigationItems,
  getOrgSlugFromPath,
} from './sidebarConfig';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';

/**
 * Unified drawer component that works for all user types
 * This replaces AdminSideBarDrawer, OrganizationSideBarDrawer, and SideBarDrawer
 */
const UnifiedSideBarDrawer = ({ userType, isDarkMode = false }) => {
  const dispatch = useDispatch();
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowSize();

  // Determine user type from current route if not provided
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const resolvedUserType = userType || getUserTypeFromPath(pathname);

  // Get organization data for logo display when in organization context
  const isOrganizationContext = pathname.startsWith('/org/');

  // Always call useOrganization, but only use result when in org context
  let organization = null;
  try {
    const orgResult = useOrganization();
    organization = isOrganizationContext ? orgResult.organization : null;
  } catch {
    // not an org route or error occurred, use null
    organization = null;
  }

  // On tablet/desktop (md+), show all items since bottom nav is hidden
  // On mobile, exclude bottom nav items
  const isMobile = width < 768;

  const navigationItems = useMemo(() => {
    const excludeBottomNavItems = isMobile; // Only exclude on mobile

    if (resolvedUserType === 'organization') {
      const orgSlug = getOrgSlugFromPath(pathname);
      return getMobileNavigationItems(
        resolvedUserType,
        { orgSlug },
        excludeBottomNavItems,
      );
    } else {
      return getMobileNavigationItems(
        resolvedUserType,
        {},
        excludeBottomNavItems,
      );
    }
  }, [resolvedUserType, pathname, isMobile]);

  // Compute the drawer width based on the toggle state
  const drawerWidth = useMemo(
    () => (togglingDrawer ? 'w-72' : 'w-0'),
    [togglingDrawer],
  );

  const closeDrawer = useCallback(() => {
    dispatch(setToggleDrawer(false));
  }, [dispatch]);

  const handleLogout = useCallback(
    async (event) => {
      event.preventDefault();

      // Prevent multiple logout attempts
      if (isLoading) return;

      setIsLoading(true);
      try {
        await LogoutUser(dispatch, router);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, router, isLoading],
  );

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (togglingDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [togglingDrawer]);

  return (
    <>
      {togglingDrawer && (
        <button
          type="button"
          onClick={closeDrawer}
          className="absolute inset-0 w-full h-dvh opacity-50 bg-black-700 z-[999998] transition-all duration-200 ease-in-out"
        />
      )}
      <Card
        width={drawerWidth}
        className="fixed right-0 top-0 h-full z-[999999] border-l-grey-750 border-l-[1px] transition-all duration-200 ease-in-out overflow-hidden"
        contentClassName="flex p-2 lg:p-4 h-full flex-col overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden"
      >
        {/* Header */}
        <div className="pb-2 lg:pb-4 flex justify-between items-center">
          {/* Show organization logo if in org context, otherwise default AirQo logo */}
          {isOrganizationContext && organization?.logo ? (
            <img
              src={organization.logo}
              alt={`${organization.name} Logo`}
              className="w-[46.56px] h-8 object-contain"
              onError={(e) => {
                e.target.src = '/icons/airqo_logo.svg';
              }}
            />
          ) : (
            <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
          )}
          <button
            type="button"
            className="relative w-auto focus:outline-none p-1 lg:p-2"
            onClick={closeDrawer}
          >
            <AqXClose />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col justify-between h-full">
          <div className="mt-6 lg:mt-11 space-y-2 lg:space-y-3">
            <UnifiedSidebarContent
              isCollapsed={false}
              userType={resolvedUserType}
              isDarkMode={isDarkMode}
              customNavigationItems={navigationItems}
            />
          </div>

          {/* Logout Section */}
          <div className="mt-auto pb-4">
            <button
              type="button"
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-all duration-200 
                ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={handleLogout}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-3">
                <AqLogOut01 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default UnifiedSideBarDrawer;
