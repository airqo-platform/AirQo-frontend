import React, { useState } from 'react';
import { isEmpty } from 'underscore';
import { HiSquares2X2 } from 'react-icons/hi2';
import PropTypes from 'prop-types';

// Components
import OrganizationSelectModal from './OrganizationSelectModal';

// Hooks
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';

// Utils
import { ORGANIZATION_LABEL } from '@/lib/constants';

/**
 * TopbarOrganizationDropdown Component
 *
 * A simple button that opens the OrganizationSelectModal
 * Shows organization initials (letters only) in the button
 * The GroupLogo component is used elsewhere for actual logo display
 */
const TopbarOrganizationDropdown = ({ showTitle = true, className = '' }) => {
  // Use unified group provider
  const {
    activeGroup,
    userGroups,
    isLoading: isLoadingGroups,
  } = useUnifiedGroup();

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Determine what to display for the title
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

  // Modal handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

  // Render the button
  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className={`flex items-center space-x-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-primary/30 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary/10 dark:focus:ring-primary/70 dark:focus:ring-offset-gray-800 transition-colors duration-200 ${className}`}
      >
        {/* Organization Logo - Show initials only */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary">
          {formatGroupName(displayGroup?.grp_title)?.charAt(0)?.toUpperCase() ||
            'O'}
        </div>
        {/* Organization Name */}
        {showTitle && (
          <span className="max-w-32 truncate">
            {formatGroupName(displayGroup?.grp_title) || ORGANIZATION_LABEL}
          </span>
        )}
        {/* Grid Icon - Google style */}
        <HiSquares2X2 className="h-4 w-4" />
      </button>

      {/* Organization Select Modal */}
      <OrganizationSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

TopbarOrganizationDropdown.propTypes = {
  showTitle: PropTypes.bool,
  className: PropTypes.string,
};

export default TopbarOrganizationDropdown;
