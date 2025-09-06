'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { AqUsers01, AqCheck, AqX } from '@airqo/icons-react';

// Import API
import { getCombinedUsersApi } from '@/core/apis/Account';

// Import Components
import { PageHeader } from '@/common/components/Header';
import ReusableTable from '@/common/components/Table';
import EmptyState from '@/common/components/EmptyState';
import ErrorState from '@/common/components/ErrorState';
import RuntimeErrorBoundary from '@/common/components/ErrorBoundary/RuntimeErrorBoundary';

// Import logger
import logger from '@/lib/logger';
import { usePermissions } from '@/core/HOC/authUtils';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import PermissionDenied from '@/common/components/PermissionDenied';
import { RolesPermissionsPageSkeleton } from '@/common/components/Skeleton';

const UsersPageContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { hasPermission, isLoading: permLoading } = usePermissions();
  // Use the unified provider helper to get the active group id quickly
  const { id: activeGroupID } = useGetActiveGroup();
  const groupId = activeGroupID || null;

  const canView = hasPermission('USER_MANAGEMENT', groupId, null, true);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCombinedUsersApi();

        if (response.success && response.users) {
          // Transform data for table
          const transformedUsers = response.users.map((user) => ({
            id: user._id,
            name:
              `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            email: user.email || 'N/A',
            firstName: user.firstName || 'N/A',
            lastName: user.lastName || 'N/A',
            jobTitle: user.jobTitle || 'N/A',
            isActive: user.isActive,
            verified: user.verified,
            createdAt: user.createdAt,
            accessRequests: user.accessRequests || [],
          }));

          setUsers(transformedUsers);
        } else {
          throw new Error('Failed to fetch users data');
        }
      } catch (err) {
        logger.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when permissions have loaded and user can view
    if (permLoading) return;
    if (!canView) {
      setUsers([]);
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [permLoading, canView]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        render: (value, item) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <AqUsers01 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {item.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.jobTitle}
              </div>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'email',
        label: 'Email',
        render: (value) => (
          <div className="flex items-center space-x-2">
            {/* mail icon */}
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 6.5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.5l9 6 9-6v-.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-900 dark:text-gray-100">{value}</span>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'verified',
        label: 'Verified',
        render: (value) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {value ? (
              <>
                <AqCheck className="w-3 h-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <AqX className="w-3 h-3 mr-1" />
                Unverified
              </>
            )}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'isActive',
        label: 'Status',
        render: (value) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {value ? 'Active' : 'Inactive'}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'Joined',
        render: (value) => (
          <div className="flex items-center space-x-2">
            {/* calendar icon */}
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2v2M16 2v2M3 8.5h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="6.5"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-900 dark:text-gray-100">
              {value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A'}
            </span>
          </div>
        ),
        sortable: true,
      },
    ],
    [],
  );

  // Table filters configuration
  const filters = useMemo(
    () => [
      {
        key: 'verified',
        placeholder: 'Verification Status',
        options: [
          { label: 'All Users', value: '' },
          { label: 'Verified', value: 'true' },
          { label: 'Unverified', value: 'false' },
        ],
      },
      {
        key: 'isActive',
        placeholder: 'Status',
        options: [
          { label: 'All Statuses', value: '' },
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
      },
    ],
    [],
  );

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Note: table handles its own loading state; show header skeleton while data loads
  // Render header with loading skeleton if data is still loading

  // Permission loading
  if (permLoading) return <RolesPermissionsPageSkeleton />;

  // Permission denied
  if (!canView) return <PermissionDenied />;

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          isLoading={false}
          title="Users"
          subtitle="Manage system users and their permissions"
        />
        <ErrorState
          type="server"
          title="Failed to Load Users"
          description={error}
          primaryAction="Retry"
          onPrimaryAction={handleRetry}
        />
      </div>
    );
  }

  // Empty state
  if (!loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          isLoading={false}
          title="Users"
          subtitle="Manage system users and their permissions"
        />
        <EmptyState
          preset="users"
          title="No Users Found"
          description="There are no users in the system yet. Users will appear here once they register and are added to the platform."
          actionLabel="Refresh"
          onAction={handleRetry}
        />
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and their permissions"
      />

      <ReusableTable
        title="System Users"
        data={users}
        loading={loading}
        columns={columns}
        searchable={true}
        filterable={true}
        filters={filters}
        sortable={true}
        pageSize={10}
        showPagination={true}
        searchableColumns={[
          'name',
          'email',
          'firstName',
          'lastName',
          'jobTitle',
        ]}
      />
    </div>
  );
};

// Main Users Page with Error Boundary
const UsersPage = () => {
  return (
    <RuntimeErrorBoundary
      name="UsersPage"
      feature="admin-users"
      onRetry={() => window.location.reload()}
      onRecover={() => logger.info('Users page recovered from error')}
    >
      <UsersPageContent />
    </RuntimeErrorBoundary>
  );
};

export default UsersPage;
