'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/shared/components';
import { Button, Card, PageHeading, toast } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqRefreshCw05, AqEdit05, AqPlus } from '@airqo/icons-react';
import { useRolesSummary, usePermissions } from '@/shared/hooks/useAdmin';
import { getUserFriendlyErrorMessage, isForbiddenError } from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import CreateRoleDialog from './components/CreateRoleDialog';
import type { UserRoleSummary } from '@/shared/types/api';

type RoleRow = UserRoleSummary & {
  id: string;
  [key: string]: unknown;
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  INACTIVE:
    'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
};

const RolesPermissionsContent: React.FC = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'ACTIVE' | 'INACTIVE'
  >('all');
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useRolesSummary();

  const { data: permissionsData } = usePermissions();

  const roles = useMemo(() => rolesData?.roles || [], [rolesData?.roles]);
  const allPermissions = useMemo(
    () => permissionsData?.permissions || [],
    [permissionsData?.permissions]
  );

  const groupMap = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const role of roles) {
      const gid = role.group?._id;
      if (gid && !map.has(gid)) {
        map.set(gid, { id: gid, title: role.group.grp_title });
      }
    }
    return map;
  }, [roles]);

  const groups = useMemo(
    () =>
      Array.from(groupMap.values()).sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
    [groupMap]
  );

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const gid = role.group?._id;
      const matchesGroup =
        selectedGroupId === 'all' || String(gid) === String(selectedGroupId);
      const matchesStatus =
        statusFilter === 'all' || role.role_status === statusFilter;
      return matchesGroup && matchesStatus;
    });
  }, [roles, selectedGroupId, statusFilter]);

  const statusCounts = useMemo(() => {
    const groupFiltered =
      selectedGroupId === 'all'
        ? roles
        : roles.filter(
            role => String(role.group?._id) === String(selectedGroupId)
          );
    return {
      total: groupFiltered.length,
      active: groupFiltered.filter(r => r.role_status === 'ACTIVE').length,
      inactive: groupFiltered.filter(r => r.role_status === 'INACTIVE').length,
    };
  }, [roles, selectedGroupId]);

  const tableData = useMemo<RoleRow[]>(
    () => filteredRoles.map(role => ({ ...role, id: role._id })),
    [filteredRoles]
  );

  const handleViewRole = useCallback(
    (roleId: string) => {
      router.push(`/system/roles-permissions/${roleId}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutateRoles(),
        'Roles refreshed successfully'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutateRoles]);

  const handleGroupChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedGroupId(e.target.value);
      setStatusFilter('all');
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        key: 'role_name',
        label: 'Role Name',
        minWidth: '240px',
        render: (_value: unknown, item: RoleRow) => (
          <p className="font-medium text-foreground truncate font-mono text-sm">
            {item.role_name}
          </p>
        ),
      },
      {
        key: 'group',
        label: 'Group',
        minWidth: '200px',
        render: (_value: unknown, item: RoleRow) => (
          <div>
            <p className="text-sm text-foreground">
              {item.group?.grp_title || '—'}
            </p>
            {item.group?.grp_description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {item.group.grp_description}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'role_status',
        label: 'Status',
        minWidth: '110px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLES[String(value)] || 'bg-muted text-foreground'
            }`}
          >
            {String(value)}
          </span>
        ),
      },
      {
        key: 'role_permissions',
        label: 'Permissions',
        minWidth: '120px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: RoleRow) => (
          <span className="text-sm text-foreground">
            {item.role_permissions.length}
          </span>
        ),
      },
      {
        key: 'user_count',
        label: 'Users',
        minWidth: '90px',
        cellClassName: 'whitespace-nowrap',
        render: (value: unknown) => (
          <span className="text-sm text-foreground">{String(value)}</span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '100px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: RoleRow) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewRole(item._id)}
            className="p-1 h-8 w-8"
            aria-label={`Edit role ${item.role_name}`}
          >
            <AqEdit05 className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [handleViewRole]
  );

  const summaryCards = [
    {
      title: 'Total Roles',
      value: filteredRoles.length,
      description:
        selectedGroupId === 'all'
          ? 'Across all groups'
          : `${groupMap.get(selectedGroupId)?.title || ''} group`,
    },
    {
      title: 'Active',
      value: statusCounts.active,
      description: 'Currently active roles',
    },
    {
      title: 'Inactive',
      value: statusCounts.inactive,
      description: 'Disabled roles',
    },
    {
      title: 'Permissions',
      value: allPermissions.length,
      description: 'Available in the system',
    },
  ];

  const filterBar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('all')}
        >
          All ({statusCounts.total})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'ACTIVE' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('ACTIVE')}
        >
          Active ({statusCounts.active})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'INACTIVE' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('INACTIVE')}
        >
          Inactive ({statusCounts.inactive})
        </Button>
      </div>
      <div className="w-full sm:w-64">
        <label className="block text-sm text-foreground mb-2">
          Filter by group
        </label>
        <select
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">All groups ({roles.length})</option>
          {groups.map(group => {
            const count = roles.filter(
              r => String(r.group?._id) === String(group.id)
            ).length;
            return (
              <option key={group.id} value={group.id}>
                {group.title} ({count})
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );

  if (isForbiddenError(rolesError)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view roles and permissions."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Roles & Permissions"
        subtitle="Manage system roles, view assignments, and configure permissions across the platform."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="filled"
              size="sm"
              Icon={AqPlus}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Role
            </Button>
            <Button
              variant="outlined"
              size="sm"
              Icon={AqRefreshCw05}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.title} className="p-4">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Card>
        ))}
      </div>

      <ServerSideTable
        key={`roles-${selectedGroupId}-${statusFilter}`}
        title="System roles"
        data={tableData}
        columns={columns}
        loading={rolesLoading}
        error={rolesError ? getUserFriendlyErrorMessage(rolesError) : null}
        onRefresh={handleRefresh}
        showClientPagination={true}
        pageSize={10}
        customHeader={filterBar}
      />

      <CreateRoleDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          mutateRoles();
        }}
        groups={groups.map(g => ({
          _id: g.id,
          grp_title: g.title,
          grp_description: '',
        }))}
      />
    </div>
  );
};

const RolesPermissionsPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to manage roles and permissions."
    >
      <RolesPermissionsContent />
    </PermissionGuard>
  );
};

export default RolesPermissionsPage;
