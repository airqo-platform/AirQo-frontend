import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { isEmpty } from 'underscore';
import { IoChevronDown } from 'react-icons/io5';
import { Menu } from '@headlessui/react';
import PropTypes from 'prop-types';

// Hooks
import { useOutsideClick } from '@/core/hooks';

// Organization Loading Context
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';

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
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Utility function to convert organization title to URL slug
 */
const titleToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Utility function to check if a group is AirQo
 */
const isAirQoGroup = (group) => {
  if (!group?.grp_title) return false;
  return removeSpacesAndLowerCase(group.grp_title) === 'airqo';
};

/**
 * Utility function to determine the target route based on group selection
 */
const determineTargetRoute = (group, currentPathname) => {
  const isTargetAirQo = isAirQoGroup(group);

  // Extract page context from current route
  let pageContext = 'dashboard'; // default fallback

  if (currentPathname.startsWith('/org/')) {
    // Extract from /org/[slug]/[page] pattern
    const orgRouteMatch = currentPathname.match(/^\/org\/[^/]+\/(.+)$/);
    if (orgRouteMatch) {
      pageContext = orgRouteMatch[1];
    }
  } else if (currentPathname.startsWith('/user/')) {
    // Extract from /user/[page] pattern
    const userRouteMatch = currentPathname.match(/^\/user\/(.+)$/);
    if (userRouteMatch) {
      pageContext = userRouteMatch[1];
    }
  } else {
    // Handle legacy routes
    if (currentPathname.includes('/analytics')) pageContext = 'analytics';
    else if (currentPathname.includes('/map')) pageContext = 'map';
    else if (currentPathname.includes('/settings')) pageContext = 'settings';
    else if (currentPathname.includes('/Home')) pageContext = 'Home';
    else if (currentPathname.includes('/insights')) pageContext = 'insights';
    else if (currentPathname.includes('/profile')) pageContext = 'profile';
  }

  // Map organization pages to user pages for AirQo navigation
  const orgToUserPageMap = {
    dashboard: 'Home',
    insights: 'analytics',
    profile: 'settings',
    settings: 'settings',
    members: 'settings',
  };

  // Map user pages to organization pages for non-AirQo navigation
  const userToOrgPageMap = {
    Home: 'dashboard',
    analytics: 'insights',
    map: 'dashboard', // map doesn't exist in org context
    settings: 'profile',
  };

  if (isTargetAirQo) {
    // Navigate to user flow
    const targetPage = orgToUserPageMap[pageContext] || pageContext;
    return `/user/${targetPage}`;
  } else {
    // Navigate to organization flow
    const orgSlug = titleToSlug(group.grp_title);
    const targetPage = userToOrgPageMap[pageContext] || pageContext;
    return `/org/${orgSlug}/${targetPage}`;
  }
};

/**
 * TopbarOrganizationDropdown Component
 *
 * Robust Organization Switching with Smart Routing:
 * - AirQo Group: Routes to /user/* flow and sets as active group
 * - Other Organizations: Routes to /org/[slug]/* flow
 * - Always displays current active group or default state
 * - Preserves current page context when switching
 */
