import { AqMarkerPin01, AqSearchRefraction } from '@airqo/icons-react';
import React from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

import {
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageMonitor,
} from '../networkCoverageTypes';

const ANALYTICS_APP_URL = 'https://analytics.airqo.net';

const typeDotClass: Record<MonitorType, string> = {
  LCS: 'bg-blue-600',
  Reference: 'bg-emerald-600',
  Inactive: 'bg-slate-400',
};

const typeLabels: Record<MonitorType, string> = {
  Reference: 'Reference',
  LCS: 'Low-Cost Sensor (LCS)',
  Inactive: 'Inactive',
};

const getBadgeClassesForMonitorType = (type: MonitorType) => {
  if (type === 'Reference')
    return 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700';
  if (type === 'LCS')
    return 'inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700';
  return 'inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600';
};

const getStatusBadgeClasses = (status: string) => {
  if (status === 'active')
    return 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700';
  if (status === 'inactive')
    return 'inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-sm font-semibold text-slate-600';
  return 'inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-700';
};

const formatRelativeTime = (iso?: string) => {
  if (!iso) return '--';
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '--';
  }
};

const formatMonthYear = (iso?: string) => {
  if (!iso) return '--';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '--';
  }
};

const formatCoordinates = (lat: number | null, lon: number | null) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '--';
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '--';

  const latSuffix = lat < 0 ? 'S' : 'N';
  const lonSuffix = lon < 0 ? 'W' : 'E';
  return `${Math.abs(lat).toFixed(4)}°${latSuffix} ${Math.abs(lon).toFixed(4)}°${lonSuffix}`;
};

const displayText = (value?: string | null) =>
  value && value.trim() ? value : '--';

const formatNetworkName = (value?: string | null) =>
  value && value.trim()
    ? value.trim().toLowerCase() === 'airqo'
      ? 'AirQo'
      : value.trim()
    : '--';

const StatLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">
      {label}
    </span>
    <span className="text-sm text-slate-800">{value}</span>
  </div>
);

interface NetworkCoverageSidebarProps {
  countries: NetworkCoverageCountry[];
  query: string;
  searchQuery?: string;
  isSearching?: boolean;
  selectedTypes: MonitorType[];
  activeOnly: boolean;
  selectedCountry: NetworkCoverageCountry | null;
  selectedMonitor: NetworkCoverageMonitor | null;
  showAddMonitorPromptFor: string | null;
  isLoading?: boolean;
  error?: string | null;
  onQueryChange: (value: string) => void;
  onToggleType: (type: MonitorType) => void;
  onToggleActiveOnly: () => void;
  onSelectCountry: (countryId: string) => void;
  onSelectMonitor: (monitorId: string, countryId: string) => void;
  onClosePrompt: () => void;
  onResetToOverview: () => void;
  onRetry?: () => void;
  monitorLoading?: boolean;
}

