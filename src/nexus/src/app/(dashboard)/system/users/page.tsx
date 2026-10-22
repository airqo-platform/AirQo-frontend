'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
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
import { useUsers } from '@/shared/hooks/useAdmin';
import { useRolesSummary } from '@/shared/hooks/useAdmin';
import UserRoleAssignmentDialog from '@/shared/components/UserRoleAssignmentDialog';
import { getRoleGroupOptions } from '@/shared/utils/roleGrouping';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { buildCsv, buildCsvFilename, downloadCsv } from '@/shared/utils/csv';
import { toDateString } from '@/shared/services/analyticsService';
import type { User } from '@/shared/types/api';
import {
  AqEye,
  AqRefreshCw05,
  AqDownload01,
  AqShield02,
} from '@airqo/icons-react';
interface UsersTableRow extends User {
  id: string;
}

const UserManagementPage: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isValidating, error, mutate } = useUsers();
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: mutateRoles,
  } = useRolesSummary();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);

  const users = useMemo(() => data?.users ?? [], [data]);
  const availableRoles = useMemo(
    () => rolesResponse?.roles ?? [],
    [rolesResponse]
  );
  const roleGroups = useMemo(
    () => getRoleGroupOptions(availableRoles),
    [availableRoles]
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

  const handleRetryRoles = useCallback(async () => {
    try {
      await mutateRoles();
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutateRoles]);

  const openRoleDialog = useCallback((user: User) => {
    setRoleDialogUser(user);
  }, []);

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

    const rows = filteredUsers.map(user => [
      user.firstName || '',
      user.lastName || '',
      user.email || '',
      user.userName || '',
      user._id || '',
      user.isActive ? 'Active' : 'Inactive',
      user.verified ? 'Yes' : 'No',
      String(user.loginCount ?? 0),
      user.lastLogin
        ? formatWithPattern(user.lastLogin, 'yyyy-MM-dd HH:mm')
        : '',
      user.organization || '',
      user.country || '',
      user.jobTitle || '',
      (user.groups ?? [])
        .map(g => g.grp_title || g.organization_slug)
        .join('; '),
    ]);

    downloadCsv(buildCsvFilename('users-export'), buildCsv(headers, rows));
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

      doc.save(`users-export-${toDateString(new Date().toISOString())}.pdf`);
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
              disabled={rolesLoading || !!rolesError || roleGroups.length === 0}
              title="Update user role"
              aria-label="Update user role"
            >
              <AqShield02 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [router, openRoleDialog, rolesLoading, rolesError, roleGroups.length]
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
          message={getUserFriendlyErrorMessage(error)}
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
          <div className="flex flex-wrap items-center gap-2">
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

      {/* Roles failed to load (e.g. 403) — role actions are disabled above,
          but the users table must still render. */}
      {rolesError && (
        <ErrorBanner
          title="Failed to load roles"
          message={getUserFriendlyErrorMessage(rolesError)}
          actions={
            <Button
              variant="outlined"
              size="sm"
              onClick={handleRetryRoles}
              loading={rolesLoading}
              Icon={AqRefreshCw05}
            >
              Retry
            </Button>
          }
        />
      )}

      {/* Users Table */}
      <ServerSideTable
        title="All Users"
        columns={columns}
        data={paginatedUsers}
        loading={isLoading}
        isRefreshing={isValidating}
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
      <UserRoleAssignmentDialog
        isOpen={!!roleDialogUser}
        user={roleDialogUser}
        roles={availableRoles}
        onClose={() => setRoleDialogUser(null)}
        onSuccess={async () => {
          await mutate();
        }}
      />
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
