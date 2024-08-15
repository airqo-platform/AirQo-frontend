import React, { useState, useEffect, useRef } from 'react';
import CollapseIcon from '@/icons/SideBar/Collapse.svg';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem, SidebarIconItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
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
import Link from 'next/link';
import { updateUserChecklists } from '@/lib/store/services/checklists/CheckData';
import LogoutUser from '@/core/utils/LogoutUser';
import LeftArrowIcon from '@/icons/sideBar/leftArrowIcon';
import RightArrowIcon from '@/icons/sideBar/rightArrowIcon';

const AuthenticatedSideBar = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const currentRoute = router.pathname;
  const navPaths = ['/collocation/overview', '/collocation/collocate'];
  const isCurrentRoute = navPaths.some((path) => currentRoute.includes(path));
  const dropdownRef = useRef(null);
  const userInfo = useSelector((state) => state.login.userInfo);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

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

  // Close dropdown when clicked outside
  useOutsideClick(dropdownRef, () => {
    setDropdown(false);
  });

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  // if its mobile view, close the sidebar when a link is clicked
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width]);

  // Handle logout
  const handleLogout = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const action = await dispatch(
      updateUserChecklists({
        user_id: userInfo._id,
        items: cardCheckList,
      }),
    );

    // Check the status of the updateUserChecklists request
    if (updateUserChecklists.rejected.match(action)) {
      setIsLoading(false);
      return;
    }

    LogoutUser(dispatch, router);

    setIsLoading(false);
  };
  return (
    <div>
      <div
        className={`${
          isCollapsed ? 'w-[88px]' : 'w-[290px]'
        } hidden h-dvh relative lg:block transition-all duration-200 ease-in-out p-2`}>
        <div className='flex p-2 bg-white h-full lg:relative flex-col justify-between overflow-y-auto border border-grey-750 scrollbar-thin rounded-xl scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden'>
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
            </div>
            <div className='mt-4'>
              <OrganizationDropdown />
            </div>
            <div className='mt-11 space-y-3'>
              {isCollapsed ? (
                <SidebarIconItem IconComponent={HomeIcon} navPath='/Home' />
              ) : (
                <SideBarItem label='Home' Icon={HomeIcon} navPath='/Home' />
              )}
              {isCollapsed ? (
                <SidebarIconItem IconComponent={BarChartIcon} navPath='/analytics' />
              ) : (
                <SideBarItem label='Analytics' Icon={BarChartIcon} navPath='/analytics' />
              )}
              {isCollapsed ? (
                <hr className='my-3 h-[0.5px] bg-grey-150 transition-all duration-300 ease-in-out' />
              ) : (
                <div className='text-xs text-[#6F87A1] px-[10px] my-3 mx-4 font-semibold transition-all duration-300 ease-in-out'>
                  Network
                </div>
              )}
              {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
                <>
                  {isCollapsed ? (
                    <div className='relative'>
                      <div onClick={toggleDropdown}>
                        <div
                          className={`relative flex items-center p-4 rounded-xl cursor-pointer ${
                            isCurrentRoute ? 'bg-light-blue' : ''
                          } hover:bg-gray-200`}>
                          {isCurrentRoute && (
                            <span className='bg-blue-600 w-1 h-1/2 mr-2 absolute rounded-xl -left-2'></span>
                          )}
                          <CollocateIcon fill={isCurrentRoute ? '#145FFF' : '#6F87A1'} />
                        </div>
                      </div>
                      {dropdown && (
                        <div className='relative bottom-20'>
                          <div
                            ref={dropdownRef}
                            className='fixed left-24 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[1000]'>
                            <Link href={'/collocation/overview'}>
                              <div className='w-full p-4 hover:bg-[#f3f6f8] cursor-pointer'>
                                Overview
                              </div>
                            </Link>
                            <Link href={'/collocation/collocate'}>
                              <div className='w-full p-4 hover:bg-[#f3f6f8] cursor-pointer'>
                                Collocate
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SideBarItem
                      label='Collocation'
                      Icon={CollocateIcon}
                      dropdown
                      toggleMethod={() => setCollocationOpen(!collocationOpen)}
                      toggleState={collocationOpen}>
                      <SideBarDropdownItem itemLabel='Overview' itemPath='/collocation/overview' />
                      <SideBarDropdownItem
                        itemLabel='Collocate'
                        itemPath='/collocation/collocate'
                      />
                    </SideBarItem>
                  )}
                </>
              )}
              {isCollapsed ? (
                <SidebarIconItem IconComponent={WorldIcon} navPath='/map' />
              ) : (
                <SideBarItem label='AirQo map' Icon={WorldIcon} navPath='/map' />
              )}
            </div>
          </div>
          <div>
            {isCollapsed ? (
              <SidebarIconItem IconComponent={SettingsIcon} navPath='/settings' />
            ) : (
              <SideBarItem label='Settings' Icon={SettingsIcon} navPath='/settings' />
            )}
            {size.width < 1024 && (
              <div onClick={handleLogout}>
                <SideBarItem label={isLoading ? 'Logging out...' : 'Logout'} Icon={LogoutIcon} />
              </div>
            )}
          </div>
        </div>
        {/* collapse sidebar */}
        <div
          className={`absolute flex rounded-full top-11 -right-[3px] z-[10000] bg-white  p-1 shadow-md justify-between items-center`}>
          <button type='button' className='bg-none' onClick={() => dispatch(toggleSidebar())}>
            <LeftArrowIcon className={isCollapsed ? 'hidden' : 'block'} />
            <RightArrowIcon className={isCollapsed ? 'block' : 'hidden'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedSideBar;
