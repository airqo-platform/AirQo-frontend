import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useWindowSize } from '@/core/hooks/useWindowSize';
import { useParams } from 'next/navigation';
import SideBarItem from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import CloseIcon from '@/icons/close_icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
// import SettingsIcon from '@/icons/SideBar/SettingsIcon';
// import UsersIcon from '@/icons/SideBar/UsersIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import PersonIcon from '@/icons/Settings/PersonIcon';
import LogoutIcon from '@/icons/SideBar/LogoutIcon';
import { useSelector, useDispatch } from 'react-redux';
import { setToggleDrawer } from '@/lib/store/services/sideBar/SideBarSlice';
import { useRouter } from 'next/navigation';
import LogoutUser from '@/core/HOC/LogoutUser';
import Card from '@/components/CardWrapper';

const OrganizationSideBarDrawer = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const drawerWidth = useMemo(
    () => (togglingDrawer ? 'w-72' : 'w-0'),
    [togglingDrawer],
  );

  const closeDrawer = useCallback(() => {
    dispatch(setToggleDrawer(false));
  }, [dispatch]);
  const handleLogout = useCallback(
    async (event) => {
      event.preventDefault();
      if (isLoading) return;

      setIsLoading(true);
      try {
        await LogoutUser(dispatch, router);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, router, isLoading],
  );

  useEffect(() => {
    if (togglingDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [togglingDrawer]);
  return (
    <>
      {togglingDrawer && (
        <button
          type="button"
          onClick={closeDrawer}
          className="absolute inset-0 w-full h-dvh opacity-50 bg-black-700 z-[999998] transition-all duration-200 ease-in-out"
        />
      )}
      <Card
        width={drawerWidth}
        className="fixed right-0 top-0 h-full z-[999999] border-l-grey-750 border-l-[1px] transition-all duration-200 ease-in-out overflow-hidden"
        contentClassName="flex p-2 lg:p-4 h-full flex-col overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden"
      >
        <div className="pb-2 lg:pb-4 flex justify-between items-center">
          {width < 1024 ? (
            // On mobile, show just the logo since profile is in topbar
            <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
          ) : (
            <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
          )}
          <button
            type="button"
            className="relative w-auto focus:outline-none border border-gray-200 rounded-xl p-1 lg:p-2"
            onClick={closeDrawer}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full">
          {' '}
          <div className="mt-6 lg:mt-11 space-y-2 lg:space-y-3">
            <SideBarItem
              label="Dashboard"
              Icon={HomeIcon}
              navPath={`/org/${orgSlug}/dashboard`}
            />
            <SideBarItem
              label="Data Insights"
              Icon={BarChartIcon}
              navPath={`/org/${orgSlug}/insights`}
            />

            {/* <div className="text-xs text-[#6F87A1] px-[10px] my-2 lg:my-3 mx-2 lg:mx-4 font-semibold transition-all duration-300 ease-in-out">
              Organization
            </div>
            <SideBarItem
              label="Members"
              Icon={UsersIcon}
              navPath={`/org/${orgSlug}/members`}
            /> */}

            <div className="text-xs text-[#6F87A1] px-[10px] my-2 lg:my-3 mx-2 lg:mx-4 font-semibold transition-all duration-300 ease-in-out">
              Account
            </div>
            <SideBarItem
              label="My Profile"
              Icon={PersonIcon}
              navPath={`/org/${orgSlug}/profile`}
            />
            {/* <SideBarItem
              label="Settings"
              Icon={SettingsIcon}
              navPath={`/org/${orgSlug}/settings`}
            /> */}

            <div
              onClick={handleLogout}
              className={
                isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
              }
            >
              <SideBarItem
                label={isLoading ? 'Signing out...' : 'Logout'}
                Icon={LogoutIcon}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(OrganizationSideBarDrawer);
