import React, { useState, useEffect, useRef } from 'react';
import HomeSmileIcon from '@/icons/SideBar/home_smile.svg';
import CollapseIcon from '@/icons/SideBar/Collapse.svg';
import BookOpenIcon from '@/icons/SideBar/book_open_01.svg';
import NotificationIcon from '@/icons/SideBar/notification_box.svg';
import SupportIcon from '@/icons/SideBar/life_buoy_02.svg';
import SiteIcon from '@/icons/SideBar/Sites.svg';
import GridIcon from '@/icons/SideBar/grid_01.svg';
import SettingsIcon from '@/icons/SideBar/settings_02.svg';
import BarChartSqIcon from '@/icons/SideBar/bar_chart.svg';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';

import CollocationIcon from '@/icons/Collocation/collocation.svg';

const AuthenticatedSideBar = ({ toggleDrawer, setToggleDrawer }) => {
  const sideBarDisplayStyle = toggleDrawer ? 'flex fixed left-0 z-50' : 'hidden';
  const size = useWindowSize();

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

  // Create a ref for the sidebar
  const sidebarRef = useRef();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setToggleDrawer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef]);

  return (
    <div className='w-64' ref={sidebarRef}>
      <div
        className={`${
          size.width >= 1024 ? 'flex' : sideBarDisplayStyle
        } bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200`}>
        <div>
          <div className='p-4 justify-between items-center flex'>
            <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
            <CollapseIcon className='invisible md:visible lg:visible pt-1 h-full flex flex-col flex-3' />
          </div>
          <div className='mt-3 mx-2'>
            {/* <SideBarItem label='Home' Icon={HomeSmileIcon} navPath='/Home/home' />
            <SideBarItem label='Learn' Icon={BookOpenIcon} />
            <SideBarItem label='Notification' Icon={NotificationIcon} /> */}
            {/* <SideBarItem
              label='Analytics'
              Icon={BarChartSqIcon}
              dropdown
              toggleMethod={() => setAnalyticsOpen(!analyticsOpen)}
              toggleState={analyticsOpen}>
              <SideBarDropdownItem itemLabel='Overview' itemPath='' />
              <SideBarDropdownItem itemLabel='AirQlouds' itemPath='/analytics/airqlouds' />
              <SideBarDropdownItem itemLabel='Map view' itemPath='' />
            </SideBarItem>
            <hr className='my-3 h-[0.5px] bg-grey-150' /> */}
            <SideBarItem
              label='Collocation'
              Icon={CollocationIcon}
              dropdown
              toggleMethod={() => setCollocationOpen(!collocationOpen)}
              toggleState={collocationOpen}>
              <SideBarDropdownItem
                itemLabel='Overview'
                itemPath='/analytics/collocation/overview'
              />
              <SideBarDropdownItem
                itemLabel='Collocate'
                itemPath='/analytics/collocation/collocate'
              />
              {/* <SideBarDropdownItem itemLabel='Reports' itemPath='/analytics/collocation/reports' /> */}
            </SideBarItem>
            {/* <SideBarItem label='Sites' Icon={SiteIcon} />
            <SideBarItem label='Other tools' Icon={GridIcon} /> */}
          </div>
        </div>
        <div className='mx-2'>
          {/* <SideBarItem label='Get Support' Icon={SupportIcon} /> */}
          <SideBarItem label='Settings' Icon={SettingsIcon} navPath={'/settings'} />
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedSideBar;
