'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { AqXClose } from '@airqo/icons-react';
import { useSitesForSelection } from '../../hooks/useCohortSelection';
import type { NormalizedSiteData } from '@/shared/utils/siteUtils';

interface LocationPickerSectionProps {
  /** Organization group id; empty in the user flow (uses the active group) */
  groupId?: string;
  /** Fully controlled selection — the parent is the single source of truth */
  selectedSiteIds: string[];
  onSelectionChange: (siteIds: string[], names: Map<string, string>) => void;
  /**
   * Explicitly-picked per-location colors (opt-in — unset locations fall
   * back to the app theme palette; nothing is auto-assigned).
   */
  locationColors?: { id: string; color: string }[];
  /** Sets or clears (null) a location's explicit series color */
  onLocationColorChange?: (siteId: string, color: string | null) => void;
  /**
   * Resolved display names (siteId → name) from the page — used by the
   * selected-items strip so off-page selections always show real names.
   */
  namesBySite?: Map<string, string>;
  maxSelection?: number;
  className?: string;
}

const MAX_SELECTION_DEFAULT = 100;

const UNKNOWN_LABEL = 'Unknown location';

interface SiteDeviceInfo {
  _id?: string;
  name?: string;
  long_name?: string;
}

/**
 * Device display names for a site row. The cohort sites payload embeds the
 * devices deployed at each site, so the device name rides along with the
 * site — no separate device fetch needed.
 */
const getSiteDeviceNames = (site: NormalizedSiteData): string => {
  const devices = (site._raw?.devices as SiteDeviceInfo[] | undefined) ?? [];
  const names = devices
    .map(device => device.long_name || device.name || device._id)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : '—';
};

/**
 * Inline site multi-select for chart configuration. One table: sites with the
 * device(s) deployed at each site shown alongside. The selection is fully
 * controlled (the parent's `selectedSiteIds` is the single source of truth)
 * so there is no local-copy/echo feedback that can loop.
 */
export const LocationPickerSection: React.FC<LocationPickerSectionProps> = ({
  groupId = '',
  selectedSiteIds,
  onSelectionChange,
  locationColors,
  onLocationColorChange,
  namesBySite,
  maxSelection = MAX_SELECTION_DEFAULT,
  className,
}) => {
  const sitesData = useSitesForSelection({
    groupId,
    initialPageSize: 6,
    maxLimit: 80,
  });

  const hasSelection = selectedSiteIds.length > 0;

  const handleSiteSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      const nextIds = ids.map(String);
      const names = new Map<string, string>();
      nextIds.forEach(id => {
        const site = sitesData.sites.find(s => s.id === id);
        const name = site?.location ?? UNKNOWN_LABEL;
        if (name && name !== UNKNOWN_LABEL) names.set(id, name);
      });
      onSelectionChange(nextIds, names);
    },
    [onSelectionChange, sitesData.sites]
  );

  const handleRemoveSelected = useCallback(
    (siteId: string) => {
      handleSiteSelectionChange(selectedSiteIds.filter(id => id !== siteId));
    },
    [handleSiteSelectionChange, selectedSiteIds]
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([], new Map());
  }, [onSelectionChange]);

  // Display name for a selected site: the picker's name, else the page's
  // resolved names (so off-page selections never show raw ids or the
  // "Unknown location" placeholder).
  const selectedSiteLabel = useCallback(
    (siteId: string): string => {
      const site = sitesData.sites.find(s => s.id === siteId);
      return site?.location ?? namesBySite?.get(siteId) ?? siteId;
    },
    [namesBySite, sitesData.sites]
  );

  const renderColorCell = useCallback(
    (id: string, label: string, isSelected: boolean) => {
      if (!isSelected) {
        return <span className="text-muted-foreground/50">—</span>;
      }
      const entry = locationColors?.find(location => location.id === id);
      const color = entry?.color ?? '#145DFF';
      return (
        <span className="flex items-center gap-1.5">
          <label
            className="relative flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border"
            title={`Pick a color for ${label}`}
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#145DFF'}
              onChange={event =>
                onLocationColorChange?.(id, event.target.value)
              }
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label={`Color for ${label}`}
            />
          </label>
          {entry && (
            <button
              type="button"
              onClick={() => onLocationColorChange?.(id, null)}
              title="Reset to the theme color"
              className="text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Reset
            </button>
          )}
        </span>
      );
    },
    [locationColors, onLocationColorChange]
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
        key: 'devices',
        label: 'Device',
        // Rendered from the site payload's embedded devices — no sortable
        // field on the row itself.
        sortable: false,
        render: (_value: unknown, site: NormalizedSiteData) =>
          getSiteDeviceNames(site),
        cellClassName: 'whitespace-nowrap',
      },
      ...(hasSelection
        ? [
            {
              key: 'color',
              label: 'Color',
              render: (
                _value: unknown,
                site: { id: string; location: string }
              ) =>
                renderColorCell(
                  String(site.id),
                  site.location,
                  selectedSiteIds.includes(String(site.id))
                ),
              width: '76px',
              cellClassName: 'whitespace-nowrap',
            },
          ]
        : []),
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
      {
        key: 'owner',
        label: 'Owner',
        sortable: true,
        cellClassName: 'whitespace-nowrap',
      },
    ],
    [hasSelection, renderColorCell, selectedSiteIds]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected items strip — shows every pick with a real name, color dot
          and remove, regardless of which table page the row is on. */}
      {selectedSiteIds.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Selected ({selectedSiteIds.length})
              {selectedSiteIds.length > maxSelection && (
                <span className="ml-2 text-destructive">
                  — max {maxSelection}
                </span>
              )}
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
              const color =
                locationColors?.find(location => location.id === siteId)
                  ?.color ?? 'rgb(var(--primary))';
              return (
                <span
                  key={siteId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
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

      {!sitesData.isLoading &&
        !sitesData.error &&
        sitesData.sites.length === 0 && (
          <EmptyState
            compact
            title="No sites found"
            description="Try a different search, or check that monitoring sites are assigned."
          />
        )}
    </div>
  );
};

export default LocationPickerSection;
