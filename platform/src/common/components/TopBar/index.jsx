import AirqoLogo from '@/icons/airqo_logo.svg';
import HelpCenterIcon from '@/icons/help_center.svg';
import NotificationsIcon from '@/icons/notifications.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down.svg';
import { useState } from 'react';

const TopBar = () => {
  const [searchInput, setSearchInput] = useState();
  return (
    <nav className='fixed top-0 w-full z-10 p-4 h-16 box-border border border-[#E8E8E8] bg-white'>
      <div className='flex justify-end md:justify-between items-center'>
        <AirqoLogo className='hidden md:block w-[46.56px] h-8' />

        <form className='hidden md:block max-w-[448px] w-full'>
          <input
            type='search'
            id='search'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='w-full h-10 rounded-[4px] bg-[#0000000A] border-0 focus:outline-2 focus:border text-black px-4'
          />
        </form>

        <div className='flex w-auto'>
          <div className='border border-[#E8E8E8] w-10 h-10 rounded-lg ml-3 p-[10px]'>
            <HelpCenterIcon className='w-5 h-5 stroke-[#00000014] opacity-30' />
          </div>
          <div className='border border-[#E8E8E8] w-10 h-10 rounded-lg ml-3 py-[10px] px-3'>
            <NotificationsIcon className='w-4 h-5 stroke-[#00000014] opacity-30' />
          </div>
          <div className='border border-[#E8E8E8] w-full h-10 p-2 box-border rounded-lg flex items-center justify-between ml-3'>
            <div className='flex items-center mr-[22.5px]'>
              <div className='bg-[#DDDDDD] w-6 h-6 p-[5px] rounded-full mr-3'>
                <h3 className='text-[10px] font-normal'>DO</h3>
              </div>
              <h3 className='hidden md:block text-[11px] font-normal'>
                Deo Okedi
              </h3>
            </div>
            <ArrowDropDownIcon />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
