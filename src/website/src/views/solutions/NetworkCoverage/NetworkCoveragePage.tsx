'use client';

import { AqLoading02 } from '@airqo/icons-react';
import jsPDF from 'jspdf';
import React, { useMemo, useState } from 'react';

import { MapLoader } from '@/components/map';

import NetworkCoverageHeader from './components/NetworkCoverageHeader';
import NetworkCoverageLegend from './components/NetworkCoverageLegend';
import NetworkCoverageMap from './components/NetworkCoverageMap';
import NetworkCoverageSidebar from './components/NetworkCoverageSidebar';
import {
  CountryCoverage,
  MonitorStation,
  MonitorType,
  networkCoverageMockData,
  ViewMode,
} from './mockup';

const toCsvRows = (rows: MonitorStation[]): string => {
  const headers = [
    'Country',
    'City',
    'Monitor Name',
    'Type',
    'Status',
    'Latitude',
    'Longitude',
    'Last Active',
  ];

  const lines = rows.map((monitor) =>
    [
      monitor.country,
      monitor.city,
      monitor.name,
      monitor.type,
      monitor.status,
      monitor.latitude,
      monitor.longitude,
      monitor.lastActive,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(','),
  );

  return [headers.join(','), ...lines].join('\n');
};

const downloadBlob = (content: BlobPart, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const NetworkCoveragePage = () => {
  const [query, setQuery] = useState('');
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
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');

  const countries = useMemo(
    () =>
      [...networkCoverageMockData].sort((a, b) =>
        a.country.localeCompare(b.country),
      ),
    [],
  );

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === selectedCountryId) ?? null,
    [countries, selectedCountryId],
  );

  const allMonitors = useMemo(
    () => countries.flatMap((country) => country.monitors),
    [countries],
  );

  const selectedMonitor = useMemo(
    () =>
      allMonitors.find((monitor) => monitor.id === selectedMonitorId) ?? null,
    [allMonitors, selectedMonitorId],
  );

  const mapCountries = useMemo<CountryCoverage[]>(() => {
    return countries.map((country) => ({
      ...country,
      monitors: country.monitors.filter((monitor) => {
        const typeAllowed = selectedTypes.includes(monitor.type);
        const statusAllowed = activeOnly ? monitor.status === 'active' : true;
        return typeAllowed && statusAllowed;
      }),
    }));
  }, [activeOnly, countries, selectedTypes]);

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

  const handleDownload = (format: 'csv' | 'pdf') => {
    const rows = selectedCountry
      ? selectedCountry.monitors
      : countries.flatMap((country) => country.monitors);

    const dateSuffix = new Date().toISOString().split('T')[0];
    if (format === 'csv') {
      downloadBlob(
        toCsvRows(rows),
        `network-coverage-${dateSuffix}.csv`,
        'text/csv;charset=utf-8',
      );
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AirQo Network Coverage Snapshot', 14, 20);
    doc.setFontSize(11);
    doc.text(
      `Scope: ${selectedCountry ? selectedCountry.country : 'All monitored countries'}`,
      14,
      30,
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 37);
    let y = 48;
    rows.forEach((monitor, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${index + 1}. ${monitor.name} | ${monitor.city}, ${monitor.country} | ${monitor.type}`,
        14,
        y,
      );
      y += 8;
    });
    doc.save(`network-coverage-${dateSuffix}.pdf`);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f6f6f7]">
      <div className="flex h-full flex-col p-2">
        <NetworkCoverageHeader
          onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
          onDownload={handleDownload}
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
              onQueryChange={setQuery}
              onToggleType={toggleType}
              onToggleActiveOnly={() => setActiveOnly((previous) => !previous)}
              onSelectCountry={selectCountry}
              onSelectMonitor={selectMonitor}
              onClosePrompt={() => setShowAddMonitorPromptFor(null)}
              onResetToOverview={resetToOverview}
              onDownloadCsv={() => handleDownload('csv')}
            />
          </div>

          <section className="relative h-full min-h-0 flex-1 overflow-hidden">
            <MapLoader
              loadingComponent={
                <div className="flex h-full w-full items-center justify-center bg-[#f6f6f7]">
                  <div className="flex flex-col items-center gap-2 text-blue-600">
                    <AqLoading02 className="h-10 w-10 animate-spin" />
                    <span className="text-sm font-semibold text-blue-700">
                      Loading map...
                    </span>
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
              />
            </MapLoader>

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
