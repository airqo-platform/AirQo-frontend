import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useWindowSize } from '@/lib/windowSize';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../Button';
import MenuBarIcon from '@/icons/menu_bar';
import Spinner from '@/components/Spinner';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import UserIcon from '@/icons/Topbar/userIcon';
import ChartIcon from '@/icons/Topbar/chartIcon';
import CustomDropdown from '../Button/CustomDropdown';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import {
  setTogglingGlobalDrawer,
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import LogoutUser from '@/core/utils/LogoutUser';
import GroupLogo from '../GroupLogo';
import MenuIcon from '@/icons/Actions/menu';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const GlobalTopbar = ({ topbarTitle, showSearch = false }) => {
  const router = useRouter();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const togglingGlobalDrawer = useSelector(
    (state) => state.sidebar.toggleGlobalDrawer,
  );
  const togglingDrawer = useSelector((state) => state.sidebar.toggleDrawer);
  const [isLoading, setIsLoading] = useState(false);

  const { theme, systemTheme } = useTheme();

  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  const styles = useMemo(
    () => ({
      text: isDarkMode ? 'text-white' : 'text-gray-800',
      background: isDarkMode ? 'bg-[#1d1f20]' : 'bg-white',
      border: isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200',
    }),
    [isDarkMode],
  );

  const placeholderImage = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${userInfo?.firstName?.[0] || 'U'}+${userInfo?.lastName?.[0] || 'S'}&background=random`,
    [userInfo?.firstName, userInfo?.lastName],
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
      if (width < 1024) {
        dispatch(setToggleDrawer(!togglingDrawer));
        dispatch(setSidebar(false));
      } else {
        dispatch(setTogglingGlobalDrawer(!togglingGlobalDrawer));
        dispatch(setSidebar(false));
      }
    },
    [dispatch, togglingGlobalDrawer, togglingDrawer, width],
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
          className="text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2"
        >
          Log out
          {isLoading && (
            <Spinner width={20} height={20} className="float-right" />
          )}
        </li>
      </ul>
    </>
  );

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  const renderProfileTrigger = () => (
    <div className="cursor-pointer">
      <img
        className="w-8 h-8 rounded-full object-cover"
        src={userInfo.profilePicture || placeholderImage}
        alt="User avatar"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <nav
        className={`fixed top-0 left-0 z-[999] right-0 w-screen py-2 px-2  shadow-sm border-b ${styles.border} ${styles.background} lg:shadow-none`}
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
              <button type="button" className="p-2 m-0" onClick={handleDrawer}>
                <MenuIcon width={20} height={20} />
              </button>
              <div className="flex justify-between items-center">
                <Button
                  padding="p-0 m-0"
                  onClick={() => router.push('/Home')}
                  variant="text"
                >
                  <div
                    className={`w-[46.56px] h-8 flex flex-col flex-1 ${styles.text}`}
                  >
                    <GroupLogo />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex gap-2 items-center">
            {/* TODO: Add search bar back */}
            {/* <Button
              type="button"
              variant="text"
              className=""
              paddingStyles="p-0 m-0"
              onClick={() => {
                handleOpenModal('search');
              }}
            >
              <TopBarSearch />
            </Button> */}

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

GlobalTopbar.propTypes = {
  showSearch: PropTypes.bool,
  topbarTitle: PropTypes.string,
  noBorderBottom: PropTypes.bool,
};

export default React.memo(GlobalTopbar);
