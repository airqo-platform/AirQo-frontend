import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import SidebarItem, { SideBarDropdownItem } from './SideBarItem';
import OrganizationDropdown from './OrganizationDropdown';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useRouter, usePathname } from 'next/navigation';
import Button from '../Button';
import Card from '../CardWrapper';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import GroupLogo from '../GroupLogo';

const MAX_WIDTH = '(max-width: 1024px)';

const AuthenticatedSideBar = ({
  forceCollapse,
  children,
  logoComponent,
  onLogoClick,
  homeNavPath = '/user/Home',
  showOrganizationDropdown = true,
  headerContent,
  footerContent,
  showCollapseButton = true,
  navigationItems,
}) => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const storeCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();

  // Use forceCollapse prop if provided, otherwise use the store value
  const isCollapsed =
    forceCollapse !== undefined ? forceCollapse : storeCollapsed;

  // Determine if dark mode should be applied
  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  // Media query and route handling
  useEffect(() => {
    const handleRouteChange = () => {
      if (pathname === '/user/map') {
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
  }, [dispatch, pathname]);

  // Handle window resizing for sidebar collapse in mobile view
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width, dispatch]);

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
      iconFill: isDarkMode ? 'ffffff' : undefined,
      stroke: isDarkMode ? 'white' : '#1f2937',
    }),
    [isDarkMode],
  );

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
          {/* Logo Section */}
          <div className="pb-4 flex justify-between items-center">
            {headerContent || (
              <Button
                padding="p-0 m-0"
                onClick={onLogoClick || (() => router.push(homeNavPath))}
                variant="text"
              >
                <div
                  className={`w-[46.56px] h-8 flex flex-col flex-1 ${styles.text}`}
                >
                  {logoComponent || <GroupLogo />}
                </div>
              </Button>
            )}
          </div>

          {/* Organization Dropdown */}
          {showOrganizationDropdown && (
            <div>
              <OrganizationDropdown />
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col justify-between h-full">
            <div className="mt-4 space-y-1">
              {children ||
                navigationItems?.map((item, index) => {
                  if (item.type === 'divider') {
                    return isCollapsed ? (
                      <hr
                        key={index}
                        className={`my-3 border-t ${styles.divider}`}
                      />
                    ) : (
                      <div
                        key={index}
                        className={`px-3 pt-5 pb-2 text-xs font-semibold ${styles.mutedText}`}
                      >
                        {item.label}
                      </div>
                    );
                  }

                  if (item.dropdown) {
                    return (
                      <SidebarItem
                        key={index}
                        label={item.label}
                        Icon={item.icon}
                        dropdown
                        toggleMethod={item.toggleMethod}
                        toggleState={item.toggleState}
                        iconOnly={isCollapsed}
                      >
                        {item.children?.map((child, childIndex) => (
                          <SideBarDropdownItem
                            key={childIndex}
                            itemLabel={child.label}
                            itemPath={child.path}
                          />
                        ))}
                      </SidebarItem>
                    );
                  }

                  return (
                    <SidebarItem
                      key={index}
                      label={item.label}
                      Icon={item.icon}
                      navPath={item.path}
                      iconOnly={isCollapsed}
                    />
                  );
                })}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto pb-4">
              {footerContent || (
                <div>{/* Placeholder for future components */}</div>
              )}
            </div>
          </div>
        </Card>

        {/* Sidebar collapse button */}
        {showCollapseButton && pathname !== '/user/map' && (
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

AuthenticatedSideBar.propTypes = {
  forceCollapse: PropTypes.bool,
  children: PropTypes.node,
  logoComponent: PropTypes.node,
  onLogoClick: PropTypes.func,
  homeNavPath: PropTypes.string,
  showOrganizationDropdown: PropTypes.bool,
  headerContent: PropTypes.node,
  footerContent: PropTypes.node,
  showCollapseButton: PropTypes.bool,
  navigationItems: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['item', 'divider', 'dropdown']),
      label: PropTypes.string,
      icon: PropTypes.elementType,
      path: PropTypes.string,
      dropdown: PropTypes.bool,
      toggleMethod: PropTypes.func,
      toggleState: PropTypes.bool,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired,
        }),
      ),
    }),
  ),
};

export default AuthenticatedSideBar;
