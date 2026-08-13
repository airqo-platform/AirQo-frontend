'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AqXClose } from '@airqo/icons-react';
import {
  useSitesForSelection,
  useDevicesForSelection,
} from '../../hooks/useCohortSelection';
import type { NormalizedDeviceData } from '@/shared/utils/deviceUtils';

interface LocationPickerSectionProps {
  /** Organization group id; empty in the user flow (uses the active group) */
  groupId?: string;
  /** Fully controlled selection â€” the parent is the single source of truth */
  selectedSiteIds: string[];
  onSelectionChange: (siteIds: string[], names: Map<string, string>) => void;
  /** Fully controlled device selection (device _id values) */
  selectedDeviceIds: string[];
  onDeviceSelectionChange: (deviceIds: string[]) => void;
  /**
   * Explicitly-picked per-location colors (opt-in â€” unset locations fall
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
  /**
   * Reports the friendly device name for each site resolved from a DEVICE
   * selection (siteId → device name). Lets the chart legend/tooltip display
   * the device name when the user picked devices instead of sites.
   */
  onDeviceNamesChange?: (namesBySite: Map<string, string>) => void;
  maxSelection?: number;
  className?: string;
}

type PickerTab = 'sites' | 'devices';

const MAX_SELECTION_DEFAULT = 100;

interface DeviceRow extends NormalizedDeviceData {
  site: string;
  site_id: string;
}

const resolveDeviceSite = (device: NormalizedDeviceData): DeviceRow => {
  const rawSite = device._raw?.site as
    | { _id?: string; search_name?: string; name?: string; formatted_name?: string }
    | undefined;

  return {
    ...device,
    site:
      rawSite?.search_name ||
      rawSite?.name ||
      rawSite?.formatted_name ||
      'Unknown location',
    site_id: rawSite?._id ?? '',
  };
};

const UNKNOWN_LABEL = 'Unknown location';

/**
 * Inline site/device multi-select for chart configuration. The sites table is
 * fully controlled (the parent's `selectedSiteIds` is the single source of
 * truth) so there is no local-copy/echo feedback that can loop. Device
 * selections resolve to the site they are deployed at and are merged up via
 * a key-guarded effect.
 */
