import React, { useCallback, useMemo, useEffect } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem from '../SideBar/SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import CloseIcon from '@/icons/close_icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import PersonIcon from '@/icons/Settings/PersonIcon';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTogglingGlobalDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useRouter } from 'next/navigation';
import Card from '@/components/CardWrapper';

const GlobalSideBarDrawer = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const togglingGlobalDrawer = useSelector(
    (state) => state.sidebar.toggleGlobalDrawer,
  );
  const router = useRouter();
  const userInfo = useSelector((state) => state.login.userInfo);

  // Compute the drawer width based on the toggle state.
  // This ensures that on desktop it uses the fixed width ('w-72') and not full screen.
  const drawerWidth = useMemo(
    () => (togglingGlobalDrawer ? 'w-72' : 'w-0'),
    [togglingGlobalDrawer],
  );

  const closeDrawer = useCallback(() => {
    dispatch(setTogglingGlobalDrawer(false));
    dispatch(setSidebar(false));
  }, [dispatch]);

  const renderUserAvatar = () =>
    userInfo.profilePicture ? (
      <img
        className="w-12 h-12 rounded-full object-cover"
        src={userInfo.profilePicture}
        alt="User avatar"
      />
    ) : (
      <div className="w-12 h-12 rounded-[28px] flex justify-center items-center bg-[#F3F6F8]">
        <PersonIcon fill="#485972" />
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
        className="fixed left-0 top-0 h-full z-[999999] border-r-grey-750 border-r-[1px] transition-all duration-200 ease-in-out overflow-hidden"
        contentClassName="flex p-4 h-full flex-col overflow-y-auto border-t-0 border-l-[1px] border-l-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden"
      >
        <div className="pb-4 flex justify-between items-center">
          {width < 1024 ? (
            <div
              className="cursor-pointer"
              onClick={() => router.push('/settings')}
            >
              {renderUserAvatar()}
            </div>
          ) : (
            <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
          )}
          <button
            type="button"
            className="relative w-auto focus:outline-none border border-gray-200 rounded-xl p-2"
            onClick={closeDrawer}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="mt-11 space-y-3">
            <SideBarItem
              label="Data Access"
              Icon={HomeIcon}
              navPath={
                ['/Home', '/analytics', '/map'].includes(router.pathname)
                  ? router.pathname
                  : '/Home'
              }
            />
            <SideBarItem
              label="Admin Panel"
              Icon={BarChartIcon}
              navPath="/admin/organisations/pending"
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default React.memo(GlobalSideBarDrawer);
