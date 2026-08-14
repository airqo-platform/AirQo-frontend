'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { AqChevronRight } from '@airqo/icons-react';
import { useSitesForSelection } from '../../hooks/useCohortSelection';
import { toSiteSlug } from '../../utils/siteDetails';
import { rememberSiteSlug } from '../../hooks/useResolveSiteByName';
import type { NormalizedSiteData } from '@/shared/utils/siteUtils';

interface ExploreSitesViewProps {
  /** Organization group id (empty in the user flow — falls back to the active group) */
  groupId?: string;
  /** Base href of the analytics page, used to build the site-details links */
  baseHref: string;
  className?: string;
}

const PAGE_SIZES = [15, 30, 50];

/**
 * Explore — the fleet-wide locations directory. Built on the cached-sites
 * cohort endpoint (server-side search + pagination, 15 rows per page by
 * default) inside the shared ServerSideTable, so it matches every other
 * table in the app. Clicking a location navigates to its detail page
 * (`analytics/sites/[siteSlug]`, slugified display name — never the raw id).
 */
export const ExploreSitesView: React.FC<ExploreSitesViewProps> = ({
  groupId = '',
  baseHref,
  className,
}) => {
  const router = useRouter();

  const {
    sites,
    totalSites,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    isRefreshing,
    isLoading,
    error,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    retry,
  } = useSitesForSelection({
    groupId,
    initialPageSize: 15,
    maxLimit: 80,
  });

  const handleOpenSite = useCallback(
    (item: NormalizedSiteData) => {
      // URL carries the location's display name (search_name || location_name)
      // as a slug — the raw site id is resolved on the detail page instead.
      // Remember the exact id/name/coords at click time so the detail page
      // resolves instantly and never fails on names the API search can't
      // match (accents, diacritics, long names).
      const slug = toSiteSlug(item.location);
      const raw = item._raw;
      const asNum = (v: unknown): number | null =>
        typeof v === 'number' && Number.isFinite(v) ? v : null;
      // Map nodes render at the approximate coordinates — prefer them so the
      // map centers on the node, not hundreds of metres away.
      rememberSiteSlug(slug, {
        siteId: item.id,
        displayName: item.location,
        latitude: asNum(raw?.approximate_latitude) ?? asNum(raw?.latitude),
        longitude: asNum(raw?.approximate_longitude) ?? asNum(raw?.longitude),
      });
      const href = `${baseHref.replace(/\/+$/, '')}/sites/${slug}`;
      router.push(href);
    },
    [baseHref, router]
  );

  const columns = React.useMemo(() => {
    type Row = NormalizedSiteData;
    return [
      {
        key: 'location',
        label: 'Location',
        sortable: false,
        minWidth: '14rem',
        render: (_value: unknown, item: Row) => (
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">
              {item.location}
            </span>
          </div>
        ),
      },
      {
        key: 'city',
        label: 'City',
        sortable: false,
        minWidth: '8rem',
        render: (value: unknown) => (
          <span className="text-muted-foreground">
            {typeof value === 'string' ? value : '—'}
          </span>
        ),
      },
      {
        key: 'country',
        label: 'Country',
        sortable: false,
        minWidth: '8rem',
        render: (value: unknown) => (
          <span className="text-muted-foreground">
            {typeof value === 'string' ? value : '—'}
          </span>
        ),
      },
      {
        key: 'owner',
        label: 'Data provider',
        sortable: false,
        minWidth: '8rem',
        render: (value: unknown) => (
          <span className="text-muted-foreground">
            {typeof value === 'string' ? value : '—'}
          </span>
        ),
      },
      {
        key: '_actions',
        label: '',
        sortable: false,
        width: '3rem',
        minWidth: '3rem',
        render: () => (
          <AqChevronRight className="h-4 w-4 text-muted-foreground" />
        ),
      },
    ];
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <ServerSideTable<NormalizedSiteData>
        title="Explore locations"
        data={sites}
        columns={columns}
        loading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRefresh={retry}
        onRowClick={handleOpenSite}
        searchableColumns={['location', 'city', 'country', 'owner']}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalSites}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={PAGE_SIZES}
        emptyComponent={
          error ? (
            <ErrorState
              title="Unable to load locations"
              description={error}
              retryAction={{ label: 'Retry', onClick: retry }}
            />
          ) : (
            <EmptyState
              title="No locations found"
              description={
                searchTerm
                  ? `No monitored locations match “${searchTerm}”. Try a different search.`
                  : 'There are no monitored locations available yet.'
              }
              className="min-h-[300px] border-0 bg-transparent"
            />
          )
        }
      />
    </div>
  );
};

export default ExploreSitesView;
