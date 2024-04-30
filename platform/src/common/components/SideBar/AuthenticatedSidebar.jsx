import React, { useState, useEffect } from 'react';
import CollapseIcon from '@/icons/SideBar/Collapse.svg';
import { useWindowSize } from '@/lib/windowSize';
import SideBarItem, { SideBarDropdownItem, SidebarIconItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import CloseIcon from '@/icons/close_icon';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import { checkAccess } from '@/core/utils/protectedRoute';
import CollapsedSidebar from './CollapsedSidebar';
import { Steps } from 'intro.js-react';
import { tr } from 'date-fns/locale';

const AuthenticatedSideBar = ({ toggleDrawer, setToggleDrawer, collapsed, setCollapsed }) => {
  const sideBarDisplayStyle = toggleDrawer ? 'flex fixed left-0 z-50' : 'hidden';
  const size = useWindowSize();

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // intro.js
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [steps] = useState([
    {
      element: '#step-0',
      intro:
        "Welcome to the <b>AirQo Analytics Platform!</b> We are committed to providing you with comprehensive air quality data. Let's get started!",
    },
    {
      element: '#step-1',
      intro:
        'This is the <b>Analytics Page</b>. Here, you can view detailed air quality data and gain insights into air quality trends. You also have the option to download the data for further analysis.',
      position: 'right',
    },
    {
      element: '#step-2',
      intro:
        'Next, we have the <b>Air Quality Map</b>. This interactive map allows you to visualize air quality data geographically. You can zoom in to specific locations for more detailed information.',
      position: 'right',
    },
    {
      element: '#step-3',
      intro:
        'Finally, this is the <b>Settings Page</b>. Here, you can customize your user experience, manage your account settings, and more. Make sure to explore all the options available to you!',
      position: 'right',
    },
  ]);

  const onExit = () => {
    setStepsEnabled(false);
  };

  // Enable the steps when the component is mounted
  useEffect(() => {
    setStepsEnabled(true);
  }, []);

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

  return !collapsed ? (
    <div>
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        keyboardNavigation={true}
        onExit={onExit}
        options={{
          showBullets: false,
          positionPrecedence: ['left', 'right', 'top', 'bottom'],
          hidePrev: true,
          exitOnOverlayClick: false,
          tooltipClass: 'w-[460px] rounded-lg shadow-lg bg-white text-gray-800',
        }}
      />

      <div className='w-64'>
        <div
          className={`${
            size.width >= 1024 ? 'flex' : sideBarDisplayStyle
          } bg-white h-[calc(100vh)] lg:relative flex-col justify-between overflow-y-auto border-t-0 border-r-[1px] border-r-grey-750 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-200`}>
          <div>
            <div className='p-4 justify-between items-center flex'>
              <AirqoLogo className='w-[46.56px] h-8 flex flex-col flex-1' />
              <button type='button' onClick={() => setCollapsed(!collapsed)}>
                <CollapseIcon className='invisible md:invisible lg:visible pt-1 h-full flex flex-col flex-3' />
              </button>
              <button
                type='button'
                className='lg:hidden relative flex items-center justify-end z-10 w-auto focus:outline-none border border-gray-200 rounded-md'
                onClick={() => setToggleDrawer(!toggleDrawer)}>
                <CloseIcon />
              </button>
            </div>
            <div className='mt-7 mx-4'>
              <OrganizationDropdown />
            </div>
            <div className='mt-11 mx-2'>
              <SideBarItem label='Home' Icon={HomeIcon} navPath='/Home' />
              <div id='step-1'>
                <SideBarItem label='Analytics' Icon={BarChartIcon} navPath='/analytics' />
              </div>
              {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
                <SideBarItem
                  label='Collocation'
                  Icon={CollocateIcon}
                  dropdown
                  toggleMethod={() => setCollocationOpen(!collocationOpen)}
                  toggleState={collocationOpen}>
                  <SideBarDropdownItem itemLabel='Overview' itemPath='/collocation/overview' />
                  <SideBarDropdownItem itemLabel='Collocate' itemPath='/collocation/collocate' />
                </SideBarItem>
              )}
              <div id='step-2'>
                <SideBarItem label='AirQo map' Icon={WorldIcon} navPath='/map' />
              </div>
            </div>
          </div>
          <div className='mx-2 mb-3' id='step-3'>
            <SideBarItem label='Settings' Icon={SettingsIcon} navPath={'/settings'} />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <CollapsedSidebar />
  );
};

export default AuthenticatedSideBar;
