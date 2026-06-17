'use client';
/* eslint-disable simple-import-sort/imports */

import { FiMenu } from 'react-icons/fi';
import { FiLoader } from 'react-icons/fi';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MapLoader } from '@/components/map';
import {
  useNetworkCoverageCountryMonitors,
  useNetworkCoverageImpact,
  useNetworkCoverageMonitor,
  useNetworkCoverageSummary,
} from '@/hooks/useApiHooks';
import NetworkCoverageAddMonitorDialog from './components/NetworkCoverageAddMonitorDialog';
import { useQueryClient } from '@tanstack/react-query';
import { networkCoverageService } from '@/services/apiService';

// Add-to-network dialog is not used — sidebar prompts link directly to Vertex
import NetworkCoverageHeader from './components/NetworkCoverageHeader';
import NetworkCoverageLegend from './components/NetworkCoverageLegend';
import NetworkCoverageMap from './components/NetworkCoverageMap';
import NetworkCoverageSidebar from './components/NetworkCoverageSidebar';
import {
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageMonitor,
  type ViewMode,
  AFRICAN_COUNTRY_LIST,
  normalizeCountryId,
} from './networkCoverageTypes';
import { type ExportData, generatePdf, generateCsv } from './utils/exportUtils';

const DEFAULT_TENANT = 'airqo';

