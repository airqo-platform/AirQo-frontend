'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { AqXClose } from '@airqo/icons-react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { useSitesForSelection } from '../../hooks/useCohortSelection';
import type { NormalizedSiteData } from '@/shared/utils/siteUtils';

interface ComparisonSitePickerProps {
  /** Organization group id; empty in the user flow (uses the active group). */
  groupId?: string;
  /** Fully controlled selection — the parent is the single source of truth. */
  selectedSiteIds: string[];
  onSelectionChange: (siteIds: string[]) => void;
  /**
   * Resolved display names (siteId → name) from the page — used by the
   * selected-items strip so off-page selections always show real names.
   */
  namesBySite?: Map<string, string>;
  /**
   * Emits every cohort-site row currently loaded, so the parent can resolve
   * full `Site` objects (real names, geo) for its save payload — including
   * rows the user just picked that were never saved before.
   */
  onSitesResolved?: (sites: NormalizedSiteData[]) => void;
  className?: string;
}

/**
 * Compact site multi-select for the comparison view. One cohort-scoped table
 * (Location / City / Country — deliberately no per-site colors or device
 * columns; this picker is about picking places, not styling charts) plus a
 * selected-items strip showing every pick with a real name and a remove
 * button, regardless of which table page the row is on.
 *
 * The selection is fully controlled (the parent's `selectedSiteIds` is the
 * single source of truth) so there is no local-copy/echo feedback that can
 * loop.
 */
export const ComparisonSitePicker: React.FC<ComparisonSitePickerProps> = ({
  groupId = '',
  selectedSiteIds,
  onSelectionChange,
  namesBySite,
  onSitesResolved,
  className,
}) => {
  const sitesData = useSitesForSelection({
    groupId,
    initialPageSize: 6,
    maxLimit: 80,
  });

  // Report loaded rows upward so the parent can build full Site objects for
  // its save payload (mirrors how the chart dialog resolves picker names).
  useEffect(() => {
    if (sitesData.sites.length > 0) {
      onSitesResolved?.(sitesData.sites);
    }
  }, [onSitesResolved, sitesData.sites]);

  const handleSiteSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      onSelectionChange(ids.map(String));
    },
    [onSelectionChange]
  );

  const handleRemoveSelected = useCallback(
    (siteId: string) => {
      onSelectionChange(selectedSiteIds.filter(id => id !== siteId));
    },
    [onSelectionChange, selectedSiteIds]
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  // Display name for a selected site: the picker's name when the row is on
  // the current page, else the page-resolved names (saved preference /
  // reading payloads), so off-page selections never show raw ids.
  const selectedSiteLabel = useCallback(
    (siteId: string): string => {
      const site = sitesData.sites.find(candidate => candidate.id === siteId);
      return site?.location ?? namesBySite?.get(siteId) ?? siteId;
    },
    [namesBySite, sitesData.sites]
  );

  const siteColumns = useMemo(
    () => [
      {
        key: 'location',
        label: 'Location',
        sortable: true,
        cellClassName: 'whitespace-nowrap',
      },
      {
        key: 'city',
        label: 'City',
        sortable: true,
        cellClassName: 'whitespace-nowrap',
      },
      {
        key: 'country',
        label: 'Country',
        sortable: true,
        cellClassName: 'whitespace-nowrap',
      },
    ],
    []
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected items strip */}
      {selectedSiteIds.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Selected ({selectedSiteIds.length})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSiteIds.map(siteId => {
              const label = selectedSiteLabel(siteId);
              return (
                <span
                  key={siteId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  <span className="max-w-[180px] truncate">{label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(siteId)}
                    aria-label={`Remove ${label}`}
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <AqXClose className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <ServerSideTable
        title="Sites"
        data={sitesData.sites}
        columns={siteColumns}
        multiSelect
        selectedItems={selectedSiteIds}
        onSelectedItemsChange={handleSiteSelectionChange}
        loading={sitesData.isLoading}
        isRefreshing={sitesData.isRefreshing}
        error={sitesData.error}
        currentPage={sitesData.currentPage}
        totalPages={sitesData.totalPages}
        pageSize={sitesData.pageSize}
        totalItems={sitesData.totalSites}
        onPageChange={sitesData.setCurrentPage}
        onPageSizeChange={sitesData.setPageSize}
        searchTerm={sitesData.searchTerm}
        onSearchChange={sitesData.setSearchTerm}
        compactRows
      />
    </div>
  );
};
