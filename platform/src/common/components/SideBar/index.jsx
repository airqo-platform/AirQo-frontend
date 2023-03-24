import BarChartIcon from '@/icons/bar_chart.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import MenuBarIcon from '@/icons/menu_bar';
import { useEffect, useState } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem } from './SideBarItem';

import CollocationIcon from '@/icons/Collocation/collocation.svg';

const SideBar = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const sideBarDisplayStyle = toggleDrawer ? 'flex absolute top-16 left-0 z-10' : 'hidden';
  const size = useWindowSize();

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

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

  useEffect(() => {
    localStorage.setItem('collocationOpen', JSON.stringify(collocationOpen));
    localStorage.setItem('analyticsOpen', JSON.stringify(analyticsOpen));
  }, [collocationOpen, analyticsOpen]);

  return (
    <div className='w-64'>
      <div
        className={`${
          size.width >= 1024 ? 'flex' : sideBarDisplayStyle
        } bg-white h-[calc(100vh-64px)] md:relative flex-col justify-between overflow-y-scroll border-t-0 border-r-[1px] border-r-grey-750`}
      >
        <div>
          <div className='border border-grey-750 h-14 p-3 box-border rounded-lg flex items-center justify-between mx-4 mt-4'>
            <div className='flex justify-start items-center'>
              <div className='bg-grey-700 w-8 h-8 p-[5px] flex items-center justify-center rounded-full mr-4'>
                <h3 className='text-sm font-normal'>FP</h3>
              </div>
              <h3 className='text-sm font-normal'>Fort Portal</h3>
            </div>
            <ArrowDropDownIcon />
          </div>
          <div className='mt-5 mx-2'>
            <SideBarItem label='Home' Icon={BarChartIcon} navPath='/' />
            <SideBarItem label='Notifications' Icon={BarChartIcon} />
            <SideBarItem
              label='Analytics'
              Icon={BarChartIcon}
              dropdown
              toggleMethod={() => setAnalyticsOpen(!analyticsOpen)}
              toggleState={analyticsOpen}
            >
              <SideBarDropdownItem itemLabel='Overview' itemPath='' />
              <SideBarDropdownItem itemLabel='AirQlouds' itemPath='/analytics/airqlouds' />
              <SideBarDropdownItem itemLabel='Map view' itemPath='' />
              <SideBarDropdownItem itemLabel='Reports' itemPath='' />
            </SideBarItem>

            <hr className='my-3 h-[0.5px] bg-grey-150' />

            <SideBarItem label='Network' Icon={BarChartIcon} />
            <SideBarItem
              label='Collocation'
              Icon={CollocationIcon}
              dropdown
              toggleMethod={() => setCollocationOpen(!collocationOpen)}
              toggleState={collocationOpen}
            >
              <SideBarDropdownItem itemLabel='Overview' itemPath='/collocation/overview' />
              <SideBarDropdownItem itemLabel='Collocate' itemPath='/collocation/collocate' />
            </SideBarItem>
            <SideBarItem label='Calibrate' Icon={BarChartIcon} />
            <SideBarItem label='Other tools' Icon={BarChartIcon} />
          </div>
        </div>

        <div className='mx-2'>
          <SideBarItem label='Settings' Icon={BarChartIcon} active />
        </div>
      </div>
      <div
        className='md:hidden fixed top-5 left-4 z-30'
        role='button'
        tabIndex={0}
        onKeyDown={() => setToggleDrawer(!toggleDrawer)}
        onClick={() => setToggleDrawer(!toggleDrawer)}
      >
        <MenuBarIcon />
      </div>
    </div>
  );
};

export default SideBar;