const TopbarOrganizationDropdown = ({ showTitle = true, className = '' }) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { setIsSwitchingOrganization } = useOrganizationLoading();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);
  const isLoadingGroups = useSelector(selectUserGroupsLoading);
  // Local state  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
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

  // Fetch user groups when component mounts
  useEffect(() => {
    const userID = session?.user?.id;
    if (
      userID &&
      isValidObjectId(userID) &&
      isEmpty(userGroups) &&
      !isLoadingGroups
    ) {
      dispatch(fetchUserGroups(userID));
    }
  }, [session?.user?.id, userGroups, isLoadingGroups, dispatch]);

  // Critical: Initialize active group based on current route context
  useEffect(() => {
    if (isEmpty(userGroups) || !session?.user?.id) {
      return;
    }

    const initializeActiveGroup = async () => {
      let selectedGroup = null;

      // PRIORITY 1: For organization flow (/org/[slug]/*), ALWAYS use slug to determine active group
      if (pathname.startsWith('/org/')) {
        const slugMatch = pathname.match(/^\/org\/([^/]+)/);
        if (slugMatch) {
          const currentSlug = slugMatch[1];
          selectedGroup = userGroups.find(
            (g) => titleToSlug(g.grp_title) === currentSlug,
          );

          // If we found the group from slug, set it immediately and return
          if (selectedGroup) {
            // Only set if it's different from current active group
            if (!activeGroup || activeGroup._id !== selectedGroup._id) {
              dispatch(setActiveGroup(selectedGroup));
            }
            return;
          }
        }
      }

      // PRIORITY 2: For user flow (/user/*), use AirQo group or user preferences
      if (pathname.startsWith('/user/')) {
        // Find AirQo group first
        selectedGroup = userGroups.find(isAirQoGroup);

        // If AirQo found, use it
        if (selectedGroup) {
          if (!activeGroup || activeGroup._id !== selectedGroup._id) {
            dispatch(setActiveGroup(selectedGroup));

            // Update user preferences for AirQo in background
            try {
              await dispatch(
                replaceUserPreferences({
                  user_id: session.user.id,
                  group_id: selectedGroup._id,
                }),
              ).unwrap();
            } catch (error) {
              void error; // Silent fail
            }
          }
          return;
        }
      }

      // PRIORITY 3: If we're not on a specific route or no route-based group found,
      // check user preferences as fallback
      if (!selectedGroup) {
        try {
          const prefRes = await recentUserPreferencesAPI(session.user.id);
          if (prefRes.success && prefRes.preference?.group_id) {
            selectedGroup = userGroups.find(
              (g) => g._id === prefRes.preference.group_id,
            );
          }
        } catch (error) {
          void error; // Silent fallback
        }
      }

      // PRIORITY 4: Final fallback to first available group
      if (!selectedGroup && userGroups.length > 0) {
        selectedGroup = userGroups[0];
      }

      // Set the selected group if different from current
      if (
        selectedGroup &&
        (!activeGroup || activeGroup._id !== selectedGroup._id)
      ) {
        dispatch(setActiveGroup(selectedGroup));
      }
    };

    initializeActiveGroup();
  }, [
    userGroups,
    session?.user?.id,
    dispatch,
    pathname, // Important: Re-run when pathname changes
    // Removed activeGroup and isInitialized from deps to allow re-initialization on route changes
  ]);

  // Monitor pathname changes and update active group for organization flow
  useEffect(() => {
    if (isEmpty(userGroups)) return;

    // Only handle organization flow - user flow is handled by preferences
    if (pathname.startsWith('/org/')) {
      const slugMatch = pathname.match(/^\/org\/([^/]+)/);
      if (slugMatch) {
        const currentSlug = slugMatch[1];
        const groupFromSlug = userGroups.find(
          (g) => titleToSlug(g.grp_title) === currentSlug,
        );

        // If we found a group and it's different from current active group
        if (
          groupFromSlug &&
          (!activeGroup || activeGroup._id !== groupFromSlug._id)
        ) {
          dispatch(setActiveGroup(groupFromSlug));
        }
      }
    }
  }, [pathname, userGroups, activeGroup, dispatch]);
  // Handle organization switching with proper state clearing and loading
  const handleGroupSelect = async (group) => {
    if (!group || group._id === activeGroup?._id) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Set switching state for UI feedback - this will persist until all data is ready
    setIsSwitching(true);
    setIsSwitchingOrganization(true); // Global loading state

    try {
      const isTargetAirQo = isAirQoGroup(group);
      const targetRoute = determineTargetRoute(group, pathname); // STEP 1: Clear relevant Redux states BEFORE setting new group to prevent stale data
      const { setChartSites, resetChartStore } = await import(
        '@/lib/store/services/charts/ChartSlice'
      );
      const { clearIndividualPreferences } = await import(
        '@/lib/store/services/account/UserDefaultsSlice'
      );

      // Clear chart-related data to prevent showing old organization's data
      dispatch(setChartSites([]));

      // For organization switches, clear chart data completely
      if (!isTargetAirQo) {
        dispatch(resetChartStore());
      }

      // STEP 2: Set the active group for immediate UI feedback
      dispatch(setActiveGroup(group));

      // STEP 3: Navigate to the determined route
      await router.push(targetRoute);

      // STEP 4: Handle organization-specific data loading and preferences
      if (isTargetAirQo) {
        // For AirQo (user flow), update preferences in background
        setTimeout(async () => {
          try {
            await dispatch(
              replaceUserPreferences({
                user_id: session.user.id,
                group_id: group._id,
              }),
            ).unwrap();
          } catch (error) {
            void error; // Silent fail
          }
        }, 0);
      } else {
        // For organizations, clear user preferences to prevent conflicts
        dispatch(clearIndividualPreferences());
      }

      // STEP 5: Set up a timer to keep the loading state until components are ready
      // This ensures the loader persists until all org-specific data is loaded
      const minLoadingTime = 1500; // Minimum loading time for UX
      setTimeout(() => {
        setIsSwitching(false);
      }, minLoadingTime);
    } catch (error) {
      // Error in navigation - provide user feedback
      void error;
      setIsSwitching(false);
      setIsSwitchingOrganization(false); // Clear global loading state on error
    }
  };

  // Determine what to display - always prioritize activeGroup
  const getDisplayGroup = () => {
    // First priority: Return the active group if it exists and is valid
    if (activeGroup && userGroups.find((g) => g._id === activeGroup._id)) {
      return activeGroup;
    }

    // Second priority: If we have userGroups but no valid activeGroup,
    // this means we're still initializing - show the first group temporarily
    if (!isEmpty(userGroups)) {
      return userGroups[0];
    }

    // Last resort: no groups available
    return null;
  };

  const displayGroup = getDisplayGroup();

  // Loading state
  if (isLoadingGroups && isEmpty(userGroups)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600"></div>
        {showTitle && (
          <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
        )}
      </div>
    );
  }

  // No groups available
  if (isEmpty(userGroups)) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <span className="text-xs">?</span>
        </div>
        {showTitle && <span>No Organizations</span>}
      </div>
    );
  }

  // Render the dropdown
  return (
    <Menu as="div" className={`relative ${className}`} ref={dropdownRef}>
      <Menu.Button className="flex items-center space-x-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary/30 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary/10 dark:focus:ring-primary/70 dark:focus:ring-offset-gray-800 transition-colors duration-200">
        {' '}
        {/* Organization Logo */}
        {displayGroup?.grp_image ? (
          <img
            src={displayGroup.grp_image}
            alt={`${displayGroup.grp_title} logo`}
            className={`h-6 w-6 rounded-full object-cover ${
              isSwitching ? 'opacity-50' : ''
            }`}
          />
        ) : (
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary ${
              isSwitching ? 'opacity-50' : ''
            }`}
          >
            {formatGroupName(displayGroup?.grp_title)
              ?.charAt(0)
              ?.toUpperCase() || 'O'}
          </div>
        )}
        {/* Organization Name */}
        {showTitle && (
          <span
            className={`max-w-32 truncate ${isSwitching ? 'opacity-50' : ''}`}
          >
            {' '}
            {isSwitching
              ? 'Switching...'
              : formatGroupName(displayGroup?.grp_title) || ORGANIZATION_LABEL}
          </span>
        )}
        {/* Dropdown Arrow */}
        <IoChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isSwitching ? 'animate-spin opacity-50' : ''
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
                  type="button"
                  onClick={() => handleGroupSelect(group)}
                  className={`flex w-full items-center space-x-3 px-3 py-2 text-left text-sm transition-colors duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                      : 'text-gray-700 hover:bg-primary/5 dark:text-gray-200 dark:hover:bg-primary/10'
                  } ${
                    activeGroup?._id === group._id
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
                      {formatGroupName(group.grp_title)
                        ?.charAt(0)
                        ?.toUpperCase() || 'O'}
                    </div>
                  )}

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    {' '}
                    <div className="truncate font-medium">
                      {formatGroupName(group.grp_title) ||
                        'Unnamed Organization'}
                    </div>
                    {group.grp_website && (
                      <div className="truncate text-xs text-primary/60 dark:text-primary/70">
                        {group.grp_website}
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {activeGroup?._id === group._id && (
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
  showTitle: PropTypes.bool,
  className: PropTypes.string,
};

export default TopbarOrganizationDropdown;

/**
 * Utility function to format group names for display
 * Converts underscores and hyphens to spaces and applies uppercase formatting
 */
const formatGroupName = (groupName) => {
  if (!groupName) return '';
  return groupName
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .split(' ')
    .map((word) => word.toUpperCase()) // Convert each word to uppercase
    .join(' ')
    .trim(); // Remove any extra whitespace
};
