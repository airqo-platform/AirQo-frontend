'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useUserDetails,
  useRolesByGroup,
  useAssignUsersToRole,
  useUnassignUsersFromRole,
  useUnassignUserFromGroup,
  useGroupDetails,
} from '@/shared/hooks';
import { Button, Select } from '@/shared/components/ui';
import Dialog from '@/shared/components/ui/dialog';
import PageHeading from '@/shared/components/ui/page-heading';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { LoadingState } from '@/shared/components/ui/loading-state';
import {
  AqChevronLeft,
  AqShield02,
  AqPlus,
  AqXClose,
  AqTrash03,
} from '@airqo/icons-react';
import { toast } from '@/shared/components/ui/toast';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { useUser } from '@/shared/hooks/useUser';
import { PermissionGuard } from '@/shared/components';
import { useRBAC } from '@/shared/hooks';

const MemberDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const org_slug = params.org_slug as string;
  const memberId = params.memberID as string;
  const { groups } = useUser();
  const { hasAnyPermissionInActiveGroup } = useRBAC();

  // Get the current organization from slug
  const currentOrg = useMemo(() => {
    return groups?.find(g => g.organizationSlug === org_slug);
  }, [groups, org_slug]);

  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [showUnassignConfirmDialog, setShowUnassignConfirmDialog] =
    useState(false);
  const [roleToUnassign, setRoleToUnassign] = useState<string>('');
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false);

  // Get user details
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    mutate: mutateUser,
  } = useUserDetails(memberId);

  // Get group details
  const { data: groupData } = useGroupDetails(currentOrg?.id || null);

  // Get roles for the current group
  const {
    data: rolesData,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useRolesByGroup(currentOrg?.id || undefined);

  const assignUsersToRole = useAssignUsersToRole();
  const unassignUsersFromRole = useUnassignUsersFromRole();
  const unassignUserFromGroup = useUnassignUserFromGroup();

  const user = userData?.users?.[0];
  const roles = rolesData?.roles || [];
  const group = groupData?.group;

  // Get user's current roles in the current group
  const userGroup = user?.groups?.find(g => g._id === currentOrg?.id);
  const userRoleIds = userGroup?.role ? [userGroup.role._id] : [];
  const userRoles = roles.filter(role => userRoleIds.includes(role._id));

  const handleAssignRole = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    try {
      await assignUsersToRole.trigger({
        roleId: selectedRoleId,
        user_ids: [memberId],
      });
      toast.success('Role assigned successfully');
      setSelectedRoleId('');
      setShowAssignRoleDialog(false);

      // Refetch user details and roles to update the UI
      mutateUser();
      mutateRoles();
    } catch {
      toast.error('Failed to assign role');
    }
  };

  const handleUnassignRole = (roleId: string) => {
    setRoleToUnassign(roleId);
    setShowUnassignConfirmDialog(true);
  };

  const confirmUnassignRole = async () => {
    if (!roleToUnassign) return;

    try {
      await unassignUsersFromRole.trigger({
        roleId: roleToUnassign,
        user_ids: [memberId],
      });
      toast.success('Role unassigned successfully');
      setShowUnassignConfirmDialog(false);
      setRoleToUnassign('');

      // Refetch user details and roles to update the UI
      mutateUser();
      mutateRoles();
    } catch {
      toast.error('Failed to unassign role');
    }
  };

  const handleRemoveUser = () => {
    // Check if this is the group manager
    if (group?.grp_manager?._id === memberId) {
      toast.error(
        'Cannot remove the group manager. Please transfer ownership first.'
      );
      return;
    }

    setShowRemoveUserDialog(true);
  };

  const confirmRemoveUser = async () => {
    if (!currentOrg?.id) return;

    try {
      await unassignUserFromGroup.trigger({
        groupId: currentOrg.id,
        userId: memberId,
      });
      toast.success('User has been removed from the group');

      // Redirect back to members list after a brief delay to show toast
      setTimeout(() => {
        router.push(`/org/${org_slug}/members`);
      }, 500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove user';
      toast.error(errorMessage);
      setShowRemoveUserDialog(false);
    }
  };

  if (userError) {
    return (
      <PermissionGuard requiredPermissionsInActiveGroup={['MEMBER_VIEW']}>
        <ErrorBanner
          title="Failed to load user details"
          message="Unable to load user information. Please try again later."
          actions={
            <Button onClick={() => router.back()} variant="outlined" size="sm">
              Go Back
            </Button>
          }
        />
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermissionsInActiveGroup={['MEMBER_VIEW']}>
      <div className="space-y-4">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/org/${org_slug}/members`)}
            Icon={AqChevronLeft}
          >
            Back to Members
          </Button>
        </div>

        {/* Header */}
        <PageHeading
          title={user ? `${user.firstName} ${user.lastName}` : 'User Details'}
          subtitle={user?.email}
          action={
            hasAnyPermissionInActiveGroup(['MEMBER_REMOVE']) &&
            user &&
            group?.grp_manager?._id !== memberId ? (
              <Button
                variant="outlined"
                size="sm"
                onClick={handleRemoveUser}
                Icon={AqTrash03}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-600"
              >
                Remove from Group
              </Button>
            ) : undefined
          }
        />

        {userLoading ? (
          <LoadingState text="Loading user details..." />
        ) : user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* User Information */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      First Name
                    </label>
                    <p className="text-sm mt-1">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <p className="text-sm mt-1">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Username
                    </label>
                    <p className="text-sm mt-1">{user.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Country
                    </label>
                    <p className="text-sm mt-1">
                      {user.country || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Job Title
                    </label>
                    <p className="text-sm mt-1">
                      {user.jobTitle || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Organization
                    </label>
                    <p className="text-sm mt-1">{user.organization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Login
                    </label>
                    <p className="text-sm mt-1">
                      {user.lastLogin
                        ? formatWithPattern(
                            user.lastLogin,
                            'MMM dd, yyyy HH:mm'
                          )
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Login Count
                    </label>
                    <p className="text-sm mt-1">{user.loginCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <p className="text-sm mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Verified
                    </label>
                    <p className="text-sm mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </p>
                  </div>
                </div>
                {user.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="text-sm mt-1">{user.description}</p>
                  </div>
                )}
              </div>

              {/* Networks */}
              {user.networks && user.networks.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-3">Network Roles</h3>
                  <div className="space-y-2">
                    {user.networks.map(network => (
                      <div
                        key={network.net_name}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{network.net_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {network.role.role_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AqShield02
                            size={16}
                            className="text-muted-foreground"
                          />
                          <span className="text-xs text-muted-foreground">
                            {network.userType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Roles Management */}
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Group Roles</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAssignRoleDialog(true)}
                    Icon={AqPlus}
                    loading={rolesLoading}
                    disabled={rolesLoading}
                  >
                    Assign Role
                  </Button>
                </div>

                {userRoles.length > 0 ? (
                  <div className="space-y-2">
                    {userRoles.map(role => (
                      <div
                        key={role._id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AqShield02 size={16} className="text-primary" />
                          <div>
                            <p className="font-medium">{role.role_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {role.role_description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassignRole(role._id)}
                          disabled={unassignUsersFromRole.isMutating}
                          Icon={AqXClose}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No roles assigned in this group
                  </p>
                )}
              </div>

              {/* Groups */}
              {user.groups && user.groups.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-3">Groups</h3>
                  <div className="space-y-2">
                    {user.groups.map(group => (
                      <div
                        key={group._id}
                        className="p-3 bg-muted/50 rounded-lg"
                      >
                        <p className="font-medium">{group.grp_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.organization_slug}
                        </p>
                        {group.role && (
                          <p className="text-xs text-primary mt-1">
                            {group.role.role_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">User not found</p>
          </div>
        )}

        {/* Assign Role Dialog */}
        <Dialog
          isOpen={showAssignRoleDialog}
          onClose={() => setShowAssignRoleDialog(false)}
          title="Assign Role"
          primaryAction={{
            label: 'Assign Role',
            onClick: handleAssignRole,
            disabled: assignUsersToRole.isMutating || !selectedRoleId,
            loading: assignUsersToRole.isMutating,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => {
              setShowAssignRoleDialog(false);
              setSelectedRoleId('');
            },
            disabled: assignUsersToRole.isMutating,
            variant: 'outlined',
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role *
              </label>
              <Select
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value as string)}
                placeholder="Choose a role..."
                disabled={rolesLoading}
              >
                {roles
                  .filter(role => !userRoleIds.includes(role._id))
                  .map(role => (
                    <option key={role._id} value={role._id}>
                      {role.role_name}
                    </option>
                  ))}
              </Select>
              {rolesLoading && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Loading roles...
                </p>
              )}
            </div>
          </div>
        </Dialog>

        {/* Unassign Role Confirmation Dialog */}
        <Dialog
          isOpen={showUnassignConfirmDialog}
          onClose={() => setShowUnassignConfirmDialog(false)}
          title="Confirm Role Unassignment"
          primaryAction={{
            label: 'Unassign Role',
            onClick: confirmUnassignRole,
            disabled: unassignUsersFromRole.isMutating,
            loading: unassignUsersFromRole.isMutating,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => {
              setShowUnassignConfirmDialog(false);
              setRoleToUnassign('');
            },
            disabled: unassignUsersFromRole.isMutating,
            variant: 'outlined',
          }}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to unassign this role from the user? This
              action cannot be undone.
            </p>
            {roleToUnassign && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  Role: {roles.find(r => r._id === roleToUnassign)?.role_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {roles.find(r => r._id === roleToUnassign)?.role_description}
                </p>
              </div>
            )}
          </div>
        </Dialog>

        {/* Remove User Confirmation Dialog */}
        <Dialog
          isOpen={showRemoveUserDialog}
          onClose={() => {
            if (!unassignUserFromGroup.isMutating) {
              setShowRemoveUserDialog(false);
            }
          }}
          title="Remove Member from Group"
          primaryAction={{
            label: 'Remove Member',
            onClick: confirmRemoveUser,
            disabled: unassignUserFromGroup.isMutating,
            loading: unassignUserFromGroup.isMutating,
            className: 'bg-red-600 hover:bg-red-700',
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setShowRemoveUserDialog(false),
            disabled: unassignUserFromGroup.isMutating,
            variant: 'outlined',
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </span>{' '}
              from this group?
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> This user will lose access to all
                group resources and their assigned roles will be removed. This
                action cannot be undone.
              </p>
            </div>
          </div>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default MemberDetailsPage;
