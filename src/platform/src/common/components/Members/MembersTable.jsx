import React, { useState } from 'react';
import Table from './Table';
import RemoveUserModal from './RemoveUserModal';
import Button from '@/common/components/Button';
import {
  FaEnvelope,
  FaEllipsisV,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserTimes,
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * Members Table Component
 * A specialized table component for displaying team members
 */
const MembersTable = ({
  members = [],
  isLoading = false,
  onRemoveUser = () => {},
  removeLoading = false,
  groupDetails = null,
  formatLastActive = () => 'Never',
}) => {
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Helper function to get status badge
  const getStatusBadge = (member) => {
    const status = member.isActive ? 'active' : 'inactive';
    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    const icons = {
      active: <FaUserCheck className="w-3 h-3" />,
      inactive: <FaUserTimes className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[status] || colors.inactive
        }`}
      >
        {icons[status]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  // Handle remove user action
  const handleRemoveUser = (user) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
    setShowActionMenu(null);
  };

  // Confirm remove user
  const confirmRemoveUser = async (user) => {
    try {
      await onRemoveUser(user);
      setShowRemoveModal(false);
      setSelectedUser(null);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Error removing user:', error);
    }
  };

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

  // Table columns configuration
  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (member) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {member.firstName?.charAt(0) || ''}
                {member.lastName?.charAt(0) || ''}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Login Count: {member.loginCount || 0}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (member) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white flex items-center">
            <FaEnvelope className="w-4 h-4 text-gray-400 mr-2" />
            {member.email}
          </div>
          {member.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {member.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => getStatusBadge(member),
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (member) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatLastActive(member)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => (
        <div className="relative action-menu-container">
          <Button
            variant="text"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() =>
              setShowActionMenu(
                showActionMenu === member._id ? null : member._id,
              )
            }
          >
            <FaEllipsisV className="w-4 h-4" />
          </Button>

          {showActionMenu === member._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {groupDetails?.grp_manager?._id !== member._id ? (
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleRemoveUser(member)}
                  >
                    <FaTrash className="w-4 h-4 mr-2" />
                    Remove from group
                  </button>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Group Manager
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {' '}
      <Table
        title={`Members (${members.length})`}
        data={members}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No members found"
        emptyIcon={FaUser}
        enablePagination={true}
        initialPageSize={10}
        pageSizeOptions={[10, 25, 50]}
      />
      {/* Remove User Modal */}
      <RemoveUserModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmRemoveUser}
        user={selectedUser}
        isLoading={removeLoading}
      />
    </>
  );
};

MembersTable.propTypes = {
  members: PropTypes.array,
  isLoading: PropTypes.bool,
  onRemoveUser: PropTypes.func,
  removeLoading: PropTypes.bool,
  groupDetails: PropTypes.object,
  formatLastActive: PropTypes.func,
};

export default MembersTable;
