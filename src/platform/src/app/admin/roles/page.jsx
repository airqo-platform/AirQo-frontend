'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageHeader } from '@/common/components/Header';
import { usePermissions } from '@/core/HOC/authUtils';
import Button from '@/common/components/Button';
import ReusableTable from '@/common/components/Table/ReusableTable';
import PermissionDenied from '@/common/components/PermissionDenied';
import { RolesPermissionsPageSkeleton } from '@/common/components/Skeleton';
import { getGroupRolesApi as getGroupRolesSummaryApi } from '@/core/apis/Account';
import { useLoadingState } from '@/core/hooks/useCommonStates';
import {
  AqPlus,
  AqShield03,
  AqUsers03,
  AqCheck,
  AqXClose,
} from '@airqo/icons-react';
import Dropdown from '@/common/components/Dropdowns/Dropdown';
import logger from '@/lib/logger';
import CustomToast from '@/common/components/Toast/CustomToast';
import AddRoleDialog from '@/common/components/roles-permissions/AddRoleDialog';
import EditRoleDialog from '@/common/components/roles-permissions/EditRoleDialog';
import DeleteRoleDialog from '@/common/components/roles-permissions/DeleteRoleDialog';
import { useRouter } from 'next/navigation';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

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
        <AqCheck className="w-3 h-3 mr-1" />
      ) : (
        <AqXClose className="w-3 h-3 mr-1" />
      )}
      {status || 'Unknown'}
    </span>
  );
};

const RolesPermissionsPage = () => {
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const { loading, startLoading, stopLoading } = useLoadingState(true);

  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { hasPermission, isLoading: permLoading } = usePermissions();
  const { id: activeGroupID, loading: groupLoading } = useGetActiveGroup();

  // Only compute permissions after loading is complete to prevent flicker
  const isLoadingAuth = permLoading || groupLoading;
  const canView = !isLoadingAuth
    ? hasPermission('ROLE_VIEW', activeGroupID)
    : null;
  const canCreate = !isLoadingAuth
    ? hasPermission('ROLE_CREATE', activeGroupID)
    : null;
  const canEdit = !isLoadingAuth
    ? hasPermission('ROLE_EDIT', activeGroupID)
    : null;
  const canDelete = !isLoadingAuth
    ? hasPermission('ROLE_DELETE', activeGroupID)
    : null;

  const fetchRoles = useCallback(async () => {
    if (!canView) return; // Don't fetch if no permission

    startLoading();
    try {
      const payload = await getGroupRolesSummaryApi();
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.roles)
          ? payload.roles
          : [];
      setRoles(list);
    } catch (e) {
      logger.error('Fetch roles error', e);
      CustomToast({
        message: e.message || 'Failed to fetch roles',
        type: 'error',
      });
      setRoles([]);
    } finally {
      stopLoading();
    }
  }, [canView, startLoading, stopLoading]);

  useEffect(() => {
    // Only fetch after auth loading is complete and permissions are resolved
    if (isLoadingAuth) return;
    if (canView === false) {
      // No permission, don't fetch but ensure loading state is cleared
      stopLoading();
      return;
    }

    fetchRoles();
  }, [fetchRoles, isLoadingAuth, canView, stopLoading]);

  const handleRoleAction = useCallback(
    (action, role) => {
      if (
        (action === 'edit_role' || action === 'edit_permissions') &&
        !canEdit
      ) {
        CustomToast({
          message: 'You do not have permission to edit roles',
          type: 'warning',
        });
        return;
      }

      if (action === 'edit_role') {
        setSelectedRole(role);
        setShowEditDialog(true);
      } else if (action === 'edit_permissions') {
        if (role?._id) {
          router.push(`/admin/roles/edit-role-permissions/${role._id}`);
        } else {
          CustomToast({ message: 'Missing role ID', type: 'error' });
        }
      } else if (action === 'delete_role') {
        if (!canDelete) {
          CustomToast({
            message: 'You do not have permission to delete roles',
            type: 'warning',
          });
          return;
        }
        setSelectedRole(role);
        setShowDeleteDialog(true);
      }
    },
    [canEdit, canDelete, router],
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
        key: 'group',
        label: 'Organization',
        render: (group) => (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {group?.grp_title || group?.organization_slug || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {group?._id || ''}
            </div>
          </div>
        ),
      },
      {
        key: 'role_permissions',
        label: 'Permissions',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <AqShield03 className="w-3 h-3 mr-1" />
            {Array.isArray(value) ? value.length : 0}
          </span>
        ),
      },
      {
        key: 'role_users',
        label: 'Users',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <AqUsers03 className="w-3 h-3 mr-1" />
            {Array.isArray(value) ? value.length : 0}
          </span>
        ),
      },
      {
        key: 'role_status',
        label: 'Status',
        render: (value) => <StatusBadge status={value} />,
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value, item) => (
          <Dropdown
            menu={[
              { id: 'edit_role', name: 'Edit Role', disabled: !canEdit },
              {
                id: 'edit_permissions',
                name: 'Edit Permissions',
                disabled: !canEdit,
              },
              { id: 'delete_role', name: 'Delete Role', disabled: !canDelete },
            ]}
            onItemClick={(action) => handleRoleAction(action, item)}
            length="last"
          />
        ),
      },
    ],
    [handleRoleAction, canEdit, canDelete],
  );

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

  const handleAddRole = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  // Show loading skeleton while authentication is loading or data is being fetched
  if (isLoadingAuth || loading) {
    return <RolesPermissionsPageSkeleton />;
  }

  // Show permission denied only after auth loading is complete
  if (canView === false) {
    return <PermissionDenied />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <PageHeader
              title="Roles & Permissions"
              subtitle="Manage system roles and permissions"
            />
          </div>
          {canCreate && (
            <Button onClick={handleAddRole} variant="filled">
              <AqPlus className="mr-2" /> Add Role
            </Button>
          )}
        </div>

        <ReusableTable
          title={`System Roles (${roles.length})`}
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
        groupId={null}
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
