'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import SelectField from '@/shared/components/ui/select';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import {
  useOrganizationActivityLog,
  useOrganizationAssignedUsers,
  useOrganizationsSummary,
} from '@/shared/hooks/useOrganizations';
import type { GroupActivity } from '@/shared/types/api';
import {
  getDefaultActivityDateRange,
  isDefaultActivityDateRange,
  toActivityApiEndDate,
} from './dateRange';

const ACTIVITY_LOG_ROUTE = '/system/activity-log';

// The backend ignores `page` and has no total count, so the page size doubles
// as the "is there a next page" signal: a full window means "Next" stays
// available, a short one means this is the last page.
const PAGE_SIZE = 20;

// Backend enum values the UI knows how to phrase. Everything else falls back
// to the underscore→space rendering below, so a new activity type added
// server-side still reads sensibly instead of showing as `SOME_NEW_EVENT`.
const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  MEMBER_ADDED: 'Member added',
  MEMBER_REMOVED: 'Member removed',
};

const humanizeActivityType = (activityType: string): string =>
  ACTIVITY_TYPE_LABELS[activityType] ?? activityType.replace(/_/g, ' ');

// Activity payloads come from the backend; the backend message on an error is
// shown verbatim as text (React escapes it, nothing is injected as HTML).
const describeError = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : getUserFriendlyErrorMessage(error);

// Table row shape: GroupActivity plus the string `id` every table component
// expects for row keys/selection, plus an index signature so the shared
// TableColumn render callbacks type-check against it.
type ActivityRow = GroupActivity & {
  id: string;
  [key: string]: unknown;
};

