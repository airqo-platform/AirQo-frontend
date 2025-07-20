import { FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';

/**
 * Remove User Modal Component
 * A modal for confirming user removal from organization
 */
const RemoveUserModal = ({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  user = null,
  isLoading = false,
}) => {
  if (!isOpen || !user) return null;

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Team Member"
      subtitle="This action cannot be undone"
      icon={FaExclamationTriangle}
      iconColor="text-red-600 dark:text-red-400"
      iconBgColor="bg-red-100 dark:bg-red-900/20"
      size="max-w-md"
      maxHeight="max-h-96"
      ariaLabel="Remove Team Member"
      primaryAction={{
        label: isLoading ? 'Removing...' : 'Remove Member',
        onClick: () => onConfirm(user),
        disabled: isLoading,
        className:
          'text-sm bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
        padding: 'px-4 py-2',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outlined',
        disabled: isLoading,
        className: 'text-sm',
        padding: 'px-4 py-2',
      }}
    >
      <div className="text-center">
        {/* User Avatar/Initial */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <span className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            {user.firstName?.charAt(0)?.toUpperCase() ||
              user.email?.charAt(0)?.toUpperCase() ||
              'U'}
          </span>
        </div>

        {/* User Info */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {user.email}
        </p>

        {/* Warning Message */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Are you sure you want to remove this member from the organization?
            They will lose access to all organization resources and data.
          </p>
        </div>
      </div>
    </ReusableDialog>
  );
};

RemoveUserModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  user: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default RemoveUserModal;
