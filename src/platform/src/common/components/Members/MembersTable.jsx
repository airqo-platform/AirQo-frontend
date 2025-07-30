import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ReusableTable from '../Table/ReusableTable';
import RemoveUserModal from './RemoveUserModal';
import EditUserRoleModal from './EditUserRoleModal';
import Dropdown from '../Dropdowns/Dropdown';
import PropTypes from 'prop-types';
import {
  AqMail01,
  AqUserX02,
  AqUserCheck02,
  AqUser02,
} from '@airqo/icons-react';

/**
 * Members Table Component
 * Displays team members and tags the group manager specially
 */
const MembersTable = ({
  members = [],
  onRemoveUser = () => {},
  removeLoading = false,
  groupDetails = null,
  formatLastActive = () => 'Never',
}) => {
  const { data: session } = useSession();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const managerId = groupDetails?.grp_manager?._id;

  // No longer needed: action menu outside click handler

  const getStatusBadge = (m) => {
    const status = m.isActive ? 'active' : 'inactive';
    const colors = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    const icons = {
      active: <AqUserCheck02 className="w-3 h-3" />,
      inactive: <AqUserX02 className="w-3 h-3" />,
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
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setShowEditRoleModal(true);
  };

  const handleSaveRole = async (newRoleId) => {
    if (!newRoleId) return;
    setEditRoleLoading(true);
    // TODO: Implement actual API call to update user role here
    // Example: await updateUserRoleApi(selectedUser._id, newRoleId);
    setEditRoleLoading(false);
    setShowEditRoleModal(false);
    setSelectedUser(null);
    // Optionally, refresh members list or show a toast
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
              <AqMail01 className="w-4 h-4 text-gray-400 mr-2" />
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
        // Prevent user from removing themselves
        const currentUserId = session?.user?.id || session?.user?._id;
        const isSelf = currentUserId && member._id === currentUserId;
        let menu;
        if (member._id === managerId) {
          menu = [
            {
              id: 'manager',
              name: (
                <span className="flex items-center text-gray-500">
                  <AqUser02 className="w-4 h-4 mr-2" />
                  Group Manager
                </span>
              ),
            },
            {
              id: 'edit-role',
              name: (
                <span className="flex items-center text-blue-600">
                  Edit role
                </span>
              ),
            },
          ];
        } else if (isSelf) {
          // User cannot remove themselves
          menu = [
            {
              id: 'self',
              name: (
                <span className="flex items-center text-gray-400 cursor-not-allowed">
                  You cannot remove yourself
                </span>
              ),
              disabled: true,
            },
            {
              id: 'edit-role',
              name: (
                <span className="flex items-center text-blue-600">
                  Edit role
                </span>
              ),
            },
          ];
        } else {
          menu = [
            {
              id: 'remove',
              name: (
                <span className="flex items-center text-red-600">
                  Remove from group
                </span>
              ),
            },
            {
              id: 'edit-role',
              name: (
                <span className="flex items-center text-blue-600">
                  Edit role
                </span>
              ),
            },
          ];
        }
        const handleMenuClick = (id) => {
          if (id === 'remove' && !isSelf) handleRemove(member);
          if (id === 'edit-role') handleEditRole(member);
        };
        return (
          <Dropdown onItemClick={handleMenuClick} menu={menu} length={'last'} />
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

  // Status filter options
  const statusFilter = {
    key: 'isActive',
    options: [
      { value: '', label: 'All' },
      { value: true, label: 'Active' },
      { value: false, label: 'Inactive' },
    ],
    placeholder: 'Filter by status',
    isMulti: false,
  };

  return (
    <>
      <ReusableTable
        title={`Members (${tableMembers.length})`}
        data={tableMembers}
        columns={patchedColumns}
        searchable={true}
        filterable={true}
        filters={[statusFilter]}
        pageSize={10}
        showPagination={true}
        sortable={true}
        searchableColumns={['member', 'contact', 'status', 'lastActive']}
      />

      <RemoveUserModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemove}
        user={selectedUser}
        isLoading={removeLoading}
      />
      <EditUserRoleModal
        isOpen={showEditRoleModal}
        onClose={() => setShowEditRoleModal(false)}
        user={selectedUser}
        groupId={groupDetails?._id}
        onSave={handleSaveRole}
        isLoading={editRoleLoading}
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
