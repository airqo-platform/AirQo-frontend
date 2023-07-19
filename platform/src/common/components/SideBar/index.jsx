import HomeSmileIcon from '@/icons/SideBar/home_smile.svg';
import CollapseIcon from '@/icons/SideBar/Collapse.svg';
import BookOpenIcon from '@/icons/SideBar/book_open_01.svg';
import NotificationIcon from '@/icons/SideBar/notification_box.svg';
import SupportIcon from '@/icons/SideBar/life_buoy_02.svg';
import SiteIcon from '@/icons/SideBar/Sites.svg';
import GridIcon from '@/icons/SideBar/grid_01.svg';
import SettingsIcon from '@/icons/SideBar/settings_02.svg';
import BarChartSqIcon from '@/icons/SideBar/bar_chart.svg';
import ArrowDropDownIcon from '@/icons/arrow_drop_down';
import MenuBarIcon from '@/icons/menu_bar';
import { useEffect, useState } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import AnnouncementCard from './AnnouncementCard';

import CollocationIcon from '@/icons/Collocation/collocation.svg';
import Link from 'next/link';

const SideBar = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const sideBarDisplayStyle = toggleDrawer ? 'flex fixed top-16 left-0 z-10' : 'hidden';
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

  // local storage
  useEffect(() => {
    localStorage.setItem('collocationOpen', JSON.stringify(collocationOpen));
    localStorage.setItem('analyticsOpen', JSON.stringify(analyticsOpen));
  }, [collocationOpen, analyticsOpen]);

  return (
    <div className='w-64'>
      <div
        className={`${
          size.width >= 1024 ? 'flex' : sideBarDisplayStyle
        } bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200`}>
        <div>
          <div
            className='
              p-4
              flex
              flex-row
              justify-between
            '>
            <AirqoLogo className='invisible md:visible lg:visible w-[46.56px] h-8 flex flex-col flex-1' />
            <CollapseIcon className='pt-1 h-full flex flex-col flex-3' />
          </div>
          {/* <div className='border border-grey-750 h-10 p-2 box-border rounded-lg flex items-center justify-between mx-4 mt-4'>
            <div className='flex justify-start items-center'>
              <div className='bg-grey-700 w-8 h-8 p-[5px] flex items-center justify-center rounded-full mr-4'>
                <h3 className='text-sm font-normal'>FP</h3>
              </div>
              <h3 className='text-sm font-normal'>Fort Portal</h3>
            </div>
            <ArrowDropDownIcon />
          </div> */}
          <div className='mt-3 mx-2'>
            <SideBarItem label='Home' Icon={HomeSmileIcon} navPath='/Home/home' />
            <SideBarItem label='Learn' Icon={BookOpenIcon} />
            <SideBarItem label='Notification' Icon={NotificationIcon} />
            <SideBarItem
              label='Analytics'
              Icon={BarChartSqIcon}
              dropdown
              toggleMethod={() => setAnalyticsOpen(!analyticsOpen)}
              toggleState={analyticsOpen}>
              <SideBarDropdownItem itemLabel='Overview' itemPath='' />
              <SideBarDropdownItem itemLabel='AirQlouds' itemPath='/analytics/airqlouds' />
              <SideBarDropdownItem itemLabel='Map view' itemPath='' />
            </SideBarItem>
            <hr className='my-3 h-[0.5px] bg-grey-150' />
            <SideBarItem label='Sites' Icon={SiteIcon} />
            <SideBarItem label='Other tools' Icon={GridIcon} />
          </div>
        </div>
        <Link href='/account/creation'>
          <AnnouncementCard />
        </Link>
        <div className='mx-2'>
          <SideBarItem label='Get Support' Icon={SupportIcon} />
          <SideBarItem label='Settings' Icon={SettingsIcon} />
        </div>
      </div>
      <div
        className='lg:hidden fixed top-5 right-10 z-30'
        role='button'
        tabIndex={0}
        onKeyDown={() => setToggleDrawer(!toggleDrawer)}
        onClick={() => setToggleDrawer(!toggleDrawer)}>
        <MenuBarIcon />
      </div>
    </div>
  );
};

export default SideBar;
