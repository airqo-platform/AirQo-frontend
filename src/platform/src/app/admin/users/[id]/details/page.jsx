'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, isValid } from 'date-fns';
import {
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
import {
  getUserByIdApi,
  assignRoleToUserApi,
  unassignRoleFromUserApi,
  getGroupRolesApi,
} from '@/core/apis/Account';

// Import utilities
import logger from '@/lib/logger';
import { usePermissions } from '@/core/HOC/authUtils';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

// Import Components
import { PageHeader } from '@/common/components/Header';
import PermissionDenied from '@/common/components/PermissionDenied';
import { UserDetailsSkeleton } from '@/common/components/Skeleton';
import ErrorState from '@/common/components/ErrorState';
import RuntimeErrorBoundary from '@/common/components/ErrorBoundary/RuntimeErrorBoundary';
import CardWrapper from '@/common/components/CardWrapper';
import SelectField from '@/common/components/SelectField';
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
  if (!Icon) return null;
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
      <div className="text-sm text-gray-500 dark:text-gray-400 italic p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        No permissions assigned
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {permissions.map((perm, index) => (
        <div
          key={perm._id || index}
          className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        >
          <AqShield03 className="w-3 h-3 mr-2 flex-shrink-0" />
          <span className="truncate">{perm.permission || perm}</span>
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
const UserAvatar = React.memo(({ user }) => {
  const name =
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    user?.userName ||
    user?.email ||
    '';
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={name || 'User avatar'}
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
        />
      ) : (
        <div
          role="img"
          aria-label={`Avatar for ${name}`}
          className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 bg-gradient-to-br from-primary/80 to-primary/60 text-white text-2xl font-semibold"
        >
          {initial}
        </div>
      )}

      <div className="absolute -bottom-2 -right-2">
        <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
          <StatusBadge status={user.isActive} />
        </div>
      </div>
    </div>
  );
});
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {userInfoData.map((item, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
            {item.icon && <item.icon className="w-5 h-5 text-primary" />}
          </div>
          <div className="min-w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {item.label}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-gray-100 break-words font-medium">
              {item.value || 'N/A'}
            </dd>
          </div>
        </div>
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
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <AqBuilding07 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Groups & Roles
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {groups.length} group{groups.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((group, index) => (
            <div key={group._id || index} className="">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Show first two letters of group title as initials */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold text-lg border border-gray-200 dark:border-gray-700">
                    {(() => {
                      const title = (group.grp_title || '').trim();
                      if (!title) return '?';
                      return title.slice(0, 2).toUpperCase();
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {group.grp_title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.organization_slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={group.status === 'ACTIVE'} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
                    {group.userType}
                  </span>
                </div>
              </div>

              {group.role && (
                <div className="mt-4">
                  <div className="flex items-center mb-3">
                    <AqShield03 className="w-4 h-4 text-primary mr-2" />
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Role: {group.role.role_name}
                    </h5>
                  </div>
                  <PermissionsList permissions={group.role.role_permissions} />
                </div>
              )}
              {index < groups.length - 1 && (
                <hr className="mt-6 border-gray-200 dark:border-gray-700" />
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
  if (!clients || clients.length === 0) {
    return (
      <CardWrapper>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <AqKey01 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                API Clients
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No API clients configured
              </p>
            </div>
          </div>
          <div className="text-center py-8">
            <AqKey01 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No API clients have been created for this user
            </p>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <AqKey01 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              API Clients
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {clients.length} client{clients.length !== 1 ? 's' : ''}{' '}
              configured
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {clients.map((client, index) => (
            <div
              key={client._id || index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <AqKey01 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {client.name}
                  </h4>
                  {client.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {client.description}
                    </p>
                  )}
                </div>
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
  if (!networks || networks.length === 0) {
    return (
      <CardWrapper>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <AqGlobe05 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Networks
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No networks assigned
              </p>
            </div>
          </div>
          <div className="text-center py-8">
            <AqGlobe05 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This user is not assigned to any networks
            </p>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <AqGlobe05 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Networks
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {networks.length} network{networks.length !== 1 ? 's' : ''}{' '}
              assigned
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {networks.map((network, index) => (
            <div
              key={network._id || index}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <AqGlobe05 className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {network.net_name}
                  </h4>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
                  {network.userType}
                </span>
              </div>

              {network.net_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {network.net_description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {network.status || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Region:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
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

  // Role management state
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [unassigningRoleId, setUnassigningRoleId] = useState(null);

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

  // --- Role management: derive assigned roles, fetch available roles and handlers ---
  const assignedRoles = useMemo(() => {
    const roles = [];
    (user?.groups || []).forEach((g) => {
      const r = g?.role;
      if (r) {
        const id = r._id || r.id || r.role_id || null;
        roles.push({
          id,
          name: r.role_name,
          groupId: g._id || g.grp_id || g.group_id,
        });
      }
    });
    const unique = [];
    const seen = new Set();
    for (const rr of roles) {
      if (rr.id && !seen.has(rr.id)) {
        seen.add(rr.id);
        unique.push(rr);
      }
    }
    return unique;
  }, [user]);

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await getGroupRolesApi();
      if (Array.isArray(res)) setAvailableRoles(res);
      else if (Array.isArray(res?.roles)) setAvailableRoles(res.roles);
      else if (Array.isArray(res?.data)) setAvailableRoles(res.data);
      else setAvailableRoles([]);
    } catch (err) {
      logger.error('Failed to fetch roles:', err);
      setAvailableRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingAuth) fetchRoles();
  }, [isLoadingAuth, fetchRoles]);

  const handleAssignRole = useCallback(async () => {
    if (!selectedRoleId || !userId) return;
    try {
      setAssigning(true);
      await assignRoleToUserApi(selectedRoleId, { user: userId });
      await fetchUserDetails();
      await fetchRoles();
      setSelectedRoleId('');
    } catch (err) {
      logger.error('Error assigning role:', err);
    } finally {
      setAssigning(false);
    }
  }, [selectedRoleId, userId, fetchUserDetails, fetchRoles]);

  const handleUnassignRole = useCallback(
    async (roleId) => {
      if (!roleId || !userId) return;
      try {
        setUnassigningRoleId(roleId);
        await unassignRoleFromUserApi(roleId, userId);
        await fetchUserDetails();
        await fetchRoles();
      } catch (err) {
        logger.error('Error unassigning role:', err);
      } finally {
        setUnassigningRoleId(null);
      }
    },
    [userId, fetchUserDetails, fetchRoles],
  );

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
        <PageHeader
          title="User Details"
          subtitle="View detailed user information"
          showBack
          onBack={handleGoBack}
        />
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
        <PageHeader
          title="User Details"
          subtitle="View detailed user information"
          showBack
          onBack={handleGoBack}
        />
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <PageHeader
            title={userName}
            subtitle="Detailed user information and permissions"
            showBack
            onBack={handleGoBack}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - User Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* User overview card */}
            <CardWrapper>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                  <UserAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">
                      {userName}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {user.jobTitle || 'No job title specified'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge
                        status={user.verified}
                        label={user.verified ? 'Verified' : 'Unverified'}
                      />
                      <StatusBadge status={user.isActive} />
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        Login Count: {user.loginCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Contact Information
                  </h3>
                  <UserBasicInfo user={user} />
                </div>

                {user.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      About
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {user.description}
                    </p>
                  </div>
                )}
              </div>
            </CardWrapper>

            {/* Groups & Roles */}
            <UserGroups groups={user.groups} />

            {/* API Clients and Networks in grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserApiClients clients={user.clients} />
              <UserNetworks networks={user.networks} />
            </div>
          </div>

          {/* Right column - Role Management */}
          <div className="space-y-6">
            {/* Manage Roles Card */}
            <CardWrapper>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <AqShield03 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Role Management
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Assign and manage user roles
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Role Assignment */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assign New Role
                    </label>
                    <div className="space-y-3">
                      <SelectField
                        label={null}
                        placeholder={
                          rolesLoading ? 'Loading roles...' : 'Select a role'
                        }
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        disabled={rolesLoading}
                        maxHeight={300}
                        listClassName="max-h-[300px]"
                      >
                        <option value="">
                          {rolesLoading ? 'Loading roles...' : 'Select a role'}
                        </option>
                        {availableRoles.map((r) => (
                          <option
                            key={r._id || r.id || r.role_id}
                            value={r._id || r.id || r.role_id}
                          >
                            {r.role_name || r.name || r.title}
                          </option>
                        ))}
                      </SelectField>
                      <button
                        className="w-full btn btn-primary disabled:opacity-50"
                        onClick={handleAssignRole}
                        disabled={!selectedRoleId || assigning || rolesLoading}
                      >
                        {assigning ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Assigning...
                          </div>
                        ) : (
                          'Assign Role'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Current Roles */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Current Roles ({assignedRoles.length})
                    </h4>
                    {assignedRoles.length === 0 ? (
                      <div className="text-center py-6">
                        <AqShield03 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No roles assigned
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedRoles.map((ar) => (
                          <div
                            key={ar.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <AqShield03 className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {ar.name}
                                </p>
                              </div>
                            </div>
                            <button
                              className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                              onClick={() => handleUnassignRole(ar.id)}
                              disabled={unassigningRoleId === ar.id}
                            >
                              {unassigningRoleId === ar.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                  Removing...
                                </div>
                              ) : (
                                <>
                                  <AqX className="w-4 h-4 mr-1" />
                                  REMOVE
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardWrapper>

            {/* Quick Stats Card */}
            <CardWrapper>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Groups
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.groups?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      API Clients
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.clients?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Networks
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.networks?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Member Since
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardWrapper>
          </div>
        </div>
      </div>
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
