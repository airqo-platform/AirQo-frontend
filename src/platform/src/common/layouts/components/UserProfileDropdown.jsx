'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import PropTypes from 'prop-types';
import CustomDropdown from '@/common/components/Button/CustomDropdown';
import SettingsIcon from '@/icons/SideBar/SettingsIcon';
import LogoutUser from '@/core/HOC/LogoutUser';
import { getContextualLoginPath } from '@/core/utils/organizationUtils';

/**
 * Reusable user profile dropdown component that adapts to different contexts
 * Supports both individual user routes and organization-specific routes
 */
const UserProfileDropdown = ({
  className = '',
  dropdownAlign = 'right',
  showUserInfo = true,
  customMenuItems = [],
  onLogout,
  isOrganization = false,
  isCreateOrganizationRoute = false,
  isAdminRoute = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // Safe selector for Redux login state with error handling
  const reduxUserInfo = useSelector((state) => {
    try {
      return state?.login?.userInfo || {};
    } catch {
      return {};
    }
  });

  // Use NextAuth session first, fallback to Redux state
  const userInfo = session?.user || reduxUserInfo;

  // Client-side only state to prevent hydration issues
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Only render after component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine context (individual vs organization)
  const isOrganizationContext = useMemo(() => {
    return isOrganization || pathname.includes('/org/');
  }, [isOrganization, pathname]);

  // Extract organization slug if in org context
  const orgSlug = useMemo(() => {
    if (isOrganizationContext) {
      const match = pathname.match(/^\/org\/([^/]+)/);
      return match ? match[1] : null;
    }
    return null;
  }, [isOrganizationContext, pathname]);

  // Generate navigation paths based on context
  const navigationPaths = useMemo(() => {
    if (isOrganizationContext && orgSlug) {
      return {
        profile: `/org/${orgSlug}/profile`,
        settings: `/org/${orgSlug}/settings`,
      };
    }
    return {
      profile: '/user/settings',
      settings: '/user/settings',
    };
  }, [isOrganizationContext, orgSlug]);

  const placeholderImage = useMemo(() => {
    const firstInitial =
      userInfo?.firstName?.[0] || userInfo?.name?.split(' ')[0]?.[0] || '';
    const lastInitial =
      userInfo?.lastName?.[0] || userInfo?.name?.split(' ')[1]?.[0] || '';
    return `https://ui-avatars.com/api/?name=${firstInitial}+${lastInitial}&background=random`;
  }, [userInfo?.firstName, userInfo?.lastName, userInfo?.name]);

  const handleLogout = useCallback(
    async (event) => {
      event.preventDefault();

      // Prevent multiple logout attempts
      if (isLoading) return;

      setIsLoading(true);
      try {
        if (onLogout) {
          await onLogout();
        } else {
          await LogoutUser(dispatch, router);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, router, isLoading, onLogout],
  );

  const handleNavigation = useCallback(
    (path) => (event) => {
      event.preventDefault();
      router.push(path);
    },
    [router],
  );
  const renderUserInfo = () => {
    if (!showUserInfo && !isCreateOrganizationRoute) return null;

    return (
      <div className="flex items-center space-x-3 p-1">
        <div className="relative">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={
              userInfo?.profilePicture ||
              userInfo?.picture ||
              userInfo?.image ||
              placeholderImage
            }
            alt="User avatar"
          />
          <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
        </div>
        <div className="font-medium dark:text-white overflow-hidden">
          <div className="capitalize truncate max-w-[14ch]">
            {userInfo?.firstName && userInfo?.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : userInfo?.name || 'User'}
          </div>{' '}
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[21ch]">
            {userInfo?.email || 'No email'}
          </div>
        </div>
      </div>
    );
  };
  const renderDropdownContent = () => (
    <>
      {/* Always show user info (email and profile picture) */}
      {renderUserInfo()}
      {(showUserInfo || isCreateOrganizationRoute) && (
        <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />
      )}

      {/* Show menu items only if not on create-organization route and not in admin route */}
      {!isCreateOrganizationRoute && !isAdminRoute && (
        <ul className="dropdown-list p-2">
          {/* My Profile - only show in organization context */}
          {isOrganizationContext && (
            <li
              onClick={handleNavigation(navigationPaths.profile)}
              className="flex items-center text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span className="mr-3">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
              My Profile
            </li>
          )}

          {/* Show Settings only for admin users in organization context or always in individual context */}
          {(!isOrganizationContext ||
            (isOrganizationContext && userInfo?.isAdmin)) && (
            <li
              onClick={handleNavigation(navigationPaths.settings)}
              className="flex items-center text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span className="mr-3">
                <SettingsIcon width={17} height={17} />
              </span>
              {isOrganizationContext ? 'Organization Settings' : 'Settings'}
            </li>
          )}

          {/* Custom menu items */}
          {customMenuItems.map((item, index) => (
            <li
              key={index}
              onClick={item.onClick}
              className="flex items-center text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {/* Show divider only if we have content above and it's not create-organization route and not admin route */}
      {!isCreateOrganizationRoute && !isAdminRoute && (
        <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />
      )}

      {/* Logout section - always show */}
      <ul className="dropdown-list p-2">
        <li
          onClick={handleLogout}
          className={`text-gray-500 dark:text-white hover:text-gray-600 cursor-pointer p-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors ${
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

  const renderProfileTrigger = () => (
    <div className="cursor-pointer">
      <img
        className="w-8 h-8 rounded-full object-cover"
        src={
          userInfo?.profilePicture ||
          userInfo?.picture ||
          userInfo?.image ||
          placeholderImage
        }
        alt="User avatar"
      />
    </div>
  );

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className={className}>
      <CustomDropdown
        trigger={renderProfileTrigger()}
        dropdownAlign={dropdownAlign}
        dropdownWidth="220px"
      >
        {renderDropdownContent()}
      </CustomDropdown>
    </div>
  );
};

UserProfileDropdown.propTypes = {
  className: PropTypes.string,
  dropdownAlign: PropTypes.oneOf(['left', 'right']),
  showUserInfo: PropTypes.bool,
  customMenuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.node,
    }),
  ),
  onLogout: PropTypes.func,
  isOrganization: PropTypes.bool,
  isCreateOrganizationRoute: PropTypes.bool,
  isAdminRoute: PropTypes.bool,
};

export default React.memo(UserProfileDropdown);
