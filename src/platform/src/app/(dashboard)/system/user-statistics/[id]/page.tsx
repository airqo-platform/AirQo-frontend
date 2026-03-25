'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Dialog,
  ErrorBanner,
  LoadingState,
  PageHeading,
  Select,
  toast,
} from '@/shared/components/ui';
import { PermissionGuard } from '@/shared/components';
import {
  useRolesSummary,
  useUpdateUserRole,
  useUserDetails,
} from '@/shared/hooks';
import {
  AqChevronLeft,
  AqRefreshCw05,
  AqShield02,
  AqUsers01,
  AqUsersCheck,
} from '@airqo/icons-react';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

const UserStatisticsDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
    mutate: mutateUser,
  } = useUserDetails(userId);
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: mutateRoles,
  } = useRolesSummary();
  const updateUserRole = useUpdateUserRole();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearch, setRoleSearch] = useState('');

  const user = userResponse?.users?.[0];
  const availableRoles = useMemo(
    () => rolesResponse?.roles || [],
    [rolesResponse?.roles]
  );

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return availableRoles;
    return availableRoles.filter(r => {
      const name = (r.role_name || '').toLowerCase();
      const group = (r.group?.grp_title || '').toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [availableRoles, roleSearch]);

  const primaryRoleId = useMemo(() => {
    return (
      user?.networks?.[0]?.role?._id ||
      user?.groups?.[0]?.role?._id ||
      availableRoles[0]?._id ||
      ''
    );
  }, [availableRoles, user]);

  const currentRoleEntries = useMemo(() => {
    const entries: Array<{
      scope: 'Network' | 'Group';
      name: string;
      roleName: string;
      rolePermissions: { _id: string; permission: string }[];
    }> = [];

    user?.networks?.forEach(network => {
      entries.push({
        scope: 'Network',
        name: network.net_name,
        roleName: network.role?.role_name || 'No role assigned',
        rolePermissions: network.role?.role_permissions || [],
      });
    });

    user?.groups?.forEach(group => {
      entries.push({
        scope: 'Group',
        name: group.grp_title,
        roleName: group.role?.role_name || 'No role assigned',
        rolePermissions: group.role?.role_permissions || [],
      });
    });

    return entries;
  }, [user]);

  const currentPermissions = user?.permissions || [];

  const selectedRole = useMemo(
    () => availableRoles.find(role => role._id === selectedRoleId),
    [availableRoles, selectedRoleId]
  );

  const handleBack = useCallback(() => {
    router.push('/system/user-statistics');
  }, [router]);

  const handleRefresh = useCallback(() => {
    mutateUser();
    mutateRoles();
  }, [mutateRoles, mutateUser]);

  const openRoleDialog = useCallback(() => {
    setSelectedRoleId(primaryRoleId);
    setIsRoleDialogOpen(true);
  }, [primaryRoleId]);

  const handleUpdateRole = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    try {
      await updateUserRole.trigger({
        userId,
        roleId: selectedRoleId,
      });

      toast.success('User role updated successfully');
      setIsRoleDialogOpen(false);
      await Promise.all([mutateUser(), mutateRoles()]);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  if (userLoading) {
    return (
      <LoadingState
        className="h-[calc(100vh-220px)]"
        text="Loading user details..."
      />
    );
  }

  /*
    WARNING: The error / not-found UI below is rendered outside the PermissionGuard
    (the PermissionGuard is applied later in the component). This means an
    unauthorized user could see the "Failed to load user details" message or
    "User not found" content even when they should instead receive the
    access-restricted UI.

    Suggested fixes:
    - Move this conditional rendering inside the PermissionGuard so access is
      checked before showing any user-specific error content.
    - OR wrap the entire component return value with PermissionGuard and
      render the error UI inside it.

    Verify behavior for authorized users after moving the block.
  */
  if (userError || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} Icon={AqChevronLeft}>
          Back to User Statistics
        </Button>
        <Card className="p-6">
          <ErrorBanner
            title="Failed to load user details"
            message={
              userError
                ? 'Unable to load the selected user. Please try again later.'
                : 'User not found'
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the AIRQO_SUPER_ADMIN role with an @airqo.net email to view user details."
    >
      <div className="space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" onClick={handleBack} Icon={AqChevronLeft}>
            Back
          </Button>
        </div>

        <PageHeading
          title={`${user.firstName} ${user.lastName}`}
          subtitle={user.email}
          action={
            <Button
              variant="outlined"
              onClick={handleRefresh}
              Icon={AqRefreshCw05}
              loading={userLoading || rolesLoading}
            >
              Refresh
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">User Information</h3>
                <p className="text-sm text-muted-foreground">
                  Basic profile and account information
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Email" value={user.email} />
              <DetailItem label="Username" value={user.userName} />
              <DetailItem
                label="Country"
                value={user.country || 'Not specified'}
              />
              <DetailItem
                label="Job Title"
                value={user.jobTitle || 'Not specified'}
              />
              <DetailItem label="Organization" value={user.organization} />
              <DetailItem
                label="Last Login"
                value={
                  user.lastLogin
                    ? formatWithPattern(user.lastLogin, 'MMM dd, yyyy HH:mm')
                    : 'Never'
                }
              />
              <DetailItem label="Login Count" value={String(user.loginCount)} />
              <DetailItem
                label="Current Primary Role"
                value={
                  user.networks?.[0]?.role?.role_name ||
                  user.groups?.[0]?.role?.role_name ||
                  'Not assigned'
                }
              />
            </div>

            {user.description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm mt-1 leading-6">{user.description}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Role Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  Update the selected role for this user
                </p>
              </div>
              <AqShield02 className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Role groups loaded
                </p>
                <p className="text-xl font-semibold">{availableRoles.length}</p>
              </div>

              {rolesError ? (
                <ErrorBanner
                  title="Failed to load roles"
                  message="Unable to load the role list needed to update this user."
                />
              ) : (
                <Button
                  variant="outlined"
                  onClick={openRoleDialog}
                  fullWidth
                  loading={rolesLoading}
                  disabled={rolesLoading || availableRoles.length === 0}
                >
                  Change Role
                </Button>
              )}

              <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                <p className="text-sm font-medium">Permissions Overview</p>
                <p className="text-sm text-muted-foreground">
                  {currentPermissions.length} direct permissions on this user
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentPermissions.slice(0, 6).map(permission => (
                    <span
                      key={permission._id}
                      className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {permission.permission}
                    </span>
                  ))}
                  {currentPermissions.length > 6 && (
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      +{currentPermissions.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-3 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Current Access</h3>
                <p className="text-sm text-muted-foreground">
                  Roles inherited from networks and groups
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqUsers01 className="w-4 h-4" />
                <span>{currentRoleEntries.length} role assignments</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Networks
                </h4>
                {user.networks?.length ? (
                  user.networks.map(network => (
                    <div
                      key={network._id}
                      className="rounded-lg border bg-muted/20 p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-medium">{network.net_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {network.role?.role_name || 'No role assigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AqUsersCheck className="w-4 h-4" />
                        <span>{network.userType}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No network roles assigned.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Groups
                </h4>
                <div className="max-h-[48vh] overflow-y-auto space-y-3 pr-2">
                  {user.groups?.length ? (
                    user.groups.map(group => (
                      <div
                        key={group._id}
                        className="rounded-lg border bg-muted/20 p-4 space-y-1"
                      >
                        <p className="font-medium">{group.grp_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.organization_slug}
                        </p>
                        <p className="text-sm text-primary">
                          {group.role?.role_name || 'No role assigned'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No group roles assigned.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentPermissions.map(permission => (
                  <span
                    key={permission._id}
                    className="px-3 py-1 rounded-full text-xs bg-muted text-foreground"
                  >
                    {permission.permission}
                  </span>
                ))}
                {!currentPermissions.length && (
                  <p className="text-sm text-muted-foreground">
                    No direct permissions returned for this user.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Dialog
          isOpen={isRoleDialogOpen}
          onClose={() => setIsRoleDialogOpen(false)}
          title="Update User Role"
          primaryAction={{
            label: 'Update Role',
            onClick: handleUpdateRole,
            disabled: updateUserRole.isMutating || !selectedRoleId,
            loading: updateUserRole.isMutating,
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setIsRoleDialogOpen(false),
            disabled: updateUserRole.isMutating,
            variant: 'outlined',
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role *
              </label>
              <input
                type="text"
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="Search roles or groups..."
                className="w-full mb-2 px-3 py-2 border rounded-md text-sm"
              />
              <Select
                value={selectedRoleId}
                onChange={e =>
                  setSelectedRoleId(
                    ((e as React.ChangeEvent<HTMLSelectElement>)?.target
                      ?.value as string) || ''
                  )
                }
                placeholder="Choose a role..."
                disabled={rolesLoading}
              >
                {filteredRoles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.role_name} - {role.group?.grp_title || 'No group'}
                  </option>
                ))}
              </Select>
              {rolesLoading && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Loading all selectable roles...
                </p>
              )}
            </div>

            {selectedRole && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Selected Role</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRole.role_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedRole.group?.grp_title || 'No group'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRole.role_permissions || []).map(permission => (
                      <span
                        key={permission._id}
                        className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {permission.permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p className="text-sm mt-1 break-words">{value}</p>
    </div>
  );
};

export default UserStatisticsDetailsPage;
