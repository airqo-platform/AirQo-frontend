'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Button,
  Banner,
  PageHeading,
  Dialog,
  Input,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { useRolesByGroup, useCreateRole } from '@/shared/hooks/useAdmin';
import { selectActiveGroup } from '@/shared/store/selectors';
import { AdminPageGuard } from '@/shared/components';
import type { RoleDetails } from '@/shared/types/api';
import { AqPlus, AqShield02 } from '@airqo/icons-react';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { formatWithPattern } from '@/shared/utils/dateUtils';

const RolesPage = () => {
  const router = useRouter();

  // Pagination and search states for ServerSideTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Create role dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // Get active group from Redux store
  const activeGroup = useSelector(selectActiveGroup);

  // Fetch data for active group only
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: refetchRoles,
  } = useRolesByGroup(activeGroup?.id || undefined);

  const createRoleMutation = useCreateRole();

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    if (!rolesData?.roles) return [];

    if (!searchTerm) return rolesData.roles;

    return rolesData.roles.filter(
      role =>
        role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.role_description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rolesData?.roles, searchTerm]);

  // Paginate filtered roles
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize);

  const handleRoleClick = useCallback(
    (role: RoleDetails) => {
      router.push(`/admin/roles/${role._id}`);
    },
    [router]
  );

  const handleCreateRole = async () => {
    if (!activeGroup?.id) {
      toast.error('No active organization found');
      return;
    }

    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await createRoleMutation.trigger({
        role_name: newRoleName.trim(),
        group_id: activeGroup.id,
        role_description: newRoleDescription.trim() || undefined,
      });

      toast.success('Role created successfully!');
      setShowCreateDialog(false);
      setNewRoleName('');
      setNewRoleDescription('');
      refetchRoles();
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to create role', errorMessage);
      console.error('Error creating role:', error);
    }
  };

  // Table columns for roles
  const roleColumns = useMemo(
    () => [
      {
        key: 'role_name',
        label: 'Role Name',
        render: (value: unknown, role: RoleDetails) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AqShield02 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{role.role_name}</div>
              {role.role_description && (
                <div className="text-sm text-gray-500">
                  {role.role_description}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'permissions',
        label: 'Permissions',
        render: (value: unknown, role: RoleDetails) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {role.role_permissions.length} permissions
          </span>
        ),
      },
      {
        key: 'users',
        label: 'Users',
        render: (value: unknown, role: RoleDetails) => (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {role.role_users.length} users
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created At',
        render: (value: unknown, role: RoleDetails) => (
          <div className="text-sm">
            {formatWithPattern(role.createdAt, 'MMM dd, yyyy')}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (value: unknown, role: RoleDetails) => (
          <Button
            variant="outlined"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              handleRoleClick(role);
            }}
          >
            Manage
          </Button>
        ),
      },
    ],
    [handleRoleClick]
  );

  return (
    <AdminPageGuard requiredPermissionsInActiveGroup={['GROUP_MANAGEMENT']}>
      <div className="py-6 space-y-6">
        {/* Error Banner */}
        {rolesError && (
          <Banner
            severity="error"
            title="Failed to load roles"
            message="There was an error loading the roles data. Please try again."
            actions={
              <Button
                variant="outlined"
                size="sm"
                onClick={() => refetchRoles()}
              >
                Retry
              </Button>
            }
          />
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <PageHeading
            title="Roles & Permissions"
            subtitle={`Manage user roles and their permissions for ${activeGroup?.title || 'your organization'}`}
          />
          <Button
            variant="filled"
            size="md"
            onClick={() => setShowCreateDialog(true)}
            Icon={AqPlus}
            disabled={!activeGroup?.id}
          >
            Create New Role
          </Button>
        </div>

        {/* Roles Table */}
        <ServerSideTable
          title="Roles"
          data={paginatedRoles.map(role => ({
            ...role,
            id: role._id,
          }))}
          columns={roleColumns}
          loading={rolesLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredRoles.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Create Role Dialog */}
        <Dialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          title="Create New Role"
          subtitle="Add a new role with permissions for the selected organization"
          primaryAction={{
            label: 'Create Role',
            onClick: handleCreateRole,
            disabled: createRoleMutation.isMutating || !newRoleName.trim(),
            loading: createRoleMutation.isMutating,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setShowCreateDialog(false),
            disabled: createRoleMutation.isMutating,
            variant: 'outlined' as const,
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Name *
              </label>
              <Input
                type="text"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="w-full"
                disabled={createRoleMutation.isMutating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Input
                type="text"
                value={newRoleDescription}
                onChange={e => setNewRoleDescription(e.target.value)}
                placeholder="Enter role description (optional)"
                className="w-full"
                disabled={createRoleMutation.isMutating}
              />
            </div>
            {activeGroup && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Organization:</strong> {activeGroup.title}
                </p>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </AdminPageGuard>
  );
};

export default RolesPage;
