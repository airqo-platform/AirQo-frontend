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
import {
  getNavigationItems,
  USER_TYPES,
} from '../../layouts/SideBar/sidebarConfig';

/**
 * GlobalSideBarDrawer - Enhanced with subroute functionality
 *
 * Features:
 * - Admin Panel item now shows subroutes on hover
 * - Right arrow (➤) indicates available subroutes
 * - Clicking main Admin Panel item navigates to /admin
 * - Hovering shows popup with all admin sections
 * - Clicking subroutes navigates directly to specific admin pages
 */

const GlobalSideBarDrawer = () => {
  const dispatch = useDispatch();
  const togglingGlobalDrawer = useSelector(
    (state) => state.sidebar.toggleGlobalDrawer,
  );

  // Compute the drawer width based on the toggle state.
  // This ensures that on desktop it uses the fixed width ('w-72') and not full screen.
  const drawerWidth = useMemo(
    () => (togglingGlobalDrawer ? 'w-64' : 'w-0'),
    [togglingGlobalDrawer],
  );
  const closeDrawer = useCallback(() => {
    dispatch(setTogglingGlobalDrawer(false));
    dispatch(setSidebar(false));
  }, [dispatch]);

  // Handle subroute clicks
  const handleSubrouteClick = useCallback(
    (event, subroute) => {
      // Navigate to the subroute and close drawer
      if (subroute.path) {
        window.location.href = subroute.path;
      }
      closeDrawer();
    },
    [closeDrawer],
  );
  // Extract admin panel subroutes from the admin navigation config
  // This demonstrates config-driven subroute extraction for maintainability
  const adminSubroutes = useMemo(() => {
    const adminItems = getNavigationItems(USER_TYPES.ADMIN);

    // Filter out dividers and extract items with paths for subroutes
    const subroutes = adminItems
      .filter((item) => item.type === 'item' && item.path)
      .map((item) => ({
        label: item.label,
        path: item.path,
        icon: item.icon || null,
      }));

    // Debug: Log subroutes to ensure they're being generated
    if (subroutes.length > 0) {
      // eslint-disable-next-line no-console
      console.log('✅ Admin subroutes loaded:', subroutes.length, 'items');
    }

    return subroutes;
  }, []);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (togglingGlobalDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [togglingGlobalDrawer]);
  return (
    <>
      {togglingGlobalDrawer && (
        <button
          type="button"
          onClick={closeDrawer}
          className="absolute inset-0 w-full h-dvh opacity-50 bg-black-700 z-[999998] transition-all duration-200 ease-in-out"
        />
      )}

      <Card
        width={drawerWidth}
        padding="p-0 m-0"
        className="fixed left-0 top-0 h-full z-[999999] border-r-grey-750 border-r-[1px] transition-all duration-200 ease-in-out"
        contentClassName="flex h-full flex-col overflow-y-auto border-t-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200"
        style={{ overflow: 'visible' }}
      >
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
        <div className="flex flex-col justify-between px-1 h-full">
          <div className="mt-1 space-y-3">
            {/* Enhanced Admin Panel with Config-Driven Subroutes */}
            <SideBarItem
              label="Admin Panel"
              Icon={MdAdminPanelSettings}
              navPath="/admin"
              onClick={closeDrawer}
              subroutes={adminSubroutes}
              onSubrouteClick={handleSubrouteClick}
              // Debug props to ensure functionality
              key="admin-panel"
            />
            <SideBarItem
              label="AirQo Website"
              Icon={FiExternalLink}
              navPath="https://airqo.africa"
              isExternal={true}
              onClick={closeDrawer}
            />
            <SideBarItem
              label="Data Analytics"
              Icon={LineChartIcon}
              navPath="/user/analytics"
              onClick={closeDrawer}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(GlobalSideBarDrawer);
