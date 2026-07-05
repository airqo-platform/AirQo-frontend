'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import {
  Button,
  Card,
  Dialog,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import {
  useRolesByGroup,
  useUpdateUserRole,
  useUserDetails,
} from '@/shared/hooks';
import { useUser } from '@/shared/hooks/useUser';
import {
  AqChevronLeft,
  AqRefreshCw05,
  AqShield02,
  AqUsers01,
  AqUsersCheck,
} from '@airqo/icons-react';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { SEARCH_TERM_MAX } from '@/shared/lib/validation-limits';
import { toast } from '@/shared/components/ui/toast';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <label className="text-sm font-medium text-muted-foreground">
      {label}
    </label>
    <p className="text-sm mt-1 break-words">{value}</p>
  </div>
);

const TeamMemberDetailContent: React.FC<{ memberId: string }> = ({
  memberId,
}) => {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const { activeGroup } = useUser();

  const {
    data: userResponse,
    isLoading: userLoading,
    error: userError,
    mutate: mutateUser,
  } = useUserDetails(memberId);

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: mutateRoles,
  } = useRolesByGroup(activeGroup?.id || undefined);

  const updateUserRole = useUpdateUserRole();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [highlightedRoleIndex, setHighlightedRoleIndex] = useState(-1);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const roleListRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
        setHighlightedRoleIndex(-1);
      }
    };

    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isRoleDropdownOpen]);

  useEffect(() => {
    if (
      isRoleDropdownOpen &&
      highlightedRoleIndex >= 0 &&
      roleListRef.current
    ) {
      const highlightedElement = roleListRef.current.children[
        highlightedRoleIndex
      ] as HTMLElement | undefined;
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [isRoleDropdownOpen, highlightedRoleIndex]);

  const primaryRoleId = useMemo(() => {
    const activeGroupRoleId = user?.groups?.find(
      group => group._id === activeGroup?.id
    )?.role?._id;

    return activeGroupRoleId &&
      availableRoles.some(role => role._id === activeGroupRoleId)
      ? activeGroupRoleId
      : '';
  }, [activeGroup?.id, availableRoles, user?.groups]);

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
    router.push('/system/team-members');
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

  const openRoleDialog = useCallback(() => {
    setSelectedRoleId(primaryRoleId);
    setRoleSearch('');
    setIsRoleDropdownOpen(false);
    setHighlightedRoleIndex(-1);
    setIsRoleDialogOpen(true);
  }, [primaryRoleId]);

  const selectRole = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
    setRoleSearch('');
    setIsRoleDropdownOpen(false);
    setHighlightedRoleIndex(-1);
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedRole) {
      toast.error('Please select a valid role');
      return;
    }

    try {
      await updateUserRole.trigger({
        userId: memberId,
        roleId: selectedRole._id,
      });

      toast.success('User role updated successfully');
      setIsRoleDialogOpen(false);
      setIsRoleDropdownOpen(false);
      await Promise.all([
        mutateUser(),
        mutateRoles(),
        globalMutate('feedback/staff'),
      ]);
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

  if (isForbiddenError(userError)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view user details."
      />
    );
  }

  if (userError || !user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} Icon={AqChevronLeft}>
          Back to Team Members
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
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="ghost" onClick={handleBack} Icon={AqChevronLeft}>
          Back to Team Members
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
                onClick={openRoleDialog}
                fullWidth
                loading={rolesLoading}
                disabled={rolesLoading || availableRoles.length === 0 || !activeGroup?.id}
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
          disabled: updateUserRole.isMutating || !selectedRole,
          loading: updateUserRole.isMutating,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsRoleDialogOpen(false),
          disabled: updateUserRole.isMutating,
          variant: 'outlined',
        }}
      >
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          <div ref={roleDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Role *
            </label>
            <input
              type="text"
              role="combobox"
              aria-expanded={isRoleDropdownOpen}
              aria-controls="role-listbox"
              aria-activedescendant={
                highlightedRoleIndex >= 0
                  ? `role-option-${filteredRoles[highlightedRoleIndex]?._id}`
                  : undefined
              }
              value={roleSearch}
              onChange={e => {
                setRoleSearch(e.target.value);
                setIsRoleDropdownOpen(true);
                setHighlightedRoleIndex(-1);
              }}
              onFocus={() => setIsRoleDropdownOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsRoleDropdownOpen(false);
                  setHighlightedRoleIndex(-1);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setIsRoleDropdownOpen(true);
                  setHighlightedRoleIndex(prev =>
                    prev < filteredRoles.length - 1 ? prev + 1 : 0
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setIsRoleDropdownOpen(true);
                  setHighlightedRoleIndex(prev =>
                    prev > 0 ? prev - 1 : filteredRoles.length - 1
                  );
                } else if (e.key === 'Enter' && highlightedRoleIndex >= 0) {
                  e.preventDefault();
                  const role = filteredRoles[highlightedRoleIndex];
                  if (role) {
                    selectRole(role._id);
                  }
                }
              }}
              placeholder="Search and select a role..."
              disabled={rolesLoading}
              maxLength={SEARCH_TERM_MAX}
              className="w-full px-3 py-2.5 border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
            />

            {isRoleDropdownOpen && (
              <div className="mt-1 w-full bg-popover rounded-md shadow-lg border border-primary max-h-[200px] overflow-y-auto">
                <ul
                  ref={roleListRef}
                  id="role-listbox"
                  role="listbox"
                  className="py-1"
                >
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role, index) => (
                      <li
                        key={role._id}
                        id={`role-option-${role._id}`}
                        role="option"
                        tabIndex={-1}
                        aria-selected={selectedRoleId === role._id}
                        onClick={() => selectRole(role._id)}
                        onMouseEnter={() => setHighlightedRoleIndex(index)}
                        className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-150 hover:bg-primary/10 ${
                          selectedRoleId === role._id
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'text-foreground'
                        } ${
                          highlightedRoleIndex === index
                            ? 'bg-primary/10'
                            : ''
                        }`}
                      >
                        {role.role_name} - {role.group?.grp_title || 'No group'}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      No roles found
                    </li>
                  )}
                </ul>
              </div>
            )}

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
  );
};

const TeamMemberDetailPage: React.FC = () => {
  const params = useParams<{ memberId: string }>();
  const router = useRouter();
  const memberId = params?.memberId;

  useEffect(() => {
    if (!memberId) {
      router.push('/system/team-members');
    }
  }, [memberId, router]);

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to view team member details."
    >
      <TeamMemberDetailContent memberId={memberId} />
    </PermissionGuard>
  );
};

export default TeamMemberDetailPage;
