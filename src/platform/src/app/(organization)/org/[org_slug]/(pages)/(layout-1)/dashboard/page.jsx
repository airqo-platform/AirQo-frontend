'use client';

import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import CardWrapper from '@/common/components/CardWrapper';
import DashboardPageSkeleton from '@/common/components/Skeleton/DashboardPageSkeleton';
import ErrorState from '@/common/components/ErrorState';
import { getGroupDetailsApi } from '@/core/apis/Account';
import { useDeviceSummary } from '@/core/hooks/analyticHooks';
import PermissionDenied from '@/common/components/PermissionDenied';
import { AqUsers01, AqMarkerPin01 } from '@airqo/icons-react';

const OrganizationDashboardPage = () => {
  const { activeGroup } = useUnifiedGroup();
  const { data: session } = useSession();
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // For demo: isAdmin is always true. Replace with real logic as needed.
  const isAdmin = true;

  // Get group title for device summary
  const groupTitle = activeGroup?.grp_title || activeGroup?.name || '';
  const {
    data: deviceSummaryData = [],
    isLoading: isDeviceSummaryLoading,
    isError: isDeviceSummaryError,
  } = useDeviceSummary(groupTitle, {});

  const fetchGroupDetails = useCallback(async () => {
    const groupId = activeGroup?._id || activeGroup?.id;
    if (!groupId) {
      setError('No organization ID found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const res = await getGroupDetailsApi(groupId);
      // If the API returns a status property, check for 403
      if (res.status === 403 || res.statusCode === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      if (res.success && res.group) {
        setGroupDetails(res.group);
      } else {
        throw new Error(res.message || 'Invalid API response');
      }
    } catch (e) {
      // If error object has a status or response status, check for 403
      if (e?.status === 403 || e?.response?.status === 403) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeGroup]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  if (!activeGroup || loading || isDeviceSummaryLoading) {
    return <DashboardPageSkeleton isAdmin={isAdmin} />;
  }

  if (permissionDenied) {
    return <PermissionDenied />;
  }

  if (isDeviceSummaryError) {
    return (
      <ErrorState
        type="server"
        title="Unable to load device summary"
        description={
          <>
            {'There was a problem retrieving the device summary.'}
            <br />
            <span className="text-sm text-gray-500">
              Please try again or contact support if the issue persists.
            </span>
          </>
        }
        onPrimaryAction={fetchGroupDetails}
        primaryAction="Retry"
        size="medium"
        variant="card"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        type="server"
        title="Unable to load dashboard"
        description={
          <>
            {error}
            <br />
            <span className="text-sm text-gray-500">
              Please try again or contact support if the issue persists.
            </span>
          </>
        }
        onPrimaryAction={fetchGroupDetails}
        primaryAction="Retry"
        size="medium"
        variant="card"
      />
    );
  }

  // Welcome message with user's first name if available
  const firstName =
    session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'User';

  const memberCount =
    groupDetails?.numberOfGroupUsers ?? groupDetails?.grp_users?.length ?? 0;

  // Get number of sites monitored from device summary data
  const sitesMonitored = Array.isArray(deviceSummaryData)
    ? deviceSummaryData.length
    : 0;

  return (
    <>
      {/* Welcome Card */}
      <CardWrapper
        className="relative overflow-hidden border-0 bg-gradient-to-r from-primary to-primary/80 text-white"
        padding="p-8 lg:p-12"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                  <span className="text-primary font-bold text-3xl">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                  Welcome back, {firstName}! 👋
                </h1>
                <p className="text-lg text-white/90 max-w-2xl">
                  Monitor your organization&apos;s air quality data and team
                  performance from your centralized dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Subtle background decoration using primary color */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full translate-y-32 -translate-x-32" />
      </CardWrapper>

      {/* Stats and Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Sites Monitored Card (public) */}
        <div className="md:col-span-1 lg:col-span-1">
          <CardWrapper
            className="group border-0 bg-white dark:bg-gray-800 relative overflow-hidden p-0"
            padding=""
          >
            <div className="flex flex-col h-full justify-center p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AqMarkerPin01 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sites Monitored
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Active air quality monitoring sites
                    </span>
                  </div>
                </div>
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white text-right">
                  {sitesMonitored}
                </span>
              </div>
            </div>
          </CardWrapper>
        </div>
        {/* Total Members Card (admin only) */}
        {isAdmin && (
          <div className="md:col-span-1 lg:col-span-1">
            <CardWrapper
              className="group border-0 bg-white dark:bg-gray-800 relative overflow-hidden p-0"
              padding=""
              as="a"
              href="/organization/members"
            >
              <div className="flex flex-col h-full justify-center p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <AqUsers01 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Members
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Team members in this group
                      </span>
                    </div>
                  </div>
                  <span className="text-4xl font-extrabold text-primary text-right">
                    {memberCount}
                  </span>
                </div>
              </div>
            </CardWrapper>
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizationDashboardPage;
