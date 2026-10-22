'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AqRefreshCw05 } from '@airqo/icons-react';
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { toast } from '@/shared/components/ui/toast';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import { useOrganizationsSummary } from '@/shared/hooks/useOrganizations';
import OrganizationAvatar from '@/modules/system-organizations/components/OrganizationAvatar';
import StatusBadge from '@/modules/system-organizations/components/StatusBadge';
import { ORGANIZATIONS_PATH } from '@/modules/system-organizations/utils';
import type { GroupSummary } from '@/shared/types/api';

// Table rows are the organization summary plus the `id` the table needs for
// React keys; the list stays read-only (edit/delete live on the detail page).
// `GroupSummary` is an interface, so the row needs an explicit index
// signature to satisfy ServerSideTable's `TableItem` constraint (interfaces
// never get the implicit index type aliases do).
type OrganizationRow = GroupSummary & {
  id: string;
  [key: string]: unknown;
};

// Thin content component mounted ONLY when PermissionGuard allows it, so a
// non-admin deep link never issues the summary request in the first place
// (the guard must gate the hooks, not just the rendered output).
const OrganizationsContent: React.FC = () => {
  const router = useRouter();
  const { groups, isLoading, isValidating, error, mutate } =
    useOrganizationsSummary();

  const organizations = useMemo<OrganizationRow[]>(
    () => groups.map(group => ({ ...group, id: group._id })),
    [groups]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'Organizations refreshed successfully'
      );
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
      console.error('Refresh organizations error:', err);
    }
  }, [mutate]);

  const handleRowClick = useCallback(
    (organization: OrganizationRow) => {
      router.push(`${ORGANIZATIONS_PATH}/${organization.id}`);
    },
    [router]
  );

  const columns = useMemo(
    () => [
      {
        key: 'grp_title',
        label: 'Organization',
        render: (_value: unknown, organization: OrganizationRow) => {
          // A single element child keeps the table's built-in search on the
          // raw row value (title) instead of empty JSX children.
          return (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <OrganizationAvatar
                  title={organization.grp_title}
                  imageUrl={organization.grp_profile_picture}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {organization.grp_title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {organization.organization_slug}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: 'grp_status',
        label: 'Status',
        render: (_value: unknown, organization: OrganizationRow) => (
          // Rows that are not ACTIVE keep the list's INACTIVE wording.
          <StatusBadge status={organization.grp_status} fallback="INACTIVE" />
        ),
      },
      {
        key: 'numberOfGroupUsers',
        label: 'Members',
        render: (_value: unknown, organization: OrganizationRow) => (
          <div className="text-sm tabular-nums">
            {organization.numberOfGroupUsers ?? 0}
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Manage',
        sortable: false,
        render: (_value: unknown, organization: OrganizationRow) => (
          <Link
            href={`${ORGANIZATIONS_PATH}/${organization.id}`}
            className="inline-flex items-center whitespace-nowrap text-sm font-medium text-primary hover:underline"
          >
            Manage
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <>
      {isLoading ? (
        <LoadingState
          className="h-[calc(100vh-200px)]"
          text="Loading organizations..."
        />
      ) : isForbiddenError(error) ? (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view organizations."
        />
      ) : error ? (
        <div className="min-w-0 space-y-4">
          <ErrorBanner
            title="Failed to load organizations"
            message={getUserFriendlyErrorMessage(error)}
            actions={
              <Button
                variant="outlined"
                size="sm"
                onClick={handleRefresh}
                loading={isValidating}
              >
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <div className="min-w-0 space-y-6">
          <PageHeading
            title="Organizations"
            subtitle={`${groups.length} organizations`}
            action={
              <Button
                variant="outlined"
                Icon={AqRefreshCw05}
                onClick={handleRefresh}
                loading={isValidating}
              >
                Refresh
              </Button>
            }
          />

          <ServerSideTable
            title="All Organizations"
            data={organizations}
            columns={columns}
            loading={isLoading}
            isRefreshing={isValidating}
            showClientPagination
            // Title + slug only: `organization_slug` has no column of its own,
            // so the table indexes that raw value straight off the row.
            searchableColumns={['grp_title', 'organization_slug']}
            onRowClick={handleRowClick}
            emptyComponent={
              <EmptyState
                title="No organizations yet"
                description="Organizations created on the platform will appear here."
                className="min-h-[300px] border-0 bg-transparent"
              />
            }
          />
        </div>
      )}
    </>
  );
};

// Guard shell: no data hooks here — PermissionGuard decides whether
// OrganizationsContent (and its fetches) mount at all.
const OrganizationsPage: React.FC = () => (
  <PermissionGuard
    requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
    accessDeniedTitle="Access Restricted"
    accessDeniedMessage="You need system administrator permissions to manage organizations."
  >
    <OrganizationsContent />
  </PermissionGuard>
);

export default OrganizationsPage;
