import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { HiPlus, HiMagnifyingGlass } from 'react-icons/hi2';
import PropTypes from 'prop-types';

// Components
import Button from '@/common/components/Button';

// Organization Loading Context
import { useOrganizationLoading } from '@/app/providers/OrganizationLoadingProvider';

// Features
import {
  CreateOrganizationDialog,
  useCreateOrganization,
} from '@/common/features/create-organization';

// Redux
import {
  selectActiveGroup,
  selectUserGroups,
  setActiveGroup,
} from '@/lib/store/services/groups';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

// Utils
import {
  isAirQoGroup,
  shouldUseUserFlow,
} from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

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
  if (shouldUseUserFlow(group)) {
    return '/user/Home';
  }

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

const OrganizationSelectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { setIsSwitchingOrganization } = useOrganizationLoading();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  // Organization creation feature
  const {
    isModalOpen,
    isSubmitting,
    openModal,
    closeModal,
    handleSubmit: handleOrganizationSubmit,
  } = useCreateOrganization();

  // Monitor pathname changes for user flow routes
  useEffect(() => {
    if (!userGroups || userGroups.length === 0) return;

    // If route goes back to /user/*, set active group to AirQo
    if (pathname.startsWith('/user/')) {
      const airqoGroup = userGroups.find(isAirQoGroup);
      if (airqoGroup && (!activeGroup || activeGroup._id !== airqoGroup._id)) {
        dispatch(setActiveGroup(airqoGroup));
      }
    }
  }, [pathname, userGroups, activeGroup, dispatch]);

  // Filter groups based on search term
  const filteredGroups =
    userGroups?.filter(
      (group) =>
        group.grp_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.grp_website?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Handle organization switching
  const handleGroupSelect = async (group) => {
    if (!group || group._id === activeGroup?._id) {
      onClose();
      return;
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

      // Update user preferences
      setTimeout(async () => {
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
      }, 300);

      onClose();
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
  // Handle opening the organization creation modal
  const handleOpenModal = () => {
    onClose(); // Close the current modal first
    openModal();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />{' '}
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl h-[650px] bg-white rounded-2xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organizations
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {filteredGroups.length} available
              </p>
            </div>{' '}
            <Button
              onClick={handleOpenModal}
              Icon={HiPlus}
              className="text-xs"
              padding="px-3 py-2"
            >
              Add New
            </Button>
          </div>
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
              />
            </div>
          </div>
          {/* Organizations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredGroups.length > 0 ? (
              <div className="space-y-1">
                {filteredGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleGroupSelect(group)}
                    disabled={isSwitching}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 group ${
                      activeGroup?._id === group._id
                        ? 'bg-primary/10 border border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    } ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                  >
                    {/* Organization Logo */}
                    {group.grp_image ? (
                      <img
                        src={group.grp_image}
                        alt={`${group.grp_title} logo`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ring-2 ${
                          activeGroup?._id === group._id
                            ? 'bg-primary/10 text-primary ring-primary/20 dark:bg-primary/30 dark:text-primary dark:ring-primary/30'
                            : 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600'
                        }`}
                      >
                        {formatGroupName(group.grp_title)
                          ?.charAt(0)
                          ?.toUpperCase() || 'O'}
                      </div>
                    )}
                    {/* Organization Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {formatGroupName(group.grp_title) ||
                          'Unnamed Organization'}
                      </h3>
                      {group.grp_website && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {group.grp_website}
                        </p>
                      )}
                    </div>{' '}
                    {/* Active Indicator */}
                    {activeGroup?._id === group._id ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    ) : (
                      <div className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <HiMagnifyingGlass className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {searchTerm
                    ? 'No organizations found'
                    : 'No organizations available'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first organization to get started'}
                </p>
              </div>
            )}
          </div>{' '}
          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={onClose}
              variant="outlined"
              className="text-sm"
              padding="px-4 py-2"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
      {/* Organization creation dialog */}
      <CreateOrganizationDialog
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleOrganizationSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

OrganizationSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrganizationSelectModal;
