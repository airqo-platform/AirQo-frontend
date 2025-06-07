'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import PropTypes from 'prop-types';
import Button from '@/common/components/Button';
import MenuBarIcon from '@/icons/menu_bar';
import ChartIcon from '@/icons/Topbar/chartIcon';
import UserProfileDropdown from './UserProfileDropdown';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import {
  setToggleDrawer,
  setSidebar,
} from '@/lib/store/services/sideBar/SideBarSlice';
import GroupLogo from '@/common/components/GroupLogo';

const TopBar = ({
  topbarTitle,
  noBorderBottom,
  showSearch = false,
  children,
  logoComponent,
  onLogoClick,
  homeNavPath = '/user/Home',
  headerIcon,
  userMenuContent,
  customActions,
  showMobileDrawerButton = true,
  showUserProfile = true,
}) => {
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
  const _userInfo = session?.user || reduxUserInfo;

  const togglingDrawer = useSelector((state) => {
    try {
      return state?.sidebar?.toggleDrawer || false;
    } catch {
      // Silent fallback during logout when store is reset
      return false;
    }
  });

  // Client-side only state to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

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
        className={`z-50 w-full py-2 px-2 md:px-0 rounded-xl bg-white shadow-sm border border-gray-200 lg:shadow-none lg:bg-transparent lg:border-none ${
          !noBorderBottom ? 'border-b-[1px] border-b-grey-750' : ''
        }`}
      >
        <div id="topBar-nav" className="flex justify-between items-center">
          {children ? (
            children
          ) : (
            <>
              <div className="block lg:hidden relative z-10 w-full">
                <Button
                  paddingStyles="p-0 m-0"
                  onClick={onLogoClick || (() => router.push(homeNavPath))}
                  variant="text"
                >
                  {logoComponent || <GroupLogo />}
                </Button>
              </div>
              <div className="font-medium hidden lg:flex items-center text-2xl text-neutral-light-800">
                <div className="flex items-center gap-[10px]">
                  <span className="p-2 rounded-full bg-[#E2E3E5]">
                    {headerIcon || <ChartIcon width={20} height={20} />}
                  </span>
                  <div>{topbarTitle}</div>
                </div>
              </div>
              <div className="hidden lg:flex gap-2 items-center">
                {customActions ||
                  (showUserProfile && (
                    <UserProfileDropdown
                      dropdownAlign="right"
                      showUserInfo={true}
                      customMenuItems={userMenuContent ? [] : undefined}
                    />
                  ))}
              </div>
              {showMobileDrawerButton && (
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
              )}
            </>
          )}
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
  children: PropTypes.node,
  logoComponent: PropTypes.node,
  onLogoClick: PropTypes.func,
  homeNavPath: PropTypes.string,
  headerIcon: PropTypes.node,
  userMenuContent: PropTypes.node,
  customActions: PropTypes.node,
  showMobileDrawerButton: PropTypes.bool,
  showUserProfile: PropTypes.bool,
};

export default React.memo(TopBar);
