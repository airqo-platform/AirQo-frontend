'use client';

import { AqLoading02 } from '@airqo/icons-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useMemo, useState } from 'react';

import { MapLoader } from '@/components/map';
import { networkCoverageService } from '@/services/apiService';
import {
  useNetworkCoverageCountryMonitors,
  useNetworkCoverageMonitor,
  useNetworkCoverageSummary,
} from '@/hooks/useApiHooks';

import NetworkCoverageHeader from './components/NetworkCoverageHeader';
import NetworkCoverageLegend from './components/NetworkCoverageLegend';
import NetworkCoverageMap from './components/NetworkCoverageMap';
import NetworkCoverageSidebar from './components/NetworkCoverageSidebar';
import {
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageMonitor,
  type ViewMode,
} from './networkCoverageTypes';

const DEFAULT_TENANT = 'airqo';

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatPdfText = (value?: string | null) => {
  if (!value || !value.trim()) {
    return '--';
  }

  return value.trim();
};

const formatNetworkName = (value?: string | null) => {
  if (!value || !value.trim()) return '--';
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === 'airqo') return 'AirQo';
  return trimmed;
};

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

const buildPdfRow = (monitor: NetworkCoverageMonitor) => [
  formatPdfText(monitor.country),
  formatPdfText(monitor.city),
  formatPdfText(monitor.name),
  monitor.type,
  monitor.status,
  formatNetworkName(monitor.network),
  formatPdfText(monitor.operator),
  formatCoordinates(monitor.latitude, monitor.longitude),
  formatPdfText(monitor.uptime30d),
  formatPdfDateTime(monitor.lastActive),
  formatPdfText(monitor.publicData),
];