const NetworkCoverageSidebar: React.FC<NetworkCoverageSidebarProps> = ({
  countries,
  query,
  searchQuery,
  selectedTypes,
  activeOnly,
  selectedCountry,
  selectedMonitor,
  showAddMonitorPromptFor,
  onQueryChange,
  onToggleType,
  onToggleActiveOnly,
  onSelectCountry,
  onSelectMonitor,
  onClosePrompt,
  onResetToOverview,
  onRetry,
  isLoading = false,
  error = null,
  monitorLoading = false,
  // `isSearching` indicates the user is typing and debounce hasn't settled
  isSearching = false,
}) => {
  const q = (searchQuery || '').trim().toLowerCase();

  const filteredCountries = React.useMemo(() => {
    if (!q) return countries;
    return countries.filter((country) => {
      if (country.country.toLowerCase().includes(q)) return true;
      return country.monitors.some((monitor) => {
        return (
          (monitor.name || '').toLowerCase().includes(q) ||
          (monitor.city || '').toLowerCase().includes(q) ||
          (monitor.network || '').toLowerCase().includes(q)
        );
      });
    });
  }, [countries, q]);

  const monitoredCountriesCount = filteredCountries.filter(
    (country) => country.monitors.length > 0,
  ).length;

  const filteredCountryMonitors = React.useMemo(() => {
    if (!selectedCountry) return [];
    if (!q) return selectedCountry.monitors;
    return selectedCountry.monitors.filter((monitor) => {
      return (
        (monitor.name || '').toLowerCase().includes(q) ||
        (monitor.city || '').toLowerCase().includes(q) ||
        (monitor.network || '').toLowerCase().includes(q)
      );
    });
  }, [selectedCountry, q]);

  const isOverviewLoading = isLoading && !selectedCountry;

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:rounded-none lg:border-0 lg:border-r lg:border-slate-200 lg:shadow-none">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white px-4 py-3.5">
        {!selectedCountry ? (
          <>
            {/* Search input */}
            <div className="relative">
              <AqSearchRefraction className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search country, city, network or station..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(['Reference', 'LCS', 'Inactive'] as MonitorType[]).map(
                (type) => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onToggleType(type)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                        active
                          ? type === 'Reference'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : type === 'LCS'
                              ? 'border-blue-300 bg-blue-50 text-blue-700'
                              : 'border-slate-300 bg-slate-100 text-slate-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${typeDotClass[type]}`}
                      />
                      {typeLabels[type]}
                    </button>
                  );
                },
              )}
              <button
                type="button"
                onClick={onToggleActiveOnly}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  activeOnly
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${activeOnly ? 'bg-blue-500' : 'bg-slate-300'}`}
                />
                Active only
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {monitoredCountriesCount}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {countries.length}
                  </span>{' '}
                  countries monitored
                </p>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={onResetToOverview}
            className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <FiChevronLeft className="h-4 w-4 flex-shrink-0" />
            <span className="text-slate-500">All countries</span>
            <span className="text-slate-300">·</span>
            <span className="truncate font-semibold text-slate-800">
              {selectedCountry.country}
            </span>
          </button>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {/* Error state */}
        {error && countries.length === 0 && !selectedCountry ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-semibold text-red-800">
              Unable to load network coverage data
            </p>
            <p className="mt-1 text-red-600">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Try again
              </button>
            )}
          </div>
        ) : null}

        {/* Structured loading skeletons */}
        {isOverviewLoading || (!selectedCountry && isSearching) ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 rounded bg-slate-200"
                      style={{ width: `${52 + (index % 4) * 12}%` }}
                    />
                    <div className="h-3 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-4 rounded bg-slate-200" />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-slate-100" />
                  {index % 3 !== 2 && (
                    <div className="h-5 w-14 rounded-full bg-slate-100" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* ── Country overview list ── */}
        {!selectedCountry &&
          !isOverviewLoading &&
          filteredCountries.length > 0 && (
            <div className="space-y-1.5">
              {filteredCountries.map((country) => {
                const counts = country.monitors.reduce(
                  (accumulator, monitor) => {
                    accumulator[monitor.type] += 1;
                    return accumulator;
                  },
                  { LCS: 0, Reference: 0, Inactive: 0 },
                );

                const totalMonitors = country.monitors.length;
                const activeMonitors = country.monitors.filter(
                  (m) => m.status === 'active',
                ).length;
                const isNoData = totalMonitors === 0;
                const isPromptOpen = showAddMonitorPromptFor === country.id;

                return (
                  <div key={country.id} className="relative">
                    <button
                      type="button"
                      onClick={() => onSelectCountry(country.id)}
                      className={`group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${
                        isNoData
                          ? 'cursor-default border-slate-100 bg-slate-50 text-slate-400'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm active:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`truncate text-[15px] font-semibold leading-6 ${
                              isNoData ? 'text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {country.country}
                          </h3>
                          {isNoData ? (
                            <p className="mt-0.5 text-xs text-slate-400">
                              No monitors installed
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs text-slate-500">
                              <span className="font-medium text-slate-700">
                                {totalMonitors}
                              </span>{' '}
                              monitor{totalMonitors !== 1 ? 's' : ''}
                              {' · '}
                              <span
                                className={
                                  activeMonitors > 0
                                    ? 'font-medium text-emerald-600'
                                    : 'text-slate-400'
                                }
                              >
                                {activeMonitors} active
                              </span>
                            </p>
                          )}
                        </div>
                        {!isNoData && (
                          <FiChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-blue-400" />
                        )}
                      </div>

                      {!isNoData && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {counts.LCS > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                              {typeLabels['LCS']} · {counts.LCS}
                            </span>
                          )}
                          {counts.Reference > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              {typeLabels['Reference']} · {counts.Reference}
                            </span>
                          )}
                          {counts.Inactive > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive · {counts.Inactive}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {isPromptOpen && (
                      <div className="absolute left-4 right-4 top-[76px] z-30 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              No monitors in {country.country} yet
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              Contact AirQo to help extend air quality
                              monitoring to this region.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={onClosePrompt}
                            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* Empty search result state */}
        {!selectedCountry &&
        !isOverviewLoading &&
        filteredCountries.length === 0 &&
        !error ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <AqSearchRefraction className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-600">
              No countries match your search
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Try adjusting the filters or search term
            </p>
          </div>
        ) : null}

        {/* ── Country monitor list ── */}
        {selectedCountry && !selectedMonitor && (
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50/70 to-slate-50 p-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedCountry.country}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {filteredCountryMonitors.length}
                </span>{' '}
                monitor{filteredCountryMonitors.length !== 1 ? 's' : ''}{' '}
                available
              </p>
            </div>

            {filteredCountryMonitors.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                No monitors match the current filters.
              </div>
            ) : (
              filteredCountryMonitors.map((monitor) => (
                <button
                  key={monitor.id}
                  type="button"
                  onClick={() =>
                    onSelectMonitor(monitor.id, selectedCountry.id)
                  }
                  className="group w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-[15px] font-semibold text-slate-900">
                        {monitor.name}
                      </h4>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                        <AqMarkerPin01 className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        {monitor.city}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          monitor.type === 'Reference'
                            ? 'bg-emerald-100 text-emerald-700'
                            : monitor.type === 'LCS'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {typeLabels[monitor.type]}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          monitor.status === 'active'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            monitor.status === 'active'
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                        {monitor.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Monitor detail ── */}
        {monitorLoading && !selectedMonitor ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
            <div className="animate-pulse">
              <div className="h-6 w-28 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-40 rounded bg-slate-100" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ) : null}

        {selectedMonitor && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* Monitor header */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-white p-4">
              <div
                className={getBadgeClassesForMonitorType(selectedMonitor.type)}
              >
                {typeLabels[selectedMonitor.type]} Monitor
              </div>
              <h3 className="mt-2 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                {selectedMonitor.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-base text-slate-500">
                <AqMarkerPin01 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                {selectedMonitor.city}, {selectedMonitor.country}
              </p>
            </div>

            {/* Network */}
            <div className="border-b border-slate-100 p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Network
              </h4>
              <p className="mb-2 text-base font-semibold text-slate-900">
                {formatNetworkName(selectedMonitor.network)}
              </p>
              <StatLine
                label="Operator"
                value={displayText(selectedMonitor.operator)}
              />
              <StatLine
                label="Status"
                value={
                  <span
                    className={getStatusBadgeClasses(selectedMonitor.status)}
                  >
                    {selectedMonitor.status}
                  </span>
                }
              />
              <StatLine
                label="Last Active"
                value={formatRelativeTime(selectedMonitor.lastActive)}
              />
            </div>

            {/* Equipment */}
            <div className="border-b border-slate-100 p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Equipment
              </h4>
              <StatLine
                label="Instrument"
                value={displayText(selectedMonitor.equipment)}
              />
              <StatLine
                label="Manufacturer"
                value={displayText(selectedMonitor.manufacturer)}
              />
              <StatLine
                label="Pollutants"
                value={
                  selectedMonitor.pollutants.length
                    ? selectedMonitor.pollutants.join(' · ')
                    : '--'
                }
              />
              <StatLine
                label="Resolution"
                value={displayText(selectedMonitor.resolution)}
              />
              <StatLine
                label="Transmission"
                value={displayText(selectedMonitor.transmission)}
              />
            </div>

            {/* Location */}
            <div className="border-b border-slate-100 p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Location
              </h4>
              <StatLine
                label="Site"
                value={displayText(selectedMonitor.site)}
              />
              <StatLine
                label="Land Use"
                value={displayText(selectedMonitor.landUse)}
              />
              <StatLine
                label="Coordinates"
                value={formatCoordinates(
                  selectedMonitor.latitude,
                  selectedMonitor.longitude,
                )}
              />
              <StatLine
                label="Deployed"
                value={formatMonthYear(selectedMonitor.deployed)}
              />
            </div>

            {/* Calibration */}
            <div className="border-b border-slate-100 p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Calibration
              </h4>
              <StatLine
                label="Last Date"
                value={formatMonthYear(selectedMonitor.calibrationLastDate)}
              />
              <StatLine
                label="Method"
                value={displayText(selectedMonitor.calibrationMethod)}
              />
              <StatLine
                label="Uptime (30d)"
                value={displayText(selectedMonitor.uptime30d)}
              />
            </div>

            {/* Data Access */}
            <div className="border-b border-slate-100 p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Data Access
              </h4>
              <StatLine
                label="Public Data"
                value={displayText(selectedMonitor.publicData)}
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      ANALYTICS_APP_URL,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 active:bg-blue-200"
                >
                  View Data
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Organisation */}
            <div className="p-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Organisation
              </h4>
              <StatLine
                label="Organisation"
                value={displayText(selectedMonitor.organisation)}
              />
              <StatLine
                label="Co-location"
                value={displayText(selectedMonitor.coLocation)}
              />
              {selectedMonitor.coLocationNote &&
                selectedMonitor.coLocationNote !== '--' && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    {displayText(selectedMonitor.coLocationNote)}
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default NetworkCoverageSidebar;
