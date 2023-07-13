import { useState } from 'react';
import ProfileIcon from '@/icons/SideBar/profile.svg';
import SearchMdIcon from '@/icons/Actions/search_md.svg';
import NotificationsIcon from '@/icons/Actions/Notification.svg';
import TopBarItem from './TopBarItem';

const TopBar = () => {
  return (
    <nav className="sticky top-0 z-10 bg-white w-full border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 border-b-grey-750">
      <div className="justify-between  items-center flex bg-white">
        <div className="font-bold invisible lg:visible ">Home</div>
        <div className='invisible lg:visible sm:flex  justify-end md:justify-between items-center '>
          <div className='flex w-auto'>
            <TopBarItem Icon={SearchMdIcon}/>
            <TopBarItem Icon={NotificationsIcon}/>
            <TopBarItem Icon={ProfileIcon}/>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopBar;


