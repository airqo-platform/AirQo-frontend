'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';
import { AqMenu02, AqMenu04 } from '@airqo/icons-react';
import MyProfileDropdown from '../components/UserProfileDropdown';
import TopbarOrganizationDropdown from '../components/TopbarOrganizationDropdown';
import AppDropdown from '../components/AppDropdown';
import {
  toggleGlobalSidebar,
  setToggleDrawer,
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
  const { activeGroup, userGroups, switchToGroup } = useUnifiedGroup();

  const isDarkMode = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  const styles = useMemo(
    () => ({
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200',
      hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    }),
    [isDarkMode],
  );

  const [mounted, setMounted] = useState(false);
  const isOrganization = pathname.startsWith('/org/');
  const isCreateOrganizationRoute = pathname === '/create-organization';
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safety check for AirQo group on create-organization route
  useEffect(() => {
    if (
      mounted &&
      isCreateOrganizationRoute &&
      userGroups?.length > 0 &&
      activeGroup
    ) {
      const airqoGroup = userGroups.find(isAirQoGroup);
      if (airqoGroup && activeGroup._id !== airqoGroup._id) {
        logger.info(
          'GlobalTopbar: Safety check - switching to AirQo group on create-organization route',
          {
            currentActiveGroup: activeGroup.grp_title,
            airqoGroupId: airqoGroup._id,
            airqoGroupTitle: airqoGroup.grp_title,
          },
        );
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
      if (width < 1024) {
        dispatch(setToggleDrawer(true)); // Open normal sidebar drawer on mobile
      } else {
        dispatch(toggleGlobalSidebar());
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

  const LogoComponent = useCallback(
    ({ className = '', buttonProps = {} }) => (
      <Button
        paddingStyles="p-0 m-0"
        onClick={handleLogoClick}
        variant="text"
        className={`inline-flex items-center justify-center ${className}`}
        {...buttonProps}
      >
        <GroupLogo size="lg" />
      </Button>
    ),
    [handleLogoClick],
  );

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
              ? 'p-1 inline-flex items-center focus:outline-none justify-center'
              : 'p-2 m-0 inline-flex items-center focus:outline-none justify-center'
          }
        >
          {isMobile ? (
            <AqMenu04 color={isDarkMode ? '#fff' : '#1C1D20'} size={20} />
          ) : (
            <AqMenu02 size={20} />
          )}
        </span>
      </Button>
    ),
    [handleDrawer, isDarkMode],
  );

  if (!mounted) {
    // loading skeleton...
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
    <div className="fixed flex flex-col gap-2 px-2 py-1 top-0 left-0 right-0 z-[999]">
      {/* Main Topbar */}
      <CardWrapper
        className={`w-full ${styles.background}`}
        padding="py-1 px-4"
      >
        <div
          id="global-topbar-nav"
          className="flex justify-between items-center min-h-[48px] h-full"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-start flex-shrink-0">
            <LogoComponent className="flex-shrink-0" />
          </div>

          {/* Desktop Left: Menu + Logo + Title */}
          <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
            <div className="flex items-center gap-[10px]">
              <MenuButton isMobile={false} />
              <LogoComponent
                className={`flex items-center justify-center ${styles.text}`}
              />
              {topbarTitle && (
                <div className={`ml-4 ${styles.text} flex items-center`}>
                  {topbarTitle}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right: Org dropdown, app dropdown, custom actions, profile */}
          <div className="hidden lg:flex gap-2 items-center justify-center h-full">
            {!isCreateOrganizationRoute && !isAdminRoute && (
              <TopbarOrganizationDropdown className="topBarOrganizationSelector" />
            )}
            <AppDropdown className="topBarAppDropdown" />
            {customActions && (
              <div className="flex items-center">{customActions}</div>
            )}
            <MyProfileDropdown
              dropdownAlign="right"
              showUserInfo={true}
              isOrganization={isOrganization}
              isCreateOrganizationRoute={isCreateOrganizationRoute}
              isAdminRoute={isAdminRoute}
            />
          </div>

          {/* Mobile Profile */}
          <div className="lg:hidden flex items-center justify-center h-full">
            <MyProfileDropdown
              dropdownAlign="right"
              showUserInfo={true}
              isOrganization={isOrganization}
              isCreateOrganizationRoute={isCreateOrganizationRoute}
              isAdminRoute={isAdminRoute}
            />
          </div>
        </div>
      </CardWrapper>

      {/* Mobile Nav Bar */}
      <CardWrapper
        className={`w-full lg:hidden ${styles.background} ${styles.border} border-t`}
        padding="py-1 px-2"
      >
        <div className="flex justify-between items-center min-h-[40px] h-full">
          <MenuButton isMobile={true} />
          {topbarTitle && (
            <div
              className={`ml-3 text-sm font-medium ${styles.text} flex-1 truncate flex items-center`}
            >
              {topbarTitle}
            </div>
          )}
          {!isCreateOrganizationRoute && !isAdminRoute && (
            <TopbarOrganizationDropdown showTitle={false} className="mr-2" />
          )}
          {customActions && <div className="flex gap-1">{customActions}</div>}
        </div>
      </CardWrapper>
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