const NetworkCoveragePage = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('monitors');
  const [selectedTypes, setSelectedTypes] = useState<MonitorType[]>([
    'Reference',
    'LCS',
  ]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [showAddMonitorPromptFor, setShowAddMonitorPromptFor] = useState<
    string | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v12',
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [flyToMonitorId, setFlyToMonitorId] = useState<string | null>(null);
  const snapshotGetterRef = useRef<(() => Promise<string | null>) | null>(null);
  const isMountedRef = useRef(true);
  const exportInProgressRef = useRef(false);
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogCountry, setAddDialogCountry] = useState<{
    id: string;
    country?: string;
    iso2?: string;
  } | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setMapStyle(
      viewMode === 'coverage'
        ? 'mapbox://styles/mapbox/light-v11'
        : 'mapbox://styles/mapbox/streets-v12',
    );
  }, [viewMode]);

  // The backend only accepts "Reference" and "LCS" as type values.
  // "Inactive" is a status filter, not a type — extract it and apply client-side.
  const backendTypes = useMemo(
    () => selectedTypes.filter((t) => t !== 'Inactive'),
    [selectedTypes],
  );

  const hasInactive = useMemo(
    () => selectedTypes.includes('Inactive'),
    [selectedTypes],
  );

  const summaryParams = useMemo(
    () => ({
      tenant: DEFAULT_TENANT,
      // Search should only filter the sidebar client-side.
      // Do not include `search` here so the map receives the full dataset.
      activeOnly: activeOnly && !hasInactive ? true : undefined,
      types:
        backendTypes.length === 0 || backendTypes.length === 2
          ? undefined
          : backendTypes.join(','),
      network:
        selectedNetworks.length > 0 ? selectedNetworks.join(',') : undefined,
    }),
    [activeOnly, hasInactive, backendTypes, selectedNetworks],
  );

  const summaryQuery = useNetworkCoverageSummary(summaryParams);

  const impactQuery = useNetworkCoverageImpact({
    tenant: DEFAULT_TENANT,
    activeOnly: activeOnly && !hasInactive ? true : undefined,
    types:
      backendTypes.length === 0 || backendTypes.length === 2
        ? undefined
        : backendTypes.join(','),
    network:
      selectedNetworks.length > 0 ? selectedNetworks.join(',') : undefined,
  });

  const impactData = impactQuery.data?.impact ?? null;

  const countries = useMemo<NetworkCoverageCountry[]>(() => {
    const raw: NetworkCoverageCountry[] =
      summaryQuery.data?.countries ?? ([] as NetworkCoverageCountry[]);
    if (!hasInactive) return raw;
    return raw.map((country: NetworkCoverageCountry) => ({
      ...country,
      monitors: country.monitors.filter(
        (m: NetworkCoverageMonitor) => m.status === 'inactive',
      ),
    }));
  }, [summaryQuery.data, hasInactive]);

  const allCountries = useMemo<NetworkCoverageCountry[]>(() => {
    const normalizeForMatch = (value?: string) => {
      if (!value) return '';
      // Strip parenthetical notes like "(TH)", trim, lower-case and remove leading 'the '
      return value
        .replace(/\([^)]*\)/g, '')
        .replace(/^the\s+/i, '')
        .trim()
        .toLowerCase();
    };

    const apiByIso = new Map(
      countries.map((c) => [c.iso2?.toUpperCase() ?? '', c]),
    );

    const apiByName = new Map(
      countries.map((c) => [normalizeForMatch(c.country), c]),
    );

    return AFRICAN_COUNTRY_LIST.map((item) => {
      const iso = item.iso2.toUpperCase();
      const normalized = normalizeForMatch(item.country);
      const apiCountry = apiByIso.get(iso) || apiByName.get(normalized);
      if (apiCountry) return apiCountry;

      return {
        id: normalizeCountryId(item.country),
        country: item.country,
        iso2: iso,
        monitors: [],
      } as NetworkCoverageCountry;
    });
  }, [countries]);
  const countryMonitorsQuery = useNetworkCoverageCountryMonitors(
    selectedCountryId,
    {
      tenant: DEFAULT_TENANT,
      activeOnly: activeOnly && !hasInactive ? true : undefined,
      types:
        backendTypes.length === 0 || backendTypes.length === 2
          ? undefined
          : backendTypes.join(','),
      network:
        selectedNetworks.length > 0 ? selectedNetworks.join(',') : undefined,
    },
  );

  const selectedCountry = useMemo<NetworkCoverageCountry | null>(() => {
    if (!selectedCountryId) {
      return null;
    }

    if (countryMonitorsQuery.data) {
      let monitors: NetworkCoverageMonitor[] =
        countryMonitorsQuery.data.monitors;
      if (hasInactive) {
        monitors = monitors.filter(
          (m: NetworkCoverageMonitor) => m.status === 'inactive',
        );
      }
      return {
        id: countryMonitorsQuery.data.countryId,
        country: countryMonitorsQuery.data.country,
        iso2: countryMonitorsQuery.data.iso2,
        monitors,
      };
    }

    return null;
  }, [countryMonitorsQuery.data, selectedCountryId, hasInactive]);

  const monitorDetailQuery = useNetworkCoverageMonitor(selectedMonitorId, {
    tenant: DEFAULT_TENANT,
  });

  const selectedMonitor = monitorDetailQuery.data?.monitor ?? null;

  // exportQueryParams removed — CSV export was removed and PDF uses current state directly

  useEffect(() => {
    if (!selectedCountryId) {
      setSelectedMonitorId(null);
      setShowAddMonitorPromptFor(null);
    }
  }, [selectedCountryId]);

  const isSearching = query !== debouncedQuery && query.trim() !== '';

  const resetToOverview = () => {
    setSelectedCountryId(null);
    setSelectedMonitorId(null);
    setShowAddMonitorPromptFor(null);
  };

  const selectCountry = (countryId: string) => {
    const country = allCountries.find((item) => item.id === countryId);
    if (!country) return;

    if (country.monitors.length === 0) {
      // Show the in-sidebar prompt for adding a monitor (no dialog)
      setShowAddMonitorPromptFor(countryId);
      // keep sidebar open so the user sees the prompt
      setIsSidebarOpen(true);
      return;
    }

    setSelectedCountryId(countryId);
    setSelectedMonitorId(null);
    setShowAddMonitorPromptFor(null);
    setViewMode('monitors');
    // Close the sidebar on mobile so the map is revealed; keep it open on larger screens.
    try {
      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 1024;
      setIsSidebarOpen(!isMobile);
    } catch {
      setIsSidebarOpen(true);
    }
  };

  const handleOpenAddMonitor = (
    countryId: string,
    countryName?: string,
    iso2?: string,
  ) => {
    setAddDialogCountry({ id: countryId, country: countryName, iso2 });
    setIsAddDialogOpen(true);
    setIsSidebarOpen(true);
    // Clear any stale empty-country prompt when opening the dialog
    setShowAddMonitorPromptFor(null);
  };

  const selectCountryByIso = (iso2: string) => {
    const country = countries.find((item) => item.iso2 === iso2);
    if (!country) {
      return;
    }
    selectCountry(country.id);
  };

  const selectMonitor = (
    monitorId: string,
    countryId: string,
    fromMap = false,
  ) => {
    setSelectedCountryId(countryId);
    setSelectedMonitorId(monitorId);
    setShowAddMonitorPromptFor(null);
    setViewMode('monitors');

    // If the selection originates from the map, open the sidebar on mobile
    // so users can see details; otherwise (sidebar selection) close the
    // sidebar on small screens to reveal the map.
    try {
      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 1024;
      if (fromMap) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(!isMobile);
      }
    } catch {
      setIsSidebarOpen(true);
    }
  };

  useEffect(() => {
    if (monitorDetailQuery.isSuccess && selectedMonitorId) {
      // Only trigger fly-to after monitor details have loaded so sidebar can show immediately
      setFlyToMonitorId(selectedMonitorId);
      // clear after a short delay to avoid re-triggering unnecessarily
      const t = window.setTimeout(() => setFlyToMonitorId(null), 1200);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [monitorDetailQuery.isSuccess, selectedMonitorId]);

  const availableNetworks = useMemo(
    () => summaryQuery.data?.meta?.availableNetworks ?? [],
    [summaryQuery.data?.meta?.availableNetworks],
  );

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((previous) => {
      if (previous.includes(network)) {
        return previous.filter((item) => item !== network);
      }
      return [...previous, network];
    });
  };

  const toggleType = (type: MonitorType) => {
    setSelectedTypes((previous) => {
      const has = previous.includes(type);
      if (has) {
        if (previous.length === 1) return previous;
        return previous.filter((item) => item !== type);
      }

      // If multiple types are already selected and the user clicks a new
      // type (e.g. "Inactive"), assume they intend to isolate that type
      // and show only it. This makes it easy to view "Inactive only".
      if (previous.length > 1) {
        return [type];
      }

      return [...previous, type];
    });
  };

  const handleAddSaved = async (response: any) => {
    setIsAddDialogOpen(false);

    const createdId = response?.registry?._id || response?.registry?.id;

    // Invalidate coverage queries so UI reflects the added monitor
    queryClient.invalidateQueries({
      predicate: (query) => {
        const k = Array.isArray(query.queryKey)
          ? query.queryKey[0]
          : query.queryKey;
        return (
          k === 'networkCoverageSummary' ||
          k === 'networkCoverageCountryMonitors' ||
          k === 'networkCoverageMonitor'
        );
      },
    });

    try {
      // Ensure queries are refetched before attempting to select the new monitor
      await queryClient.refetchQueries({
        predicate: (query) => {
          const k = Array.isArray(query.queryKey)
            ? query.queryKey[0]
            : query.queryKey;
          return (
            k === 'networkCoverageSummary' ||
            k === 'networkCoverageCountryMonitors' ||
            k === 'networkCoverageMonitor'
          );
        },
      });
    } catch {
      // ignore refetch errors; we'll still attempt to select if possible
    }

    let monitorPresent = false;
    if (createdId && addDialogCountry?.id) {
      try {
        const refreshed =
          await networkCoverageService.getNetworkCoverageCountryMonitors(
            addDialogCountry.id,
            {
              tenant: DEFAULT_TENANT,
            },
          );
        if (refreshed && Array.isArray(refreshed.monitors)) {
          monitorPresent = refreshed.monitors.some(
            (m: any) => m.id === createdId || m._id === createdId,
          );
        }
      } catch {
        // ignore
      }
    }

    if (addDialogCountry?.id) {
      setSelectedCountryId(addDialogCountry.id);
      if (createdId && monitorPresent) setSelectedMonitorId(createdId);
      setIsSidebarOpen(true);
    }

    setAddDialogCountry(null);
  };

  const handleRegisterSnapshot = useCallback(
    (fn: (() => Promise<string | null>) | null) => {
      snapshotGetterRef.current = fn;
    },
    [],
  );

  const buildExportData = useCallback((): ExportData => {
    const scopedCountries =
      selectedCountryId && selectedCountry ? [selectedCountry] : countries;
    const effectiveActiveOnly = activeOnly && !hasInactive;
    // Impact data is global — don't attribute it to a single country or
    // inactive-filtered view where it would be misleading.
    const scopedImpactData =
      selectedCountryId || hasInactive ? null : impactData;

    return {
      countries: scopedCountries,
      impactData: scopedImpactData,
      selectedTypes,
      activeOnly: effectiveActiveOnly,
      selectedNetworks,
      selectedCountryId,
      selectedCountry,
      snapshotGetter: snapshotGetterRef.current,
    };
  }, [
    countries,
    impactData,
    selectedTypes,
    activeOnly,
    hasInactive,
    selectedNetworks,
    selectedCountryId,
    selectedCountry,
  ]);

  const downloadPdf = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      await generatePdf(buildExportData());
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'PDF download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) setIsDownloading(false);
    }
  }, [buildExportData]);

  const downloadCsv = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      await generateCsv(buildExportData());
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'CSV download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) setIsDownloading(false);
    }
  }, [buildExportData]);

  const handleDownload = useCallback(() => {
    downloadPdf();
  }, [downloadPdf]);

  const isInitialLoading = summaryQuery.isLoading && countries.length === 0;
  const isFetchingData =
    summaryQuery.isFetching || countryMonitorsQuery.isFetching;
  const summaryError = summaryQuery.error?.message ?? null;

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100">
      <div className="flex h-full flex-col gap-2 p-2">
        <NetworkCoverageHeader
          onDownload={handleDownload}
          onDownloadCsv={downloadCsv}
          isDownloading={isDownloading}
        />

        <NetworkCoverageAddMonitorDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          initialCountryId={addDialogCountry?.id ?? undefined}
          initialCountryName={addDialogCountry?.country}
          initialCountryIso2={addDialogCountry?.iso2}
          onSaved={handleAddSaved}
        />

        <main className="relative flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
          <div
            className={`absolute inset-0 z-30 bg-black/35 transition-opacity lg:hidden ${
              isSidebarOpen
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />

          <div
            className={`absolute inset-y-0 left-0 z-40 w-[86%] max-w-[380px] transform transition-transform duration-300 lg:relative lg:inset-auto lg:left-auto lg:z-10 lg:h-full lg:w-[350px] lg:max-w-none lg:flex-shrink-0 lg:translate-x-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <NetworkCoverageSidebar
              countries={allCountries}
              query={query}
              searchQuery={debouncedQuery}
              isSearching={isSearching}
              selectedTypes={selectedTypes}
              activeOnly={activeOnly}
              selectedNetworks={selectedNetworks}
              availableNetworks={availableNetworks}
              selectedCountry={selectedCountry}
              selectedMonitor={selectedMonitor}
              showAddMonitorPromptFor={showAddMonitorPromptFor}
              isLoading={isInitialLoading}
              error={summaryError}
              onQueryChange={setQuery}
              onToggleType={toggleType}
              onToggleActiveOnly={() => setActiveOnly((previous) => !previous)}
              onToggleNetwork={toggleNetwork}
              onSelectCountry={selectCountry}
              onSelectMonitor={selectMonitor}
              // sidebar prompt opens our dialog via onOpenAddMonitor
              onOpenAddMonitor={handleOpenAddMonitor}
              onClosePrompt={() => setShowAddMonitorPromptFor(null)}
              onResetToOverview={resetToOverview}
              onRetry={() => summaryQuery.refetch()}
            />
          </div>

          <section className="relative h-full min-h-0 flex-1 overflow-hidden">
            <MapLoader
              loadingComponent={
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <div className="text-blue-600">
                    <FiLoader className="animate-spin" />
                  </div>
                </div>
              }
            >
              <NetworkCoverageMap
                key={mapStyle}
                countries={countries}
                selectedCountryId={selectedCountryId}
                selectedMonitorId={selectedMonitorId}
                viewMode={viewMode}
                mapStyle={mapStyle}
                onCountrySelectByIso={selectCountryByIso}
                onMonitorSelect={selectMonitor}
                onResetView={resetToOverview}
                flyToMonitorId={flyToMonitorId}
                onRegisterSnapshot={handleRegisterSnapshot}
              />
            </MapLoader>
            {/* Show spinner overlay while data is fetching (initial load or filter change) */}
            {isFetchingData && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100/70">
                <div className="text-blue-600">
                  <FiLoader className="animate-spin" />
                </div>
              </div>
            )}
            {/* initial loading handled by MapLoader spinner; remove redundant message */}
            {summaryError && !countries.length ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100/80 px-6">
                <div className="max-w-sm rounded-2xl border border-red-200 bg-white p-5 text-center shadow-lg">
                  <p className="text-base font-semibold text-slate-950">
                    Network coverage failed to load
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{summaryError}</p>
                  <button
                    type="button"
                    onClick={() => summaryQuery.refetch()}
                    className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}
            {downloadError ? (
              <div className="absolute right-4 top-4 z-20 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm">
                {downloadError}
              </div>
            ) : null}
            {isDownloading ? (
              <div className="absolute right-4 top-4 z-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm">
                Preparing download...
              </div>
            ) : null}
            <div className="absolute right-3 top-3 z-20 inline-flex rounded-full border border-slate-300 bg-white p-1 text-xs font-semibold shadow-sm sm:right-4 sm:top-4">
              <button
                type="button"
                onClick={() => setViewMode('monitors')}
                className={`rounded-full px-3 py-1.5 sm:px-4 ${
                  viewMode === 'monitors'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600'
                }`}
              >
                Monitors
              </button>
              <button
                type="button"
                onClick={() => setViewMode('coverage')}
                className={`rounded-full px-3 py-1.5 sm:px-4 ${
                  viewMode === 'coverage'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600'
                }`}
              >
                Coverage
              </button>
            </div>
            <div className="absolute bottom-4 left-4 z-20">
              <NetworkCoverageLegend viewMode={viewMode} />
            </div>
            <div className="absolute left-4 top-3 z-20 sm:top-4">
              <select
                value={mapStyle}
                onChange={(event) => setMapStyle(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
                aria-label="Map style"
              >
                <option value="mapbox://styles/mapbox/light-v11">Light</option>
                <option value="mapbox://styles/mapbox/navigation-day-v1">
                  Navigation Day
                </option>
                <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
                <option value="mapbox://styles/mapbox/streets-v12">
                  Streets
                </option>
              </select>
            </div>
            {/* Mobile map sidebar toggle — absolute and positioned slightly below the style selector */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((previous) => !previous)}
              aria-label="Toggle country sidebar"
              className="lg:hidden absolute left-4 top-12 z-20 grid h-8 w-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default NetworkCoveragePage;
