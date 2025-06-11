import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { isEmpty } from 'underscore';
import { IoChevronDown } from 'react-icons/io5';
import { Menu } from '@headlessui/react';
import PropTypes from 'prop-types';

// Hooks
import { useOutsideClick } from '@/core/hooks';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

// Redux
import {
  selectActiveGroup,
  selectUserGroups,
  selectUserGroupsLoading,
  setActiveGroup,
  fetchUserGroups,
} from '@/lib/store/services/groups';

// APIs
import { recentUserPreferencesAPI } from '@/core/apis/Account';

// Redux Actions for preferences
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

// Utils
import { removeSpacesAndLowerCase } from '@/core/utils/strings';
import { ORGANIZATION_LABEL } from '@/lib/constants';

/**
 * Utility function to validate ObjectId format
 * Prevents API calls with invalid ObjectIds
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Dropdown component for selecting organization/group in topbar
 * Handles both individual user flows and organization flows with dark mode support
 */
const TopbarOrganizationDropdown = ({
  onGroupChange,
  showTitle = true,
  className = '',
}) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();

  // Theme variables for dark mode classes (used in template conditionals)
  const { theme: _theme, systemTheme: _systemTheme } = useTheme();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);
  const isLoadingGroups = useSelector(selectUserGroupsLoading);

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click to close dropdown
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Determine if we're in organization context
  const isOrganizationContext = useMemo(() => {
    return (
      pathname?.includes('/organization/') ||
      pathname?.startsWith('/organization')
    );
  }, [pathname]);

  // Get organization slug from URL if in organization context
  const organizationSlug = useMemo(() => {
    if (!isOrganizationContext || !pathname) return null;
    const match = pathname.match(/\/organization\/([^/]+)/);
    return match ? match[1] : null;
  }, [isOrganizationContext, pathname]);

  // Effect to fetch user groups when component mounts or user changes
  useEffect(() => {
    const userID = session?.user?.id;
    // Only fetch if we have a valid user ID and no groups loaded yet
    if (
      userID &&
      isValidObjectId(userID) &&
      isEmpty(userGroups) &&
      !isLoadingGroups
    ) {
      dispatch(fetchUserGroups(userID));
    }
  }, [session?.user?.id, userGroups, isLoadingGroups, dispatch]); // Effect to set default active group based on context - only when no active group exists
  useEffect(() => {
    if (isEmpty(userGroups) || !session?.user?.id) return;

    // Only set default if no active group is currently selected
    if (activeGroup) return;

    if (isOrganizationContext && organizationSlug) {
      // In organization context: find group by slug
      const orgGroup = userGroups.find(
        (group) =>
          removeSpacesAndLowerCase(group.grp_title) ===
          organizationSlug.toLowerCase(),
      );

      if (orgGroup) {
        dispatch(setActiveGroup(orgGroup));
      }
    } else if (!isOrganizationContext) {
      // In individual context: only set AirQo as default if it's the first time or no preferences exist
      // This prevents overriding user's previously selected organization after page refresh
      const airqoGroup = userGroups.find(
        (group) => removeSpacesAndLowerCase(group.grp_title) === 'airqo',
      );

      // Only set AirQo as default if:
      // 1. AirQo group exists, AND
      // 2. User has no stored preferences (first time user)
      if (airqoGroup && userGroups.length > 0) {
        // Try to get user's last preference first
        const trySetFromPreferences = async () => {
          try {
            const prefRes = await recentUserPreferencesAPI(session.user.id);
            if (prefRes.success && prefRes.preference?.group_id) {
              const preferredGroup = userGroups.find(
                (g) => g._id === prefRes.preference.group_id,
              );
              if (preferredGroup) {
                dispatch(setActiveGroup(preferredGroup));
                return;
              }
            }
          } catch {
            // If preferences API fails, fall back to AirQo only if it's available
            // Silent error handling in production
          }

          // Fallback: set AirQo as default only if no other preference was found
          dispatch(setActiveGroup(airqoGroup));
        };

        trySetFromPreferences();
      }
    }
  }, [
    userGroups,
    isOrganizationContext,
    organizationSlug,
    session?.user?.id,
    dispatch,
    activeGroup,
  ]);
  /**
   * Handle group selection
   */
  const handleGroupSelect = (group) => {
    if (group._id !== activeGroup?._id) {
      dispatch(setActiveGroup(group));

      // Persist the user's group selection to preferences
      if (session?.user?.id) {
        dispatch(
          replaceUserPreferences({
            user_id: session.user.id,
            group_id: group._id,
          }),
        ).catch(() => {
          // Silent error handling for preference update failures
          // The Redux state will still be updated, ensuring UI consistency
        });
      }

      // Call the callback to notify parent component about the change
      if (onGroupChange) {
        onGroupChange({
          loading: false,
          group: group,
          isChangingOrg: true,
          isUserContext: false,
        });
      }
    }
    setIsOpen(false);
  };

  // Don't render anything if no groups or loading
  if (isLoadingGroups || isEmpty(userGroups)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
      </div>
    );
  }

  // Don't render if no active group
  if (!activeGroup) {
    return null;
  }
  return (
    <Menu as="div" className={`relative ${className}`} ref={dropdownRef}>
      <Menu.Button
        className="flex items-center space-x-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary/30 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary/10 dark:focus:ring-primary/70 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Organization/Group Logo */}
        {activeGroup.grp_image ? (
          <img
            src={activeGroup.grp_image}
            alt={`${activeGroup.grp_title} logo`}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary">
            {activeGroup.grp_title?.charAt(0)?.toUpperCase() || 'O'}
          </div>
        )}
        {/* Organization/Group Name */}
        {showTitle && (
          <span className="max-w-32 truncate">
            {activeGroup.grp_title || ORGANIZATION_LABEL}
          </span>
        )}
        {/* Dropdown Arrow */}
        <IoChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg border border-primary/20 bg-white py-1 shadow-lg ring-1 ring-primary/10 ring-opacity-5 focus:outline-none dark:border-primary/30 dark:bg-gray-800 dark:ring-primary/20 transition-colors duration-200">
        <div className="px-3 py-2 text-xs font-semibold text-primary/70 uppercase tracking-wide dark:text-primary/80">
          Switch Organization
        </div>
        <div className="max-h-60 overflow-y-auto">
          {userGroups.map((group) => (
            <Menu.Item key={group._id}>
              {({ active }) => (
                <button
                  onClick={() => handleGroupSelect(group)}
                  className={`flex w-full items-center space-x-3 px-3 py-2 text-left text-sm transition-colors duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'text-gray-700 hover:bg-primary/5 dark:text-gray-200 dark:hover:bg-primary/10'
                  } ${
                    activeGroup._id === group._id
                      ? 'bg-primary/15 font-medium text-primary dark:bg-primary/25 dark:text-primary'
                      : ''
                  }`}
                >
                  {/* Group Logo */}
                  {group.grp_image ? (
                    <img
                      src={group.grp_image}
                      alt={`${group.grp_title} logo`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-primary/20 dark:text-primary">
                      {group.grp_title?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                  )}
                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {group.grp_title || 'Unnamed Organization'}
                    </div>
                    {group.grp_website && (
                      <div className="truncate text-xs text-primary/60 dark:text-primary/70">
                        {group.grp_website}
                      </div>
                    )}
                  </div>
                  {/* Active Indicator */}
                  {activeGroup._id === group._id && (
                    <div className="flex h-2 w-2 rounded-full bg-primary dark:bg-primary"></div>
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
        {/* Footer */}
        {userGroups.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-primary/60 dark:text-primary/70">
            No organizations available
          </div>
        )}
      </Menu.Items>
    </Menu>
  );
};

TopbarOrganizationDropdown.propTypes = {
  onGroupChange: PropTypes.func,
  showTitle: PropTypes.bool,
  className: PropTypes.string,
};

TopbarOrganizationDropdown.defaultProps = {
  onGroupChange: null,
  showTitle: true,
  className: '',
};

export default TopbarOrganizationDropdown;
