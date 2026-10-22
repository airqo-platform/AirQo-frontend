'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Card,
  ErrorBanner,
  LoadingState,
  PageHeading,
  toast,
} from '@/shared/components/ui';
import { PermissionGuard } from '@/shared/components';
import { useRolesSummary, useUserDetails } from '@/shared/hooks';
import {
  AqChevronLeft,
  AqRefreshCw05,
  AqShield02,
  AqUsers01,
} from '@airqo/icons-react';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import UserRoleAssignmentDialog from '@/shared/components/UserRoleAssignmentDialog';
import { getRoleGroupOptions } from '@/shared/utils/roleGrouping';

const UserDetailPage: React.FC = () => {
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

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const user = userResponse?.users?.[0];
  const availableRoles = useMemo(
    () => rolesResponse?.roles || [],
    [rolesResponse?.roles]
  );
  const roleGroups = useMemo(
    () => getRoleGroupOptions(availableRoles),
    [availableRoles]
  );

  const currentRoleEntries = useMemo(() => {
    const entries: Array<{
      scope: 'Group';
      name: string;
      roleName: string;
      rolePermissions: { _id: string; permission: string }[];
    }> = [];

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

  const handleBack = useCallback(() => {
    router.push('/system/users');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => Promise.all([mutateUser(), mutateRoles()]),
        'User details refreshed successfully'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutateRoles, mutateUser]);

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to view user details."
    >
      {userLoading ? (
        <LoadingState
          className="h-[calc(100vh-220px)]"
          text="Loading user details..."
        />
      ) : isForbiddenError(userError) ? (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view user details."
        />
      ) : userError || !user ? (
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleBack} Icon={AqChevronLeft}>
            Back to User Management
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
      ) : (
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
                <DetailItem
                  label="Login Count"
                  value={String(user.loginCount)}
                />
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
                  <p className="text-xl font-semibold">
                    {availableRoles.length}
                  </p>
                </div>

                {rolesError ? (
                  <ErrorBanner
                    title="Failed to load roles"
                    message="Unable to load the role list needed to update this user."
                  />
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => setIsRoleDialogOpen(true)}
                    fullWidth
                    loading={rolesLoading}
                    disabled={rolesLoading || roleGroups.length === 0}
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
                    Roles assigned in groups
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

          <UserRoleAssignmentDialog
            isOpen={isRoleDialogOpen}
            user={user ?? null}
            roles={availableRoles}
            onClose={() => setIsRoleDialogOpen(false)}
            onSuccess={async () => {
              await Promise.all([mutateUser(), mutateRoles()]);
            }}
          />
        </div>
      )}
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

export default UserDetailPage;
