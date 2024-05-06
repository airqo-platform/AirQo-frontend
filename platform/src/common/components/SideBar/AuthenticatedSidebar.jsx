import React, { useState, useEffect, useRef } from 'react';
import CollapseIcon from '@/icons/SideBar/Collapse.svg';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem, SidebarIconItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import CloseIcon from '@/icons/close_icon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import { checkAccess } from '@/core/utils/protectedRoute';
import CollapsedSidebar from './CollapsedSidebar';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import useOutsideClick from '@/core/utils/useOutsideClick';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AuthenticatedSideBar = ({ toggleDrawer, setToggleDrawer }) => {
  const dispatch = useDispatch();
  const sideBarDisplayStyle = toggleDrawer ? 'flex fixed left-0 z-50' : 'hidden';
  const size = useWindowSize();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const currentRoute = router.pathname;
  const navPaths = ['/collocation/overview', '/collocation/collocate'];
  const isCurrentRoute = navPaths.some((path) => currentRoute.includes(path));
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setToggleDrawer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef]);

  useOutsideClick(dropdownRef, () => {
    setDropdown(false);
  });

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  useEffect(() => {
    if (router.pathname === '/map') {
      dispatch(setSidebar(true));
    }
  }, [router.pathname, isCollapsed]);

  return (
    <>
      <div
        className={`${!isCollapsed ? 'w-64' : 'w-[88px]'} transition-all duration-200 ease-in-out`}
        ref={sidebarRef}>
        <div
          className={`${
            size.width >= 1024 ? 'flex' : sideBarDisplayStyle
          } bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200`}>
          <div>
            <div className='p-4 justify-between items-center flex'>
              <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
              <div className={`${isCollapsed ? 'hidden' : ''}`}>
                <button type='button' onClick={() => dispatch(toggleSidebar())}>
                  <CollapseIcon className='invisible md:invisible lg:visible pt-1 h-full flex flex-col flex-3' />
                </button>
                <button
                  type='button'
                  className='lg:hidden relative flex items-center justify-end z-10 w-auto focus:outline-none border border-gray-200 rounded-md'
                  onClick={() => setToggleDrawer(!toggleDrawer)}>
                  <CloseIcon />
                </button>
              </div>
            </div>
            <div className='mt-4 mx-4'>
              <OrganizationDropdown />
            </div>
            <div className='mt-11 mx-4'>
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
                          className={`relative flex items-center p-4 rounded cursor-pointer ${
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
                            className='fixed left-24 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-50'>
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
          <div className='mx-2 mb-3'>
            {isCollapsed ? (
              <SidebarIconItem IconComponent={SettingsIcon} navPath='/settings' />
            ) : (
              <SideBarItem label='Settings' Icon={SettingsIcon} navPath='/settings' />
            )}
          </div>
        </div>
      </div>
      {/* <CollapsedSidebar /> */}
    </>
  );
};

export default AuthenticatedSideBar;
