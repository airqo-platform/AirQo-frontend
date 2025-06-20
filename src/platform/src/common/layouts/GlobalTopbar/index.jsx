'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';
import MenuBarIcon from '@/icons/menu_bar';
import MenuIcon from '@/icons/Actions/menu';
import UserProfileDropdown from '../components/UserProfileDropdown';
import TopbarOrganizationDropdown from '../components/TopbarOrganizationDropdown';
import {
  setTogglingGlobalDrawer,
  setToggleDrawer,
  setSidebar,
  setGlobalSidebarOpen,
  toggleGlobalSidebar,
  setGlobalDrawerOpen,
  toggleGlobalDrawerMobile,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import GroupLogo from '@/common/components/GroupLogo';
import CardWrapper from '@/common/components/CardWrapper';
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import { isAirQoGroup } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

/**
 * Unified Global Topbar Component
 * Works for both individual users and organizations
 * Contains profile dropdown, organization logo, menu button, and organization dropdown
 */
const GlobalTopbar = ({
  topbarTitle,
  onLogoClick,
  homeNavPath = '/user/Home',
  customActions,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const { theme, systemTheme } = useTheme();

  // Get unified group provider for AirQo safety check
  const { activeGroup, userGroups, switchToGroup } = useUnifiedGroup();

  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const styles = useMemo(
    () => ({
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200',
      hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    }),
    [isDarkMode],
  );
  const togglingDrawer = useSelector((state) => {
    try {
      return state?.sidebar?.togglingDrawer || false;
    } catch {
      return false;
    }
  });
  const togglingGlobalDrawer = useSelector((state) => {
    try {
      return state?.sidebar?.toggleGlobalDrawer || false;
    } catch {
      return false;
    }
  });

  // New selectors for global sidebar (completely separate)
  const isGlobalSidebarOpen = useSelector((state) => {
    try {
      return state?.sidebar?.isGlobalSidebarOpen || false;
    } catch {
      return false;
    }
  });
  const isGlobalDrawerOpen = useSelector((state) => {
    try {
      return state?.sidebar?.isGlobalDrawerOpen || false;
    } catch {
      return false;
    }
  });
  // Client-side only state to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  // Detect context (individual vs organization)
  const isOrganization = pathname.startsWith('/org/');

  // Check if we're on the create-organization route
  const isCreateOrganizationRoute = pathname === '/create-organization';

  // Check if we're in admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  // Only render after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safety check: Ensure AirQo is active group when on create-organization route
  useEffect(() => {
    if (
      mounted &&
      isCreateOrganizationRoute &&
      userGroups?.length > 0 &&
      activeGroup
    ) {
      const airqoGroup = userGroups.find(isAirQoGroup);

      // If AirQo group exists and is not currently active, switch to it
      if (airqoGroup && activeGroup._id !== airqoGroup._id) {
        logger.info(
          'GlobalTopbar: Safety check - switching to AirQo group on create-organization route',
          {
            currentActiveGroup: activeGroup.grp_title,
            airqoGroupId: airqoGroup._id,
            airqoGroupTitle: airqoGroup.grp_title,
          },
        );

        // Switch to AirQo group without navigation
        switchToGroup(airqoGroup, { navigate: false }).catch((error) => {
          logger.error(
            'Failed to switch to AirQo group during safety check:',
            error,
          );
        });
      }
    }
  }, [
    mounted,
    isCreateOrganizationRoute,
    userGroups,
    activeGroup,
    switchToGroup,
  ]);
  const handleDrawer = useCallback(
    (e) => {
      e.preventDefault();
      try {
        if (width < 1024) {
          // Mobile: Use the new global drawer mobile action
          dispatch(toggleGlobalDrawerMobile());
        } else {
          // Desktop: Use the new global sidebar action
          dispatch(toggleGlobalSidebar());
        }
      } catch (error) {
        console.error('GlobalTopbar: Error toggling drawer:', error);
      }
    },
    [dispatch, width],
  );

  const handleLogoClick = useCallback(() => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      router.push(homeNavPath);
    }
  }, [onLogoClick, router, homeNavPath]);

  // Shared Logo Component to avoid duplication
  const LogoComponent = useCallback(
    ({ className = '', buttonProps = {} }) => (
      <Button
        paddingStyles="p-0 m-0"
        onClick={handleLogoClick}
        variant="text"
        className={`inline-flex items-center justify-center ${className}`}
        {...buttonProps}
      >
        <GroupLogo className="flex-shrink-0" />
      </Button>
    ),
    [handleLogoClick],
  );
  // Shared Menu Button Component
  const MenuButton = useCallback(
    ({ isMobile = false, className = '' }) => (
      <Button
        paddingStyles="p-0 m-0"
        className={`inline-flex items-center justify-center focus:outline-none min-h-[32px] ${className}`}
        onClick={handleDrawer}
        variant="text"
        aria-label="Open navigation menu"
      >
        <span
          className={
            isMobile
              ? 'p-1 inline-flex items-center justify-center'
              : 'p-2 m-0 inline-flex items-center justify-center'
          }
        >
          {isMobile ? (
            <MenuBarIcon
              fill={isDarkMode ? '#fff' : '#1C1D20'}
              width={18}
              height={18}
            />
          ) : (
            <MenuIcon width={20} height={20} />
          )}
        </span>
      </Button>
    ),
    [handleDrawer, isDarkMode],
  );

  // Don't render until client-side hydration is complete to prevent mismatch
  if (!mounted) {
    return (
      <>
        {/* Main Topbar Loading State */}
        <div className="fixed top-0 left-0 right-0 z-[99] p-1">
          <CardWrapper className="w-full shadow-sm animate-pulse" padding="p-2">
            {' '}
            <div className="flex justify-between items-center">
              <div className="block lg:hidden relative z-10 w-full">
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
                <div className="flex items-center gap-[10px]">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="hidden lg:flex gap-2 items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="lg:hidden w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardWrapper>
        </div>{' '}
        {/* Mobile Bar Loading State */}
        <div className="fixed top-20 left-0 right-0 z-[998] lg:hidden p-1">
          <CardWrapper
            className="w-full shadow-sm animate-pulse border-t"
            padding="py-1 px-2"
          >
            <div className="flex justify-between items-center h-8">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardWrapper>
        </div>
      </>
    );
  }
  return (
    <div className="fixed top-0 left-0  right-0 z-[999]">
      {' '}
      {/* Main Global Topbar */}{' '}
      <div className="p-1">
        {' '}
        <CardWrapper
          className={`w-full ${styles.background}`}
          padding="py-1 px-4"
        >
          {' '}
          <div
            id="global-topbar-nav"
            className="flex justify-between items-center min-h-[48px] h-full"
          >
            {' '}
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-start flex-shrink-0">
              {' '}
              <LogoComponent className="flex-shrink-0" />
            </div>
            {/* Desktop Left Section - Menu Button + Logo */}
            <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
              <div className="flex items-center gap-[10px]">
                {/* Menu Button */}
                <MenuButton isMobile={false} />
                {/* Logo */}
                <LogoComponent
                  className={`flex items-center justify-center ${styles.text}`}
                />
                {/* Title (optional) */}
                {topbarTitle && (
                  <div className={`ml-4 ${styles.text} flex items-center`}>
                    {topbarTitle}
                  </div>
                )}
              </div>
            </div>{' '}
            {/* Desktop Right Section - Organization Dropdown + Custom Actions + Profile Dropdown */}
            <div className="hidden lg:flex gap-2 items-center justify-center h-full">
              {' '}
              {/* Organization Dropdown - Show for users with multiple groups but hide for create-organization route and admin routes */}
              {!isCreateOrganizationRoute && !isAdminRoute && (
                <TopbarOrganizationDropdown className="mr-2" />
              )}
              {customActions && (
                <div className="flex items-center justify-center h-full">
                  {customActions}
                </div>
              )}
              <UserProfileDropdown
                dropdownAlign="right"
                showUserInfo={true}
                isOrganization={isOrganization}
                isCreateOrganizationRoute={isCreateOrganizationRoute}
                isAdminRoute={isAdminRoute}
              />
            </div>{' '}
            {/* Mobile Profile Dropdown - Moved to main topbar */}
            <div className="lg:hidden flex items-center justify-center h-full">
              {' '}
              <UserProfileDropdown
                dropdownAlign="right"
                showUserInfo={false}
                isOrganization={isOrganization}
                isCreateOrganizationRoute={isCreateOrganizationRoute}
                isAdminRoute={isAdminRoute}
              />
            </div>
          </div>
        </CardWrapper>
      </div>
      {/* Mobile Navigation Bar - Below main topbar with gap */}
      <div className="lg:hidden p-1">
        <CardWrapper
          className={`w-full ${styles.background} ${styles.border} border-t`}
          padding="py-1 px-2"
        >
          <div className="flex justify-between items-center min-h-[40px] h-full">
            {/* Mobile Menu Button */}
            <div className="flex items-center justify-center h-full">
              <MenuButton isMobile={true} />
            </div>
            {/* Title (optional) */}
            {topbarTitle && (
              <div
                className={`ml-3 text-sm font-medium ${styles.text} flex-1 truncate flex items-center h-full`}
              >
                {topbarTitle}
              </div>
            )}{' '}
            {/* Organization Dropdown for mobile - hide for create-organization route and admin routes */}
            {!isCreateOrganizationRoute && !isAdminRoute && (
              <div className="flex items-center justify-center h-full">
                <TopbarOrganizationDropdown
                  showTitle={false}
                  className="mr-2"
                />
              </div>
            )}
            {/* Custom actions for mobile if any */}
            {customActions && (
              <div className="flex gap-1 items-center justify-center h-full">
                {customActions}
              </div>
            )}
          </div>
        </CardWrapper>
      </div>
    </div>
  );
};

GlobalTopbar.propTypes = {
  topbarTitle: PropTypes.string,
  onLogoClick: PropTypes.func,
  homeNavPath: PropTypes.string,
  customActions: PropTypes.node,
};

export default React.memo(GlobalTopbar);
