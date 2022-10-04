import BarChartIcon from '../../../../public/icons/bar_chart.svg';
import SideBarItem from './SideBarItem';
import ArrowDropDownIcon from '../../../../public/icons/arrow_drop_down.svg';

const SideBar = () => {
  return (
    <div className='col-span-1 flex flex-col justify-between overflow-y-scroll'>
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
  );
};

export default SideBar;
