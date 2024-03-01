import React from 'react';
import SideBarItem, { SideBarDropdownItem, SidebarIconItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import { checkAccess } from '@/core/utils/protectedRoute';

const CollapsedSidebar = () => {
  return (
    <div className='w-[88px]'>
      <div className='flex bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200'>
        <div className='flex flex-col items-center justify-center'>
          <div className='p-4 justify-between items-center flex'>
            <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
          </div>
          <div className='mt-3 mx-2'>
            <SidebarIconItem IconComponent={HomeIcon} navPath='/Home' />
            <SidebarIconItem IconComponent={BarChartIcon} navPath='/analytics' />
            <hr className='my-3 h-[0.5px] bg-grey-150' />
            {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
              <SidebarIconItem IconComponent={CollocateIcon} navPath='/collocation/overview' />
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