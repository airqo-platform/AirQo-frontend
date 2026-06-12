'use client';
/* eslint-disable simple-import-sort/imports */

import { FiMenu } from 'react-icons/fi';
import { FiLoader } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const DEFAULT_TENANT = 'airqo';

// CSV download removed; blob helper not required here

const formatPdfDateTime = (value?: string) => {
  if (!value) {
    return '--';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '--';
  }
};

// formatCoordinates helper is implemented in sidebar/map components where needed

// buildPdfRow removed — report now summarizes monitors instead of listing them all

const buildPdfFileName = (scope: string) => {
  const dateSuffix = new Date().toISOString().split('T')[0];
  const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `network-coverage-${normalizedScope}-${dateSuffix}.pdf`;
};

const displayText = (value?: string | null) =>
  value && value.trim() ? value : '--';

const formatNetworkName = (value?: string | null) => {
  if (!value || !value.trim()) return '--';
  const trimmed = value.trim();
  return trimmed.toLowerCase() === 'airqo' ? 'AirQo' : trimmed;
};

const captureWithTimeout = async <T,>(
  factory: () => Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  let timeoutId: number | undefined;

  try {
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = window.setTimeout(() => resolve(fallback), timeoutMs);
    });

    return await Promise.race([
      Promise.resolve()
        .then(factory)
        .catch(() => fallback),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

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

  const summaryParams = useMemo(
    () => ({
      tenant: DEFAULT_TENANT,
      // Search should only filter the sidebar client-side.
      // Do not include `search` here so the map receives the full dataset.
      activeOnly: activeOnly ? true : undefined,
      types: selectedTypes.length === 3 ? undefined : selectedTypes.join(','),
    }),
    [activeOnly, selectedTypes],
  );

  const summaryQuery = useNetworkCoverageSummary(summaryParams);

  const countries = useMemo<NetworkCoverageCountry[]>(
    () => summaryQuery.data?.countries ?? [],
    [summaryQuery.data],
  );

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
      activeOnly: activeOnly ? true : undefined,
      types: selectedTypes.length === 3 ? undefined : selectedTypes.join(','),
    },
  );

  const selectedCountry = useMemo<NetworkCoverageCountry | null>(() => {
    if (!selectedCountryId) {
      return null;
    }

    if (countryMonitorsQuery.data) {
      return {
        id: countryMonitorsQuery.data.countryId,
        country: countryMonitorsQuery.data.country,
        iso2: countryMonitorsQuery.data.iso2,
        monitors: countryMonitorsQuery.data.monitors,
      };
    }

    return null;
  }, [countryMonitorsQuery.data, selectedCountryId]);

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

  const mapCountries = useMemo(() => {
    if (selectedNetworks.length === 0) return countries;
    return countries.map((country) => ({
      ...country,
      monitors: country.monitors.filter((monitor) =>
        selectedNetworks.includes(monitor.network || ''),
      ),
    }));
  }, [countries, selectedNetworks]);

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

  const availableNetworks = useMemo(() => {
    const networkSet = new Set<string>();
    allCountries.forEach((country) => {
      country.monitors.forEach((monitor) => {
        const network = (monitor.network || '').trim();
        if (network) networkSet.add(network);
      });
    });
    return Array.from(networkSet).sort((a, b) => a.localeCompare(b));
  }, [allCountries]);

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

  const resolveExportCountries = async (): Promise<
    NetworkCoverageCountry[]
  > => {
    const filterByNetwork = (monitors: NetworkCoverageMonitor[]) => {
      if (selectedNetworks.length === 0) return monitors;
      return monitors.filter((m) => selectedNetworks.includes(m.network || ''));
    };

    if (!selectedCountryId) {
      return countries.map((country) => ({
        ...country,
        monitors: filterByNetwork(country.monitors),
      }));
    }

    if (selectedCountry) {
      return [
        {
          ...selectedCountry,
          monitors: filterByNetwork(selectedCountry.monitors),
        },
      ];
    }

    const response =
      await networkCoverageService.getNetworkCoverageCountryMonitors(
        selectedCountryId,
        {
          tenant: DEFAULT_TENANT,
          activeOnly: activeOnly ? true : undefined,
          types:
            selectedTypes.length === 3 ? undefined : selectedTypes.join(','),
        },
      );

    return [
      {
        id: response.countryId || selectedCountryId,
        country: response.country,
        iso2: response.iso2,
        monitors: filterByNetwork(response.monitors),
      },
    ];
  };

  const handleRegisterSnapshot = useCallback(
    (fn: (() => Promise<string | null>) | null) => {
      snapshotGetterRef.current = fn;
    },
    [],
  );

  const getTypeLabel = (type: string) => {
    if (!type) return type;
    if (type === 'LCS') return 'Low-Cost Sensor (LCS)';
    if (type === 'Reference') return 'Reference Monitor';
    return type;
  };

  const downloadPdf = async () => {
    if (exportInProgressRef.current) {
      return;
    }

    exportInProgressRef.current = true;
    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }

    try {
      const exportCountries = await resolveExportCountries();

      const isSingleCountry = !!selectedCountryId && exportCountries.length === 1;
      const selectedCountryObj = isSingleCountry ? exportCountries[0] : null;
      const countryName = selectedCountryObj?.country ?? null;

      const scopeText = countryName
        ? countryName
        : 'All monitored countries';
      const scopeLabel = countryName
        ? countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'all-countries';

      // Build a descriptive subtitle that reflects active filters
      const filterParts: string[] = [];
      if (selectedTypes.length < 3) {
        filterParts.push(selectedTypes.map(getTypeLabel).join(', '));
      }
      if (activeOnly) {
        filterParts.push('Active only');
      }
      if (selectedNetworks.length > 0) {
        filterParts.push(
          `Source${selectedNetworks.length === 1 ? '' : 's'}: ${selectedNetworks.map((n) => formatNetworkName(n)).join(', ')}`,
        );
      }
      const filterSummary = filterParts.join(' · ');

      const totalMonitors = exportCountries.reduce(
        (sum, country) => sum + country.monitors.length,
        0,
      );
      const countriesWithMonitors = exportCountries.filter(
        (country) => country.monitors.length > 0,
      );
      const countrySummaryRows = exportCountries.map((country) => [
        country.country,
        country.iso2 || '--',
        String(country.monitors.length),
        String(
          country.monitors.filter((monitor) => monitor.status === 'active')
            .length,
        ),
      ]);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const PAGE_W = 297; // A4 landscape
      const PAGE_H = 210;
      const MARGIN = 14;
      const CONTENT_W = PAGE_W - MARGIN * 2; // 269 mm
      const HEADER_H = 18;
      const FOOTER_Y = PAGE_H - 8;

      // ── Document metadata ────────────────────────────────────────────────
      doc.setProperties({
        title: countryName
          ? `Air Quality Monitoring Landscape — ${countryName} Report`
          : 'Air Quality Monitoring Landscape in Africa Report',
        subject: `Air quality monitoring landscape export — ${scopeText}`,
        author: 'Africa Air Quality Monitoring Network',
      });

      // ── Dark navy header banner ──────────────────────────────────────────
      const NAVY: [number, number, number] = [12, 28, 90];

      const formatExportCoordinates = (monitor: {
        latitude: number | null;
        longitude: number | null;
      }) => {
        if (
          typeof monitor.latitude !== 'number' ||
          typeof monitor.longitude !== 'number'
        ) {
          return '--';
        }

        if (
          !Number.isFinite(monitor.latitude) ||
          !Number.isFinite(monitor.longitude)
        ) {
          return '--';
        }

        const latitude = `${Math.abs(monitor.latitude).toFixed(4)}°${monitor.latitude < 0 ? 'S' : 'N'}`;
        const longitude = `${Math.abs(monitor.longitude).toFixed(4)}°${monitor.longitude < 0 ? 'W' : 'E'}`;
        return `${latitude}, ${longitude}`;
      };

      const drawFooter = () => {
        const currentPage =
          (doc as any).getCurrentPageInfo?.().pageNumber ??
          doc.getNumberOfPages();
        doc.setDrawColor(180, 185, 210);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, FOOTER_Y - 2, PAGE_W - MARGIN, FOOTER_Y - 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120, 130, 160);
        doc.text('AirQo Network Coverage', MARGIN, FOOTER_Y);
        doc.text(`Page ${currentPage}`, PAGE_W - MARGIN, FOOTER_Y, {
          align: 'right',
        });
      };

      const drawHeader = (titleText: string, subtitleText?: string) => {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text(titleText, MARGIN, 12);
        if (subtitleText) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(180, 200, 255);
          doc.text(subtitleText, MARGIN, 16);
        }
      };

      drawHeader(
        countryName
          ? `Air Quality Monitoring Landscape — ${countryName}`
          : 'Air Quality Monitoring Landscape in Africa',
        filterSummary || undefined,
      );

      // ── Light metadata strip ──────────────────────────────────────────────
      const STRIP_Y = HEADER_H; // immediately below header — no gap
      const STRIP_H = 9;
      doc.setFillColor(240, 242, 248);
      doc.rect(0, STRIP_Y, PAGE_W, STRIP_H, 'F');

      const filtersLabel = filterSummary || `${selectedTypes.map(getTypeLabel).join(', ')}${activeOnly ? ' · Active only' : ''}`;
      const metaLine = `Scope: ${scopeText}  ·  Filters: ${filtersLabel}  ·  Generated: ${formatPdfDateTime(new Date().toISOString())}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 70, 100);
      doc.text(metaLine, MARGIN, STRIP_Y + 6);

      // ── Build statistics ──────────────────────────────────────────────────
      const uniqueCountries = new Set(
        exportCountries
          .filter((country) => country.monitors.length > 0)
          .map((country) => country.country)
          .filter(Boolean),
      );
      const countriesMonitored = uniqueCountries.size;
      const countriesInReport = exportCountries.length;

      const countsByType: Record<string, number> = { Reference: 0, LCS: 0 };
      const countsByStatus: Record<string, number> = { active: 0, inactive: 0 };
      exportCountries.forEach((country) => {
        country.monitors.forEach((monitor) => {
          const type = monitor.type || 'LCS';
          countsByType[type] = (countsByType[type] || 0) + 1;
          const status = monitor.status || 'active';
          countsByStatus[status] = (countsByStatus[status] || 0) + 1;
        });
      });

      const BODY_Y = STRIP_Y + STRIP_H + 6;
      const SECTION_HEAD_COLOR: [number, number, number] = NAVY;
      const ALT_ROW: [number, number, number] = [245, 247, 252];
      const COMMON_STYLES = {
        font: 'helvetica' as const,
        fontSize: 9,
        cellPadding: 3,
      };

      const summaryBody: string[][] = [];
      summaryBody.push(['Total monitors', String(totalMonitors)]);
      summaryBody.push(['Countries in report', String(countriesInReport)]);
      summaryBody.push(['Countries with monitors', String(countriesMonitored)]);
      summaryBody.push([
        'Reference monitors',
        String(countsByType.Reference || 0),
      ]);
      summaryBody.push([
        'Low-Cost Sensor (LCS) monitors',
        String(countsByType.LCS || 0),
      ]);
      summaryBody.push(['Active monitors', String(countsByStatus.active || 0)]);
      summaryBody.push([
        'Inactive monitors',
        String(countsByStatus.inactive || 0),
      ]);

      autoTable(doc, {
        startY: BODY_Y,
        head: [['Metric', 'Value']],
        body: summaryBody,
        theme: 'grid',
        styles: COMMON_STYLES,
        headStyles: {
          fillColor: SECTION_HEAD_COLOR,
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        columnStyles: {
          0: { cellWidth: CONTENT_W * 0.6 },
          1: { cellWidth: CONTENT_W * 0.4, halign: 'right' },
        },
        margin: { left: MARGIN, right: MARGIN },
        didDrawPage: () => drawFooter(),
      });

      let currentY = ((doc as any).lastAutoTable?.finalY ?? BODY_Y + 50) + 8;

      if (currentY > PAGE_H - 55) {
        doc.addPage('a4', 'landscape');
        currentY = MARGIN;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Country summary', MARGIN, currentY);
      currentY += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'Monitor counts by country in the current report scope.',
        MARGIN,
        currentY,
      );
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Country', 'ISO', 'Monitors', 'Active']],
        body: countrySummaryRows,
        theme: 'grid',
        styles: COMMON_STYLES,
        headStyles: {
          fillColor: SECTION_HEAD_COLOR,
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        columnStyles: {
          0: { cellWidth: CONTENT_W * 0.5 },
          1: { cellWidth: CONTENT_W * 0.15, halign: 'center' },
          2: { cellWidth: CONTENT_W * 0.175, halign: 'right' },
          3: { cellWidth: CONTENT_W * 0.175, halign: 'right' },
        },
        margin: { left: MARGIN, right: MARGIN },
        didDrawPage: () => drawFooter(),
      });

      currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 8;

      if (countriesWithMonitors.length > 0) {
        if (currentY > PAGE_H - 55) {
          doc.addPage('a4', 'landscape');
          currentY = MARGIN;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('Monitor inventory', MARGIN, currentY);
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          'Each country section lists the devices, coordinates, and status for the selected scope.',
          MARGIN,
          currentY,
        );
        currentY += 5;

        countriesWithMonitors.forEach((country) => {
          if (currentY > PAGE_H - 55) {
            doc.addPage('a4', 'landscape');
            currentY = MARGIN;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.text(
            `${country.country} (${country.iso2 || '--'})`,
            MARGIN,
            currentY,
          );
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(
            `${country.monitors.length} monitor${country.monitors.length === 1 ? '' : 's'}`,
            PAGE_W - MARGIN,
            currentY,
            { align: 'right' },
          );
          currentY += 4.5;

          autoTable(doc, {
            startY: currentY,
            head: [
              [
                'Monitor',
                'City',
                'Type',
                'Status',
                'Coordinates',
                'Manufacturer',
              ],
            ],
            body: country.monitors.map((monitor) => [
              monitor.name || '--',
              monitor.city || '--',
              getTypeLabel(monitor.type),
              monitor.status === 'active' ? 'Active' : 'Inactive',
              formatExportCoordinates(monitor),
              displayText(monitor.manufacturer || monitor.organisation),
            ]),
            theme: 'grid',
            styles: {
              font: 'helvetica',
              fontSize: 8.2,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: SECTION_HEAD_COLOR,
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: ALT_ROW },
            columnStyles: {
              0: { cellWidth: CONTENT_W * 0.25 },
              1: { cellWidth: CONTENT_W * 0.14 },
              2: { cellWidth: CONTENT_W * 0.14 },
              3: { cellWidth: CONTENT_W * 0.12 },
              4: { cellWidth: CONTENT_W * 0.21 },
              5: { cellWidth: CONTENT_W * 0.14 },
            },
            margin: { left: MARGIN, right: MARGIN },
            didDrawPage: () => drawFooter(),
          });

          currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 8;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('No monitors match the current filters.', MARGIN, currentY);
        currentY += 8;
      }

      // ── Map snapshot on page 2 (only when available) ──────────────────
      try {
        if (snapshotGetterRef.current) {
          // Await async capture — html-to-image serialises both the WebGL
          // canvas AND the HTML marker overlay into one PNG.
          const dataUrl = await captureWithTimeout(
            () => snapshotGetterRef.current?.() ?? Promise.resolve(null),
            6000,
            null,
          );
          if (dataUrl && dataUrl.length > 100) {
            doc.addPage('a4', 'landscape');

            // Repeat header banner on page 2
            drawHeader(
              countryName
                ? `Map Snapshot — ${countryName}`
                : 'Map Snapshot — Air Quality Monitoring Landscape in Africa',
              `Scope: ${scopeText}`,
            );

            // Full-width map image below header — preserve aspect ratio and center
            const IMG_Y = HEADER_H + 4;
            const IMG_H = PAGE_H - IMG_Y - 14;

            // Measure image natural size to preserve aspect ratio
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            });

            const imgRatio =
              img.naturalWidth && img.naturalHeight
                ? img.naturalWidth / img.naturalHeight
                : CONTENT_W / IMG_H;
            let targetW = CONTENT_W;
            let targetH = CONTENT_W / imgRatio;
            if (targetH > IMG_H) {
              targetH = IMG_H;
              targetW = IMG_H * imgRatio;
            }

            const targetX = MARGIN + (CONTENT_W - targetW) / 2;
            doc.addImage(dataUrl, 'PNG', targetX, IMG_Y, targetW, targetH);

            // Page 2 footer
            drawFooter();
          }
        }
      } catch {
        // Snapshot failed — omit page 2, report is still complete
      }

      doc.save(buildPdfFileName(scopeLabel));
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
      }
    }
  };

  const escapeCsvField = (value: string | number | null | undefined): string => {
    const str = value == null ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const buildCsvFileName = (scope: string, suffix: string) => {
    const dateSuffix = new Date().toISOString().split('T')[0];
    const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `network-coverage-${normalizedScope}-${suffix}-${dateSuffix}.csv`;
  };

  const downloadCsv = async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;

    if (isMountedRef.current) {
      setIsDownloading(true);
      setDownloadError(null);
    }

    try {
      const exportCountries = await resolveExportCountries();

      const isSingleCountryCsv = !!selectedCountryId && exportCountries.length === 1;
      const selectedCountryObjCsv = isSingleCountryCsv ? exportCountries[0] : null;
      const countryNameCsv = selectedCountryObjCsv?.country ?? null;

      const scopeText = countryNameCsv
        ? countryNameCsv
        : 'All monitored countries';
      const scopeLabel = countryNameCsv
        ? countryNameCsv.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'all-countries';

      const allMonitors = exportCountries.flatMap((c) => c.monitors);
      const totalMonitors = allMonitors.length;
      const activeMonitors = allMonitors.filter((m) => m.status === 'active').length;
      const inactiveMonitors = totalMonitors - activeMonitors;
      const referenceCount = allMonitors.filter((m) => m.type === 'Reference').length;
      const lcsCount = allMonitors.filter((m) => m.type === 'LCS').length;
      const countriesWithMonitors = exportCountries.filter((c) => c.monitors.length > 0).length;

      const cities = new Set(
        allMonitors.map((m) => `${m.city}, ${m.country}`).filter(Boolean),
      );
      const networks = new Set(allMonitors.map((m) => m.network).filter(Boolean));
      const manufacturers = new Set(allMonitors.map((m) => m.manufacturer).filter(Boolean));
      const pollutants = new Set(allMonitors.flatMap((m) => m.pollutants).filter(Boolean));

      const uptimeValues = allMonitors
        .map((m) => parseFloat(m.uptime30d))
        .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
      const avgUptime =
        uptimeValues.length > 0
          ? (uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length).toFixed(1)
          : '--';

      const lines: string[] = [];

      // ── Section 1: Summary ──
      lines.push('AIR QUALITY MONITORING NETWORK - SUMMARY REPORT');
      lines.push('');
      lines.push('Report Scope,' + escapeCsvField(scopeText));
      lines.push(
        'Generated,' +
          escapeCsvField(new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())),
      );
      lines.push(
        'Filters Applied,' +
          escapeCsvField(
            `${selectedTypes.map((t) => getTypeLabel(t)).join(', ')}${activeOnly ? ' · Active only' : ''}${selectedNetworks.length > 0 ? ` · Sources: ${selectedNetworks.map((n) => formatNetworkName(n)).join(', ')}` : ''}`,
          ),
      );
      lines.push('');
      lines.push('NETWORK OVERVIEW');
      lines.push('Metric,Value');
      lines.push('Total Sensors Installed,' + totalMonitors);
      lines.push('Active Sensors,' + activeMonitors);
      lines.push('Inactive Sensors,' + inactiveMonitors);
      lines.push('Countries Represented,' + countriesWithMonitors);
      lines.push('Total Countries in Report,' + exportCountries.length);
      lines.push('Unique Cities/Locations,' + cities.size);
      lines.push('Data Sources/Networks,' + networks.size);
      lines.push('Unique Manufacturers,' + manufacturers.size);
      lines.push('Unique Pollutants Measured,' + pollutants.size);
      lines.push('');
      lines.push('MONITOR TYPE BREAKDOWN');
      lines.push('Type,Count,Percentage');
      lines.push(
        `Reference Monitors,${referenceCount},${totalMonitors > 0 ? ((referenceCount / totalMonitors) * 100).toFixed(1) : 0}%`,
      );
      lines.push(
        `Low-Cost Sensors (LCS),${lcsCount},${totalMonitors > 0 ? ((lcsCount / totalMonitors) * 100).toFixed(1) : 0}%`,
      );
      lines.push(
        `Inactive,${inactiveMonitors},${totalMonitors > 0 ? ((inactiveMonitors / totalMonitors) * 100).toFixed(1) : 0}%`,
      );
      lines.push('');
      lines.push('DATA QUALITY');
      lines.push('Metric,Value');
      lines.push('Average 30-Day Uptime,' + avgUptime + '%');
      lines.push(
        'Public Data Available,' +
          allMonitors.filter((m) => m.publicData === 'Yes').length +
          ' of ' +
          totalMonitors,
      );
      lines.push('');

      // ── Section 2: Country Summary ──
      lines.push('COUNTRY SUMMARY');
      lines.push('Country,ISO2,Total Monitors,Active,Inactive,Reference,LCS,Data Sources');
      exportCountries.forEach((country) => {
        const countryActive = country.monitors.filter((m) => m.status === 'active').length;
        const countryInactive = country.monitors.length - countryActive;
        const countryRef = country.monitors.filter((m) => m.type === 'Reference').length;
        const countryLcs = country.monitors.filter((m) => m.type === 'LCS').length;
        const countryNetworks = [...new Set(country.monitors.map((m) => m.network).filter(Boolean))].join('; ');
        lines.push(
          [
            escapeCsvField(country.country),
            escapeCsvField(country.iso2),
            country.monitors.length,
            countryActive,
            countryInactive,
            countryRef,
            countryLcs,
            escapeCsvField(countryNetworks),
          ].join(','),
        );
      });
      lines.push('');

      // ── Section 3: Cities/Locations ──
      lines.push('CITIES / LOCATIONS WITH MONITORS');
      lines.push('City,Country,ISO2,Number of Monitors,Sources');
      const cityMap = new Map<string, { country: string; iso2: string; count: number; networks: Set<string> }>();
      allMonitors.forEach((m) => {
        const key = `${m.city}|${m.country}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, { country: m.country, iso2: m.iso2, count: 0, networks: new Set() });
        }
        const entry = cityMap.get(key)!;
        entry.count += 1;
        if (m.network) entry.networks.add(m.network);
      });
      Array.from(cityMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([cityKey, info]) => {
          const cityName = cityKey.split('|')[0];
          lines.push(
            [
              escapeCsvField(cityName),
              escapeCsvField(info.country),
              escapeCsvField(info.iso2),
              info.count,
              escapeCsvField([...info.networks].join('; ')),
            ].join(','),
          );
        });
      lines.push('');

      // ── Section 4: Network/Source Breakdown ──
      lines.push('SOURCE / NETWORK BREAKDOWN');
      lines.push('Source/Network,Total Monitors,Active,Inactive,Countries');
      const networkMap = new Map<string, { total: number; active: number; inactive: number; countries: Set<string> }>();
      allMonitors.forEach((m) => {
        const net = m.network || 'Unknown';
        if (!networkMap.has(net)) {
          networkMap.set(net, { total: 0, active: 0, inactive: 0, countries: new Set() });
        }
        const entry = networkMap.get(net)!;
        entry.total += 1;
        if (m.status === 'active') entry.active += 1;
        else entry.inactive += 1;
        if (m.country) entry.countries.add(m.country);
      });
      Array.from(networkMap.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([net, info]) => {
          lines.push(
            [
              escapeCsvField(net),
              info.total,
              info.active,
              info.inactive,
              info.countries.size,
            ].join(','),
          );
        });
      lines.push('');

      // ── Section 5: Detailed Monitor Data ──
      lines.push('DETAILED MONITOR DATA');
      lines.push(
        [
          'Monitor Name',
          'City',
          'Country',
          'ISO2',
          'Type',
          'Status',
          'Network/Source',
          'Operator',
          'Organization',
          'Manufacturer',
          'Equipment',
          'Pollutants',
          'Latitude',
          'Longitude',
          'Resolution',
          'Transmission',
          'Land Use',
          'Site',
          'Deployed',
          'Last Active',
          'Calibration Date',
          'Calibration Method',
          'Uptime (30d)',
          'Public Data',
          'Co-location',
          'View Data URL',
        ].join(','),
      );
      allMonitors.forEach((m) => {
        lines.push(
          [
            escapeCsvField(m.name),
            escapeCsvField(m.city),
            escapeCsvField(m.country),
            escapeCsvField(m.iso2),
            escapeCsvField(m.type),
            escapeCsvField(m.status),
            escapeCsvField(m.network),
            escapeCsvField(m.operator),
            escapeCsvField(m.organisation),
            escapeCsvField(m.manufacturer),
            escapeCsvField(m.equipment),
            escapeCsvField(m.pollutants.join('; ')),
            m.latitude ?? '',
            m.longitude ?? '',
            escapeCsvField(m.resolution),
            escapeCsvField(m.transmission),
            escapeCsvField(m.landUse),
            escapeCsvField(m.site),
            escapeCsvField(m.deployed),
            escapeCsvField(m.lastActive),
            escapeCsvField(m.calibrationLastDate),
            escapeCsvField(m.calibrationMethod),
            escapeCsvField(m.uptime30d),
            escapeCsvField(m.publicData),
            escapeCsvField(m.coLocation),
            escapeCsvField(m.viewDataUrl),
          ].join(','),
        );
      });

      const csvContent = lines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildCsvFileName(scopeLabel, 'data');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
      }
    }
  };

  const handleDownload = async () => {
    await downloadPdf();
  };

  const isInitialLoading = summaryQuery.isLoading && countries.length === 0;
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
                countries={mapCountries}
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
            {/* Show spinner overlay while coverage or country monitors data is loading */}
            {(summaryQuery.isLoading ||
              countryMonitorsQuery.isLoading ||
              monitorDetailQuery.isLoading) && (
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
