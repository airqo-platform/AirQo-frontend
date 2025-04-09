import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SidebarItem, { SideBarDropdownItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import { checkAccess } from '@/core/utils/protectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useOutsideClick } from '@/core/hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '../Button';
import Card from '../CardWrapper';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const MAX_WIDTH = '(max-width: 1024px)';

const AuthenticatedSideBar = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const { isSemiDarkEnabled, theme } = useTheme();

  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Media query and route handling
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname === '/map') {
        dispatch(setSidebar(true));
      }
    };

    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        dispatch(setSidebar(true));
      }
    };

    const mediaQuery = window.matchMedia(MAX_WIDTH);
    handleRouteChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      mediaQuery.addListener(handleMediaQueryChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, [dispatch, router.pathname]);

  // Handle window resizing for sidebar collapse in mobile view
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width, dispatch]);

  // Retrieve dropdown states from localStorage
  useEffect(() => {
    const collocationOpenState = localStorage.getItem('collocationOpen');
    const analyticsOpenState = localStorage.getItem('analyticsOpen');

    if (collocationOpenState) {
      try {
        setCollocationOpen(JSON.parse(collocationOpenState));
      } catch (error) {
        console.error(
          'Error parsing "collocationOpen" from localStorage:',
          error,
        );
      }
    }

    if (analyticsOpenState) {
      try {
        setAnalyticsOpen(JSON.parse(analyticsOpenState));
      } catch (error) {
        console.error(
          'Error parsing "analyticsOpen" from localStorage:',
          error,
        );
      }
    }
  }, []);

  // Save dropdown states to localStorage
  useEffect(() => {
    localStorage.setItem('collocationOpen', JSON.stringify(collocationOpen));
    localStorage.setItem('analyticsOpen', JSON.stringify(analyticsOpen));
  }, [collocationOpen, analyticsOpen]);

  // Close dropdown when clicked outside
  useOutsideClick(dropdownRef, () => {
    setDropdown(false);
  });

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setDropdown((prevState) => !prevState);
  }, []);

  // Collapse button styling
  const collapseButtonStyle =
    isSemiDarkEnabled || theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-white'
      : 'bg-white border-gray-200 text-gray-800';

  // Function to render Collocation sidebar item based on permissions
  const renderCollocationItem = useCallback(() => {
    if (!checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES')) {
      return null;
    }

    return isCollapsed ? (
      <div className="relative">
        <SidebarItem
          Icon={CollocateIcon}
          navPath="#"
          iconOnly
          onClick={toggleDropdown}
          label="Collocation"
        />
        {dropdown && (
          <div
            ref={dropdownRef}
            className={`
              fixed left-24 top-[300px] w-48 z-50
              ${isSemiDarkEnabled || theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
              border ${isSemiDarkEnabled || theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              shadow-lg rounded-xl p-2 space-y-1
            `}
          >
            <Link href={'/collocation/overview'}>
              <div
                className={`
                w-full p-3 rounded-lg cursor-pointer
                ${
                  isSemiDarkEnabled || theme === 'dark'
                    ? 'text-white hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }
              `}
              >
                Overview
              </div>
            </Link>
            <Link href={'/collocation/collocate'}>
              <div
                className={`
                w-full p-3 rounded-lg cursor-pointer
                ${
                  isSemiDarkEnabled || theme === 'dark'
                    ? 'text-white hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }
              `}
              >
                Collocate
              </div>
            </Link>
          </div>
        )}
      </div>
    ) : (
      <SidebarItem
        label="Collocation"
        Icon={CollocateIcon}
        dropdown
        toggleMethod={() => setCollocationOpen(!collocationOpen)}
        toggleState={collocationOpen}
      >
        <SideBarDropdownItem
          itemLabel="Overview"
          itemPath="/collocation/overview"
        />
        <SideBarDropdownItem
          itemLabel="Collocate"
          itemPath="/collocation/collocate"
        />
      </SidebarItem>
    );
  }, [
    isCollapsed,
    toggleDropdown,
    dropdown,
    collocationOpen,
    isSemiDarkEnabled,
    theme,
  ]);

  return (
    <div>
      <div
        className={`
          transition-all duration-200 ease-in-out relative z-50 h-dvh hidden lg:block p-2
          ${isCollapsed ? 'w-[88px]' : 'w-[256px]'}
        `}
      >
        <Card
          className="h-full sidebar-card relative overflow-hidden"
          background={
            isSemiDarkEnabled ? 'bg-gray-900' : 'bg-white dark:bg-gray-900'
          }
          padding="p-3"
          overflow={true}
          overflowType="auto"
          bordered={true}
          borderColor={
            isSemiDarkEnabled || theme === 'dark'
              ? 'border-gray-700'
              : 'border-gray-200'
          }
          contentClassName={`
            flex flex-col h-full overflow-x-hidden
            scrollbar-thin 
            ${
              isSemiDarkEnabled || theme === 'dark'
                ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
                : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'
            }
          `}
        >
          {/* Logo Section */}
          <div className="pb-4 flex justify-between items-center">
            <Button
              paddingStyles="p-0 m-0"
              onClick={() => router.push('/Home')}
              variant="text"
            >
              <div
                className={`w-[46.56px] h-8 flex flex-col flex-1 ${isSemiDarkEnabled || theme === 'dark' ? 'text-white' : ''}`}
              >
                {isSemiDarkEnabled || theme === 'dark' ? (
                  <AirqoLogo className="w-full h-full" fill={'ffffff'} />
                ) : (
                  <AirqoLogo className="w-full h-full" />
                )}
              </div>
            </Button>
          </div>

          {/* Organization Dropdown */}
          <div className="mt-4">
            <OrganizationDropdown
              className={
                isSemiDarkEnabled || theme === 'dark'
                  ? 'semi-dark-dropdown'
                  : ''
              }
            />
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col justify-between h-full">
            <div className="mt-8 space-y-1">
              <SidebarItem
                label="Home"
                Icon={HomeIcon}
                navPath="/Home"
                iconOnly={isCollapsed}
              />

              <SidebarItem
                label="Analytics"
                Icon={BarChartIcon}
                navPath="/analytics"
                iconOnly={isCollapsed}
              />

              {/* Network Section */}
              {isCollapsed ? (
                <hr
                  className={`my-3 border-t ${isSemiDarkEnabled || theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                />
              ) : (
                <div
                  className={`
                  px-3 pt-5 pb-2 text-xs font-semibold
                  ${isSemiDarkEnabled || theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                `}
                >
                  Network
                </div>
              )}

              {renderCollocationItem()}

              <SidebarItem
                label="Map"
                Icon={WorldIcon}
                navPath="/map"
                iconOnly={isCollapsed}
              />

              <SidebarItem
                label="Settings"
                Icon={SettingsIcon}
                navPath="/settings"
                iconOnly={isCollapsed}
              />
            </div>

            {/* Bottom Section (for future carousel) */}
            <div className="mt-auto pb-4">
              {/* Placeholder for future components */}
            </div>
          </div>
        </Card>

        {/* Sidebar collapse button */}
        {router.pathname !== '/map' && (
          <div
            className={`
            absolute flex rounded-full top-10 -right-[3px] z-50 
            shadow-md justify-between items-center border
            ${collapseButtonStyle}
          `}
          >
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 focus:outline-none"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform rotate-180"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke={
                      isSemiDarkEnabled || theme === 'dark'
                        ? 'white'
                        : '#1f2937'
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke={
                      isSemiDarkEnabled || theme === 'dark'
                        ? 'white'
                        : '#1f2937'
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticatedSideBar;
