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
import {
  replaceUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';

// APIs
import { recentUserPreferencesAPI } from '@/core/apis/Account';

// Utils
import {
  isAirQoGroup,
  shouldUseUserFlow,
} from '@/core/utils/organizationUtils';
import { ORGANIZATION_LABEL } from '@/lib/constants';
import logger from '@/lib/logger';

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
 * Utility function to determine the target route based on group selection
 * Enhanced with explicit AirQo routing rules and error prevention
 */
const determineTargetRoute = (group) => {
  // STRICT REQUIREMENT: If group is AirQo, ALWAYS redirect to /user/Home
  if (shouldUseUserFlow(group)) {
    return '/user/Home';
  }

  // REQUIREMENT: If group is NOT AirQo, redirect to /org/[slug]/dashboard
  // Ensure we have a valid group title, fallback to AirQo if invalid
  if (!group?.grp_title?.trim()) {
    logger.warn('Invalid group title, falling back to AirQo user flow');
    return '/user/Home';
  }

  // Use the same titleToSlug function used everywhere else for consistency
  const groupSlug = titleToSlug(group.grp_title);

  // Prevent "default" or empty slugs
  if (!groupSlug || groupSlug === 'default') {
    logger.warn(
      'Invalid group slug generated, falling back to AirQo user flow',
    );
    return '/user/Home';
  }

  return `/org/${groupSlug}/dashboard`;
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
  const switchingTimeoutRef = useRef(null); // For cleanup

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
      } // PRIORITY 2: For user flow (/user/*), use AirQo group or user preferences
      if (pathname.startsWith('/user/')) {
        // Find AirQo group first
        selectedGroup = userGroups.find(isAirQoGroup);

        // If AirQo found, use it
        if (selectedGroup) {
          if (!activeGroup || activeGroup._id !== selectedGroup._id) {
            dispatch(setActiveGroup(selectedGroup));

            // Fetch individual user preferences for AirQo group immediately
            try {
              await dispatch(
                getIndividualUserPreferences({
                  identifier: session.user.id,
                  groupID: selectedGroup._id,
                }),
              );

              // Also update preferences to ensure consistency
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

  // Handle organization switching with proper cleanup and route completion detection
  const handleGroupSelect = async (group) => {
    if (!group || group._id === activeGroup?._id) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Clear any existing switching timeout to prevent memory leaks
    if (switchingTimeoutRef.current) {
      clearTimeout(switchingTimeoutRef.current);
      switchingTimeoutRef.current = null;
    }

    // Set switching state for UI feedback
    setIsSwitching(true);
    setIsSwitchingOrganization(true);

    try {
      const isTargetAirQo = isAirQoGroup(group);
      const targetRoute = determineTargetRoute(group);

      // Debug logging to understand what's happening
      logger.info('Organization switch attempt:', {
        groupName: group.grp_name,
        groupTitle: group.grp_title,
        isTargetAirQo,
        targetRoute,
        shouldUseUserFlow: shouldUseUserFlow(group),
      });

      // STEP 1: Set the active group immediately for UI feedback
      dispatch(setActiveGroup(group));

      // Wait for group to be set in Redux before proceeding
      await new Promise((resolve) => setTimeout(resolve, 100));

      // STEP 2: Clear relevant Redux states to prevent stale data
      const { setChartSites, resetChartStore } = await import(
        '@/lib/store/services/charts/ChartSlice'
      );

      dispatch(setChartSites([]));
      if (!isTargetAirQo) {
        dispatch(resetChartStore());
      }

      // STEP 3: Navigate and wait for route completion
      await router.push(targetRoute);

      // STEP 4: Wait for route to stabilize and then fetch preferences
      await new Promise((resolve) => {
        switchingTimeoutRef.current = setTimeout(async () => {
          try {
            // Fetch individual preferences for the new group
            await dispatch(
              replaceUserPreferences({
                user_id: session.user.id,
                group_id: group._id,
              }),
            ).unwrap();
          } catch (error) {
            logger.warn('Failed to fetch user preferences:', error);
          } finally {
            resolve();
          }
        }, 300); // Reduced delay for faster response
      });

      // STEP 5: Additional wait for data to load properly
      await new Promise((resolve) => {
        switchingTimeoutRef.current = setTimeout(() => {
          setIsSwitching(false);
          setIsSwitchingOrganization(false);
          resolve();
        }, 500); // Reduced total loading time for better UX
      });
    } catch (error) {
      logger.error('Organization switch failed:', error);

      // Fallback to AirQo user flow
      try {
        const airqoGroup = userGroups.find(isAirQoGroup);
        if (airqoGroup) {
          dispatch(setActiveGroup(airqoGroup));
          await router.push('/user/Home');
        }
      } catch (fallbackError) {
        logger.error('Fallback failed:', fallbackError);
      }

      // Always clear loading state on error
      setIsSwitching(false);
      setIsSwitchingOrganization(false);
    }
  };

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (switchingTimeoutRef.current) {
        clearTimeout(switchingTimeoutRef.current);
        switchingTimeoutRef.current = null;
      }
    };
  }, []);

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
