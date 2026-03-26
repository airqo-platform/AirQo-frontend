'use client';
/* eslint-disable simple-import-sort/imports */

import { AqLoading02 } from '@airqo/icons-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { MapLoader } from '@/components/map';
import {
  useNetworkCoverageCountryMonitors,
  useNetworkCoverageMonitor,
  useNetworkCoverageSummary,
} from '@/hooks/useApiHooks';
import { networkCoverageService } from '@/services/apiService';

import NetworkCoverageAddToNetworkDialog from './components/NetworkCoverageAddToNetworkDialog';
import NetworkCoverageHeader from './components/NetworkCoverageHeader';
import NetworkCoverageLegend from './components/NetworkCoverageLegend';
import NetworkCoverageMap from './components/NetworkCoverageMap';
import NetworkCoverageSidebar from './components/NetworkCoverageSidebar';
import {
  type MonitorType,
  type NetworkCoverageCountry,
  type ViewMode,
  AFRICAN_COUNTRY_LIST,
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
  const [isAddToNetworkDialogOpen, setIsAddToNetworkDialogOpen] =
    useState(false);
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v12',
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [flyToMonitorId, setFlyToMonitorId] = useState<string | null>(null);
  const snapshotGetterRef = useRef<(() => Promise<string | null>) | null>(null);

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

  const mapCountries = countries;

  const isSearching = query !== debouncedQuery && query.trim() !== '';

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

  const getTypeLabel = (type: string) => {
    if (!type) return type;
    if (type === 'LCS') return 'Low-Cost Sensor (LCS)';
    return type;
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
      const PAGE_W = 297; // A4 landscape
      const MARGIN = 14;
      const CONTENT_W = PAGE_W - MARGIN * 2; // 269 mm

      // ── Document metadata ────────────────────────────────────────────────
      doc.setProperties({
        title: 'Africa Air Quality Monitoring Network Coverage Report',
        subject: 'Network coverage monitors export',
        author: 'Africa Air Quality Monitoring Network',
      });

      // ── Dark navy header banner ──────────────────────────────────────────
      const NAVY: [number, number, number] = [12, 28, 90];
      const HEADER_H = 18;
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(
        'Africa Air Quality Monitoring — Network Coverage Report',
        MARGIN,
        12,
      );

      // ── Light metadata strip ──────────────────────────────────────────────
      const STRIP_Y = HEADER_H; // immediately below header — no gap
      const STRIP_H = 9;
      doc.setFillColor(240, 242, 248);
      doc.rect(0, STRIP_Y, PAGE_W, STRIP_H, 'F');

      const filtersLabel = `${selectedTypes.map(getTypeLabel).join(', ')}${activeOnly ? ' · Active only' : ''}`;
      const metaLine = `Scope: ${scopeText}  ·  Filters: ${filtersLabel}  ·  Generated: ${formatPdfDateTime(new Date().toISOString())}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 70, 100);
      doc.text(metaLine, MARGIN, STRIP_Y + 6);

      // ── Build statistics ──────────────────────────────────────────────────
      const totalMonitors = rows.length;
      const uniqueCountries = new Set(
        rows.map((r) => r.country).filter(Boolean),
      );
      const countriesMonitored = uniqueCountries.size;
      const totalAfricanCountries = AFRICAN_COUNTRY_LIST.length;

      const countsByType: Record<string, number> = { Reference: 0, LCS: 0 };
      const countsByStatus: Record<string, number> = { active: 0, inactive: 0 };
      const monitorsByCountry: Record<
        string,
        { iso2?: string; country: string; count: number }
      > = {};

      rows.forEach((m) => {
        const t = m.type || 'LCS';
        countsByType[t] = (countsByType[t] || 0) + 1;
        const s = m.status || 'active';
        countsByStatus[s] = (countsByStatus[s] || 0) + 1;
        const key = (m.country || m.iso2 || 'Unknown').toString();
        if (!monitorsByCountry[key]) {
          monitorsByCountry[key] = {
            iso2: m.iso2,
            country: m.country || key,
            count: 0,
          };
        }
        monitorsByCountry[key].count += 1;
      });

      // All countries sorted by monitor count — no truncation
      const topCountries = Object.values(monitorsByCountry).sort(
        (a, b) => b.count - a.count,
      );

      // ── Single-column layout: summary above, countries list below ──────
      const BODY_Y = STRIP_Y + STRIP_H + 6;
      const SECTION_HEAD_COLOR: [number, number, number] = NAVY;
      const ALT_ROW: [number, number, number] = [245, 247, 252];
      const COMMON_STYLES = {
        font: 'helvetica' as const,
        fontSize: 9,
        cellPadding: 3,
      };

      const summaryTable = autoTable(doc, {
        startY: BODY_Y,
        head: [['Metric', 'Value']],
        body: [
          ['Total monitors', String(totalMonitors)],
          [
            'Countries covered',
            `${countriesMonitored} / ${totalAfricanCountries}`,
          ],
          ['Reference monitors', String(countsByType.Reference || 0)],
          ['Low-Cost Sensor (LCS) monitors', String(countsByType.LCS || 0)],
          ['Active monitors', String(countsByStatus.active || 0)],
          ['Inactive monitors', String(countsByStatus.inactive || 0)],
        ],
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
      });

      const startYForCountries = (summaryTable as any)?.finalY
        ? (summaryTable as any).finalY + 8
        : BODY_Y + 50;

      autoTable(doc, {
        startY: startYForCountries,
        head: [['Country', 'ISO', 'Monitors']],
        body: topCountries.map((c) => [
          c.country,
          c.iso2 || '',
          String(c.count),
        ]),
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
          1: { cellWidth: CONTENT_W * 0.15, halign: 'center' },
          2: { cellWidth: CONTENT_W * 0.25, halign: 'right' },
        },
        margin: { left: MARGIN, right: MARGIN },
      });

      // ── Page 1 footer ────────────────────────────────────────────────────
      const PAGE_H = 210; // A4 landscape height
      const FOOTER_Y = PAGE_H - 8;
      doc.setDrawColor(180, 185, 210);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, FOOTER_Y - 2, PAGE_W - MARGIN, FOOTER_Y - 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 130, 160);
      doc.text('Africa Air Quality Monitoring Network', MARGIN, FOOTER_Y);
      doc.text('Page 1', PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });

      // ── Map snapshot on page 2 (only when available) ──────────────────
      try {
        if (snapshotGetterRef.current) {
          // Await async capture — html-to-image serialises both the WebGL
          // canvas AND the HTML marker overlay into one PNG.
          const dataUrl = await snapshotGetterRef.current();
          if (dataUrl && dataUrl.length > 100) {
            doc.addPage('a4', 'landscape');

            // Repeat header banner on page 2
            doc.setFillColor(...NAVY);
            doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(
              'Map Snapshot — Africa Air Quality Monitoring Network',
              MARGIN,
              10,
            );
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(180, 200, 255);
            doc.text(
              `Scope: ${scopeText}  ·  ${formatPdfDateTime(new Date().toISOString())}`,
              MARGIN,
              16,
            );

            // Full-width map image below header
            const IMG_Y = HEADER_H + 4;
            const IMG_H = PAGE_H - IMG_Y - 14;
            doc.addImage(dataUrl, 'PNG', MARGIN, IMG_Y, CONTENT_W, IMG_H);

            // Page 2 footer
            doc.setDrawColor(180, 185, 210);
            doc.setLineWidth(0.3);
            doc.line(MARGIN, FOOTER_Y - 2, PAGE_W - MARGIN, FOOTER_Y - 2);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(120, 130, 160);
            doc.text('Africa Air Quality Monitoring Network', MARGIN, FOOTER_Y);
            doc.text('Page 2', PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
          }
        }
      } catch {
        // Snapshot failed — omit page 2, report is still complete
      }

      doc.save(buildPdfFileName(scopeLabel));
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : 'PDF download failed',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
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

        <NetworkCoverageAddToNetworkDialog
          isOpen={isAddToNetworkDialogOpen}
          onOpenChange={setIsAddToNetworkDialogOpen}
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
              searchQuery={debouncedQuery}
              isSearching={isSearching}
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
                flyToMonitorId={flyToMonitorId}
                onRegisterSnapshot={(fn) => {
                  snapshotGetterRef.current = fn;
                }}
              />
            </MapLoader>
            {/* Show spinner overlay while coverage or country monitors data is loading */}
            {(summaryQuery.isLoading ||
              countryMonitorsQuery.isLoading ||
              monitorDetailQuery.isLoading) && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#f6f6f7]/70">
                <div className="text-blue-600">
                  <AqLoading02 className="animate-spin" />
                </div>
              </div>
            )}
            {/* initial loading handled by MapLoader spinner; remove redundant message */}
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
