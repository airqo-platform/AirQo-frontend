import { useState } from 'react';
import ProfileIcon from '@/icons/SideBar/Profile.svg';
import SearchMdIcon from '@/icons/SideBar/search-md.svg';
import NotificationsIcon from '@/icons/SideBar/Notification.svg';

const TopBar = () => {
  return (
    <div>
      <div className="w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
       <div className="font-bold">Home</div>
        <div className='flex  justify-end md:justify-between items-center'>
         <div className='flex w-auto'>
           <div className='border border-grey-750 w-15 h-10 rounded-lg flex items-center justify-between ml-3 p-[10px]'>
             {/* <SearchMdIcon  /> */}
             A
           </div>
           <div className='border border-grey-750 w-full h-10 rounded-lg ml-3 flex items-center justify-between py-[10px] px-3'>
             {/* <NotificationsIcon /> */}
             A
           </div>
           <div className='border border-grey-750 w-full h-10 p-2 box-border rounded-lg flex items-center justify-between ml-3'>
            
             {/* <ProfileIcon /> */}
             A
           </div>
         </div>
       </div>
     </div>
    </div>
  )
}

export default TopBar;


