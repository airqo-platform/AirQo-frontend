import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../Button';
import MenuBarIcon from '@/icons/menu_bar';
import AirqoLogo from '@/icons/airqo_logo.svg';
import Spinner from '@/components/Spinner';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import UserIcon from '@/icons/Topbar/userIcon';
import ChartIcon from '@/icons/Topbar/chartIcon';
import CustomDropdown from '../Dropdowns/CustomDropdown';
import TopBarSearch from '../search/TopBarSearch';

import {
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import LogoutUser from '@/core/utils/LogoutUser';

const TopBar = ({ topbarTitle, noBorderBottom }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const [isLoading, setIsLoading] = useState(false);

  const placeholderImage = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${userInfo.firstName[0]}+${userInfo.lastName[0]}&background=random`,
    [userInfo.firstName, userInfo.lastName],
  );

  const handleLogout = useCallback(
    async (event) => {
      event.preventDefault();
      setIsLoading(true);
      await LogoutUser(dispatch, router);
      setIsLoading(false);
    },
    [dispatch, router],
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
      dispatch(setToggleDrawer(!togglingDrawer));
      dispatch(setSidebar(false));
    },
    [dispatch, togglingDrawer],
  );

  const renderUserInfo = () => (
    <div className="flex items-center space-x-3 p-1">
      <div className="relative">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={userInfo.profilePicture || placeholderImage}
          alt="User avatar"
        />
        <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
      </div>
      <div className="font-medium dark:text-white overflow-hidden">
        <div className="capitalize truncate max-w-[14ch]">
          {`${userInfo.firstName} ${userInfo.lastName}`}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[21ch]">
          {userInfo.email}
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
          className="flex items-center text-gray-500 hover:text-gray-600 cursor-pointer p-2"
        >
          <span className="mr-3">
            <UserIcon fill="#6F87A1" width={16} height={16} />
          </span>
          My profile
        </li>
        <li
          onClick={handleClick('/settings')}
          className="flex items-center text-gray-500 hover:text-gray-600 cursor-pointer p-2"
        >
          <span className="mr-3">
            <SettingsIcon fill="#6F87A1" width={17} height={17} />
          </span>
          Settings
        </li>
      </ul>
      <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />
      <ul className="dropdown-list p-2">
        <li
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-600 cursor-pointer p-2"
        >
          Log out
          {isLoading && (
            <Spinner width={20} height={20} className="float-right" />
          )}
        </li>
      </ul>
    </>
  );

  return (
    <nav
      className={`z-50 w-full py-2 ${!noBorderBottom ? 'border-b-[1px] border-b-grey-750' : ''}`}
    >
      <div id="topBar-nav" className="flex justify-between items-center">
        <div className="block lg:hidden relative z-10 w-full">
          <Button
            paddingStyles="p-0 m-0"
            onClick={() => {
              router.push('/Home');
            }}
          >
            <AirqoLogo className="w-[46.56px] h-8" />
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
          <TopBarSearch />
          <CustomDropdown
            tabIcon={
              userInfo.profilePicture ? (
                <img
                  className="w-7 h-7 rounded-full object-cover"
                  src={userInfo.profilePicture || placeholderImage}
                  alt="User avatar"
                />
              ) : (
                <UserIcon />
              )
            }
            alignment="right"
            tabStyle={`border-none p-2 ${userInfo.profilePicture ? '' : 'bg-yellow-200'} shadow-none rounded-full`}
            id="user"
            className="right-0"
          >
            {renderDropdownContent()}
          </CustomDropdown>
        </div>

        <Button
          paddingStyles="p-0 m-0"
          className="lg:hidden relative flex items-center justify-start z-10 w-auto focus:outline-none border border-gray-200 rounded-xl"
          onClick={handleDrawer}
        >
          <span className="p-2">
            <MenuBarIcon />
          </span>
        </Button>
      </div>
    </nav>
  );
};

TopBar.propTypes = {
  topbarTitle: PropTypes.string,
  noBorderBottom: PropTypes.bool,
};

export default React.memo(TopBar);
