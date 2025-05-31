'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import PropTypes from 'prop-types';
import Button from '../Button';
import MenuBarIcon from '@/icons/menu_bar';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import UserIcon from '@/icons/Topbar/userIcon';
import ChartIcon from '@/icons/Topbar/chartIcon';
import CustomDropdown from '../Button/CustomDropdown';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import {
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import LogoutUser from '@/core/utils/LogoutUser';
import GroupLogo from '../GroupLogo';

const TopBar = ({ topbarTitle, noBorderBottom, showSearch = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // Safe selector for Redux login state with error handling
  const reduxUserInfo = useSelector((state) => {
    try {
      return state?.login?.userInfo || {};
    } catch {
      // Silent fallback during logout when store is reset
      return {};
    }
  });

  // Use NextAuth session first, fallback to Redux state
  const userInfo = session?.user || reduxUserInfo;

  const togglingDrawer = useSelector((state) => {
    try {
      return state?.sidebar?.toggleDrawer || false;
    } catch {
      // Silent fallback during logout when store is reset
      return false;
    }
  });

  // Client-side only state to prevent hydration issues
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const placeholderImage = useMemo(() => {
    // Add null checks to prevent TypeError
    const firstInitial = userInfo?.firstName?.[0] || '';
    const lastInitial = userInfo?.lastName?.[0] || '';
    return `https://ui-avatars.com/api/?name=${firstInitial}+${lastInitial}&background=random`;
  }, [userInfo?.firstName, userInfo?.lastName]);

  const handleLogout = useCallback(
    async (event) => {
      event.preventDefault();

      // Prevent multiple logout attempts
      if (isLoading) return;

      setIsLoading(true);
      try {
        await LogoutUser(dispatch, router);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, router, isLoading],
  );

  const handleClick = useCallback(
    (path) => (event) => {
      event.preventDefault();
      router.push(path);
    },
    [router],
  );

  const handleDrawer = useCallback(
    (e) => {
      e.preventDefault();
      try {
        dispatch(setToggleDrawer(!togglingDrawer));
        dispatch(setSidebar(false));
      } catch {
        // Silent fallback if dispatch fails during logout
      }
    },
    [dispatch, togglingDrawer],
  );

  const renderUserInfo = () => (
    <div className="flex items-center space-x-3 p-1">
      <div className="relative">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={userInfo?.profilePicture || placeholderImage}
          alt="User avatar"
        />
        <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
      </div>
      <div className="font-medium dark:text-white overflow-hidden">
        <div className="capitalize truncate max-w-[14ch]">
          {`${userInfo?.firstName || 'User'} ${userInfo?.lastName || ''}`}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[21ch]">
          {userInfo?.email || 'No email'}
        </div>
      </div>
    </div>
  );

  const renderDropdownContent = () => (
    <>
      {renderUserInfo()}
      <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />
      <ul className="dropdown-list p-2">
        <li
          onClick={handleClick('/settings')}
          className="flex items-center text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2"
        >
          <span className="mr-3">
            <UserIcon width={16} height={16} />
          </span>
          My profile
        </li>
        <li
          onClick={handleClick('/settings')}
          className="flex items-center text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2"
        >
          <span className="mr-3">
            <SettingsIcon width={17} height={17} />
          </span>
          Settings
        </li>
      </ul>
      <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />
      <ul className="dropdown-list p-2">
        <li
          onClick={handleLogout}
          className={`text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2 flex items-center justify-between ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <span>{isLoading ? 'Signing out...' : 'Log out'}</span>
          {isLoading && (
            <div className="flex items-center">
              <div className="animate-pulse w-2 h-2 bg-current rounded-full mr-1"></div>
              <div className="animate-pulse w-2 h-2 bg-current rounded-full mr-1 delay-75"></div>
              <div className="animate-pulse w-2 h-2 bg-current rounded-full delay-150"></div>
            </div>
          )}
        </li>
      </ul>
    </>
  );

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      try {
        dispatch(setOpenModal(true));
        dispatch(setModalType({ type, ids }));
      } catch {
        // Silent fallback if dispatch fails during logout
      }
    },
    [dispatch],
  );
  const renderProfileTrigger = () => (
    <div className="cursor-pointer">
      <img
        className="w-8 h-8 rounded-full object-cover"
        src={userInfo?.profilePicture || placeholderImage}
        alt="User avatar"
      />
    </div>
  );

  // Don't render until client-side hydration is complete to prevent mismatch
  if (!mounted) {
    return (
      <div className="space-y-3">
        <nav className="z-50 w-full py-2 px-2 md:px-0 rounded-xl bg-white shadow-sm border border-gray-200 lg:shadow-none lg:bg-transparent lg:border-none">
          <div className="flex justify-between items-center">
            <div className="block lg:hidden relative z-10 w-full">
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
              <div className="flex items-center gap-[10px]">
                <span className="p-2 rounded-full bg-[#E2E3E5]">
                  <ChartIcon width={20} height={20} />
                </span>
                <div>{topbarTitle}</div>
              </div>
            </div>
            <div className="hidden lg:flex gap-2 items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="lg:hidden w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <nav
        className={`z-50 w-full py-2 px-2 md:px-0 rounded-xl bg-white shadow-sm border border-gray-200 lg:shadow-none lg:bg-transparent lg:border-none ${!noBorderBottom ? 'border-b-[1px] border-b-grey-750' : ''}`}
      >
        <div id="topBar-nav" className="flex justify-between items-center">
          <div className="block lg:hidden relative z-10 w-full">
            <Button
              paddingStyles="p-0 m-0"
              onClick={() => {
                router.push('/Home');
              }}
              variant="text"
            >
              <GroupLogo />
            </Button>
          </div>

          <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
            <div className="flex items-center gap-[10px]">
              <span className="p-2 rounded-full bg-[#E2E3E5]">
                <ChartIcon width={20} height={20} />
              </span>
              <div>{topbarTitle}</div>
            </div>
          </div>

          <div className="hidden lg:flex gap-2 items-center">
            <CustomDropdown
              trigger={renderProfileTrigger()}
              dropdownAlign="right"
              dropdownWidth="200px"
            >
              {renderDropdownContent()}
            </CustomDropdown>
          </div>

          <Button
            paddingStyles="p-0 m-0"
            className="lg:hidden relative flex items-center justify-start z-10 w-auto focus:outline-none"
            onClick={handleDrawer}
            variant="text"
          >
            <span className="p-2">
              <MenuBarIcon />
            </span>
          </Button>
        </div>
      </nav>
      {showSearch && (
        <div className="lg:hidden flex flex-col md:flex-row justify-between py-2 gap-3 items-center w-full">
          <div className="font-medium flex items-center justify-start w-full text-2xl text-neutral-light-800">
            <div className="flex items-center gap-[10px]">
              <span className="p-2 rounded-full bg-[#E2E3E5]">
                <ChartIcon width={20} height={20} />
              </span>
              <div>{topbarTitle}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleOpenModal('search');
            }}
          >
            {/* <TopBarSearch customWidth="md:max-w-[192px]" /> */}
          </button>
        </div>
      )}
    </div>
  );
};

TopBar.propTypes = {
  showSearch: PropTypes.bool,
  topbarTitle: PropTypes.string,
  noBorderBottom: PropTypes.bool,
};

export default React.memo(TopBar);
