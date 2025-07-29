import React from 'react';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import { useRouter } from 'next/navigation';
import { AqPlus } from '@airqo/icons-react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@/common/components/Button';
import SearchField from '@/common/components/search/SearchField';
import { addSearchTerm } from '@/lib/store/services/search/LocationSearchSlice';

import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import logger from '@/lib/logger';
import { isAirQoGroup } from '@/core/utils/organizationUtils';

// Utility to format names
const formatGroupName = (groupName) => {
  if (!groupName) return '';
  return groupName
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((w) => w.toUpperCase())
    .join(' ')
    .trim();
};

const OrganizationSelectModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // --- use the redux‐backed searchTerm now ---
  const searchTerm = useSelector((state) => state.locationSearch.searchTerm);

  const {
    activeGroup,
    userGroups = [],
    switchToGroup,
    isSwitching,
  } = useUnifiedGroup();

  const filteredGroups = userGroups.filter(
    (g) =>
      g.grp_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.grp_website?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleGroupSelect = async (group) => {
    if (!group || group._id === activeGroup?._id) {
      onClose();
      return;
    }
    if (isSwitching) return;
    logger.info('OrganizationSelectModal: selecting', {
      from: activeGroup?.grp_title,
      to: group.grp_title,
    });
    try {
      // Show loading immediately for smooth transition
      const result = await switchToGroup(group, { navigate: true });
      if (result.success) onClose();
      else logger.error('Switch failed:', result.error);
    } catch (err) {
      logger.error('Switch error:', err);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      // ensure AirQo group is active before nav
      const airqo = userGroups.find(isAirQoGroup);
      if (airqo && airqo._id !== activeGroup?._id) {
        await switchToGroup(airqo, { navigate: false });
      }
    } catch (err) {
      logger.error('Could not switch to AirQo first:', err);
    } finally {
      onClose();
      router.push('/create-organization');
    }
  };

  if (!isOpen) return null;

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      size="max-w-2xl"
      maxHeight="h-[450px]"
      ariaLabel="Organizations Modal"
      className="z-[10001]"
      contentClassName="flex flex-col h-[450px]"
      contentAreaClassName="px-0 py-4 flex-1"
      hideCloseIcon={true}
      primaryAction={null}
      secondaryAction={null}
      customHeader={
        <div className="flex items-center justify-between border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
            Icon={AqPlus}
            className="text-xs"
            padding="px-3 py-2"
          >
            Request New Organization
          </Button>
        </div>
      }
      customFooter={
        <div className="flex items-center justify-end border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button
            onClick={onClose}
            variant="outlined"
            className="text-sm"
            padding="px-4 py-2"
          >
            Close
          </Button>
        </div>
      }
    >
      {/* Search via reusable component */}
      <div className="border-gray-200 px-2 dark:border-gray-700">
        <SearchField
          onSearch={() => {}}
          onClearSearch={() => dispatch(addSearchTerm(''))}
          focus={false}
          showSearchResultsNumber={false}
        />
      </div>

      {/* divider */}
      <div className="border-b pt-4 border-gray-200 dark:border-gray-700" />

      {/* Organizations List */}
      <div className="flex-1 px-2 py-1 overflow-y-auto">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((g) => (
            <button
              key={g._id}
              onClick={() => handleGroupSelect(g)}
              disabled={isSwitching}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 group
                ${
                  activeGroup?._id === g._id
                    ? 'bg-primary/10 border border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }
                ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
              `}
            >
              {g.grp_image ? (
                <img
                  src={g.grp_image}
                  alt={`${g.grp_title} logo`}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                />
              ) : (
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ring-2
                    ${
                      activeGroup?._id === g._id
                        ? 'bg-primary/10 text-primary ring-primary/20 dark:bg-primary/30 dark:text-primary dark:ring-primary/30'
                        : 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600'
                    }
                  `}
                >
                  {formatGroupName(g.grp_title)?.charAt(0) || 'O'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {formatGroupName(g.grp_title) || 'Unnamed Organization'}
                </h3>
                {g.grp_website && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {g.grp_website}
                  </p>
                )}
              </div>
              {activeGroup?._id === g._id ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              ) : (
                <div className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
              <AqPlus className="w-6 h-6 text-gray-400" />
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
      </div>
    </ReusableDialog>
  );
};

OrganizationSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OrganizationSelectModal;
