import BarChartIcon from '@/icons/bar_chart.svg';
import SideBarItem from './SideBarItem';
import ArrowDropDownIcon from '@/icons/arrow_drop_down.svg';
import MenuBarIcon from '@/icons/menu_bar.js';
import { useState } from 'react';
import { useWindowSize } from '@/lib/windowSize';

const SideBar = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  let sideBarDisplayStyle = toggleDrawer
    ? 'flex absolute top-16 left-0 z-10'
    : 'hidden';
  let size = useWindowSize();

  return (
    <div className='w-64'>
      <div
        className={`${
          size.width >= 768 ? 'flex' : sideBarDisplayStyle
        } bg-white h-[calc(100vh-64px)] md:relative flex-col justify-between overflow-y-scroll border-t-0 border-r-[1px] border-r-[#E8E8E8]`}
      >
        <div>
          <div className='border border-[#E8E8E8] h-10 p-2 box-border rounded-lg flex items-center justify-between mx-4 mt-4 opacity-[0.16]'>
            <div className='flex mr-[22.5px]'>
              <div className='bg-[#DDDDDD] w-6 h-6 p-[5px] rounded-full mr-3'>
                <h3 className='text-[10px] font-normal'>FP</h3>
              </div>
              <h3>Fort Portal</h3>
            </div>
            <ArrowDropDownIcon />
          </div>
          <div className='mt-5 mx-2'>
            <SideBarItem label='Home' Icon={BarChartIcon} navPath='/' />
            <SideBarItem label='Notifications' Icon={BarChartIcon} />
            <SideBarItem label='Analytics' Icon={BarChartIcon} dropdown />
            <hr className='my-3 border border-[#00000014]' />
            <SideBarItem label='Network' Icon={BarChartIcon} />
            <SideBarItem label='Collocation' Icon={BarChartIcon} />
            <SideBarItem label='Calibrate' Icon={BarChartIcon} />
            <SideBarItem label='All tools' Icon={BarChartIcon} />
          </div>
        </div>

        <div className='mx-2'>
          <SideBarItem label='Settings' Icon={BarChartIcon} active />
        </div>
      </div>
      <div
        className='block md:hidden absolute top-4 left-4 z-30'
        onClick={() => setToggleDrawer(!toggleDrawer)}
      >
        <MenuBarIcon />
      </div>
    </div>
  );
};

export default SideBar;
