'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';
import {
  AqUsers01,
  AqCheck,
  AqX,
  AqShield03,
  AqKey01,
  AqGlobe05,
  AqBuilding07,
  AqMail01,
  AqPhone01,
  AqCalendar,
  AqClock,
  AqUser02,
} from '@airqo/icons-react';

// Import API
import { getUserByIdApi } from '@/core/apis/Account';

// Import Components
import { PageHeader } from '@/common/components/Header';
// Button replaced by PageHeader's built-in back control
import PermissionDenied from '@/common/components/PermissionDenied';
import { UserDetailsSkeleton } from '@/common/components/Skeleton';
import ErrorState from '@/common/components/ErrorState';
import RuntimeErrorBoundary from '@/common/components/ErrorBoundary/RuntimeErrorBoundary';
import CardWrapper from '@/common/components/CardWrapper';

// Import utilities
import logger from '@/lib/logger';
import { usePermissions } from '@/core/HOC/authUtils';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

/**
 * Utility function for consistent date formatting
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'PPP') : 'Invalid Date';
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Reusable status badge component
 */
const StatusBadge = React.memo(({ status, label }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }`}
  >
    {status ? (
      <>
        <AqCheck className="w-3 h-3 mr-1" />
        {label || 'Active'}
      </>
    ) : (
      <>
        <AqX className="w-3 h-3 mr-1" />
        {label || 'Inactive'}
      </>
    )}
  </span>
));
StatusBadge.displayName = 'StatusBadge';

/**
 * Reusable info item component with consistent styling
 */
const InfoItem = React.memo(({ icon: Icon, label, value, className = '' }) => {
  // Guard against undefined Icon
  if (!Icon) {
    logger.warn(`InfoItem: Icon is undefined for label: ${label}`);
    return null;
  }

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </dt>
        <dd className="text-sm text-gray-900 dark:text-gray-100 break-words">
          {value || 'N/A'}
        </dd>
      </div>
    </div>
  );
});
InfoItem.displayName = 'InfoItem';

/**
 * Permissions list component with proper empty state
 */
const PermissionsList = React.memo(({ permissions = [] }) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No permissions assigned
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {permissions.map((perm, index) => (
        <div
          key={perm._id || index}
          className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
        >
          <AqShield03 className="w-3 h-3 mr-1.5" />
          {perm.permission || perm}
        </div>
      ))}
    </div>
  );
});
PermissionsList.displayName = 'PermissionsList';

/**
 * Consistent section headers
 */
const SectionHeader = React.memo(({ icon: Icon, title, count }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
    <Icon className="w-5 h-5 mr-2 text-primary" />
    {title} {count && `(${count})`}
  </h3>
));
SectionHeader.displayName = 'SectionHeader';

/**
 * User avatar component with fallback
 */
const UserAvatar = React.memo(({ user }) => (
  <div className="relative">
    {user.profilePicture ? (
      <img
        src={user.profilePicture}
        alt={
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        }
        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
      />
    ) : (
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <AqUsers01 className="w-8 h-8 text-primary" />
      </div>
    )}
    <div className="absolute -bottom-1 -right-1">
      <StatusBadge status={user.isActive} />
    </div>
  </div>
));
UserAvatar.displayName = 'UserAvatar';

/**
 * User basic information grid
 */
const UserBasicInfo = React.memo(({ user }) => {
  const userInfoData = useMemo(
    () => [
      { icon: AqMail01, label: 'Email Address', value: user.email },
      { icon: AqUser02, label: 'Username', value: user.userName },
      { icon: AqPhone01, label: 'Phone Number', value: user.phoneNumber },
      { icon: AqGlobe05, label: 'Country', value: user.country },
      { icon: AqBuilding07, label: 'Organization', value: user.organization },
      { icon: AqGlobe05, label: 'Website', value: user.website },
      {
        icon: AqCalendar,
        label: 'Member Since',
        value: formatDate(user.createdAt),
      },
      {
        icon: AqClock,
        label: 'Last Login',
        value: formatDate(user.lastLogin),
      },
    ],
    [user],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userInfoData.map((item, index) => (
        <InfoItem
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
});
UserBasicInfo.displayName = 'UserBasicInfo';

/**
 * User groups and roles section
 */
const UserGroups = React.memo(({ groups = [] }) => {
  if (!groups || groups.length === 0) return null;

  return (
    <CardWrapper>
      <div className="p-6">
        <SectionHeader icon={AqBuilding07} title="Groups & Roles" />
        <div className="space-y-4">
          {groups.map((group, index) => (
            <div
              key={group._id || index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {group.grp_profile_picture && (
                    <img
                      src={group.grp_profile_picture}
                      alt={group.grp_title}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {group.grp_title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.organization_slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={group.status === 'ACTIVE'} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {group.userType}
                  </span>
                </div>
              </div>

              {group.role && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role: {group.role.role_name}
                  </h5>
                  <PermissionsList permissions={group.role.role_permissions} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
});
UserGroups.displayName = 'UserGroups';

/**
 * User API clients section
 */
const UserApiClients = React.memo(({ clients = [] }) => {
  if (!clients || clients.length === 0) return null;

  return (
    <CardWrapper>
      <div className="p-6">
        <SectionHeader
          icon={AqKey01}
          title="API Clients"
          count={clients.length}
        />
        <div className="space-y-3">
          {clients.map((client, index) => (
            <div
              key={client._id || index}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {client.name}
                </h4>
                {client.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {client.description}
                  </p>
                )}
              </div>
              <StatusBadge status={client.isActive} />
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
});
UserApiClients.displayName = 'UserApiClients';

/**
 * User networks section
 */
const UserNetworks = React.memo(({ networks = [] }) => {
  if (!networks || networks.length === 0) return null;

  return (
    <CardWrapper>
      <div className="p-6">
        <SectionHeader
          icon={AqGlobe05}
          title="Networks"
          count={networks.length}
        />
        <div className="space-y-4">
          {networks.map((network, index) => (
            <div
              key={network._id || index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {network.net_name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {network.userType}
                </span>
              </div>

              {network.net_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {network.net_description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {network.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Region:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {network.net_region || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
});
UserNetworks.displayName = 'UserNetworks';

/**
 * Main user details page content
 */
const UserDetailsPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { hasPermission, isLoading: permLoading } = usePermissions();
  const { id: activeGroupID, loading: groupLoading } = useGetActiveGroup();

  // Memoized computed values
  const isLoadingAuth = useMemo(
    () => permLoading || groupLoading,
    [permLoading, groupLoading],
  );

  const canView = useMemo(
    () =>
      !isLoadingAuth ? hasPermission('USER_MANAGEMENT', activeGroupID) : null,
    [isLoadingAuth, hasPermission, activeGroupID],
  );

  const userName = useMemo(
    () =>
      user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email ||
          'User Details'
        : 'User Details',
    [user],
  );

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    router.push('/admin/users');
  }, [router]);

  // Data fetching
  const fetchUserDetails = useCallback(async () => {
    if (!userId || !canView) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getUserByIdApi(userId);

      if (
        response?.success &&
        Array.isArray(response?.users) &&
        response.users.length > 0
      ) {
        setUser(response.users[0]);
      } else {
        throw new Error('User not found or invalid response format');
      }
    } catch (err) {
      logger.error('Error fetching user details:', err);
      setError(err.message || 'Failed to load user details');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId, canView]);

  const handleRetry = useCallback(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Effects
  useEffect(() => {
    // Only fetch when auth loading is complete and user has permission
    if (isLoadingAuth) return;
    if (canView === false) {
      setLoading(false);
      return;
    }
    if (canView && userId) {
      fetchUserDetails();
    }
  }, [isLoadingAuth, canView, userId, fetchUserDetails]);

  // Loading state
  if (isLoadingAuth || loading) {
    return <UserDetailsSkeleton />;
  }

  // Permission denied
  if (canView === false) {
    return <PermissionDenied />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <PageHeader
            title="User Details"
            subtitle="View detailed user information"
            showBack
            onBack={handleGoBack}
          />
        </div>
        <ErrorState
          type="server"
          title="Failed to Load User Details"
          description={error}
          primaryAction="Retry"
          onPrimaryAction={handleRetry}
          secondaryAction="Go Back"
          onSecondaryAction={handleGoBack}
        />
      </div>
    );
  }

  // No user found
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <PageHeader
            title="User Details"
            subtitle="View detailed user information"
            showBack
            onBack={handleGoBack}
          />
        </div>
        <ErrorState
          type="empty"
          title="User Not Found"
          description="The requested user could not be found or you don't have permission to view their details."
          primaryAction="Go Back"
          onPrimaryAction={handleGoBack}
        />
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center space-x-4">
        <PageHeader
          title={userName}
          subtitle="Detailed user information and permissions"
          showBack
          onBack={handleGoBack}
        />
      </div>

      {/* User overview card */}
      <CardWrapper>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <UserAvatar user={user} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {userName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {user.jobTitle || 'No job title specified'}
              </p>
              <div className="flex items-center space-x-4">
                <StatusBadge
                  status={user.verified}
                  label={user.verified ? 'Verified' : 'Unverified'}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Login Count: {user.loginCount || 0}
                </span>
              </div>
            </div>
          </div>

          <UserBasicInfo user={user} />

          {user.description && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <InfoItem
                icon={AqUser02}
                label="Description"
                value={user.description}
              />
            </div>
          )}
        </div>
      </CardWrapper>

      {/* Additional sections */}
      <UserGroups groups={user.groups} />
      <UserApiClients clients={user.clients} />
      <UserNetworks networks={user.networks} />
    </div>
  );
};

/**
 * Main component with error boundary
 */
const UserDetailsPage = () => {
  return (
    <RuntimeErrorBoundary
      name="UserDetailsPage"
      feature="admin-user-details"
      onRetry={() => window.location.reload()}
      onRecover={() => logger.info('User details page recovered from error')}
    >
      <UserDetailsPageContent />
    </RuntimeErrorBoundary>
  );
};

export default UserDetailsPage;
