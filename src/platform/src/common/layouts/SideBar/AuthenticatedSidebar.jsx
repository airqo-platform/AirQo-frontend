'use client';

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
import { useSession } from 'next-auth/react';
import Card from '@/common/components/CardWrapper';
import UnifiedSidebarContent from './UnifiedSidebarContent';
import AuthenticatedSidebarSkeleton from '../components/AuthenticatedSidebarSkeleton';
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
  const { status } = useSession();
  const size = useWindowSize();
  const storeCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const pathname = usePathname();

  // Always-register effects
  useEffect(() => {
    if (pathname === '/user/map') {
      dispatch(setSidebar(true));
    }
    const mq = window.matchMedia('(max-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) dispatch(setSidebar(true));
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        mq.removeListener(onChange);
      }
    };
  }, [dispatch, pathname]);

  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [dispatch, size.width]);

  // Determine collapse state
  const isCollapsed =
    forceCollapse !== undefined ? forceCollapse : storeCollapsed;

  // Determine user type
  const resolvedUserType = userType || getUserTypeFromPath(pathname);

  // Static styling (no theme customizer)
  const isDarkMode = false;
  const styles = getSidebarStyles(isDarkMode);

  // Render sidebar when session ready or unauthenticated fallback
  return (
    <div className="hidden lg:block relative z-50 p-1">
      <div
        className={`transition-all duration-200 ease-in-out relative z-50 p-1
          ${isCollapsed ? 'w-[75px]' : 'w-[256px]'} h-[calc(100vh-4rem)]`}
      >
        <Card
          className="h-full relative overflow-hidden"
          padding={isCollapsed ? 'p-2' : 'p-3'}
          overflow
          overflowType="auto"
          contentClassName={`flex flex-col h-full overflow-x-hidden scrollbar-thin ${styles.scrollbar}`}
        >
          {status === 'loading' ? (
            <AuthenticatedSidebarSkeleton />
          ) : (
            <>
              {headerContent && (
                <div className="pb-4 flex justify-between items-center">
                  {headerContent}
                </div>
              )}
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
                </div>
                <div className="mt-auto pb-4">{footerContent}</div>
              </div>
            </>
          )}
        </Card>
        {showCollapseButton && pathname !== '/user/map' && (
          <div
            className={`absolute flex rounded-full bg-white top-4 -right-[6px] z-50 shadow-lg justify-center items-center border w-6 h-6 ${styles.collapseButton} hover:shadow-xl transition-all duration-200`}
          >
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 focus:outline-none w-full h-full flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <IoChevronForward size={14} />
              ) : (
                <IoChevronBack size={14} />
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
