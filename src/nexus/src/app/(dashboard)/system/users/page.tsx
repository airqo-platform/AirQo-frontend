'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import {
  isForbiddenError,
  getUserFriendlyErrorMessage,
} from '@/shared/utils/errorMessages';
import { toast } from '@/shared/components/ui/toast';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import { useUsers, useUpdateUserRole } from '@/shared/hooks/useAdmin';
import { useRolesSummary } from '@/shared/hooks/useAdmin';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import type { User } from '@/shared/types/api';
import {
  AqEye,
  AqRefreshCw05,
  AqDownload01,
  AqShield02,
} from '@airqo/icons-react';
import { Dialog, Select } from '@/shared/components/ui';
import { SEARCH_TERM_MAX } from '@/shared/lib/validation-limits';

interface UsersTableRow extends User {
  id: string;
}

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error, mutate } = useUsers();
  const { data: rolesResponse, isLoading: rolesLoading } = useRolesSummary();
  const updateUserRole = useUpdateUserRole();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearch, setRoleSearch] = useState('');

  const users = useMemo(() => data?.users ?? [], [data]);
  const availableRoles = useMemo(
    () => rolesResponse?.roles ?? [],
    [rolesResponse]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(user => {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      const haystack = [
        fullName,
        user.email,
        user.userName,
        user._id,
        user.organization,
        user.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [users, search]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end).map(user => ({
      ...user,
      id: user._id,
    }));
  }, [filteredUsers, page, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return availableRoles;
    return availableRoles.filter(role => {
      const name = (role.role_name || '').toLowerCase();
      const group = (role.group?.grp_title || '').toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [availableRoles, roleSearch]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'User list refreshed successfully'
      );
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutate]);

  const openRoleDialog = useCallback((user: User) => {
    const primaryRoleId =
      user.groups?.[0]?.role?._id || user.networks?.[0]?.role?._id || '';
    setRoleDialogUser(user);
    setSelectedRoleId(primaryRoleId);
    setRoleSearch('');
  }, []);

  const handleUpdateRole = async () => {
    if (!roleDialogUser || !selectedRoleId) {
      toast.error('Please select a role');
      return;
    }
    try {
      await updateUserRole.trigger({
        userId: roleDialogUser._id,
        roleId: selectedRoleId,
      });
      toast.success('User role updated successfully');
      setRoleDialogUser(null);
      await mutate();
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  };

  const selectedRole = useMemo(
    () => availableRoles.find(role => role._id === selectedRoleId),
    [availableRoles, selectedRoleId]
  );

  const exportToCSV = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Username',
      'User ID',
      'Status',
      'Verified',
      'Login Count',
      'Last Login',
      'Organization',
      'Country',
      'Job Title',
      'Groups',
    ];

    const escape = (s: string) => {
      if (!s) return '';
      const first = s.trimStart().charAt(0);
      const neutralize = ['=', '+', '-', '@'].includes(first);
      const text = neutralize ? `'${s}` : s;
      return text.replace(/"/g, '""');
    };

    const rows = filteredUsers.map(user => [
      escape(user.firstName || ''),
      escape(user.lastName || ''),
      escape(user.email || ''),
      escape(user.userName || ''),
      escape(user._id || ''),
      user.isActive ? 'Active' : 'Inactive',
      user.verified ? 'Yes' : 'No',
      String(user.loginCount ?? 0),
      user.lastLogin
        ? formatWithPattern(user.lastLogin, 'yyyy-MM-dd HH:mm')
        : '',
      escape(user.organization || ''),
      escape(user.country || ''),
      escape(user.jobTitle || ''),
      escape(
        (user.groups ?? [])
          .map(g => g.grp_title || g.organization_slug)
          .join('; ')
      ),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('AirQo User Management Report', 40, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Records: ${filteredUsers.length}`, 40, 70);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 85);

      const tableData = filteredUsers.map(user => [
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '--',
        user.email || '--',
        user.userName || '--',
        user.isActive ? 'Active' : 'Inactive',
        user.verified ? 'Yes' : 'No',
        String(user.loginCount ?? 0),
      ]);

      autoTable(doc, {
        head: [['Name', 'Email', 'Username', 'Status', 'Verified', 'Logins']],
        body: tableData,
        startY: 105,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 78, 99] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 40, right: 40 },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Page ${i} of ${pageCount}`,
          40,
          doc.internal.pageSize.height - 30
        );
      }

      doc.save(`users-export-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {user.firstName?.[0] || '?'}
                {user.lastName?.[0] || ''}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'userName',
        label: 'Username',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="text-sm truncate">{user.userName || '--'}</div>
        ),
      },
      {
        key: 'organization',
        label: 'Organization',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="text-sm truncate">{user.organization || '--'}</div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="flex flex-wrap gap-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            {user.verified ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Verified
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: 'loginCount',
        label: 'Logins',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="text-sm">{user.loginCount ?? 0}</div>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="text-sm whitespace-nowrap">
            {user.lastLogin
              ? formatWithPattern(user.lastLogin, 'MMM dd, yyyy')
              : 'Never'}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value: unknown, user: UsersTableRow) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/system/users/${user._id}`)}
              title="View user details"
              aria-label="View user details"
            >
              <AqEye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openRoleDialog(user)}
              disabled={rolesLoading || availableRoles.length === 0}
              title="Update user role"
              aria-label="Update user role"
            >
              <AqShield02 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [router, openRoleDialog, rolesLoading, availableRoles.length]
  );

  if (isLoading) {
    return (
      <LoadingState className="h-[calc(100vh-200px)]" text="Loading users..." />
    );
  }

  if (error) {
    if (isForbiddenError(error)) {
      return (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view users."
        />
      );
    }
    return (
      <div className="p-6 space-y-4">
        <ErrorBanner
          title="Failed to load users"
          message={error?.message || 'An error occurred while loading users'}
        />
        <Button
          onClick={handleRefresh}
          Icon={AqRefreshCw05}
          loading={isLoading}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="User Management"
        subtitle="View, search, and manage platform users and their roles"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              onClick={handleRefresh}
              Icon={AqRefreshCw05}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={exportToCSV}
              Icon={AqDownload01}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              onClick={exportToPDF}
              Icon={AqDownload01}
            >
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Users Table */}
      <ServerSideTable
        title="All Users"
        columns={columns}
        data={paginatedUsers}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredUsers.length}
        onPageChange={setPage}
        onPageSizeChange={size => {
          setPageSize(size);
          setPage(1);
        }}
        searchTerm={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
      />

      {/* Role Update Dialog */}
      <Dialog
        isOpen={!!roleDialogUser}
        onClose={() => setRoleDialogUser(null)}
        title={`Update Role: ${roleDialogUser?.firstName ?? ''} ${
          roleDialogUser?.lastName ?? ''
        }`.trim()}
        primaryAction={{
          label: 'Update Role',
          onClick: handleUpdateRole,
          disabled: updateUserRole.isMutating || !selectedRoleId,
          loading: updateUserRole.isMutating,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setRoleDialogUser(null),
          disabled: updateUserRole.isMutating,
          variant: 'outlined',
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Role *
            </label>
            <Input
              type="text"
              value={roleSearch}
              onChange={e => setRoleSearch(e.target.value)}
              placeholder="Search roles or groups..."
              maxLength={SEARCH_TERM_MAX}
              containerClassName="mb-2"
            />
            <Select
              value={selectedRoleId}
              onChange={e =>
                setSelectedRoleId(
                  (e as React.ChangeEvent<HTMLSelectElement>).target.value
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

const ProtectedUserManagementPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN']}
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You need system administrator permissions to manage users."
    >
      <UserManagementPage />
    </PermissionGuard>
  );
};

export default ProtectedUserManagementPage;
