'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  Checkbox,
  LoadingState,
  PageHeading,
  SearchField,
  toast,
} from '@/shared/components/ui';
import {
  AqRefreshCw05,
  AqArrowLeft,
} from '@airqo/icons-react';
import { useRoleById, usePermissions } from '@/shared/hooks/useAdmin';
import { adminService } from '@/shared/services/adminService';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type { RoleDetails, RolePermission } from '@/shared/types/api';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  INACTIVE:
    'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
};

const RoleDetailContent: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const roleId = params.roleId as string;

  const {
    data: roleData,
    error: roleError,
    isLoading: roleLoading,
    mutate: mutateRole,
  } = useRoleById(roleId);

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    mutate: mutatePermissions,
  } = usePermissions();

  const role: RoleDetails | null = useMemo(() => {
    if (!roleData) return null;
    return (
      roleData.role ||
      (roleData.roles && roleData.roles[0]) ||
      null
    );
  }, [roleData]);

  const allPermissions = useMemo(
    () => permissionsData?.permissions || [],
    [permissionsData?.permissions]
  );

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState('');

  useEffect(() => {
    if (role) {
      const ids = new Set(role.role_permissions.map(p => p._id));
      setSelectedPermissionIds(ids);
      setHasChanges(false);
    }
  }, [role]);

  const filteredPermissions = useMemo(() => {
    if (!permissionSearch.trim()) return allPermissions;
    const term = permissionSearch.toLowerCase();
    return allPermissions.filter(
      p =>
        p.permission.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }, [allPermissions, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, RolePermission[]> = {};
    for (const perm of filteredPermissions) {
      const prefix = perm.permission.split('_')[0] || 'OTHER';
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(perm);
    }
    const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    return sorted;
  }, [filteredPermissions]);

  const originalPermissionIds = useMemo(() => {
    if (!role) return new Set<string>();
    return new Set(role.role_permissions.map(p => p._id));
  }, [role]);

  const handleToggle = useCallback(
    (permissionId: string) => {
      setSelectedPermissionIds(prev => {
        const next = new Set(prev);
        if (next.has(permissionId)) {
          next.delete(permissionId);
        } else {
          next.add(permissionId);
        }
        return next;
      });
      setHasChanges(true);
    },
    []
  );

  const handleToggleGroup = useCallback((permissionIds: string[]) => {
    setSelectedPermissionIds(prev => {
      const next = new Set(prev);
      const allSelected = permissionIds.every(id => next.has(id));
      for (const id of permissionIds) {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
    setHasChanges(true);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPermissionIds(new Set(allPermissions.map(p => p._id)));
    setHasChanges(true);
  }, [allPermissions]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPermissionIds(new Set());
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!role) return;
    if (selectedPermissionIds.size === 0) {
      toast.error('A role must have at least one permission');
      return;
    }
    setIsSaving(true);
    try {
      await adminService.updateRolePermissions(role._id, {
        permission_ids: Array.from(selectedPermissionIds),
      });
      toast.success('Permissions updated successfully');
      setHasChanges(false);
      await mutateRole();
      await mutatePermissions();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => Promise.all([mutateRole(), mutatePermissions()]),
        'Role data refreshed'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutateRole, mutatePermissions]);

  if (roleLoading || permissionsLoading) {
    return (
      <LoadingState
        className="min-h-[400px]"
        text="Loading role details..."
      />
    );
  }

  if (roleError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {getUserFriendlyErrorMessage(roleError)}
        </p>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Role not found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={role.role_name}
        subtitle={`Role details and permission management for ${role.group?.grp_title || 'Unknown group'}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              Icon={AqRefreshCw05}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              size="sm"
              Icon={AqArrowLeft}
              onClick={() => router.push('/system/roles-permissions')}
            >
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLES[role.role_status] || 'bg-muted text-foreground'
            }`}
          >
            {role.role_status}
          </span>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Users Assigned</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {role.user_count}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Group</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {role.group?.grp_title || '—'}
          </p>
          {role.group?.grp_description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {role.group.grp_description}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            Selected Permissions
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {selectedPermissionIds.size}
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / {allPermissions.length}
            </span>
          </p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Permissions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure which permissions are assigned to this role.
            </p>
            {selectedPermissionIds.size === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                A role must have at least one permission assigned.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outlined"
              onClick={handleSelectAll}
              disabled={isSaving}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outlined"
              onClick={handleDeselectAll}
              disabled={isSaving}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              variant="filled"
              onClick={handleSave}
              disabled={isSaving || !hasChanges || selectedPermissionIds.size === 0}
              loading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-4">
          <SearchField
            placeholder="Search permissions..."
            value={permissionSearch}
            onChange={e => setPermissionSearch(e.target.value)}
            onClear={() => setPermissionSearch('')}
          />
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {groupedPermissions.map(([group, permissions]) => {
            const allGroupSelected = permissions.every(p =>
              selectedPermissionIds.has(p._id)
            );
            const someGroupSelected = permissions.some(p =>
              selectedPermissionIds.has(p._id)
            );
            const selectedCount = permissions.filter(p =>
              selectedPermissionIds.has(p._id)
            ).length;

            return (
              <div key={group} className="rounded-lg border border-border">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
                  <Checkbox
                    checked={allGroupSelected}
                    onCheckedChange={() =>
                      handleToggleGroup(permissions.map(p => p._id))
                    }
                  />
                  <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {group}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {selectedCount}/{permissions.length} selected
                    {someGroupSelected && !allGroupSelected && (
                      <span className="ml-1 text-primary">(partial)</span>
                    )}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {permissions.map(perm => {
                    const isSelected = selectedPermissionIds.has(perm._id);
                    const wasOriginallySelected =
                      originalPermissionIds.has(perm._id);
                    const isChanged = isSelected !== wasOriginallySelected;

                    return (
                      <label
                        key={perm._id}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          isChanged
                            ? isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/20'
                              : 'bg-red-50 dark:bg-red-950/20'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(perm._id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground font-mono">
                            {perm.permission}
                          </p>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {perm.description}
                            </p>
                          )}
                        </div>
                        {isChanged && (
                          <span
                            className={`text-xs font-medium mt-0.5 ${
                              isSelected
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isSelected ? 'Added' : 'Removed'}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredPermissions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No permissions match your search.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

const RoleDetailPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to manage roles and permissions."
    >
      <RoleDetailContent />
    </PermissionGuard>
  );
};

export default RoleDetailPage;
