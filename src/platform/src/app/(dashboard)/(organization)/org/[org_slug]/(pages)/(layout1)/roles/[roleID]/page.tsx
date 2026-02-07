'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AqChevronLeft } from '@airqo/icons-react';
import {
  useRoleById,
  usePermissions,
  useUpdateRolePermissions,
  useUpdateRoleData,
} from '@/shared/hooks/useAdmin';
import { PermissionGuard } from '@/shared/components';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageHeading } from '@/shared/components/ui';
import { LoadingState } from '@/shared/components/ui/loading-state';
import Checkbox from '@/shared/components/ui/checkbox';
import Select from '@/shared/components/ui/select';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useRBAC } from '@/shared/hooks';

const RoleDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const org_slug = params.org_slug as string;
  const roleId = params.roleID as string;
  const { hasAnyPermissionInActiveGroup } = useRBAC();

  const {
    data: roleData,
    error: roleError,
    isLoading: roleLoading,
    mutate: refetchRole,
  } = useRoleById(roleId);

  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
  } = usePermissions();
  const updateRolePermissionsMutation = useUpdateRolePermissions();
  const updateRoleDataMutation = useUpdateRoleData();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Role data editing state
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [editedRoleStatus, setEditedRoleStatus] = useState<
    'ACTIVE' | 'INACTIVE'
  >('ACTIVE');

  // Check permissions
  const canEditRole = hasAnyPermissionInActiveGroup(['ROLE_EDIT']);

  // Get the role details from the response
  // Handle both single role and roles array response formats
  const role = roleData?.role || roleData?.roles?.[0];

  // Initialize selected permissions when role data loads
  React.useEffect(() => {
    if (isEditingRole) return; // Don't reset while user is editing

    if (role?.role_permissions) {
      const initialPermissions = role.role_permissions.map(rp => rp._id);
      setSelectedPermissions(initialPermissions);
    }
    if (role?.role_status) {
      setEditedRoleStatus(role.role_status as 'ACTIVE' | 'INACTIVE');
    }
  }, [role, isEditingRole]);

  // Validate roleId
  if (!roleId || typeof roleId !== 'string' || roleId.trim() === '') {
    return (
      <PermissionGuard requiredPermissionsInActiveGroup={['ROLE_VIEW']}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Invalid role ID provided</p>
          <Button onClick={() => router.push(`/org/${org_slug}/roles`)}>
            Back to Roles
          </Button>
        </div>
      </PermissionGuard>
    );
  }

  const handlePermissionToggle = (permissionId: string) => {
    if (!canEditRole) {
      toast.error('You do not have permission to edit roles');
      return;
    }

    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(newPermissions);

    // Check if there are changes from the original
    const originalPermissions = role?.role_permissions?.map(rp => rp._id) || [];
    setHasChanges(
      JSON.stringify(newPermissions.sort()) !==
        JSON.stringify(originalPermissions.sort())
    );
  };

  const handleSaveChanges = async () => {
    if (!role || !canEditRole) return;

    try {
      await updateRolePermissionsMutation.trigger({
        roleId: role._id,
        permission_ids: selectedPermissions,
      });

      toast.success('Role permissions updated successfully!');
      setHasChanges(false);
      refetchRole();
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to update role permissions', errorMessage);
      console.error('Error updating role permissions:', error);
    }
  };

  const handleDiscardChanges = () => {
    if (role?.role_permissions) {
      const originalPermissions = role.role_permissions.map(rp => rp._id);
      setSelectedPermissions(originalPermissions);
      setHasChanges(false);
    }
  };

  const handleSaveRoleData = async () => {
    if (!role || !canEditRole) return;

    try {
      await updateRoleDataMutation.trigger({
        roleId: role._id,
        role_name: role.role_name,
        role_status: editedRoleStatus,
        role_code: role.role_code,
      });

      toast.success('Role data updated successfully!');
      setIsEditingRole(false);
      refetchRole();
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to update role data', errorMessage);
      console.error('Error updating role data:', error);
    }
  };

  const handleCancelRoleEdit = () => {
    if (role?.role_status) {
      setEditedRoleStatus(role.role_status as 'ACTIVE' | 'INACTIVE');
    }
    setIsEditingRole(false);
  };

  if (roleLoading || permissionsLoading) {
    return (
      <PermissionGuard requiredPermissionsInActiveGroup={['ROLE_VIEW']}>
        <LoadingState text="Loading role details..." />
      </PermissionGuard>
    );
  }

  if (roleError || permissionsError || !role) {
    // More specific error message
    let errorMessage = 'Role not found';
    if (roleError) {
      errorMessage = `Failed to load role details: ${roleError.message || 'Unknown error'}`;
    } else if (!role && roleData) {
      errorMessage = 'Role data loaded but role object is missing';
    } else if (!roleId) {
      errorMessage = 'No role ID provided in URL';
    }

    return (
      <PermissionGuard requiredPermissionsInActiveGroup={['ROLE_VIEW']}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{errorMessage}</p>
          <Button onClick={() => router.push(`/org/${org_slug}/roles`)}>
            Back to Roles
          </Button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermissionsInActiveGroup={['ROLE_VIEW']}>
      <Button
        variant="ghost"
        size="sm"
        Icon={AqChevronLeft}
        onClick={() => router.push(`/org/${org_slug}/roles`)}
        className="mb-6"
      >
        Back
      </Button>

      {/* Header */}
      <div className="relative">
        <PageHeading
          title="Edit Role"
          subtitle="Modify role details and permissions for your organization"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Role Details Section */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Role Details
            </h2>
            {!isEditingRole && canEditRole ? (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setIsEditingRole(true)}
              >
                Edit
              </Button>
            ) : canEditRole ? (
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleCancelRoleEdit}
                  disabled={updateRoleDataMutation.isMutating}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveRoleData}
                  disabled={updateRoleDataMutation.isMutating}
                  loading={updateRoleDataMutation.isMutating}
                >
                  {updateRoleDataMutation.isMutating ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role Name *
                </label>
                {/* Role name is read-only in both modes */}
                <div className="mt-1">
                  <span className="font-medium text-gray-900">
                    {role.role_name}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role Status
                </label>
                {isEditingRole && canEditRole ? (
                  <div className="mt-1">
                    <Select
                      value={editedRoleStatus}
                      onChange={e =>
                        setEditedRoleStatus(
                          e.target.value as 'ACTIVE' | 'INACTIVE'
                        )
                      }
                      disabled={updateRoleDataMutation.isMutating}
                      placeholder="Select status"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </Select>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        role.role_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {role.role_status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role Description
                </label>
                <div className="mt-1 p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[80px] flex items-start">
                  <span className="text-sm text-gray-700">
                    {role.role_description || 'No description provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Permissions ({selectedPermissions.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedPermissions.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No permissions selected
                  </p>
                ) : (
                  selectedPermissions.map(permissionId => {
                    const permission = permissionsData?.permissions?.find(
                      p => p._id === permissionId
                    );
                    if (!permission) return null;
                    return (
                      <div
                        key={permissionId}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 font-medium">
                          {permission.permission}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {hasChanges && canEditRole && (
              <div className="border-t pt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSaveChanges}
                  disabled={updateRolePermissionsMutation.isMutating}
                  loading={updateRolePermissionsMutation.isMutating}
                >
                  {updateRolePermissionsMutation.isMutating
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  className="w-full"
                  onClick={handleDiscardChanges}
                >
                  Discard Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {selectedPermissions.length}/
              {permissionsData?.permissions?.length || 0}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <Input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Permissions List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissionsData?.permissions
                  ?.filter(
                    permission =>
                      !searchTerm ||
                      permission.permission
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      permission.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map(permission => {
                    const isSelected = selectedPermissions.includes(
                      permission._id
                    );
                    return (
                      <div
                        key={permission._id}
                        className={`relative p-2 bg-slate-50 border border-gray-200 rounded-lg hover:bg-slate-100 hover:border-gray-300 transition-colors min-w-0 ${canEditRole ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        onClick={() =>
                          canEditRole && handlePermissionToggle(permission._id)
                        }
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {}} // Disable default behavior
                          onClick={e => {
                            e.stopPropagation();
                            if (canEditRole) {
                              handlePermissionToggle(permission._id);
                            }
                          }}
                          disabled={!canEditRole}
                          className="absolute top-1.5 right-1.5"
                        />
                        <div className="pr-8">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {permission.permission}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {permissionsData?.permissions?.filter(
                permission =>
                  !searchTerm ||
                  permission.permission
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  permission.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No permissions found matching &ldquo;{searchTerm}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default RoleDetailPage;
