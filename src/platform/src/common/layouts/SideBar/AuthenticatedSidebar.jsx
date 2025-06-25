import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { usePathname } from 'next/navigation';
import Card from '@/common/components/CardWrapper';
import UnifiedSidebarContent from './UnifiedSidebarContent';
import { getSidebarStyles, getUserTypeFromPath } from './sidebarConfig';

const AuthenticatedSideBar = ({
  forceCollapse,
  children,
  headerContent,
  footerContent,
  showCollapseButton = true,
  navigationItems,
  userType,
}) => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const storeCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const pathname = usePathname();
  // Use forceCollapse prop if provided, otherwise use the store value
  const isCollapsed =
    forceCollapse !== undefined ? forceCollapse : storeCollapsed;

  // Determine user type from pathname if not provided
  const resolvedUserType = userType || getUserTypeFromPath(pathname);

  // Static styling (removing theme customizer dependencies)
  const isDarkMode = false; // Simplified for organization context
  // Theme-based styling using memoized values
  const styles = getSidebarStyles(isDarkMode);
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

    const mediaQuery = window.matchMedia('(max-width: 1024px)');
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
  return (
    <div>
      {' '}
      <div
        className={`
          transition-all duration-200 ease-in-out relative z-50 hidden lg:block p-1
          ${isCollapsed ? 'w-[75px]' : 'w-[256px]'}
          h-[calc(100vh-4rem)]
        `}
      >
        {' '}
        <Card
          className="h-full relative overflow-hidden"
          padding={isCollapsed ? 'p-2' : 'p-3'}
          overflow={true}
          overflowType="auto"
          contentClassName={`
            flex flex-col h-full overflow-x-hidden
            scrollbar-thin ${styles.scrollbar}
          `}
        >
          {/* Header Section */}
          {headerContent && (
            <div className="pb-4 flex justify-between items-center">
              {headerContent}
            </div>
          )}
          {/* Navigation Items */}
          <div className="flex flex-col justify-between h-full">
            <div className="mt-3 space-y-2">
              {children || (
                <UnifiedSidebarContent
                  isCollapsed={isCollapsed}
                  userType={resolvedUserType}
                  isDarkMode={isDarkMode}
                  customNavigationItems={navigationItems}
                />
              )}
            </div>{' '}
            {/* Bottom Section */}
            <div className="mt-auto pb-4">{footerContent}</div>
          </div>{' '}
        </Card>
        {/* Sidebar collapse button */}
        {showCollapseButton && pathname !== '/user/map' && (
          <div
            className={`
              absolute flex rounded-full dark:bg-slate-700 top-4 -right-[6px] z-50 
              shadow-lg justify-center items-center border w-6 h-6
              ${styles.collapseButton}
              hover:shadow-xl transition-all duration-200
            `}
          >
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 focus:outline-none w-full h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <IoChevronForward
                  size={14}
                  className="text-gray-600 dark:text-gray-300"
                />
              ) : (
                <IoChevronBack
                  size={14}
                  className="text-gray-600 dark:text-gray-300"
                />
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
  headerContent: PropTypes.node,
  footerContent: PropTypes.node,
  showCollapseButton: PropTypes.bool,
  userType: PropTypes.oneOf(['user', 'admin', 'organization']),
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
