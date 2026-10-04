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
import { keepPreviousData } from '@tanstack/react-query';
import NetworkCoverageAddMonitorDialog from './components/NetworkCoverageAddMonitorDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

// Add-to-network dialog is not used - sidebar prompts link directly to Vertex
import NetworkCoverageHeader from './components/NetworkCoverageHeader';
import NetworkCoverageLegend from './components/NetworkCoverageLegend';
import NetworkCoverageMap from './components/NetworkCoverageMap';
import NetworkCoverageSidebar from './components/NetworkCoverageSidebar';
import {
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageCountryResponse,
  type NetworkCoverageImpact,
  type NetworkCoverageMonitor,
  type ViewMode,
  AFRICAN_COUNTRY_LIST,
  normalizeCountryId,
} from './networkCoverageTypes';

// Pure helpers (module scope) used to decide whether a /country-monitors
// response actually belongs to the currently-selected country. Keeping them
// outside the component guarantees a stable identity so the `selectedCountry
// memo never recomputes unless its real inputs change.
const normalizeCountryNameMatch = (value?: string): string => {
  if (!value) return '';
  return value
    .replace(/\([^)]*\)/g, '')
    .replace(/^the\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const countryResponseMatchesSelection = (
  data: NetworkCoverageCountryResponse,
  countryId: string | null,
  base: NetworkCoverageCountry | null,
): boolean => {
  if (!countryId || !data) return false;
  if ((data.countryId ?? '').toLowerCase() === countryId.toLowerCase()) {
    return true;
  }
  if (base) {
    const dataIso = (data.iso2 ?? '').toUpperCase();
    const baseIso = (base.iso2 ?? '').toUpperCase();
    if (dataIso && baseIso && dataIso === baseIso) {
      return true;
    }
    const baseName = normalizeCountryNameMatch(base.country);
    if (baseName && normalizeCountryNameMatch(data.country) === baseName) {
      return true;
    }
  }
  return false;
};
import { type ExportData, generatePdf, generateCsv } from './utils/exportUtils';

const DEFAULT_TENANT = 'airqo';

// Constant params for summary, impact, and country-monitors queries. All
// monitor/status/network filtering is now done client-side on the already-
// fetched full dataset, so these params never change and toggling filters
// triggers ZERO new API requests (the query keys stay identical).
const COVERAGE_QUERY_PARAMS = { tenant: DEFAULT_TENANT } as const;

const NetworkCoveragePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Initialize selection state from URL deep links (?country &monitor &view).
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    () => searchParams.get('country'),
  );
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(
    () => searchParams.get('monitor'),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (searchParams.get('view') as ViewMode) || 'monitors',
  );

  // Impact data is only consumed by the export action. Keep it off the
  // critical load path so the initial page render never requests /impact.
  const [hasRequestedExport, setHasRequestedExport] = useState(false);
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
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [flyToMonitorId, setFlyToMonitorId] = useState<string | null>(null);
  const snapshotGetterRef = useRef<
    | ((options: {
        scope: 'country' | 'africa';
        countryId?: string | null;
      }) => Promise<string | null>)
    | null
  >(null);
  const isMountedRef = useRef(true);
  const exportInProgressRef = useRef(false);
  const queryClient = useQueryClient();
  const sidebarToggleRef = useRef<HTMLButtonElement | null>(null);

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
  // "Inactive" is a status filter, not a type - extract it and apply client-side.
  const backendTypes = useMemo(
    () => selectedTypes.filter((t) => t !== 'Inactive'),
    [selectedTypes],
  );

  const hasInactive = useMemo(
    () => selectedTypes.includes('Inactive'),
    [selectedTypes],
  );

  // Whether a client-side DATA filter narrows the visible monitors (status,
  // single type, or network selection). Search is NOT part of this: it is a
  // sidebar-only text filter that never affects exports. When true, global
  // /impact data would be misleading, so exports skip the fetch entirely.
  const hasDataFilter = useMemo(
    () =>
      hasInactive ||
      activeOnly ||
      backendTypes.length === 1 ||
      selectedNetworks.length >= 1,
    [hasInactive, activeOnly, backendTypes, selectedNetworks],
  );

  // Client-side monitor filter applied to every country's monitors array.
  // Replaces the old server-side params (activeOnly / types / network) so the
  // API always returns the full dataset and filtering never refetches.
  const filterMonitors = useCallback(
    (monitors: NetworkCoverageMonitor[]): NetworkCoverageMonitor[] => {
      let result = monitors;
      if (hasInactive) {
        result = result.filter((m) => m.status === 'inactive');
      } else if (activeOnly) {
        result = result.filter((m) => m.status === 'active');
      }
      if (backendTypes.length === 1) {
        result = result.filter((m) => m.type === backendTypes[0]);
      }
      if (selectedNetworks.length >= 1) {
        const allowed = new Set(selectedNetworks.map((n) => n.toLowerCase()));
        result = result.filter(
          (m) => m.network && allowed.has(m.network.toLowerCase()),
        );
      }
      return result;
    },
    [hasInactive, activeOnly, backendTypes, selectedNetworks],
  );

  const summaryQuery = useNetworkCoverageSummary(COVERAGE_QUERY_PARAMS, {
    retry: 1,
  });

  const impactQuery = useNetworkCoverageImpact(COVERAGE_QUERY_PARAMS, {
    enabled: hasRequestedExport,
  });

  const impactData = impactQuery.data?.impact ?? null;

  const countries = useMemo<NetworkCoverageCountry[]>(() => {
    const raw: NetworkCoverageCountry[] =
      summaryQuery.data?.countries ?? ([] as NetworkCoverageCountry[]);
    return raw.map((country: NetworkCoverageCountry) => ({
      ...country,
      monitors: filterMonitors(country.monitors),
    }));
  }, [summaryQuery.data, filterMonitors]);

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

  // Immediate, always-available baseline for the selected country so the
  // sidebar header can show the country name the instant it is picked,
  // even before the detailed monitors request resolves.
  const selectedCountryBase = useMemo<NetworkCoverageCountry | null>(() => {
    if (!selectedCountryId) return null;
    return allCountries.find((c) => c.id === selectedCountryId) ?? null;
  }, [allCountries, selectedCountryId]);

  const countryMonitorsQuery = useNetworkCoverageCountryMonitors(
    selectedCountryId,
    COVERAGE_QUERY_PARAMS,
    { placeholderData: keepPreviousData, retry: 1 },
  );

  // Turns a /country-monitors response into the render/Export country object.
  // Extracted so both the `selectedCountry` memo and the export flow apply the
  // same inactive + multi-network filters and stats merge.
  const resolveCountryFromMonitorsResponse = useCallback(
    (data: NetworkCoverageCountryResponse): NetworkCoverageCountry => {
      const monitors = filterMonitors(data.monitors);
      // Pull stats from the summary's country list so the sidebar can
      // render counts directly from the API instead of reducing monitors.
      const summaryCountry = summaryQuery.data?.countries?.find(
        (c: NetworkCoverageCountry) => c.id === data.countryId,
      );
      return {
        id: data.countryId,
        country: data.country,
        iso2: data.iso2,
        stats: summaryCountry?.stats,
        monitors,
      };
    },
    [filterMonitors, summaryQuery.data?.countries],
  );

  // With `keepPreviousData`, `countryMonitorsQuery.data` is the PREVIOUS
  // country's response while a new selection is in flight. Only trust it once
  // it actually matches the current selection; otherwise return null so the
  // sidebar shows a loading state instead of stale details.
  const selectedCountry = useMemo<NetworkCoverageCountry | null>(() => {
    if (!selectedCountryId) {
      return null;
    }

    if (
      countryMonitorsQuery.data &&
      countryResponseMatchesSelection(
        countryMonitorsQuery.data,
        selectedCountryId,
        selectedCountryBase,
      )
    ) {
      return resolveCountryFromMonitorsResponse(countryMonitorsQuery.data);
    }

    return null;
  }, [
    countryMonitorsQuery.data,
    selectedCountryId,
    selectedCountryBase,
    resolveCountryFromMonitorsResponse,
  ]);

  // Country-scoped loading/error: true only when a country is selected but its
  // detailed monitors have not yet resolved to a matching response.
  const isCountryLoading =
    !!selectedCountryId &&
    !selectedCountry &&
    (countryMonitorsQuery.isLoading || countryMonitorsQuery.isFetching);
  const countryError =
    !!selectedCountryId &&
    !selectedCountry &&
    countryMonitorsQuery.error !== null
      ? (countryMonitorsQuery.error?.message ??
        'Failed to load country monitors')
      : null;
  const monitorDetailQuery = useNetworkCoverageMonitor(
    selectedMonitorId,
    { tenant: DEFAULT_TENANT },
    { retry: 1 },
  );

  const selectedMonitor = monitorDetailQuery.data?.monitor ?? null;

  // exportQueryParams removed - CSV export was removed and PDF uses current state directly

  useEffect(() => {
    if (!selectedCountryId) {
      setSelectedMonitorId(null);
      setShowAddMonitorPromptFor(null);
    }
  }, [selectedCountryId]);

  // Mirror selection state into the URL for shareable deep links.
  // Uses replace semantics (no new history entries) and scroll:false.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCountryId) params.set('country', selectedCountryId);
    else params.delete('country');
    if (selectedMonitorId) params.set('monitor', selectedMonitorId);
    else params.delete('monitor');
    if (viewMode && viewMode !== 'monitors') params.set('view', viewMode);
    else params.delete('view');

    const qs = params.toString();
    const target = qs ? `?${qs}` : '';
    const current = searchParams.toString();
    if ((current ? `?${current}` : '') === target) return;

    router.replace(`${window.location.pathname}${target}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId, selectedMonitorId, viewMode]);

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
    // Keep the sidebar open on every viewport so the selected-country view
    // (which contains the "Add device" action) stays visible on mobile.
    setIsSidebarOpen(true);
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
        // Inactive and Active only are mutually exclusive.
        if (type === 'Inactive') setActiveOnly(false);
        return [type];
      }

      if (type === 'Inactive') setActiveOnly(false);
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

    if (addDialogCountry?.id) {
      setSelectedCountryId(addDialogCountry.id);
      if (createdId) setSelectedMonitorId(createdId);
      setIsSidebarOpen(true);
    }

    setAddDialogCountry(null);
  };

  const handleRegisterSnapshot = useCallback(
    (
      fn:
        | ((options: {
            scope: 'country' | 'africa';
            countryId?: string | null;
          }) => Promise<string | null>)
        | null,
    ) => {
      snapshotGetterRef.current = fn;
    },
    [],
  );

  const buildExportData = useCallback(
    ({
      impactOverride,
      countryOverride,
      forceAllCountries = false,
    }: {
      impactOverride?: NetworkCoverageImpact | null;
      countryOverride?: NetworkCoverageCountry | null;
      forceAllCountries?: boolean;
    } = {}): ExportData => {
      // When the caller already resolved the export country (e.g. after awaiting
      // `resolveCountryForExport`), prefer it so a country-scoped export never
      // silently falls back to all countries while data is still loading.
      // `forceAllCountries` (full report) ignores any country scope entirely.
      const exportCountry = forceAllCountries
        ? null
        : countryOverride !== undefined
          ? countryOverride
          : selectedCountry;
      const scopedCountries =
        !forceAllCountries && selectedCountryId && exportCountry
          ? [exportCountry]
          : countries;
      const effectiveActiveOnly = activeOnly && !hasInactive;
      // A fresh refetch result (impactOverride) wins over the render-scoped
      // `impactData`, which is stale before the component re-renders.
      const effectiveImpact =
        impactOverride !== undefined ? impactOverride : impactData;
      // Impact data is global - don't attribute it to a filtered view where it
      // would be misleading. Any data filter (country or any client-side data
      // filter) nulls it out. This applies to both the scoped and forced
      // all-countries export paths.
      const dataFilterActive = selectedCountryId || hasDataFilter;
      const scopedImpactData = dataFilterActive ? null : effectiveImpact;

      return {
        countries: scopedCountries,
        impactData: scopedImpactData,
        selectedTypes,
        activeOnly: effectiveActiveOnly,
        selectedNetworks,
        selectedCountryId: forceAllCountries ? null : selectedCountryId,
        selectedCountry: exportCountry,
        snapshotGetter: snapshotGetterRef.current,
      };
    },
    [
      countries,
      impactData,
      selectedTypes,
      activeOnly,
      hasInactive,
      hasDataFilter,
      selectedNetworks,
      selectedCountryId,
      selectedCountry,
    ],
  );

  // Resolves the country object that a country-scoped export should use.
  // Returns null when nothing is selected, the already-resolved country when
  // available, otherwise refetches the selection and resolves it, falling back
  // to the immediate `selectedCountryBase` so the export is never "all
  // countries" when a country is selected.
  const resolveCountryForExport =
    useCallback(async (): Promise<NetworkCoverageCountry | null> => {
      if (!selectedCountryId) return null;
      if (selectedCountry) return selectedCountry;
      try {
        const result = await countryMonitorsQuery.refetch();
        if (
          result.data &&
          countryResponseMatchesSelection(
            result.data,
            selectedCountryId,
            selectedCountryBase,
          )
        ) {
          return resolveCountryFromMonitorsResponse(result.data);
        }
      } catch {
        // Fall through to the base fallback below.
      }
      return selectedCountryBase;
    }, [
      selectedCountryId,
      selectedCountry,
      selectedCountryBase,
      countryMonitorsQuery,
      resolveCountryFromMonitorsResponse,
    ]);

  const downloadPdf = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      // Resolve the export country first so a country-scoped export is never
      // silently "all countries" while the selection is still loading.
      const exportCountry = await resolveCountryForExport();

      let impactOverride: NetworkCoverageImpact | null | undefined;
      if (selectedCountryId || hasDataFilter) {
        // Country-scoped or data-filtered: impact is global and would be
        // misleading. The export nulls it out, so don't fetch /impact at all.
        impactOverride = null;
      } else {
        // "All countries" scope: impact data is only needed for the export;
        // fetch it lazily now. The refetch result wins over the render-scoped
        // `impactData` (stale before re-render).
        if (isMountedRef.current) setIsLoadingImpact(true);
        setHasRequestedExport(true);
        const result = await impactQuery.refetch();
        impactOverride = result.data?.impact ?? null;
      }

      await generatePdf(
        buildExportData({ impactOverride, countryOverride: exportCountry }),
      );
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'PDF download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) {
        setIsDownloading(false);
        setIsLoadingImpact(false);
      }
    }
  }, [
    buildExportData,
    hasDataFilter,
    impactQuery,
    resolveCountryForExport,
    selectedCountryId,
  ]);

  const downloadCsv = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      // Resolve the export country first so a country-scoped export is never
      // silently "all countries" while the selection is still loading.
      const exportCountry = await resolveCountryForExport();

      let impactOverride: NetworkCoverageImpact | null | undefined;
      if (selectedCountryId || hasDataFilter) {
        // Country-scoped or data-filtered: impact is global and would be
        // misleading. The export nulls it out, so don't fetch /impact at all.
        impactOverride = null;
      } else {
        // "All countries" scope: impact data is only needed for the export;
        // fetch it lazily now. The refetch result wins over the render-scoped
        // `impactData` (stale before re-render).
        if (isMountedRef.current) setIsLoadingImpact(true);
        setHasRequestedExport(true);
        const result = await impactQuery.refetch();
        impactOverride = result.data?.impact ?? null;
      }

      await generateCsv(
        buildExportData({ impactOverride, countryOverride: exportCountry }),
      );
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'CSV download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) {
        setIsDownloading(false);
        setIsLoadingImpact(false);
      }
    }
  }, [
    buildExportData,
    hasDataFilter,
    impactQuery,
    resolveCountryForExport,
    selectedCountryId,
  ]);

  const handleDownload = useCallback(() => {
    downloadPdf();
  }, [downloadPdf]);

  // Full-report ("All countries") exports, offered alongside the
  // country-scoped menu items. They deliberately skip
  // `resolveCountryForExport()`: the scope is forced to every country, so a
  // pending/loaded country selection must not shrink the report.
  const downloadPdfAllCountries = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      let impactOverride: NetworkCoverageImpact | null;
      if (hasDataFilter) {
        // A client-side data filter is active: impact is global and the
        // export nulls it out anyway, so don't touch the impact query.
        impactOverride = null;
      } else {
        // All-countries scope always needs impact data; fetch it lazily now.
        // The refetch result wins over the render-scoped `impactData` (stale
        // before re-render).
        if (isMountedRef.current) setIsLoadingImpact(true);
        setHasRequestedExport(true);
        const result = await impactQuery.refetch();
        impactOverride = result.data?.impact ?? null;
      }

      await generatePdf(
        buildExportData({
          impactOverride,
          countryOverride: null,
          forceAllCountries: true,
        }),
      );
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'PDF download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) {
        setIsDownloading(false);
        setIsLoadingImpact(false);
      }
    }
  }, [buildExportData, hasDataFilter, impactQuery]);

  const downloadCsvAllCountries = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }
    try {
      let impactOverride: NetworkCoverageImpact | null;
      if (hasDataFilter) {
        // A client-side data filter is active: impact is global and the
        // export nulls it out anyway, so don't touch the impact query.
        impactOverride = null;
      } else {
        // All-countries scope always needs impact data; fetch it lazily now.
        // The refetch result wins over the render-scoped `impactData` (stale
        // before re-render).
        if (isMountedRef.current) setIsLoadingImpact(true);
        setHasRequestedExport(true);
        const result = await impactQuery.refetch();
        impactOverride = result.data?.impact ?? null;
      }

      await generateCsv(
        buildExportData({
          impactOverride,
          countryOverride: null,
          forceAllCountries: true,
        }),
      );
    } catch (error) {
      if (isMountedRef.current) {
        setDownloadError(
          error instanceof Error ? error.message : 'CSV download failed',
        );
      }
    } finally {
      exportInProgressRef.current = false;
      if (isMountedRef.current) {
        setIsDownloading(false);
        setIsLoadingImpact(false);
      }
    }
  }, [buildExportData, hasDataFilter, impactQuery]);

  // Determine whether a client-side-only filter is active (search query or
  // any data filter). When any of these is active the header stats are hidden
  // because the API meta is not filter-aware.
  const hasClientOnlyFilter = useMemo(
    () => (debouncedQuery && debouncedQuery.trim() !== '') || hasDataFilter,
    [debouncedQuery, hasDataFilter],
  );

  // Header stats are derived entirely from the API meta. They are hidden
  // (undefined) when a client-only filter is active.
  const headerStats = useMemo(() => {
    if (hasClientOnlyFilter) return undefined;
    const meta = summaryQuery.data?.meta;
    if (!meta) return undefined;
    return {
      monitors: meta.totalMonitors ?? 0,
      countries: meta.monitoredCountries,
      cities: meta.totalCities ?? 0,
    };
  }, [hasClientOnlyFilter, summaryQuery.data?.meta]);

  const isInitialLoading = summaryQuery.isLoading && countries.length === 0;
  const isFetchingData =
    summaryQuery.isFetching || countryMonitorsQuery.isFetching;
  const summaryError = summaryQuery.error?.message ?? null;

  // Human-readable export scope for the header download menu ("All countries"
  // or the selected country's name).
  const exportScopeLabel = selectedCountryId
    ? (selectedCountry?.country ??
      selectedCountryBase?.country ??
      'Selected country')
    : 'All countries';

  return (
    <div className="h-screen w-full overflow-hidden bg-slate-100 supports-[height:100dvh]:h-[100dvh]">
      <div className="flex h-full flex-col gap-2 p-2">
        <NetworkCoverageHeader
          onDownload={handleDownload}
          onDownloadCsv={downloadCsv}
          onDownloadAll={downloadPdfAllCountries}
          onDownloadAllCsv={downloadCsvAllCountries}
          isCountryScoped={!!selectedCountryId}
          isDownloading={isDownloading}
          stats={headerStats}
          scopeLabel={exportScopeLabel}
          dimmed={
            summaryQuery.isFetching &&
            summaryQuery.isSuccess &&
            !!summaryQuery.data
          }
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
          <button
            type="button"
            aria-label="Close countries panel"
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
              selectedCountry={selectedCountry ?? selectedCountryBase}
              monitoredCountriesTotal={
                summaryQuery.data?.meta?.monitoredCountries
              }
              selectedMonitor={selectedMonitor}
              showAddMonitorPromptFor={showAddMonitorPromptFor}
              isLoading={isInitialLoading}
              error={summaryError}
              onQueryChange={setQuery}
              onToggleType={toggleType}
              onToggleActiveOnly={() => {
                setActiveOnly((previous) => {
                  if (!previous) {
                    // Turning on Active only → clear the Inactive chip
                    setSelectedTypes((types) =>
                      types.filter((t) => t !== 'Inactive'),
                    );
                  }
                  return !previous;
                });
              }}
              onToggleNetwork={toggleNetwork}
              onSelectCountry={selectCountry}
              onSelectMonitor={selectMonitor}
              // sidebar prompt opens our dialog via onOpenAddMonitor
              onOpenAddMonitor={handleOpenAddMonitor}
              onClosePrompt={() => setShowAddMonitorPromptFor(null)}
              onResetToOverview={resetToOverview}
              onRetry={() => summaryQuery.refetch()}
              onRetryCountry={() => countryMonitorsQuery.refetch()}
              isCountryLoading={isCountryLoading}
              countryError={countryError}
              // Monitor-detail loading: only while a single monitor's details
              // are being fetched (independent of country loading).
              monitorLoading={
                !!selectedMonitorId && monitorDetailQuery.isLoading
              }
              isSummaryLoading={summaryQuery.isLoading}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              toggleButtonRef={sidebarToggleRef}
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
            {/* Blocking overlay only while the summary has never resolved yet */}
            {isInitialLoading && (
              <div
                className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100/70"
                role="status"
              >
                <div className="flex items-center gap-2 text-blue-600">
                  <FiLoader className="animate-spin" />
                  <span className="sr-only">Loading network coverage data</span>
                </div>
              </div>
            )}
            {/* Non-blocking "updating" pill for background refetches */}
            {isFetchingData && !isInitialLoading && (
              <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <FiLoader className="animate-spin text-blue-600" />
                  Updating…
                </span>
              </div>
            )}
            {/* initial loading handled by MapLoader spinner; remove redundant message */}
            {summaryError && !countries.length ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100/80 px-6">
                <div className="max-w-sm rounded-xl border border-red-200 bg-white p-5 text-center shadow-lg">
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
              <div
                role="alert"
                className="absolute right-4 top-4 z-20 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow-sm"
              >
                {downloadError}
              </div>
            ) : null}
            {isDownloading ? (
              <div
                role="status"
                aria-live="polite"
                className="absolute right-4 top-4 z-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm"
              >
                {isLoadingImpact
                  ? 'Loading impact data…'
                  : 'Preparing download…'}
              </div>
            ) : null}
            <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold shadow-md">
                <button
                  type="button"
                  onClick={() => setViewMode('monitors')}
                  className={`rounded-md px-3 py-1.5 sm:px-4 ${
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
                  className={`rounded-md px-3 py-1.5 sm:px-4 ${
                    viewMode === 'coverage'
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600'
                  }`}
                >
                  Coverage
                </button>
              </div>
              <select
                value={mapStyle}
                onChange={(event) => setMapStyle(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-md"
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
            <div className="absolute bottom-4 left-4 z-20">
              <NetworkCoverageLegend viewMode={viewMode} />
            </div>
            {/* Mobile map sidebar toggle - absolute on the left edge below the stats strip */}
            <button
              ref={sidebarToggleRef}
              type="button"
              onClick={() => setIsSidebarOpen((previous) => !previous)}
              aria-label="Toggle country sidebar"
              aria-expanded={isSidebarOpen}
              className="lg:hidden absolute left-4 top-12 z-20 grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
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
