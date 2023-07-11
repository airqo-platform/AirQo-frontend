import { useState } from 'react';
import ProfileIcon from '@/icons/SideBar/profile.svg';
import SearchMdIcon from '@/icons/SideBar/search-md.svg';
import NotificationsIcon from '@/icons/SideBar/Notification.svg';
import TopBarItem from './TopBarItem';

const TopBar = () => {
  return (
    <div className='sticky top-0'>
      <div className=" w-full bg-white flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
      <div className="font-bold invisible lg:visible">Home</div>
      <div className='invisible lg:visible sm:flex  justify-end md:justify-between items-center'>
        <div className='flex w-auto'>
          <TopBarItem Icon={SearchMdIcon}/>
          <TopBarItem Icon={NotificationsIcon}/>
          <TopBarItem Icon={ProfileIcon}/>
        </div>
      </div>
      </div>
    </div>
  )
}

export default TopBar;


