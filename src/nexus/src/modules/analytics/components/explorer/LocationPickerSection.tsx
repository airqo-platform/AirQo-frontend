'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqXClose } from '@airqo/icons-react';
import {
  useSitesForSelection,
  useDevicesForSelection,
} from '../../hooks/useCohortSelection';
import type { NormalizedDeviceData } from '@/shared/utils/deviceUtils';

interface LocationPickerSectionProps {
  /** Organization group id; empty in the user flow (uses the active group) */
  groupId?: string;
  /** Fully controlled selection — the parent is the single source of truth */
  selectedSiteIds: string[];
  onSelectionChange: (siteIds: string[], names: Map<string, string>) => void;
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
  maxSelection = MAX_SELECTION_DEFAULT,
  className,
}) => {
  const [tab, setTab] = useState<PickerTab>('sites');
  const [selectedDeviceIdsLocal, setSelectedDeviceIdsLocal] = useState<
    string[]
  >([]);

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
      if (selectedDeviceIdsLocal.includes(row.id) && row.site_id) {
        map.set(row.site_id, row.site);
      }
    });
    return map;
  }, [deviceRows, selectedDeviceIdsLocal]);

  const mergedSiteIds = useMemo(
    () =>
      Array.from(
        new Set(selectedSiteIds.concat(Array.from(deviceResolvedSites.keys())))
      ),
    [selectedSiteIds, deviceResolvedSites]
  );

  const isOverLimit = mergedSiteIds.length > maxSelection;

  // Keep previously-known display names for selected sites that aren't on
  // the current page, so the parent's names map never regresses to a label.
  const knownNamesRef = useRef<Map<string, string>>(new Map());

  // Push the merged selection up only when it actually changed. The parent
  // mirrors it straight back down through `selectedSiteIds`, so an
  // unconditional push would loop forever.
  const lastPushedKeyRef = useRef('');
  useEffect(() => {
    const names = new Map<string, string>(selectedNames);
    deviceResolvedSites.forEach((name, siteId) => names.set(siteId, name));
    // Fill gaps with previously known names (off-page selections)
    selectedNames.forEach((name, id) => {
      if (name === UNKNOWN_LABEL && knownNamesRef.current.has(id)) {
        names.set(id, knownNamesRef.current.get(id) as string);
      }
    });
    // Remember real names for future pushes
    names.forEach((name, id) => {
      if (name !== UNKNOWN_LABEL) knownNamesRef.current.set(id, name);
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
    // Never propagate a selection over the configured cap — the user sees an
    // inline warning instead of silently saving an oversized chart scope.
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
        names.set(id, site?.location ?? UNKNOWN_LABEL);
      });
      onSelectionChange(nextIds, names);
    },
    [onSelectionChange, sitesData.sites]
  );

  const handleDeviceSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      setSelectedDeviceIdsLocal(ids.map(String));
    },
    []
  );

  const handleRemove = (siteId: string) => {
    if (selectedSiteIds.includes(siteId)) {
      handleSiteSelectionChange(selectedSiteIds.filter(id => id !== siteId));
      return;
    }
    // A device-resolved site: drop the device(s) contributing it
    setSelectedDeviceIdsLocal(prev =>
      prev.filter(id => {
        const device = deviceRows.find(d => d.id === id);
        return device?.site_id !== siteId;
      })
    );
  };

  const handleClear = () => {
    onSelectionChange([], new Map());
    setSelectedDeviceIdsLocal([]);
  };

  const siteColumns = useMemo(
    () => [
      { key: 'location', label: 'Location', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'country', label: 'Country', sortable: true },
      { key: 'owner', label: 'Owner', sortable: true },
    ],
    []
  );

  const deviceColumns = useMemo(
    () => [
      { key: 'name', label: 'Device', sortable: true },
      { key: 'site', label: 'Deployed site', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'lastData', label: 'Last data', sortable: true },
    ],
    []
  );

  const chipNames = useMemo(() => {
    const names = new Map<string, string>(selectedNames);
    deviceResolvedSites.forEach((name, siteId) => names.set(siteId, name));
    return names;
  }, [selectedNames, deviceResolvedSites]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Source switcher */}
      <SegmentedTabs
        ariaLabel="Selection source"
        options={[
          { value: 'sites', label: 'Sites' },
          { value: 'devices', label: 'Devices' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* Inline selection summary */}
      <div className="rounded-md border border-border bg-muted/40 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Selected ({mergedSiteIds.length})
            {isOverLimit && (
              <span className="ml-2 text-destructive">
                — max {maxSelection}
              </span>
            )}
          </span>
          {mergedSiteIds.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
        {mergedSiteIds.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mergedSiteIds.map(siteId => (
              <span
                key={siteId}
                className="inline-flex items-center gap-1 rounded-full bg-background border border-border px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {chipNames.get(siteId) ?? UNKNOWN_LABEL}
                <button
                  type="button"
                  onClick={() => handleRemove(siteId)}
                  aria-label={`Remove ${chipNames.get(siteId) ?? UNKNOWN_LABEL}`}
                  className="rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <AqXClose className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            No locations selected yet — pick sites or devices below.
          </p>
        )}
      </div>

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
        />
      ) : (
        <ServerSideTable
          title="Devices"
          data={deviceRows}
          columns={deviceColumns}
          multiSelect
          selectedItems={selectedDeviceIdsLocal}
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
        />
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