const buildPdfFileName = (scope: string) => {
  const dateSuffix = new Date().toISOString().split('T')[0];
  const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `network-coverage-${normalizedScope}-${dateSuffix}.pdf`;
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

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
      search: debouncedQuery.trim() || undefined,
      activeOnly: activeOnly ? true : undefined,
      types: selectedTypes.length === 3 ? undefined : selectedTypes.join(','),
    }),
    [activeOnly, debouncedQuery, selectedTypes],
  );

  const summaryQuery = useNetworkCoverageSummary(summaryParams);

  const countries = useMemo<NetworkCoverageCountry[]>(
    () => summaryQuery.data?.countries ?? [],
    [summaryQuery.data],
  );

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

  const exportQueryParams = useMemo(
    () => ({
      tenant: DEFAULT_TENANT,
      search: debouncedQuery.trim() || undefined,
      activeOnly: activeOnly ? true : undefined,
      types: selectedTypes.length === 3 ? undefined : selectedTypes.join(','),
      countryId: selectedCountryId ?? undefined,
    }),
    [activeOnly, debouncedQuery, selectedCountryId, selectedTypes],
  );

  useEffect(() => {
    if (!selectedCountryId) {
      setSelectedMonitorId(null);
      setShowAddMonitorPromptFor(null);
    }
  }, [selectedCountryId]);

  const mapCountries = countries;

  const resetToOverview = () => {
    setSelectedCountryId(null);
    setSelectedMonitorId(null);
    setShowAddMonitorPromptFor(null);
  };

  const selectCountry = (countryId: string) => {
    const country = countries.find((item) => item.id === countryId);
    if (!country) {
      return;
    }

    if (country.monitors.length === 0) {
      setShowAddMonitorPromptFor(countryId);
      return;
    }

    setSelectedCountryId(countryId);
    setSelectedMonitorId(null);
    setShowAddMonitorPromptFor(null);
    setViewMode('monitors');
    setIsSidebarOpen(true);
  };

  const selectCountryByIso = (iso2: string) => {
    const country = countries.find((item) => item.iso2 === iso2);
    if (!country) {
      return;
    }
    selectCountry(country.id);
  };

  const selectMonitor = (monitorId: string, countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedMonitorId(monitorId);
    setShowAddMonitorPromptFor(null);
    setViewMode('monitors');
    setIsSidebarOpen(true);
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

  const toggleType = (type: MonitorType) => {
    setSelectedTypes((previous) => {
      if (previous.includes(type)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((item) => item !== type);
      }

      return [...previous, type];
    });
  };

  const getPdfRows = async () => {
    if (!selectedCountryId) {
      return countries.flatMap((country) => country.monitors);
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

    return response.monitors;
  };

  const downloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const rows = await getPdfRows();
      const scopeText =
        selectedCountry?.country ??
        selectedCountryId ??
        'All monitored countries';
      const scopeLabel =
        selectedCountry?.country ?? selectedCountryId ?? 'all-countries';
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      doc.setProperties({
        title: 'AirQo Network Coverage Report',
        subject: 'Network coverage monitors export',
        author: 'AirQo',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('AirQo Network Coverage Report', 14, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Scope: ${scopeText}`, 14, 23);
      doc.text(
        `Filters: ${selectedTypes.join(', ')}${activeOnly ? ' | Active only' : ''}`,
        14,
        29,
      );
      doc.text(
        `Generated: ${formatPdfDateTime(new Date().toISOString())}`,
        14,
        35,
      );

      const tableRows =
        rows.length > 0
          ? rows.map((monitor) => buildPdfRow(monitor))
          : [
              [
                'No data available',
                '--',
                '--',
                '--',
                '--',
                '--',
                '--',
                '--',
                '--',
                '--',
                '--',
              ],
            ];

      autoTable(doc, {
        startY: 42,
        head: [
          [
            'Country',
            'City',
            'Monitor',
            'Type',
            'Status',
            'Network',
            'Operator',
            'Coordinates',
            'Uptime (30d)',
            'Last Active',
            'Public Data',
          ],
        ],
        body: tableRows,
        margin: { left: 14, right: 14 },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 23 },
          2: { cellWidth: 35 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 24 },
          6: { cellWidth: 28 },
          7: { cellWidth: 35 },
          8: { cellWidth: 22 },
          9: { cellWidth: 28 },
          10: { cellWidth: 22 },
        },
      });

      doc.save(buildPdfFileName(scopeLabel));
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'PDF download failed',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCsv = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const blob = await networkCoverageService.downloadNetworkCoverageCsv({
        ...exportQueryParams,
      });

      const dateSuffix = new Date().toISOString().split('T')[0];
      const fileName = selectedCountryId
        ? `network-coverage-${selectedCountryId}-${dateSuffix}.csv`
        : `network-coverage-${dateSuffix}.csv`;

      downloadBlob(blob, fileName);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'CSV download failed',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      await downloadCsv();
      return;
    }

    await downloadPdf();
  };

  const isInitialLoading = summaryQuery.isLoading && countries.length === 0;
  const summaryError = summaryQuery.error?.message ?? null;

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f6f6f7]">
      <div className="flex h-full flex-col p-2">
        <NetworkCoverageHeader
          onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />

        <main className="relative mt-2 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-[#f6f6f7]">
          <div
            className={`absolute inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${
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
              countries={countries}
              query={query}
              selectedTypes={selectedTypes}
              activeOnly={activeOnly}
              selectedCountry={selectedCountry}
              selectedMonitor={selectedMonitor}
              showAddMonitorPromptFor={showAddMonitorPromptFor}
              isLoading={isInitialLoading}
              error={summaryError}
              onQueryChange={setQuery}
              onToggleType={toggleType}
              onToggleActiveOnly={() => setActiveOnly((previous) => !previous)}
              onSelectCountry={selectCountry}
              onSelectMonitor={selectMonitor}
              onClosePrompt={() => setShowAddMonitorPromptFor(null)}
              onResetToOverview={resetToOverview}
              onRetry={() => summaryQuery.refetch()}
            />
          </div>

          <section className="relative h-full min-h-0 flex-1 overflow-hidden">
            <MapLoader
              loadingComponent={
                <div className="flex h-full w-full items-center justify-center bg-[#f6f6f7]">
                  <div className="text-blue-600">
                    <AqLoading02 className="animate-spin" />
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
              />
            </MapLoader>
            {isInitialLoading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f6f6f7]/70 backdrop-blur-[1px]">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-lg">
                  Loading network coverage data...
                </div>
              </div>
            ) : null}
            {summaryError && !countries.length ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f6f6f7]/80 px-6">
                <div className="max-w-sm rounded-2xl border border-red-200 bg-white p-5 text-center shadow-lg">
                  <p className="text-base font-semibold text-slate-900">
                    Network coverage failed to load
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{summaryError}</p>
                  <button
                    type="button"
                    onClick={() => summaryQuery.refetch()}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}
            {downloadError ? (
              <div className="absolute right-4 top-4 z-20 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 shadow-sm">
                {downloadError}
              </div>
            ) : null}
            monitorLoading={monitorDetailQuery.isFetching}
            {isDownloading ? (
              <div className="absolute right-4 top-4 z-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
                Preparing download...
              </div>
            ) : null}
            <div className="absolute right-3 top-3 z-20 inline-flex rounded-full border border-slate-300 bg-white p-1 text-xs font-semibold shadow-sm sm:right-4 sm:top-4">
              <button
                type="button"
                onClick={() => setViewMode('monitors')}
                className={`rounded-full px-3 py-1.5 sm:px-4 ${
                  viewMode === 'monitors'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500'
                }`}
              >
                Monitors
              </button>
              <button
                type="button"
                onClick={() => setViewMode('coverage')}
                className={`rounded-full px-3 py-1.5 sm:px-4 ${
                  viewMode === 'coverage'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500'
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
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
          </section>
        </main>
      </div>
    </div>
  );
};

export default NetworkCoveragePage;
