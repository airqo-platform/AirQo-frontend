import React, { useState, useEffect, useRef } from 'react';
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
import PersonIcon from '@/icons/Settings/PersonIcon';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import useOutsideClick from '@/core/utils/useOutsideClick';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LeftArrowIcon from '@/icons/SideBar/leftArrowIcon';
import RightArrowIcon from '@/icons/SideBar/rightArrowIcon';

const AuthenticatedSideBar = () => {
  const dispatch = useDispatch();
  const size = useWindowSize();
  const MAX_WIDTH = '(max-width: 1024px)';
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const router = useRouter();
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userInfo = useSelector((state) => state.login.userInfo);

  // Toggle Dropdown open and close
  const [collocationOpen, setCollocationOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/map') {
        dispatch(setSidebar(true));
      }
    };

    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        dispatch(setSidebar(true));
      }
    };

    const mediaQuery = window.matchMedia(MAX_WIDTH);

    // Call the functions initially
    handleRouteChange();
    if (mediaQuery.matches) {
      handleMediaQueryChange(mediaQuery);
    }

    // Add event listeners
    window.addEventListener('popstate', handleRouteChange);
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [dispatch, size]);

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

  // Close dropdown when clicked outside
  useOutsideClick(dropdownRef, () => {
    setDropdown(false);
  });

  const toggleDropdown = () => {
    setDropdown(!dropdown);
  };

  // if its mobile view, close the sidebar when a link is clicked
  useEffect(() => {
    if (size.width < 1024) {
      dispatch(setSidebar(false));
      dispatch(setToggleDrawer(false));
    }
  }, [size.width]);

  return (
    <div>
      <div
        className={`${
          isCollapsed ? 'w-[88px]' : 'w-[256px]'
        } hidden h-dvh relative lg:block transition-all duration-200 ease-in-out p-2`}
      >
        <div className="flex p-3 bg-white h-full lg:relative flex-col justify-between overflow-y-auto border border-grey-750 scrollbar-thin rounded-xl scrollbar-thumb-gray-800 scrollbar-track-gray-200 overflow-x-hidden">
          <div>
            <div className="pb-4 flex justify-between items-center">
              {size.width < 1024 ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    router.push('/settings');
                  }}
                >
                  {userInfo.profilePicture ? (
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={userInfo.profilePicture}
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-[28px] flex justify-center items-center bg-[#F3F6F8]">
                      <PersonIcon fill="#485972" />
                    </div>
                  )}
                </div>
              ) : (
                <AirqoLogo className="w-[46.56px] h-8 flex flex-col flex-1" />
              )}
            </div>
            <div className="mt-4">
              <OrganizationDropdown />
            </div>
            <div className="mt-11 space-y-3">
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
                <hr className="my-3 h-[0.5px] bg-grey-150 transition-all duration-300 ease-in-out" />
              ) : (
                <div className="text-xs text-[#7A7F87] px-[10px] my-3 mx-4 font-semibold transition-all duration-300 ease-in-out">
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
                        <div className="relative bottom-20">
                          <div
                            ref={dropdownRef}
                            className="fixed left-24 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-[1000]"
                          >
                            <Link href={'/collocation/overview'}>
                              <div className="w-full p-4 hover:bg-[#f3f6f8] cursor-pointer">
                                Overview
                              </div>
                            </Link>
                            <Link href={'/collocation/collocate'}>
                              <div className="w-full p-4 hover:bg-[#f3f6f8] cursor-pointer">
                                Collocate
                              </div>
                            </Link>
                          </div>
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
          </div>
        </div>
        {/* collapse sidebar */}
        {router.pathname !== '/map' && (
          <div
            className={`absolute flex rounded-full top-11 -right-[3px] z-50 bg-white  p-1 shadow-md justify-between items-center`}
          >
            <button
              type="button"
              className="bg-none"
              onClick={() => dispatch(toggleSidebar())}
            >
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
