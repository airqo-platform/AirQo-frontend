import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SidebarItem, { SideBarDropdownItem } from './SideBarItem';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import OrganizationDropdown from './OrganizationDropdown';
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
import Card from '../CardWrapper';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { GoOrganization } from 'react-icons/go';

const MAX_WIDTH = '(max-width: 1024px)';

const AuthenticatedSideBar = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const { title: groupTitle } = useGetActiveGroup();

  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [displayAdminSidebarView, setDisplayAdminSidebarView] = useState(false);

  // Determine if dark mode should be applied
  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

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

  useEffect(() => {
    if (router.pathname.startsWith('/admin')) {
      setDisplayAdminSidebarView(true);
    } else {
      setDisplayAdminSidebarView(false);
    }
  }, [router.pathname]);

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

  // Theme-based styling using memoized values
  const styles = useMemo(
    () => ({
      collapseButton: isDarkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-200 text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      scrollbar: isDarkMode
        ? 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
        : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100',
      divider: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      dropdownHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      dropdownText: isDarkMode ? 'text-white' : 'text-gray-800',
      dropdownBackground: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      iconFill: isDarkMode ? 'ffffff' : undefined,
      stroke: isDarkMode ? 'white' : '#1f2937',
    }),
    [isDarkMode],
  );

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
              fixed left-[86px] top-[280px] w-48 z-50
              ${styles.dropdownBackground} border ${styles.border}
              shadow-lg rounded-xl p-2 space-y-1
            `}
          >
            <Link href={'/collocation/overview'}>
              <div
                className={`
                  w-full p-3 rounded-lg cursor-pointer
                  ${styles.dropdownText} ${styles.dropdownHover}
                `}
              >
                Overview
              </div>
            </Link>
            <Link href={'/collocation/collocate'}>
              <div
                className={`
                  w-full p-3 rounded-lg cursor-pointer
                  ${styles.dropdownText} ${styles.dropdownHover}
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
  }, [isCollapsed, toggleDropdown, dropdown, collocationOpen, styles]);

  const renderAdminOrganisationItem = useCallback(() => {
    if (
      !checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') &&
      groupTitle === 'airqo'
    ) {
      return null;
    }

    return isCollapsed ? (
      <div className="relative">
        <SidebarItem
          Icon={GoOrganization}
          navPath="#"
          iconOnly
          onClick={toggleDropdown}
          label="Organizations"
        />
        {dropdown && (
          <div
            ref={dropdownRef}
            className={`
              fixed left-[86px] top-[280px] w-48 z-50
              ${styles.dropdownBackground} border ${styles.border}
              shadow-lg rounded-xl p-2 space-y-1
            `}
          >
            <Link href={'/admin/organisations/approved'}>
              <div
                className={`
                  w-full p-3 rounded-lg cursor-pointer
                  ${styles.dropdownText} ${styles.dropdownHover}
                `}
              >
                Approved
              </div>
            </Link>
            <Link href={'/admin/organisations/pending'}>
              <div
                className={`
                  w-full p-3 rounded-lg cursor-pointer
                  ${styles.dropdownText} ${styles.dropdownHover}
                `}
              >
                New Requests
              </div>
            </Link>
          </div>
        )}
      </div>
    ) : (
      <SidebarItem
        label="Organizations"
        Icon={GoOrganization}
        dropdown
        toggleMethod={() => setCollocationOpen(!collocationOpen)}
        toggleState={collocationOpen}
      >
        <SideBarDropdownItem
          itemLabel="Approved"
          itemPath="/admin/organisations/approved"
        />
        <SideBarDropdownItem
          itemLabel="New Requests"
          itemPath="/admin/organisations/pending"
        />
      </SidebarItem>
    );
  }, [isCollapsed, toggleDropdown, dropdown, collocationOpen, styles]);

  return (
    <div>
      <div
        className={`
          transition-all duration-200 ease-in-out relative z-50 h-dvh hidden lg:block p-2
          ${isCollapsed ? 'w-[88px]' : 'w-[256px]'}
        `}
      >
        <Card
          className="h-full relative overflow-hidden"
          padding="p-3"
          overflow={true}
          overflowType="auto"
          contentClassName={`
            flex flex-col h-full overflow-x-hidden
            scrollbar-thin ${styles.scrollbar}
          `}
        >
          {/* Organization Dropdown */}
          {!displayAdminSidebarView && (
            <div>
              <OrganizationDropdown />
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col justify-between h-full">
            {displayAdminSidebarView ? (
              <div className="mt-8 space-y-1">
                <div
                  className={`px-3 pb-2 text-xs font-semibold ${styles.mutedText}`}
                >
                  Admin Panel
                </div>
                {renderAdminOrganisationItem()}
                {/* <SidebarItem
                  label="Users"
                  Icon={HomeIcon}
                  navPath="/admin/users"
                  iconOnly={isCollapsed}
                />

                <SidebarItem
                  label="Preferances"
                  Icon={HomeIcon}
                  navPath="/admin/preferences"
                  iconOnly={isCollapsed}
                /> */}
              </div>
            ) : (
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
                  <hr className={`my-3 border-t ${styles.divider}`} />
                ) : (
                  <div
                    className={`px-3 pt-5 pb-2 text-xs font-semibold ${styles.mutedText}`}
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
            )}

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
              ${styles.collapseButton}
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
                    stroke={styles.stroke}
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
                    stroke={styles.stroke}
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
