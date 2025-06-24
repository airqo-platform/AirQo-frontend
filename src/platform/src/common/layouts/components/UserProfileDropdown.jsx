import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import PropTypes from 'prop-types';
import CustomDropdown from '@/common/components/Button/CustomDropdown';
import LogoutUser from '@/core/HOC/LogoutUser';

/**
 * My Profile Dropdown Component
 * Unified "My Profile" link for user and organization contexts
 */
const MyProfileDropdown = ({
  className = '',
  dropdownAlign = 'right',
  showUserInfo = true,
  customMenuItems = [],
  onLogout,
  isOrganization = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // Redux fallback and merge session + redux to reflect updated user info immediately
  const reduxUserInfo = useSelector((state) => {
    try {
      return state?.login?.userInfo || {};
    } catch {
      return {};
    }
  });
  const sessionUser = session?.user || {};
  const userInfo = useMemo(
    () => ({ ...sessionUser, ...reduxUserInfo }),
    [sessionUser, reduxUserInfo],
  );

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine context
  const isOrgContext = useMemo(
    () => isOrganization || pathname.startsWith('/org/'),
    [isOrganization, pathname],
  );
  const orgSlug = useMemo(() => {
    if (!isOrgContext) return null;
    const match = pathname.match(/^\/org\/([^/]+)/);
    return match?.[1] || null;
  }, [isOrgContext, pathname]);

  // Unified profile path
  const profilePath = useMemo(
    () =>
      isOrgContext && orgSlug ? `/org/${orgSlug}/profile` : '/user/profile',
    [isOrgContext, orgSlug],
  );

  // Placeholder avatar
  const placeholderImage = useMemo(() => {
    const first = userInfo?.firstName?.[0] || userInfo?.name?.[0] || '';
    const last = userInfo?.lastName?.[0] || '';
    return `https://ui-avatars.com/api/?name=${first}+${last}&background=random`;
  }, [userInfo]);

  const handleLogout = useCallback(
    async (e) => {
      e.preventDefault();
      if (isLoading) return;
      setIsLoading(true);
      try {
        if (onLogout) await onLogout();
        else await LogoutUser(dispatch, router);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, router, isLoading, onLogout],
  );

  const navigate = useCallback(
    (path) => (e) => {
      e.preventDefault();
      router.push(path);
    },
    [router],
  );

  const renderTrigger = () => (
    <div className="cursor-pointer">
      <img
        className="w-8 h-8 rounded-full object-cover"
        src={
          userInfo.profilePicture ||
          userInfo.picture ||
          userInfo.image ||
          placeholderImage
        }
        alt="Avatar"
      />
    </div>
  );

  if (!mounted) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  return (
    <div className={className}>
      <CustomDropdown
        trigger={renderTrigger()}
        dropdownAlign={dropdownAlign}
        dropdownWidth="220px"
      >
        {/* User Info Section */}
        {showUserInfo && (
          <div className="flex items-center space-x-3 p-1">
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={
                userInfo.profilePicture ||
                userInfo.picture ||
                userInfo.image ||
                placeholderImage
              }
              alt="User Avatar"
            />
            <div className="font-medium dark:text-white overflow-hidden">
              <div className="capitalize truncate max-w-[14ch]">
                {userInfo.firstName && userInfo.lastName
                  ? `${userInfo.firstName} ${userInfo.lastName}`
                  : userInfo.name || 'User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[21ch]">
                {userInfo.email || 'No email'}
              </div>
            </div>
          </div>
        )}
        <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />

        {/* Unified "My Profile" Link */}
        <ul className="dropdown-list p-2">
          <li
            onClick={navigate(profilePath)}
            className="flex items-center cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
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

          {/* Custom menu items */}
          {customMenuItems.map((item, idx) => (
            <li
              key={idx}
              onClick={item.onClick}
              className="flex items-center cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </li>
          ))}
        </ul>

        <hr className="dropdown-divider border-b border-gray-200 dark:border-gray-700" />

        {/* Logout */}
        <ul className="dropdown-list p-2">
          <li
            onClick={handleLogout}
            className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <span>{isLoading ? 'Signing out...' : 'Log out'}</span>
            {isLoading && (
              <div className="flex items-center">
                <div className="animate-pulse w-2 h-2 bg-current rounded-full mr-1" />
                <div className="animate-pulse w-2 h-2 bg-current rounded-full mr-1 delay-75" />
                <div className="animate-pulse w-2 h-2 bg-current rounded-full delay-150" />
              </div>
            )}
          </li>
        </ul>
      </CustomDropdown>
    </div>
  );
};

MyProfileDropdown.propTypes = {
  className: PropTypes.string,
  dropdownAlign: PropTypes.oneOf(['left', 'right']),
  showUserInfo: PropTypes.bool,
  customMenuItems: PropTypes.array,
  onLogout: PropTypes.func,
  isOrganization: PropTypes.bool,
};

export default React.memo(MyProfileDropdown);