export const LocationPickerSection: React.FC<LocationPickerSectionProps> = ({
  groupId = '',
  selectedSiteIds,
  onSelectionChange,
  selectedDeviceIds,
  onDeviceSelectionChange,
  locationColors,
  onLocationColorChange,
  namesBySite,
  onDeviceNamesChange,
  maxSelection = MAX_SELECTION_DEFAULT,
  className,
}) => {
  const [tab, setTab] = useState<PickerTab>('sites');

  const sitesData = useSitesForSelection({
    groupId,
    enabled: tab === 'sites',
    initialPageSize: 6,
    maxLimit: 80,
  });

  const devicesData = useDevicesForSelection({
    groupId,
    enabled: tab === 'devices',
    initialPageSize: 6,
    maxLimit: 80,
  });

  const deviceRows = useMemo(
    () => devicesData.devices.map(resolveDeviceSite),
    [devicesData.devices]
  );

  // SiteId -> display name for currently selected sites. Existing names are
  // preserved so selections made on other pages don't regress to a generic
  // label (the parent's map is overwritten from this one).
  const selectedNames = useMemo(() => {
    const names = new Map<string, string>();
    selectedSiteIds.forEach(id => {
      const site = sitesData.sites.find(s => s.id === id);
      names.set(id, site?.location ?? UNKNOWN_LABEL);
    });
    return names;
  }, [sitesData.sites, selectedSiteIds]);

  // Device selections resolve to their deployed site id + name
  const deviceResolvedSites = useMemo(() => {
    const map = new Map<string, string>();
    deviceRows.forEach(row => {
      if (selectedDeviceIds.includes(row.id) && row.site_id) {
        map.set(row.site_id, row.site);
      }
    });
    return map;
  }, [deviceRows, selectedDeviceIds]);

  const mergedSiteIds = useMemo(
    () =>
      Array.from(
        new Set(selectedSiteIds.concat(Array.from(deviceResolvedSites.keys())))
      ),
    [selectedSiteIds, deviceResolvedSites]
  );

  // Keep previously-known display names for selected sites that aren't on
  // the current page, so the parent's names map never regresses to a label.
  const knownNamesRef = useRef<Map<string, string>>(new Map());

  // Push the merged selection up only when it actually changed. The parent
  // mirrors it straight back down through `selectedSiteIds`, so an
  // unconditional push would loop forever. "Unknown location" placeholders
  // for off-page rows are never pushed — they would overwrite real names
  // that the page already resolved.
  const lastPushedKeyRef = useRef('');
  useEffect(() => {
    const names = new Map<string, string>();
    selectedNames.forEach((name, id) => {
      if (name && name !== UNKNOWN_LABEL) names.set(id, name);
    });
    deviceResolvedSites.forEach((name, siteId) => {
      if (name && name !== UNKNOWN_LABEL) names.set(siteId, name);
    });
    // Remember real names for future pushes
    names.forEach((name, id) => {
      knownNamesRef.current.set(id, name);
    });

    const namesKey = Array.from(names.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, name]) => `${id}=${name}`)
      .join(',');
    const key = `${mergedSiteIds.join(',')}|${namesKey}`;
    if (key === lastPushedKeyRef.current) {
      return;
    }
    lastPushedKeyRef.current = key;
    // Never propagate a selection over the configured cap — the table shows
    // the selection state, so an oversized scope is simply not saved.
    if (mergedSiteIds.length > maxSelection) {
      return;
    }
    onSelectionChange(mergedSiteIds, names);
  }, [
    mergedSiteIds,
    deviceResolvedSites,
    maxSelection,
    onSelectionChange,
    selectedNames,
  ]);

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

  const handleDeviceSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      onDeviceSelectionChange(ids.map(String));
    },
    [onDeviceSelectionChange]
  );

  // Display name for a selected site: the device name ONLY when the site was
  // resolved from a DEVICE selection, else the picker name, else the page's
  // resolved names (so off-page selections never show raw ids or the
  // "Unknown location" placeholder).
  const selectedSiteLabel = useCallback(
    (siteId: string): string => {
      const devicePicked = deviceRows.some(
        row => selectedDeviceIds.includes(row.id) && row.site_id === siteId
      );
      const deviceName = devicePicked
        ? deviceRows.find(row => row.site_id === siteId)?.name
        : undefined;
      const pickerName = selectedNames.get(siteId);
      const resolvedPickerName =
        pickerName && pickerName !== UNKNOWN_LABEL
          ? pickerName
          : undefined;
      return (
        deviceName ??
        resolvedPickerName ??
        namesBySite?.get(siteId) ??
        siteId
      );
    },
    [deviceRows, namesBySite, selectedDeviceIds, selectedNames]
  );

  const handleRemoveSelected = useCallback(
    (siteId: string) => {
      if (selectedSiteIds.includes(siteId)) {
        handleSiteSelectionChange(selectedSiteIds.filter(id => id !== siteId));
        return;
      }
      // A device-resolved site: drop the devices contributing it.
      const devicesForSite = deviceRows
        .filter(row => row.site_id === siteId)
        .map(row => row.id);
      if (devicesForSite.length > 0) {
        onDeviceSelectionChange(
          selectedDeviceIds.filter(id => !devicesForSite.includes(id))
        );
      }
    },
    [
      deviceRows,
      handleSiteSelectionChange,
      onDeviceSelectionChange,
      selectedDeviceIds,
      selectedSiteIds,
    ]
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([], new Map());
    onDeviceSelectionChange([]);
  }, [onDeviceSelectionChange, onSelectionChange]);

  // Report the friendly device name for each site resolved from a DEVICE
  // selection, so the chart can label its series with device names. Key-
  // guarded so re-renders never loop the parent.
  const lastDeviceNamesKeyRef = useRef('');
  useEffect(() => {
    if (!onDeviceNamesChange) return;
    const namesBySite = new Map<string, string>();
    deviceRows.forEach(row => {
      if (selectedDeviceIds.includes(row.id) && row.site_id) {
        // The last selected device at a site wins (multi-device sites).
        namesBySite.set(row.site_id, row.name);
      }
    });
    const key = Array.from(namesBySite.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, name]) => `${id}=${name}`)
      .join(',');
    if (key === lastDeviceNamesKeyRef.current) return;
    lastDeviceNamesKeyRef.current = key;
    onDeviceNamesChange(namesBySite);
  }, [deviceRows, onDeviceNamesChange, selectedDeviceIds]);

  // Devices without a deployed site can't be matched to chart data â€” hide
  // them from the table (with a note) instead of letting users select rows
  // that would silently do nothing.
  const visibleDeviceRows = useMemo(
    () => deviceRows.filter(row => row.site_id),
    [deviceRows]
  );
  const hiddenDeviceCount = deviceRows.length - visibleDeviceRows.length;

  const hasSelection = mergedSiteIds.length > 0;

  const renderColorCell = useCallback(
    (id: string, label: string, isSelected: boolean) => {
      if (!isSelected) {
        return <span className="text-muted-foreground/50">â€”</span>;
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
              onChange={event => onLocationColorChange?.(id, event.target.value)}
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
      { key: 'location', label: 'Location', sortable: true, cellClassName: 'whitespace-nowrap' },
      ...(hasSelection
        ? [{
            key: 'color',
            label: 'Color',
            render: (_value: unknown, site: { id: string; location: string }) =>
              renderColorCell(String(site.id), site.location, selectedSiteIds.includes(String(site.id))),
            width: '76px',
            cellClassName: 'whitespace-nowrap',
          }]
        : []),
      { key: 'city', label: 'City', sortable: true, cellClassName: 'whitespace-nowrap' },
      { key: 'country', label: 'Country', sortable: true, cellClassName: 'whitespace-nowrap' },
      { key: 'owner', label: 'Owner', sortable: true, cellClassName: 'whitespace-nowrap' },
    ],
    [hasSelection, renderColorCell, selectedSiteIds]
  );

  const deviceColumns = useMemo(
    () => [
      { key: 'name', label: 'Device', sortable: true, cellClassName: 'whitespace-nowrap' },
      ...(hasSelection
        ? [{
            key: 'color',
            label: 'Color',
            render: (_value: unknown, device: { id: string; name: string }) =>
              renderColorCell(String(device.id), device.name, selectedDeviceIds.includes(String(device.id))),
            width: '76px',
            cellClassName: 'whitespace-nowrap',
          }]
        : []),
      { key: 'site', label: 'Deployed site', sortable: true, cellClassName: 'whitespace-nowrap' },
      { key: 'lastData', label: 'Last data', sortable: true, cellClassName: 'whitespace-nowrap' },
    ],
    [hasSelection, renderColorCell, selectedDeviceIds]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Source switcher — wrapped in a card, sized to content */}
      <Card className="w-fit">
        <CardContent className="p-1">
          <SegmentedTabs
            ariaLabel="Selection source"
            options={[
              { value: 'sites', label: 'Sites' },
              { value: 'devices', label: 'Devices' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </CardContent>
      </Card>

      {/* Selected items strip — shows every pick with a real name (device
          name for device picks), color dot and remove, regardless of which
          table page the row is on. */}
      {mergedSiteIds.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Selected ({mergedSiteIds.length})
              {mergedSiteIds.length > maxSelection && (
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
            {mergedSiteIds.map(siteId => {
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

      {/* Table */}
      {tab === 'sites' ? (
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
      ) : (
        <>
          <ServerSideTable
            title="Devices"
            data={visibleDeviceRows}
            columns={deviceColumns}
            multiSelect
            selectedItems={selectedDeviceIds}
            onSelectedItemsChange={handleDeviceSelectionChange}
            loading={devicesData.isLoading}
            isRefreshing={devicesData.isRefreshing}
            error={devicesData.error}
            currentPage={devicesData.currentPage}
            totalPages={devicesData.totalPages}
            pageSize={devicesData.pageSize}
            totalItems={devicesData.totalDevices}
            onPageChange={devicesData.setCurrentPage}
            onPageSizeChange={devicesData.setPageSize}
            searchTerm={devicesData.searchTerm}
            onSearchChange={devicesData.setSearchTerm}
            compactRows
          />
          {hiddenDeviceCount > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {hiddenDeviceCount} device{hiddenDeviceCount === 1 ? '' : 's'}{' '}
              without a deployed site {hiddenDeviceCount === 1 ? 'is' : 'are'}{' '}
              hidden â€” they cannot be matched to chart data.
            </p>
          )}
        </>
      )}

      {tab === 'sites' &&
        !sitesData.isLoading &&
        !sitesData.error &&
        sitesData.sites.length === 0 && (
          <EmptyState
            compact
            title="No sites found"
            description="Try a different search, or check that monitoring sites are assigned."
          />
        )}

      {tab === 'devices' &&
        !devicesData.isLoading &&
        !devicesData.error &&
        deviceRows.length === 0 && (
          <EmptyState
            compact
            title="No devices found"
            description="Try a different search, or check that devices are assigned."
          />
        )}
    </div>
  );
};

export default LocationPickerSection;
