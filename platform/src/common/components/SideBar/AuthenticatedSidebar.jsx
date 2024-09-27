import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowSize } from '@/lib/windowSize';
import SidebarItem, { SideBarDropdownItem } from './SideBarItem';
import AirqoLogo from '@/icons/airqo_logo.svg';
import WorldIcon from '@/icons/SideBar/world_Icon';
import HomeIcon from '@/icons/SideBar/HomeIcon';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import BarChartIcon from '@/icons/SideBar/BarChartIcon';
import CollocateIcon from '@/icons/SideBar/CollocateIcon';
import OrganizationDropdown from '../Dropdowns/OrganizationDropdown';
import { checkAccess } from '@/core/utils/protectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import { useOutsideClick } from '@/core/hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LeftArrowIcon from '@/icons/SideBar/leftArrowIcon';
import RightArrowIcon from '@/icons/SideBar/rightArrowIcon';
import Button from '../Button';
import Carousel_1 from '../carousels/Carousel_1';

const MAX_WIDTH = '(max-width: 1024px)';

const AuthenticatedSideBar = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();

  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Media query and route handling
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname === '/map') {
        dispatch(setSidebar(true));
      }
    };

    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        dispatch(setSidebar(true));
      }
    };

    const mediaQuery = window.matchMedia(MAX_WIDTH);
    handleRouteChange();
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [dispatch, router.pathname]);

  // Handle window resizing for sidebar collapse in mobile view
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width, dispatch]);

  // Retrieve dropdown states from localStorage
  useEffect(() => {
    const collocationOpenState = localStorage.getItem('collocationOpen');
    const analyticsOpenState = localStorage.getItem('analyticsOpen');

    if (collocationOpenState)
      setCollocationOpen(JSON.parse(collocationOpenState));
    if (analyticsOpenState) setAnalyticsOpen(JSON.parse(analyticsOpenState));
  }, []);

  // Save dropdown states to localStorage
  useEffect(() => {
    localStorage.setItem('collocationOpen', JSON.stringify(collocationOpen));
    localStorage.setItem('analyticsOpen', JSON.stringify(analyticsOpen));
  }, [collocationOpen, analyticsOpen]);

  // Close dropdown when clicked outside
  useOutsideClick(dropdownRef, () => {
    setDropdown(false);
  });

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setDropdown((prevState) => !prevState);
  }, []);

  return (
    <div>
      <div
        className={`transition-all duration-200 ease-in-out ${isCollapsed ? 'w-[88px]' : 'w-[256px]'} hidden h-dvh lg:block relative p-2 z-50`}
      >
        <div className="flex p-3 bg-white h-full lg:relative flex-col overflow-y-auto border border-grey-750 scrollbar-thin rounded-xl scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden">
          <div className="pb-4 flex justify-between items-center">
            <Button
              paddingStyles="p-0 m-0"
              onClick={() => router.push('/Home')}
              variant="text"
            >
              <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
            </Button>
          </div>
          <div className="mt-4">
            <OrganizationDropdown />
          </div>
          <div className="flex flex-col justify-between h-full">
            <div className="mt-10 space-y-2">
              <SidebarItem
                label="Home"
                Icon={HomeIcon}
                navPath="/Home"
                iconOnly={isCollapsed}
              />
              <SidebarItem
                label="Analytics"
                Icon={BarChartIcon}
                navPath="/analytics"
                iconOnly={isCollapsed}
              />

              {isCollapsed ? (
                <hr className="h-[0.5px] bg-grey-150 transition-all duration-300 ease-in-out" />
              ) : (
                <div className="text-xs text-[#7A7F87] px-3 py-3 font-semibold transition-all duration-300 ease-in-out">
                  Network
                </div>
              )}

              {checkAccess('CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES') && (
                <>
                  {isCollapsed ? (
                    <div className="relative">
                      <SidebarItem
                        Icon={CollocateIcon}
                        navPath="#"
                        iconOnly
                        onClick={toggleDropdown}
                      />
                      {dropdown && (
                        <div
                          ref={dropdownRef}
                          className="fixed left-24 top-[300px] w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-xl shadow-lg p-1"
                        >
                          <Link href={'/collocation/overview'}>
                            <div className="w-full p-4 rounded-xl hover:bg-[#f3f6f8] cursor-pointer">
                              Overview
                            </div>
                          </Link>
                          <Link href={'/collocation/collocate'}>
                            <div className="w-full p-4 rounded-xl hover:bg-[#f3f6f8] cursor-pointer">
                              Collocate
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarItem
                      label="Collocation"
                      Icon={CollocateIcon}
                      dropdown
                      toggleMethod={() => setCollocationOpen(!collocationOpen)}
                      toggleState={collocationOpen}
                    >
                      <SideBarDropdownItem
                        itemLabel="Overview"
                        itemPath="/collocation/overview"
                      />
                      <SideBarDropdownItem
                        itemLabel="Collocate"
                        itemPath="/collocation/collocate"
                      />
                    </SidebarItem>
                  )}
                </>
              )}

              <SidebarItem
                label="Pollution map"
                Icon={WorldIcon}
                navPath="/map"
                iconOnly={isCollapsed}
              />
              <SidebarItem
                label="Settings"
                Icon={SettingsIcon}
                navPath="/settings"
                iconOnly={isCollapsed}
              />
            </div>
            <Carousel_1 />
          </div>
        </div>

        {/* Sidebar collapse button */}
        {router.pathname !== '/map' && (
          <div className="absolute flex rounded-full top-11 -right-[3px] z-50 bg-white p-[2px] shadow-md justify-between items-center border">
            <button type="button" onClick={() => dispatch(toggleSidebar())}>
              <LeftArrowIcon className={isCollapsed ? 'hidden' : 'block'} />
              <RightArrowIcon className={isCollapsed ? 'block' : 'hidden'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthenticatedSideBar;
