'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import { useSelector } from 'react-redux';
import Button from '@/common/components/Button';
import ReusableTable from '@/common/components/Table/ReusableTable';
import ErrorState from '@/common/components/ErrorState';
import EmptyState from '@/common/components/EmptyState';
import PermissionDenied from '@/common/components/PermissionDenied';
import { RolesPermissionsPageSkeleton } from '@/common/components/Skeleton';
import { getGroupRolesApi } from '@/core/apis/Account';

import { FaPlus, FaShieldAlt, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import Dropdown from '@/common/components/Dropdowns/Dropdown';
import logger from '@/lib/logger';
import CustomToast from '@/common/components/Toast/CustomToast';
import AddRoleDialog from '@/common/components/roles-permissions/AddRoleDialog';
import EditRoleDialog from '@/common/components/roles-permissions/EditRoleDialog';
import DeleteRoleDialog from '@/common/components/roles-permissions/DeleteRoleDialog';
import { useRouter } from 'next/navigation';

/**
 * Roles & Permissions Page Component
 *
 * Displays and manages roles and their permissions for an organization.
 * Features include:
 * - View all organization roles in a table format
 * - Search and filter roles by status
 * - Display role details including permission count and user count
 * - Handle loading, error, and empty states gracefully
 * - Permission-based access control
 *
 * @returns {JSX.Element} The roles and permissions page component
 */
const RolesPermissionsPage = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const activeGroup = useSelector((state) => state.groups?.activeGroup);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const getGroupId = useCallback(
    () => organization?._id || organization?.id || activeGroup?._id,
    [organization, activeGroup],
  );

  const fetchRoles = useCallback(async () => {
    const groupId = getGroupId();
    if (!groupId) {
      logger.warn('No group ID available', { organization, activeGroup });
      setError('No organization ID found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const response = await getGroupRolesApi(groupId);
      if (response.status === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      if (response.success && response.roles) {
        setRoles(response.roles);
      } else {
        // If the response has a 403 status, show permission denied
        if (response.status === 403) {
          setPermissionDenied(true);
          setLoading(false);
          return;
        }
        throw new Error(response.message || 'Failed to fetch roles');
      }
    } catch (e) {
      // Check for 403 in error response
      if (e?.response?.status === 403 || e?.status === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      logger.error('Fetch roles error', e);
      setError(e.message);
      CustomToast({ message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [organization, activeGroup, getGroupId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  /**
   * Formats a date string to a readable format
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string or 'N/A' if invalid
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  /**
   * Status Badge Component
   * Renders a colored badge indicating the status of a role
   * @param {Object} props - Component props
   * @param {string} props.status - The status value ('ACTIVE' or 'INACTIVE')
   * @returns {JSX.Element} Status badge component
   */
  const StatusBadge = ({ status }) => {
    const isActive = status?.toUpperCase() === 'ACTIVE';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {isActive ? (
          <FaCheck className="w-3 h-3 mr-1" />
        ) : (
          <FaTimes className="w-3 h-3 mr-1" />
        )}
        {status || 'Unknown'}
      </span>
    );
  };

  // Table columns configuration
  const handleRoleAction = useCallback(
    (action, role) => {
      if (action === 'edit_role') {
        setSelectedRole(role);
        setShowEditDialog(true);
      } else if (action === 'edit_permissions') {
        // Redirect to edit permissions page
        const slug =
          organization?.slug ||
          organization?.grp_slug ||
          organization?.grp_code ||
          organization?._id;
        if (slug && role?._id) {
          router.push(
            `/org/${slug}/roles-permissions/edit-role-permissions/${role._id}`,
          );
        } else {
          CustomToast({
            message: 'Missing organization or role ID.',
            type: 'error',
          });
        }
      } else if (action === 'delete_role') {
        setSelectedRole(role);
        setShowDeleteDialog(true);
      }
    },
    [organization, router],
  );

  const columns = useMemo(
    () => [
      {
        key: 'role_name',
        label: 'Role Name',
        render: (value) => (
          <div className="flex items-center">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {value || 'N/A'}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'role_status',
        label: 'Status',
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: 'createdAt',
        label: 'Created',
        render: (value) => (
          <span className="text-gray-900 dark:text-gray-100">
            {formatDate(value)}
          </span>
        ),
      },
      {
        key: 'role_permissions',
        label: 'Permissions',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <FaShieldAlt className="w-3 h-3 mr-1" />
            {Array.isArray(value) ? value.length : 0}
          </span>
        ),
      },
      {
        key: 'role_users',
        label: 'Users',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <FaUsers className="w-3 h-3 mr-1" />
            {Array.isArray(value) ? value.length : 0}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value, item) => (
          <Dropdown
            menu={[
              { id: 'edit_role', name: 'Edit Role' },
              { id: 'edit_permissions', name: 'Edit Permissions' },
              { id: 'delete_role', name: 'Delete Role' },
            ]}
            onItemClick={(action) => handleRoleAction(action, item)}
            length="last"
          />
        ),
      },
    ],
    [handleRoleAction],
  );

  // Status filter options
  const statusFilterOptions = [
    { value: '', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const filters = [
    {
      key: 'role_status',
      placeholder: 'Filter by status',
      options: statusFilterOptions,
      isMulti: false,
    },
  ];

  const handleAddRole = () => {
    setShowAddDialog(true);
  };

  if (permissionDenied) {
    return <PermissionDenied />;
  }

  if (!organization || loading) {
    return <RolesPermissionsPageSkeleton />;
  }

  if (error && !loading) {
    return (
      <ErrorState
        type="server"
        title="Unable to load roles"
        description={
          <>
            {error}
            <br />
            <span className="text-sm text-gray-500">
              Please try again or contact support if the issue persists.
            </span>
          </>
        }
        onPrimaryAction={fetchRoles}
        primaryAction="Retry"
        size="medium"
        variant="card"
      />
    );
  }

  if (roles.length === 0 && !loading && !error) {
    return (
      <EmptyState
        icon={FaShieldAlt}
        title="No roles created yet"
        description="Create your first role to manage permissions and access control for your organization members."
        actionLabel="Add Role"
        onAction={handleAddRole}
        size="medium"
        variant="card"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Roles & Permissions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage roles and permissions for your organization
            </p>
          </div>
          <Button onClick={handleAddRole} variant="filled">
            <FaPlus className="mr-2" /> Add Role
          </Button>
        </div>

        <ReusableTable
          title={`Organization Roles (${roles.length})`}
          data={roles}
          columns={columns}
          searchable={true}
          filterable={true}
          filters={filters}
          loading={loading}
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
          searchableColumns={['role_name', 'role_code']}
          className="bg-white dark:bg-gray-800"
          sortable={true}
        />
      </div>

      {/* Add Role Dialog */}
      <AddRoleDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        groupId={getGroupId()}
        onRefresh={fetchRoles}
      />

      {/* Edit Role Dialog */}
      {selectedRole && (
        <EditRoleDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedRole(null);
          }}
          roleId={selectedRole._id}
          initialRoleName={selectedRole.role_name}
          initialRoleStatus={selectedRole.role_status}
          onRefresh={fetchRoles}
        />
      )}

      {/* Delete Role Dialog */}
      {selectedRole && (
        <DeleteRoleDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedRole(null);
          }}
          roleId={selectedRole._id}
          onRefresh={fetchRoles}
        />
      )}
    </>
  );
};

export default RolesPermissionsPage;
