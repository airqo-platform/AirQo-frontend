import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus, HiMagnifyingGlass } from 'react-icons/hi2';
import PropTypes from 'prop-types';

// Components
import Button from '@/common/components/Button';

// Hooks
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';

// Utils
import logger from '@/lib/logger';
import { isAirQoGroup } from '@/core/utils/organizationUtils';

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
  const router = useRouter();
  // Use unified group provider
  const { activeGroup, userGroups, switchToGroup, isSwitching } =
    useUnifiedGroup();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');

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

    if (isSwitching) return; // Prevent multiple rapid switches

    logger.info('OrganizationSelectModal: User selected group:', {
      groupId: group._id,
      groupName: group.grp_title,
      previousActiveGroup: activeGroup?.grp_title,
    });

    try {
      // Use the unified group provider to switch groups
      const result = await switchToGroup(group, { navigate: true });

      if (result.success) {
        onClose();
      } else {
        logger.error('Group switch failed:', result.error);
      }
    } catch (error) {
      logger.error('Organization switching failed:', error);
    }
  }; // Handle navigation to create organization page
  const handleCreateOrganization = async () => {
    try {
      // Find AirQo group in user's groups
      const airqoGroup = userGroups?.find(isAirQoGroup);

      if (airqoGroup && activeGroup?._id !== airqoGroup._id) {
        logger.info(
          'OrganizationSelectModal: Switching to AirQo group before navigation',
          {
            airqoGroupId: airqoGroup._id,
            airqoGroupName: airqoGroup.grp_title,
            currentActiveGroup: activeGroup?.grp_title,
          },
        );

        // Switch to AirQo group without navigation (we'll navigate manually)
        await switchToGroup(airqoGroup, { navigate: false });
      }

      onClose(); // Close the current modal
      router.push('/create-organization'); // Navigate to the create organization page
    } catch (error) {
      logger.error(
        'Failed to switch to AirQo group before create organization:',
        error,
      );
      // Still navigate even if group switch fails
      onClose();
      router.push('/create-organization');
    }
  };

  if (!isOpen) return null;

  // Render the organization selection modal
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
            </div>
            <Button
              onClick={handleCreateOrganization}
              Icon={HiPlus}
              className="text-xs"
              padding="px-3 py-2"
            >
              Request New Org
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
            </Button>{' '}
          </div>
        </div>
      </div>
    </>
  );
};

OrganizationSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrganizationSelectModal;
