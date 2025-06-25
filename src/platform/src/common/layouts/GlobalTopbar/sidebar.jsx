import React, { useCallback, useMemo, useEffect } from 'react';
import SideBarItem from '../../layouts/SideBar/SideBarItem';
import CloseIcon from '@/icons/close_icon';
import LineChartIcon from '@/icons/Charts/LineChartIcon';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTogglingGlobalDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import Card from '@/components/CardWrapper';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FiExternalLink } from 'react-icons/fi';
import AirqoLogo from '@/icons/airqo_logo.svg';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import {
  getNavigationItems,
  USER_TYPES,
} from '../../layouts/SideBar/sidebarConfig';

/**
 * GlobalSideBarDrawer - Enhanced with stable subroute hover functionality
 *
 * Features:
 * - Google Console-style hover behavior
 * - Stable popup positioning aligned with sidebar items
 * - Proper hover bridge for seamless mouse movement
 * - Instant popup closing when clicking subroutes
 * - Automatic sidebar closure after navigation
 * - Improved error handling and performance
 */

const GlobalSideBarDrawer = () => {
  const dispatch = useDispatch();
  const togglingGlobalDrawer = useSelector(
    (state) => state.sidebar.toggleGlobalDrawer,
  );

  // Optimized drawer width calculation
  const drawerWidth = useMemo(
    () => (togglingGlobalDrawer ? 'w-64' : 'w-0'),
    [togglingGlobalDrawer],
  );

  // Enhanced drawer close handler
  const closeDrawer = useCallback(() => {
    // Batch state updates for better performance
    dispatch(setTogglingGlobalDrawer(false));
    dispatch(setSidebar(false));
  }, [dispatch]);

  // Enhanced subroute click handler with better UX
  const handleSubrouteClick = useCallback(
    (event, subroute) => {
      event.preventDefault();
      event.stopPropagation();

      // Validate subroute before navigation
      if (!subroute || !subroute.path) {
        console.warn('Invalid subroute:', subroute);
        return;
      }

      try {
        // Enhanced navigation logic
        if (subroute.path.startsWith('http')) {
          // External links
          window.open(subroute.path, '_blank', 'noopener,noreferrer');
        } else if (subroute.path.includes('/admin')) {
          // Admin routes - use direct navigation for better performance
          window.location.href = subroute.path;
        } else {
          // Internal routes
          window.location.href = subroute.path;
        }

        // Close drawer immediately after starting navigation
        closeDrawer();
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: still close the drawer
        closeDrawer();
      }
    },
    [closeDrawer],
  );

  // Enhanced admin panel subroutes with better caching and error handling
  const adminSubroutes = useMemo(() => {
    try {
      const adminItems = getNavigationItems(USER_TYPES.ADMIN);

      if (!Array.isArray(adminItems)) {
        console.warn('Admin items not found or invalid');
        return [];
      }

      // Enhanced filtering and mapping with better validation
      const subroutes = adminItems
        .filter((item) => {
          return (
            item &&
            typeof item === 'object' &&
            item.type === 'item' &&
            item.path &&
            typeof item.path === 'string' &&
            item.label &&
            typeof item.label === 'string' &&
            item.path !== '/admin' // Exclude main admin path
          );
        })
        .map((item) => ({
          label: item.label.trim(),
          path: item.path.trim(),
          icon: item.icon || null,
        }))
        .slice(0, 10); // Increased limit for better functionality

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `✅ Loaded ${subroutes.length} admin subroutes:`,
          subroutes.map((s) => s.label),
        );
      }

      return subroutes;
    } catch (error) {
      console.error('Error loading admin subroutes:', error);
      // Return empty array as fallback
      return [];
    }
  }, []);

  // Enhanced body scroll management
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (togglingGlobalDrawer) {
      document.body.style.overflow = 'hidden';
      // Add a class for additional styling if needed
      document.body.classList.add('sidebar-open');
    } else {
      document.body.style.overflow = originalOverflow || 'unset';
      document.body.classList.remove('sidebar-open');
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
      document.body.classList.remove('sidebar-open');
    };
  }, [togglingGlobalDrawer]);

  // Keyboard event handler for better accessibility
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape' && togglingGlobalDrawer) {
        closeDrawer();
      }
    },
    [togglingGlobalDrawer, closeDrawer],
  );

  // Add keyboard event listener
  useEffect(() => {
    if (togglingGlobalDrawer) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [togglingGlobalDrawer, handleKeyDown]);

  return (
    <>
      {/* FIXED backdrop with proper z-index and opacity */}
      {togglingGlobalDrawer && (
        <button
          type="button"
          onClick={closeDrawer}
          className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50 z-[9999]     transition-opacity duration-200 ease-in-out"
          aria-label="Close sidebar"
        />
      )}

      {/* Main sidebar container with HIGHER z-index */}
      <Card
        width={drawerWidth}
        padding="p-0 m-0"
        className="fixed left-0 top-0 h-full z-[10001] border-r-gray-200 dark:border-r-gray-700 border-r transition-all duration-200 ease-in-out"
        contentClassName="flex h-full flex-col overflow-y-auto border-t-0 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
        style={{
          overflow: 'visible',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Enhanced header section with better dark mode support */}
        <div className="px-2 py-4 flex justify-between border-b border-gray-400 items-center">
          <div className="flex items-center space-x-2">
            <AirqoLogo />
          </div>
          <button
            type="button"
            className="relative w-auto focus:outline-none border border-gray-200 rounded-xl p-2"
            onClick={closeDrawer}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Enhanced navigation section with better dark mode */}
        <div className="flex flex-col justify-between px-3 h-full">
          <div className="mt-4 space-y-2">
            <SideBarItem
              label="Home"
              Icon={HomeIcon}
              navPath="/user/Home"
              onClick={closeDrawer}
              key="home"
            />

            {/* Enhanced Admin Panel with improved subroute functionality */}
            <SideBarItem
              label="Admin Panel"
              Icon={MdAdminPanelSettings}
              navPath="/admin"
              onClick={closeDrawer}
              subroutes={adminSubroutes}
              onSubrouteClick={handleSubrouteClick}
              key="admin-panel-enhanced"
            />

            {/* Data Analytics */}
            <SideBarItem
              label="Data Analytics"
              Icon={LineChartIcon}
              navPath="/user/analytics"
              onClick={closeDrawer}
              key="data-analytics"
            />

            {/* External link */}
            <SideBarItem
              label="AirQo Website"
              Icon={FiExternalLink}
              navPath="https://airqo.africa"
              isExternal={true}
              onClick={closeDrawer}
              key="airqo-website"
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(GlobalSideBarDrawer);
