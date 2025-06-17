import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { isEmpty } from 'underscore';
import { HiPlus } from 'react-icons/hi2';
import { ImSpinner8 } from 'react-icons/im';
import PropTypes from 'prop-types';

// Organization Loading Context
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';

// Features
import {
  CreateOrganizationDialog,
  useCreateOrganization,
} from '@/common/features/create-organization';

// Components
import DialogWrapper from '@/common/components/Modal/DialogWrapper';

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
 */
const determineTargetRoute = (group) => {
  // STRICT REQUIREMENT: If group is AirQo, ALWAYS redirect to /user/Home
  if (shouldUseUserFlow(group)) {
    return '/user/Home';
  }

  // REQUIREMENT: If group is NOT AirQo, redirect to /org/[slug]/dashboard
  if (!group?.grp_title?.trim()) {
    logger.warn('Invalid group title, falling back to AirQo user flow');
    return '/user/Home';
  }

  const groupSlug = titleToSlug(group.grp_title);
  if (!groupSlug || groupSlug === 'default') {
    logger.warn(
      'Invalid group slug generated, falling back to AirQo user flow',
    );
    return '/user/Home';
  }

  return `/org/${groupSlug}/dashboard`;
};

/**
 * Enhanced TopbarOrganizationSelectorComponent
 *
 * Features:
 * - Rotating arrow animation when dropdown opens/closes
 * - Plus icon button to add new organizations
 * - Modal dialog for organization creation request
 * - Improved design with primary colors
 * - Form validation and error handling
 */
