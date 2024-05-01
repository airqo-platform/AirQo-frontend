import React, { useEffect, useRef, useState } from 'react';
import { SidebarIconItem } from './SideBarItem';
import Link from 'next/link';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import AirqoLogo from '@/icons/airqo_logo.svg';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import { checkAccess } from '@/core/utils/protectedRoute';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebar } from '@/lib/store/services/sideBar/SideBarSlice';
import useOutsideClick from '@/core/utils/useOutsideClick';

const CollapsedSidebar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [dropdown, setDropdown] = useState(false);
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const dropdownRef = useRef(null);
  const currentRoute = router.pathname;
  const navPaths = ['/collocation/overview', '/collocation/collocate'];
  const isCurrentRoute = navPaths.some((path) => currentRoute.includes(path));

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
    <div className='w-[88px]'>
      <div
        className='flex bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200'
        style={{
          zIndex: 1000,
        }}>
        <div className='flex flex-col items-center justify-center'>
          <div className='p-4 justify-between items-center flex'>
            <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
          </div>
          <div className='mt-4'>
            <OrganizationDropdown />
          </div>
          <div className='mt-11'>
            <SidebarIconItem IconComponent={HomeIcon} navPath='/Home' />
            <SidebarIconItem IconComponent={BarChartIcon} navPath='/analytics' />
            <hr className='my-3 h-[0.5px] bg-grey-150' />
            {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
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
                  <div
                    ref={dropdownRef}
                    className='fixed top-[31%] left-[95px] w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-50'>
                    <Link href={'/collocation/overview'}>
                      <div className='w-full p-4 hover:bg-[#f3f6f8] cursor-pointer'>Overview</div>
                    </Link>
                    <Link href={'/collocation/collocate'}>
                      <div className='w-full p-4 hover:bg-[#f3f6f8] cursor-pointer'>Collocate</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
            <SidebarIconItem IconComponent={WorldIcon} navPath='/map' />
          </div>
        </div>
        <div className='mx-2 mb-2 flex items-center justify-center'>
          <SidebarIconItem IconComponent={SettingsIcon} navPath='/settings' />
        </div>
      </div>
    </div>
  );
};

export default CollapsedSidebar;
