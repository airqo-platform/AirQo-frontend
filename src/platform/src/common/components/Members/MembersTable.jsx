import React, { useState, useEffect } from 'react';
import ReusableTable from '../Table/ReusableTable';
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
 * Displays team members and tags the group manager specially
 */
const MembersTable = ({
  members = [],
  // isLoading = false, // removed unused prop
  onRemoveUser = () => {},
  removeLoading = false,
  groupDetails = null,
  formatLastActive = () => 'Never',
}) => {
  const [actionMenuFor, setActionMenuFor] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const managerId = groupDetails?.grp_manager?._id;

  // Close any open menus when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActionMenuFor(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const getStatusBadge = (m) => {
    const status = m.isActive ? 'active' : 'inactive';
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
          colors[status]
        }`}
      >
        {icons[status]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const handleRemove = (user) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
    setActionMenuFor(null);
  };
  const confirmRemove = async () => {
    await onRemoveUser(selectedUser);
    setShowRemoveModal(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      key: 'member',
      header: 'Member',
      render: (member) => {
        if (!member) return null;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {member.firstName?.[0] || ''}
                  {member.lastName?.[0] || ''}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </span>
                {member._id === managerId && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                    👑 Manager
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Login Count: {member.loginCount || 0}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (member) => {
        if (!member) return null;
        return (
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
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => (member ? getStatusBadge(member) : null),
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (member) =>
        member ? (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatLastActive(member)}
          </span>
        ) : null,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member) => {
        if (!member) return null;
        return (
          <div className="relative action-menu-container">
            <Button
              variant="text"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() =>
                setActionMenuFor(
                  actionMenuFor === member._id ? null : member._id,
                )
              }
            >
              <FaEllipsisV className="w-4 h-4" />
            </Button>

            {actionMenuFor === member._id && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  {member._id !== managerId ? (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleRemove(member)}
                    >
                      <FaTrash className="w-4 h-4 mr-2" />
                      Remove from group
                    </button>
                  ) : (
                    <div className="flex items-center w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaUser className="w-4 h-4 mr-2" />
                      Group Manager
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Ensure members is always an array and not undefined/null
  const tableMembers = Array.isArray(members) ? members : [];

  // Patch column renderers to accept (value, row) and always use row for rendering
  const patchedColumns = columns.map((col) => ({
    key: col.key,
    label: col.header,
    render: (value, row) => col.render(row),
  }));

  return (
    <>
      <ReusableTable
        title={`Members (${tableMembers.length})`}
        data={tableMembers}
        columns={patchedColumns}
        searchable={true}
        filterable={false}
        filters={[]}
        pageSize={10}
        showPagination={true}
        sortable={true}
        className="mb-6"
      />

      <RemoveUserModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemove}
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