const TopbarOrganizationSelector = ({ showTitle = true, className = '' }) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { setIsSwitchingOrganization } = useOrganizationLoading();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);
  const isLoadingGroups = useSelector(selectUserGroupsLoading);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Organization creation feature
  const {
    isModalOpen: isCreateModalOpen,
    isSubmitting,
    openModal,
    closeModal,
    handleSubmit: handleOrganizationSubmit,
  } = useCreateOrganization();

  const switchingTimeoutRef = useRef(null);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen]);

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
  // Initialize active group based on current route context
  useEffect(() => {
    if (isEmpty(userGroups) || !session?.user?.id) {
      return;
    }

    const initializeActiveGroup = async () => {
      let selectedGroup = null;

      // PRIORITY 1: For organization flow (/org/[slug]/*), use slug to determine active group
      if (pathname.startsWith('/org/')) {
        const slugMatch = pathname.match(/^\/org\/([^/]+)/);
        if (slugMatch) {
          const currentSlug = slugMatch[1];
          selectedGroup = userGroups.find(
            (g) => titleToSlug(g.grp_title) === currentSlug,
          );

          if (selectedGroup) {
            if (!activeGroup || activeGroup._id !== selectedGroup._id) {
              dispatch(setActiveGroup(selectedGroup));
            }
            return;
          }
        }
      }

      // PRIORITY 2: For user flow (/user/*), use AirQo group
      if (pathname.startsWith('/user/')) {
        selectedGroup = userGroups.find(isAirQoGroup);
      }

      // PRIORITY 3: Try to get user preferences
      if (!selectedGroup) {
        try {
          const prefRes = await dispatch(
            getIndividualUserPreferences({
              identifier: session.user.id,
            }),
          ).unwrap();
          if (prefRes?.preference?.group_id) {
            selectedGroup = userGroups.find(
              (g) => g._id === prefRes.preference.group_id,
            );
          }
        } catch {
          // Silent fallback
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
  }, [userGroups, session?.user?.id, dispatch, pathname]);

  // Monitor pathname changes for organization flow
  useEffect(() => {
    if (isEmpty(userGroups)) return;

    if (pathname.startsWith('/org/')) {
      const slugMatch = pathname.match(/^\/org\/([^/]+)/);
      if (slugMatch) {
        const currentSlug = slugMatch[1];
        const groupFromSlug = userGroups.find(
          (g) => titleToSlug(g.grp_title) === currentSlug,
        );

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
   */
  const formatGroupName = (groupName) => {
    if (!groupName) return '';
    return groupName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((word) => word.toUpperCase())
      .join(' ')
      .trim();
  };

  // Handle opening the organization modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Handle closing the organization modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle organization switching
  const handleGroupSelect = async (group) => {
    if (!group || group._id === activeGroup?._id) {
      handleCloseModal();
      return;
    }

    handleCloseModal();

    if (switchingTimeoutRef.current) {
      clearTimeout(switchingTimeoutRef.current);
      switchingTimeoutRef.current = null;
    }

    setIsSwitching(true);
    setIsSwitchingOrganization(true);

    try {
      const isTargetAirQo = isAirQoGroup(group);
      const targetRoute = determineTargetRoute(group);

      // Set the active group immediately for UI feedback
      dispatch(setActiveGroup(group));

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Clear relevant Redux states to prevent stale data
      const { setChartSites, resetChartStore } = await import(
        '@/lib/store/services/charts/ChartSlice'
      );

      dispatch(setChartSites([]));
      if (!isTargetAirQo) {
        dispatch(resetChartStore());
      }

      // Navigate and wait for route completion
      await router.push(targetRoute);

      // Wait for route to stabilize and then fetch preferences
      await new Promise((resolve) => {
        switchingTimeoutRef.current = setTimeout(async () => {
          try {
            await dispatch(
              replaceUserPreferences({
                user_id: session?.user?.id,
                group_id: group._id,
              }),
            );
          } catch (error) {
            logger.warn('Failed to update preferences:', error);
          }
          resolve();
        }, 300);
      });
    } catch (error) {
      logger.error('Organization switching failed:', error);

      try {
        const airqoGroup = userGroups.find(isAirQoGroup);
        if (airqoGroup) {
          dispatch(setActiveGroup(airqoGroup));
          await router.push('/user/Home');
        }
      } catch (fallbackError) {
        logger.error('Fallback failed:', fallbackError);
      }
    } finally {
      setIsSwitching(false);
      setIsSwitchingOrganization(false);
    }
  };
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (switchingTimeoutRef.current) {
        clearTimeout(switchingTimeoutRef.current);
        switchingTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle opening the organization creation modal
  const handleOpenCreateModal = () => {
    openModal();
    handleCloseModal();
  };

  // Determine what to display
  const getDisplayGroup = () => {
    if (activeGroup && userGroups.find((g) => g._id === activeGroup._id)) {
      return activeGroup;
    }

    if (!isEmpty(userGroups)) {
      return userGroups[0];
    }

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

  // Custom footer for the organization modal
  const modalFooter = (
    <div className="flex justify-end items-center gap-3 w-full border-t border-gray-200 pt-4 mt-4 bg-white">
      <button
        type="button"
        onClick={handleCloseModal}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleOpenCreateModal}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200"
      >
        <HiPlus className="h-4 w-4" />
        <span>Add New Organization</span>
      </button>
    </div>
  );

  // Render the organization selector and modals
  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`flex items-center space-x-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary/30 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary/10 dark:focus:ring-primary/70 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${className}`}
      >
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
            {isSwitching
              ? 'Switching...'
              : formatGroupName(displayGroup?.grp_title) || ORGANIZATION_LABEL}
          </span>
        )}

        {/* Loading Spinner */}
        {isSwitching && (
          <ImSpinner8 className="h-4 w-4 animate-spin text-primary" />
        )}
      </button>

      {/* Organization Selection Modal */}
      <DialogWrapper
        open={isModalOpen}
        onClose={handleCloseModal}
        footer={modalFooter}
        width="w-full max-w-[600px]"
      >
        <div>
          <div className="text-xl font-semibold text-gray-900 mb-1">
            Select an organization
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Choose which organization you want to work with.
          </div>
          <div className="border-b border-gray-200 mb-4" />
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-100">
            {userGroups.map((group) => (
              <button
                key={group._id}
                type="button"
                onClick={() => handleGroupSelect(group)}
                className={`w-full flex items-center px-2 py-1 text-left transition-colors duration-200 hover:bg-primary/5 dark:hover:bg-primary/10 ${
                  activeGroup?._id === group._id
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {group.grp_image ? (
                  <img
                    src={group.grp_image}
                    alt={`${group.grp_title} logo`}
                    className="h-8 w-8 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary dark:bg-primary/20 dark:text-primary mr-4">
                    {formatGroupName(group.grp_title)
                      ?.charAt(0)
                      ?.toUpperCase() || 'O'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">
                    {formatGroupName(group.grp_title) || 'Unnamed Organization'}
                  </div>
                  {group.grp_website && (
                    <div className="truncate text-xs text-primary/60 dark:text-primary/70">
                      {group.grp_website}
                    </div>
                  )}
                </div>
                {activeGroup?._id === group._id && (
                  <svg
                    className="ml-3 h-5 w-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogWrapper>

      {/* Organization creation dialog */}
      <CreateOrganizationDialog
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        onSubmit={handleOrganizationSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

TopbarOrganizationSelector.propTypes = {
  showTitle: PropTypes.bool,
  className: PropTypes.string,
};

export default TopbarOrganizationSelector;
