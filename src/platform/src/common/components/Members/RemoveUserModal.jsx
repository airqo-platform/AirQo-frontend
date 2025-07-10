import React from 'react';
import Button from '@/common/components/Button';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';

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

  const handleConfirm = () => {
    onConfirm(user);
  };

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/80 transition-opacity duration-200"
        onClick={onClose}
        aria-label="Close remove user modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col overflow-hidden z-[10001]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Remove Team Member
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
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
                  Are you sure you want to remove this member from the
                  organization? They will lose access to all organization
                  resources and data.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={isLoading}
              className="text-sm"
              padding="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="text-sm bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
              padding="px-4 py-2"
            >
              {isLoading ? 'Removing...' : 'Remove Member'}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
