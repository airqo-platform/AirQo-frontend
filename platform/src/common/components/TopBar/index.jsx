import AirqoLogo from '@/icons/airqo_logo.svg';
import HelpCenterIcon from '@/icons/help_center.svg';
import NotificationsIcon from '@/icons/notifications.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import SearchIcon from '@/icons/Actions/search.svg';
import { useState } from 'react';

const TopBar = () => {
  const [searchInput, setSearchInput] = useState();
  return (
    <nav className='fixed top-0 w-full z-10 px-4 py-3 h-16 box-border border-b-[0.5px] border-b-grey-750 bg-white-900'>
      <div className='flex justify-end md:justify-between items-center'>
        <AirqoLogo className='hidden md:block w-[46.56px] h-8' />

        <form className='hidden relative md:block md:max-w-[280px] lg:max-w-[448px] h-10 w-full'>
          <div className='absolute my-[10px] mx-3'>
            <SearchIcon />
          </div>
          <input
            type='search'
            id='search'
            placeholder='Search'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='h-10 w-full bg-grey-250 flex justify-center pl-10 rounded-md text-sm border-0 focus:outline-none focus:ring focus:ring-violet-300'
          />
        </form>

        <div className='flex w-auto'>
          <div className='border border-grey-750 w-10 h-10 rounded-lg ml-3 p-[10px]'>
            <HelpCenterIcon className='w-5 h-5 stroke-grey-200 opacity-30' />
          </div>
          <div className='border border-grey-750 w-10 h-10 rounded-lg ml-3 py-[10px] px-3'>
            <NotificationsIcon className='w-4 h-5 stroke-grey-200 opacity-30' />
          </div>
          <div className='border border-grey-750 w-full h-10 p-2 box-border rounded-lg flex items-center justify-between ml-3'>
            <div className='flex items-center mr-[22.5px]'>
              <div className='bg-grey-700 w-6 h-6 p-2 rounded-full mr-3 flex justify-center items-center'>
                <h3 className='font-normal text-xs'>DO</h3>
              </div>
              <h3 className='hidden md:block text-xs font-normal'>Deo Okedi</h3>
            </div>
            <ArrowDropDownIcon />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
