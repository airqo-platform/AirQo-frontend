import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import CloseIcon from '@/icons/close_icon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import LogoutIcon from '@/icons/SideBar/LogoutIcon';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import { checkAccess } from '@/core/utils/protectedRoute';
import PersonIcon from '@/icons/Settings/PersonIcon';
import { useSelector, useDispatch } from 'react-redux';
import { setToggleDrawer } from '@/lib/store/services/sideBar/SideBarSlice';
import { useRouter } from 'next/router';
// import Carousel_1 from '../carousels/Carousel_1';
import LogoutUser from '@/core/utils/LogoutUser';
import Card from '@/components/CardWrapper';

const SideBarDrawer = () => {
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const router = useRouter();
  const userInfo = useSelector((state) => state.login.userInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [collocationOpen, setCollocationOpen] = useState(() => {
    try {
      const storedValue = localStorage.getItem('collocationOpen');
      if (!storedValue || storedValue === 'undefined') {
        return false;
      }
      return JSON.parse(storedValue);
    } catch (error) {
      console.error(
        'Error parsing "collocationOpen" from localStorage:',
        error,
      );
      return false;
    }
  });

  // Compute the drawer width based on the toggle state.
  // This ensures that on desktop it uses the fixed width ('w-72') and not full screen.
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
      setIsLoading(true);
      await LogoutUser(dispatch, router);
      setIsLoading(false);
    },
    [dispatch, router],
  );

  const toggleCollocation = useCallback(() => {
    setCollocationOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('collocationOpen', JSON.stringify(newState));
      return newState;
    });
  }, []);

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

  const renderCollocationSection = useCallback(() => {
    if (!checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES')) {
      return null;
    }
    return (
      <SideBarItem
        label="Collocation"
        Icon={CollocateIcon}
        dropdown
        toggleMethod={toggleCollocation}
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
      </SideBarItem>
    );
  }, [collocationOpen, toggleCollocation]);

  // Prevent body scrolling when drawer is open
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
        contentClassName="flex p-4 h-full flex-col overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden"
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
        <div className="mt-4">
          <OrganizationDropdown />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="mt-11 space-y-3">
            <SideBarItem label="Home" Icon={HomeIcon} navPath="/Home" />
            <SideBarItem
              label="Analytics"
              Icon={BarChartIcon}
              navPath="/analytics"
            />
            <div className="text-xs text-[#6F87A1] px-[10px] my-3 mx-4 font-semibold transition-all duration-300 ease-in-out">
              Network
            </div>
            {renderCollocationSection()}
            <SideBarItem label="Map" Icon={WorldIcon} navPath="/map" />
            <SideBarItem
              label="Settings"
              Icon={SettingsIcon}
              navPath="/settings"
            />
            <div onClick={handleLogout}>
              <SideBarItem
                label={isLoading ? 'Logging out...' : 'Logout'}
                Icon={LogoutIcon}
              />
            </div>
          </div>

          {/* TODO: Add carousel BACK later */}
          {/* <Carousel_1 className="w-full" cardWidth="min-w-[250px]" /> */}
        </div>
      </Card>
    </>
  );
};

export default React.memo(SideBarDrawer);
