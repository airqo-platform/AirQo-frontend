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
  // Custom Admin Panel Icon component using react-icons
  const AdminPanelIcon = ({ width = 24, height = 24, fill = '#485972' }) => (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MdAdminPanelSettings size={width} color={fill} />
    </div>
  );

  // Custom External Link Icon component using react-icons
  const ExternalLinkIcon = ({ width = 24, height = 24, fill = '#485972' }) => (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FiExternalLink size={width} color={fill} />
    </div>
  );

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
        className="fixed left-0 top-0 h-full z-[999999] border-r-grey-750 border-r-[1px] transition-all duration-200 ease-in-out overflow-hidden"
        contentClassName="flex h-full flex-col overflow-y-auto border-t-0 border-l-[1px] border-l-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden"
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
            <SideBarItem
              label="Data Analytics"
              Icon={LineChartIcon}
              navPath="/user/analytics"
              onClick={closeDrawer}
            />
            <SideBarItem
              label="Organisation Requests"
              Icon={AdminPanelIcon}
              navPath="/admin/organisations/requests"
              onClick={closeDrawer}
            />
            <SideBarItem
              label="AirQo Website"
              Icon={ExternalLinkIcon}
              navPath="https://airqo.africa"
              isExternal={true}
              onClick={closeDrawer}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(GlobalSideBarDrawer);
