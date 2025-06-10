'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';
import MenuBarIcon from '@/icons/menu_bar';
import MenuIcon from '@/icons/Actions/menu';
import UserProfileDropdown from '../TopBar/UserProfileDropdown';
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
 * Contains profile dropdown, organization logo, and menu button
 */
const GlobalTopbar = ({
  topbarTitle,
  logoComponent,
  onLogoClick,
  homeNavPath = '/user/Home',
  showSearch = false,
  customActions,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const { theme, systemTheme } = useTheme();

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

  const { data: session } = useSession();

  // Safe selector for Redux login state with error handling
  const reduxUserInfo = useSelector((state) => {
    try {
      return state?.login?.userInfo || {};
    } catch {
      return {};
    }
  });

  // Use NextAuth session first, fallback to Redux state
  const userInfo = session?.user || reduxUserInfo;

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

  // Don't render until client-side hydration is complete to prevent mismatch
  if (!mounted) {
    return (
      <CardWrapper
        className="fixed top-0 left-0 z-[999] right-0 w-screen py-2 px-2 shadow-sm border-b border-gray-200 lg:shadow-none bg-white"
        padding="p-0"
        rounded={false}
      >
        <div className="flex justify-between items-center p-2">
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
    );
  }

  return (
    <CardWrapper
      className={`fixed top-0 left-0 z-[999] right-0 w-screen shadow-sm border-b ${styles.border} ${styles.background} lg:shadow-none`}
      padding="p-0"
      rounded={false}
    >
      <div
        id="global-topbar-nav"
        className="flex justify-between items-center p-2"
      >
        {/* Mobile Logo */}
        <div className="block lg:hidden relative z-10 w-full">
          <Button
            paddingStyles="p-0 m-0"
            onClick={handleLogoClick}
            variant="text"
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
              className="p-2 m-0"
              onClick={handleDrawer}
              aria-label="Open navigation menu"
            >
              <MenuIcon width={20} height={20} />
            </button>

            {/* Logo */}
            <Button padding="p-0 m-0" onClick={handleLogoClick} variant="text">
              <div
                className={`w-[46.56px] h-8 flex flex-col flex-1 ${styles.text}`}
              >
                {logoComponent || <GroupLogo />}
              </div>
            </Button>

            {/* Title (optional) */}
            {topbarTitle && (
              <div className={`ml-4 ${styles.text}`}>{topbarTitle}</div>
            )}
          </div>
        </div>

        {/* Desktop Right Section - Custom Actions + Profile Dropdown */}
        <div className="hidden lg:flex gap-2 items-center">
          {customActions}
          <UserProfileDropdown
            dropdownAlign="right"
            showUserInfo={true}
            isOrganization={isOrganization}
          />
        </div>

        {/* Mobile Menu Button */}
        <Button
          paddingStyles="p-0 m-0"
          className="lg:hidden relative flex items-center justify-start z-10 w-auto focus:outline-none"
          onClick={handleDrawer}
          variant="text"
          aria-label="Open navigation menu"
        >
          <span className="p-2">
            <MenuBarIcon fill={isDarkMode ? '#fff' : '#1C1D20'} />
          </span>
        </Button>
      </div>
    </CardWrapper>
  );
};

GlobalTopbar.propTypes = {
  topbarTitle: PropTypes.string,
  logoComponent: PropTypes.node,
  onLogoClick: PropTypes.func,
  homeNavPath: PropTypes.string,
  showSearch: PropTypes.bool,
  customActions: PropTypes.node,
};

export default React.memo(GlobalTopbar);
