import React, { useState, useEffect, useRef } from 'react';
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
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import useOutsideClick from '@/core/utils/useOutsideClick';
import { useRouter } from 'next/router';
import LogoutUser from '@/core/utils/LogoutUser';

const SideBarDrawer = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const router = useRouter();
  const userInfo = useSelector((state) => state.login.userInfo);
  const [isLoading, setIsLoading] = useState(false);
  const drawerClasses = size.width < 1024 && togglingDrawer ? 'w-72' : 'w-0';

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Create a ref for the sidebar
  const sidebarRef = useRef();

  useEffect(() => {
    const collocationOpenState = localStorage.getItem('collocationOpen');
    const analyticsOpenState = localStorage.getItem('analyticsOpen');

    if (collocationOpenState) {
      setCollocationOpen(JSON.parse(collocationOpenState));
    }

    if (analyticsOpenState) {
      setAnalyticsOpen(JSON.parse(analyticsOpenState));
    }
  }, []);

  // local storage
  useEffect(() => {
    localStorage.setItem('collocationOpen', JSON.stringify(collocationOpen));
    localStorage.setItem('analyticsOpen', JSON.stringify(analyticsOpen));
  }, [collocationOpen, analyticsOpen]);

  // close sidebar when clicked outside
  useOutsideClick(sidebarRef, () => {
    dispatch(setToggleDrawer(false));
  });

  // if its mobile view, close the sidebar when a link is clicked
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width]);

  // Handle logout
  const handleLogout = (event) => {
    event.preventDefault();
    setIsLoading(true);
    LogoutUser(dispatch, router);
    setIsLoading(false);
  };

  return (
    <>
      {/* overlay */}
      {togglingDrawer && (
        <div className='absolute inset-0 w-full h-dvh opacity-50 bg-black-700 z-[1000] transition-all duration-200 ease-in-out'></div>
      )}
      {/* sidebar */}
      <div
        className={`${drawerClasses} fixed right-0 top-0 z-[99999] border-l-grey-750 border-l-[1px] transition-all duration-200 ease-in-out overflow-hidden`}
        ref={sidebarRef}>
        <div className='flex p-4 bg-white h-dvh lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden'>
          <div>
            <div className='pb-4 flex justify-between items-center'>
              {size.width < 1024 ? (
                <div
                  className='cursor-pointer'
                  onClick={() => {
                    router.push('/settings');
                  }}>
                  {userInfo.profilePicture ? (
                    <img
                      className='w-12 h-12 rounded-full object-cover'
                      src={userInfo.profilePicture || PlaceholderImage}
                      alt=''
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-[28px] flex justify-center items-center bg-[#F3F6F8]'>
                      <PersonIcon fill='#485972' />
                    </div>
                  )}
                </div>
              ) : (
                <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
              )}
              <div className='flex justify-between items-center'>
                <button
                  type='button'
                  className='lg:hidden relative w-auto focus:outline-none border border-gray-200 rounded-xl p-2'
                  onClick={() => dispatch(setToggleDrawer(false))}>
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className='mt-4'>
              <OrganizationDropdown />
            </div>
            <div className='mt-11 space-y-3'>
              <SideBarItem label='Home' Icon={HomeIcon} navPath='/Home' />

              <SideBarItem label='Analytics' Icon={BarChartIcon} navPath='/analytics' />

              <div className='text-xs text-[#6F87A1] px-[10px] my-3 mx-4 font-semibold transition-all duration-300 ease-in-out'>
                Network
              </div>

              {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
                <>
                  <SideBarItem
                    label='Collocation'
                    Icon={CollocateIcon}
                    dropdown
                    toggleMethod={() => setCollocationOpen(!collocationOpen)}
                    toggleState={collocationOpen}>
                    <SideBarDropdownItem itemLabel='Overview' itemPath='/collocation/overview' />
                    <SideBarDropdownItem itemLabel='Collocate' itemPath='/collocation/collocate' />
                  </SideBarItem>
                </>
              )}

              <SideBarItem label='AirQo map' Icon={WorldIcon} navPath='/map' />
            </div>
          </div>
          <div>
            <SideBarItem label='Settings' Icon={SettingsIcon} navPath='/settings' />

            {size.width < 1024 && (
              <div onClick={handleLogout}>
                <SideBarItem label={isLoading ? 'Logging out...' : 'Logout'} Icon={LogoutIcon} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBarDrawer;