// Content child of the PermissionGuard: it owns `useSearchParams`, every
// data hook and all state, so none of them run until the guard resolves and
// allows rendering (a non-admin deep link issues no API reads).
const ActivityLogContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Activity defaults to a 7-day window (inclusive of today), so the very
  // first fetch is already scoped to recent entries instead of the whole log.
  const defaultDateRange = useMemo(() => getDefaultActivityDateRange(), []);

  // The selected group is component state mirrored into the URL, so a change
  // is reflected immediately (no waiting for a navigation round-trip) while
  // still being shareable/bookmarkable via ?group_id=.
  const [groupId, setGroupId] = useState<string | null>(
    () => searchParams?.get('group_id') || null
  );
  const [page, setPage] = useState(0);
  const [memberId, setMemberId] = useState('');
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const urlGroupId = searchParams?.get('group_id') || null;
  const previousUrlGroupId = useRef(urlGroupId);

  useEffect(() => {
    if (previousUrlGroupId.current === urlGroupId) return;

    previousUrlGroupId.current = urlGroupId;
    setGroupId(urlGroupId);
    setMemberId('');
    setPage(0);
  }, [urlGroupId]);

  const { groups, isLoading: groupsLoading } = useOrganizationsSummary();
  const { users, isLoading: membersLoading } =
    useOrganizationAssignedUsers(groupId);

  const params = useMemo(
    () => ({
      limit: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      ...(memberId ? { user_id: memberId } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      // The UI's "To" date is inclusive, but the backend treats end_date as
      // midnight at the START of that day — shift it one day forward so the
      // whole of the selected final day is covered. An empty (cleared) input
      // sends no end_date at all, keeping all-time browsing possible.
      ...(endDate ? { end_date: toActivityApiEndDate(endDate) } : {}),
    }),
    [page, memberId, startDate, endDate]
  );

  const { activities, groupName, error, isLoading, isValidating, mutate } =
    useOrganizationActivityLog(groupId, params);

  // No total count is returned, so the only "there is more" signal available
  // is a full page.
  const hasNextPage = activities.length === PAGE_SIZE;

  const activityRows = useMemo<ActivityRow[]>(
    () => activities.map(activity => ({ ...activity, id: activity.id })),
    [activities]
  );

  const columns = useMemo(
    () => [
      {
        key: 'activity_type',
        label: 'Activity',
        minWidth: '140px',
        render: (_value: unknown, activity: ActivityRow) => (
          <span className="inline-flex max-w-full items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {humanizeActivityType(activity.activity_type)}
          </span>
        ),
      },
      {
        key: 'actor',
        label: 'Actor',
        minWidth: '180px',
        render: (_value: unknown, activity: ActivityRow) => (
          <span className="break-words text-sm">
            {activity.actor?.email || 'System'}
          </span>
        ),
      },
      {
        key: 'target_user',
        label: 'Target',
        minWidth: '180px',
        render: (_value: unknown, activity: ActivityRow) => (
          <span className="break-words text-sm text-muted-foreground">
            {activity.target_user?.name || activity.target_user?.email || '—'}
          </span>
        ),
      },
      {
        key: 'timestamp',
        label: 'When',
        minWidth: '160px',
        render: (_value: unknown, activity: ActivityRow) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatWithPattern(activity.timestamp, 'MMM d, yyyy HH:mm')}
          </span>
        ),
      },
    ],
    []
  );

  const syncGroupIdToUrl = useCallback(
    (nextGroupId: string) => {
      const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
      if (nextGroupId) {
        nextParams.set('group_id', nextGroupId);
      } else {
        nextParams.delete('group_id');
      }
      const query = nextParams.toString();
      // Same path, only the query string changes.
      router.replace(
        query ? `${ACTIVITY_LOG_ROUTE}?${query}` : ACTIVITY_LOG_ROUTE
      );
    },
    [router, searchParams]
  );

  const handleGroupChange = useCallback(
    (event: { target: { value: unknown } }) => {
      const nextGroupId = String(event.target.value ?? '');
      setGroupId(nextGroupId || null);
      setMemberId('');
      setPage(0);
      syncGroupIdToUrl(nextGroupId);
    },
    [syncGroupIdToUrl]
  );

  const handleMemberChange = useCallback(
    (event: { target: { value: unknown } }) => {
      setMemberId(String(event.target.value ?? ''));
      setPage(0);
    },
    []
  );

  const handleStartDateChange = useCallback(
    (event: { target: { value: unknown } }) => {
      setStartDate(String(event.target.value ?? ''));
      setPage(0);
    },
    []
  );

  const handleEndDateChange = useCallback(
    (event: { target: { value: unknown } }) => {
      setEndDate(String(event.target.value ?? ''));
      setPage(0);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setMemberId('');
    // "Clear" restores the default 7-day window rather than emptying the
    // inputs — an all-time view is still reachable by clearing each date.
    setStartDate(defaultDateRange.startDate);
    setEndDate(defaultDateRange.endDate);
    setPage(0);
  }, [defaultDateRange]);

  const handleRetry = useCallback(() => {
    void mutate();
  }, [mutate]);

  // The default 7-day window isn't a "filter" in the user's mind, so the
  // reset button stays disabled while the dates sit at their defaults.
  const filtersActive = Boolean(
    memberId || !isDefaultActivityDateRange(startDate, endDate)
  );

  return (
    <>
      <div className="min-w-0 space-y-6">
        <PageHeading
          title="Activity Log"
          subtitle={
            groupName
              ? `Recent membership changes in ${groupName}`
              : 'Audit trail of organization membership changes'
          }
        />

        {/* Filters — every control is stacked on mobile so nothing overflows
            horizontally at 390px. */}
        <div className="min-w-0 space-y-4 rounded-md border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Organization"
              id="activity_log_organization"
              name="activity_log_organization"
              // Grid items default to min-width:auto, so a long organization
              // name would widen the track past 390px. min-w-0 lets the
              // trigger's truncate rule do its job instead.
              containerClassName="min-w-0"
              value={groupId ?? ''}
              onChange={handleGroupChange}
              searchable
              searchPlaceholder="Search organizations..."
              noOptionsMessage={
                groupsLoading ? 'Loading organizations...' : 'No matches'
              }
            >
              <option value="">Select an organization</option>
              {groups.map(group => (
                <option
                  key={group._id}
                  value={group._id}
                  data-search={group.organization_slug}
                >
                  {group.grp_title} ({group.organization_slug})
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Member"
              id="activity_log_member"
              name="activity_log_member"
              containerClassName="min-w-0"
              value={memberId}
              onChange={handleMemberChange}
              disabled={!groupId}
              searchable
              searchPlaceholder="Search members..."
              noOptionsMessage={
                membersLoading ? 'Loading members...' : 'No members match'
              }
            >
              <option value="">All members</option>
              {users.map(user => (
                <option
                  key={user._id}
                  value={user._id}
                  data-search={user.email}
                >
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </SelectField>

            <Input
              label="Start date"
              id="activity_log_start_date"
              name="activity_log_start_date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              disabled={!groupId}
              containerClassName="mb-0"
            />

            <Input
              label="End date"
              id="activity_log_end_date"
              name="activity_log_end_date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              disabled={!groupId}
              containerClassName="mb-0"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Activity defaults to the last 7 days. Widen the dates to see older
              entries.
            </p>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleClearFilters}
              disabled={!filtersActive}
            >
              Reset filters
            </Button>
          </div>
        </div>

        {!groupId ? (
          <EmptyState
            title="No organization selected"
            description="Select an organization to view its activity log."
            className="min-h-[240px] border-0 bg-transparent"
          />
        ) : error && isForbiddenError(error) ? (
          <AccessDenied
            title="Access Denied"
            message="You do not have the required permissions to view this activity log."
          />
        ) : error ? (
          <ErrorState
            title="Failed to load activity log"
            description={describeError(error)}
            retryAction={{ label: 'Retry', onClick: handleRetry }}
            // break-words is inherited, so an unbroken backend message
            // (URL, long token) wraps instead of pushing past 390px.
            className="min-h-[240px] break-words border-0 bg-transparent"
          />
        ) : isLoading ? (
          <LoadingState
            className="h-[calc(100vh-320px)]"
            text="Loading activity..."
          />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activity found"
            description="No recorded activity matches the current filters."
            className="min-h-[240px] border-0 bg-transparent"
          />
        ) : (
          <div className="min-w-0 space-y-4">
            {/* searchable={false}: the table only ever holds one server page
                (20 rows), so a client-side search over it would hide matching
                rows that live on other pages. The endpoint also returns no
                total count, so the table's server-pagination footer can't be
                used — the custom Prev/Next below stays. */}
            <ServerSideTable<ActivityRow>
              title="Activity"
              data={activityRows}
              columns={columns}
              loading={false}
              searchable={false}
              showClientPagination={false}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Page {page + 1}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setPage(current => Math.max(0, current - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => setPage(current => current + 1)}
                  disabled={!hasNextPage || isValidating}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Guard shell: PermissionGuard resolves first, so ActivityLogContent — and
// with it `useSearchParams`, every hook and every request — only mounts for
// permitted users.
const ActivityLogPage: React.FC = () => (
  <Suspense fallback={<LoadingState text="Loading activity log..." />}>
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to view the activity log."
    >
      <ActivityLogContent />
    </PermissionGuard>
  </Suspense>
);

export default ActivityLogPage;
