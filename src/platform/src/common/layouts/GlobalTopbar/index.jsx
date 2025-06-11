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
import OrganizationLoadingOverlay from '@/common/components/OrganizationLoadingOverlay';
import {
  setTogglingGlobalDrawer,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import GroupLogo from '@/common/components/GroupLogo';
import CardWrapper from '@/common/components/CardWrapper';

/**
 * Unified Global Topbar Component
 * Works for both individual users and organizations
 * Contains profile dropdown, organization logo, menu button, and organization dropdown
 */
const GlobalTopbar = ({
  topbarTitle,
  logoComponent,
  onLogoClick,
  homeNavPath = '/user/Home',
  customActions,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const { theme, systemTheme } = useTheme();

  // Organization loading state
  const [organizationLoading, setOrganizationLoading] = useState({
    isLoading: false,
    organizationName: '',
    message: 'Switching organizations...',
  });

  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const styles = useMemo(
    () => ({
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200',
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
      return state?.sidebar?.togglingGlobalDrawer || false;
    } catch {
      return false;
    }
  });

  // Client-side only state to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect context (individual vs organization)
  const isOrganization = pathname.startsWith('/org/');

  const handleDrawer = useCallback(
    (e) => {
      e.preventDefault();
      try {
        if (width < 1024) {
          dispatch(setToggleDrawer(!togglingDrawer));
          dispatch(setSidebar(false));
        } else {
          dispatch(setTogglingGlobalDrawer(!togglingGlobalDrawer));
          dispatch(setSidebar(false));
        }
      } catch {
        // Silent fallback if dispatch fails during logout
      }
    },
    [dispatch, togglingGlobalDrawer, togglingDrawer, width],
  );
  const handleLogoClick = useCallback(() => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      router.push(homeNavPath);
    }
  }, [onLogoClick, router, homeNavPath]);
  // Handle organization changes with loading state
  const handleOrganizationChange = useCallback(
    ({ loading, group, isChangingOrg, isUserContext }) => {
      if (loading) {
        setOrganizationLoading({
          isLoading: true,
          organizationName:
            group?.grp_title?.replace(/[-_]/g, ' ').toUpperCase() || '',
          message: isChangingOrg
            ? 'Switching organizations...'
            : isUserContext
              ? 'Updating organization preferences...'
              : 'Loading organization data...',
        });
      } else {
        // Delay hiding loading to allow for smooth transition
        setTimeout(() => {
          setOrganizationLoading({
            isLoading: false,
            organizationName: '',
            message: '',
          });
        }, 500);
      }
    },
    [],
  );

  // Don't render until client-side hydration is complete to prevent mismatch
  if (!mounted) {
    return (
      <>
        {/* Main Topbar Loading State */}
        <div className="fixed top-0 left-0 right-0 z-[999] p-1">
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
      {/* Main Global Topbar */}
      <div className="p-1">
        <CardWrapper
          className={`w-full ${styles.background}`}
          padding="py-1 px-4"
        >
          {' '}
          <div
            id="global-topbar-nav"
            className="flex justify-between items-center min-h-[48px]"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden relative z-10 w-full flex items-center justify-start">
              <Button
                paddingStyles="p-0 m-0"
                onClick={handleLogoClick}
                variant="text"
                className="flex items-center justify-center"
              >
                {logoComponent || <GroupLogo />}
              </Button>
            </div>
            {/* Desktop Left Section - Menu Button + Logo */}
            <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
              <div className="flex items-center gap-[10px]">
                {/* Menu Button */}
                <button
                  type="button"
                  className="p-2 m-0 flex items-center justify-center"
                  onClick={handleDrawer}
                  aria-label="Open navigation menu"
                >
                  <MenuIcon width={20} height={20} />
                </button>
                {/* Logo */}
                <Button
                  padding="p-0 m-0"
                  onClick={handleLogoClick}
                  variant="text"
                  className="flex items-center justify-center"
                >
                  <div
                    className={`w-[46.56px] h-8 flex items-center justify-center ${styles.text}`}
                  >
                    {logoComponent || <GroupLogo />}
                  </div>
                </Button>
                {/* Title (optional) */}
                {topbarTitle && (
                  <div className={`ml-4 ${styles.text} flex items-center`}>
                    {topbarTitle}
                  </div>
                )}
              </div>
            </div>{' '}
            {/* Desktop Right Section - Organization Dropdown + Custom Actions + Profile Dropdown */}
            <div className="hidden lg:flex gap-2 items-center justify-center">
              {/* Organization Dropdown - Show for users with multiple groups */}
              <TopbarOrganizationDropdown
                onGroupChange={handleOrganizationChange}
                className="mr-2"
              />
              {customActions && (
                <div className="flex items-center justify-center">
                  {customActions}
                </div>
              )}
              <UserProfileDropdown
                dropdownAlign="right"
                showUserInfo={true}
                isOrganization={isOrganization}
              />
            </div>
            {/* Mobile Profile Dropdown - Moved to main topbar */}
            <div className="lg:hidden flex items-center justify-center">
              <UserProfileDropdown
                dropdownAlign="right"
                showUserInfo={false}
                isOrganization={isOrganization}
              />
            </div>
          </div>
        </CardWrapper>
      </div>{' '}
      {/* Mobile Navigation Bar - Below main topbar with gap */}
      <div className="lg:hidden p-1">
        <CardWrapper
          className={`w-full ${styles.background} ${styles.border} border-t`}
          padding="py-1 px-2"
        >
          <div className="flex justify-between items-center min-h-[40px]">
            {/* Mobile Menu Button */}
            <Button
              paddingStyles="p-0 m-0"
              className="flex items-center justify-center focus:outline-none"
              onClick={handleDrawer}
              variant="text"
              aria-label="Open navigation menu"
            >
              <span className="p-1 flex items-center justify-center">
                <MenuBarIcon
                  fill={isDarkMode ? '#fff' : '#1C1D20'}
                  width={18}
                  height={18}
                />
              </span>
            </Button>
            {/* Title (optional) */}
            {topbarTitle && (
              <div
                className={`ml-3 text-sm font-medium ${styles.text} flex-1 truncate flex items-center`}
              >
                {topbarTitle}
              </div>
            )}{' '}
            {/* Organization Dropdown for mobile */}
            <TopbarOrganizationDropdown
              onGroupChange={handleOrganizationChange}
              showTitle={false}
              className="mr-2"
            />
            {/* Custom actions for mobile if any */}
            {customActions && (
              <div className="flex gap-1 items-center justify-center">
                {customActions}
              </div>
            )}
          </div>
        </CardWrapper>
      </div>
      {/* Organization Loading Overlay */}
      <OrganizationLoadingOverlay
        isVisible={organizationLoading.isLoading}
        organizationName={organizationLoading.organizationName}
        message={organizationLoading.message}
      />
    </div>
  );
};

GlobalTopbar.propTypes = {
  topbarTitle: PropTypes.string,
  logoComponent: PropTypes.node,
  onLogoClick: PropTypes.func,
  homeNavPath: PropTypes.string,
  customActions: PropTypes.node,
};

export default React.memo(GlobalTopbar);
