import { AqMarkerPin01, AqSearchRefraction } from '@airqo/icons-react';
import React from 'react';
import { FiChevronLeft, FiX } from 'react-icons/fi';

import { CountryCoverage, MonitorStation, MonitorType } from '../mockup';

const VERTEX_APP_URL = 'https://vertex.airqo.net';

const typeDotClass: Record<MonitorType, string> = {
  LCS: 'bg-blue-600',
  Reference: 'bg-emerald-600',
  Inactive: 'bg-slate-400',
};

const StatLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[112px_1fr] gap-2 py-1 text-[14px] sm:grid-cols-[130px_1fr] sm:text-[15px]">
    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 sm:text-xs">
      {label}
    </span>
    <span className="text-[15px] text-slate-900 sm:text-base">{value}</span>
  </div>
);

interface NetworkCoverageSidebarProps {
  countries: CountryCoverage[];
  query: string;
  selectedTypes: MonitorType[];
  activeOnly: boolean;
  selectedCountry: CountryCoverage | null;
  selectedMonitor: MonitorStation | null;
  showAddMonitorPromptFor: string | null;
  onQueryChange: (value: string) => void;
  onToggleType: (type: MonitorType) => void;
  onToggleActiveOnly: () => void;
  onSelectCountry: (countryId: string) => void;
  onSelectMonitor: (monitorId: string, countryId: string) => void;
  onClosePrompt: () => void;
  onResetToOverview: () => void;
}

const NetworkCoverageSidebar: React.FC<NetworkCoverageSidebarProps> = ({
  countries,
  query,
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
}) => {
  const monitoredCountriesCount = countries.filter(
    (country) => country.monitors.length > 0,
  ).length;

  const filteredCountries = countries.filter((country) => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return true;
    }
    return country.country.toLowerCase().includes(search);
  });

  const filteredCountryMonitors = selectedCountry
    ? selectedCountry.monitors.filter((monitor) => {
        const typeAllowed = selectedTypes.includes(monitor.type);
        const statusAllowed = activeOnly ? monitor.status === 'active' : true;
        return typeAllowed && statusAllowed;
      })
    : [];

  return (
    <aside className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:rounded-none lg:border-0 lg:border-r lg:border-slate-200">
      <div className="border-b border-slate-200 px-4 py-3">
        {!selectedCountry ? (
          <>
            <div className="relative">
              <AqSearchRefraction className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search country, city, network or station..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-blue-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Clear search"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(['Reference', 'LCS'] as MonitorType[]).map((type) => {
                const active = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onToggleType(type)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                      active
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${typeDotClass[type]}`}
                    />
                    {type}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={onToggleActiveOnly}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  activeOnly
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                Active only
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">
                {monitoredCountriesCount}
              </span>{' '}
              of {countries.length} countries monitored
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={onResetToOverview}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700"
          >
            <FiChevronLeft className="h-4 w-4" />
            {selectedCountry.country}
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-3 overscroll-contain">
        {!selectedCountry && (
          <div className="space-y-2">
            {filteredCountries.map((country) => {
              const counts = country.monitors.reduce(
                (accumulator, monitor) => {
                  accumulator[monitor.type] += 1;
                  return accumulator;
                },
                { LCS: 0, Reference: 0, Inactive: 0 },
              );

              const isNoData = country.monitors.length === 0;
              const isPromptOpen = showAddMonitorPromptFor === country.id;

              return (
                <div key={country.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onSelectCountry(country.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left ${
                      isNoData
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[16px] font-semibold leading-6 text-inherit sm:text-[17px] sm:leading-7">
                          {country.country}
                        </h3>
                        {isNoData ? (
                          <p className="mt-1 text-xs">No monitors installed</p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">
                            {country.monitors.length} monitor
                            {country.monitors.length === 1 ? '' : 's'} {' · '}
                            {
                              country.monitors.filter(
                                (monitor) => monitor.status === 'active',
                              ).length
                            }{' '}
                            active
                          </p>
                        )}
                      </div>
                      <AqMarkerPin01 className="mt-1 h-4 w-4 text-slate-400" />
                    </div>

                    {!isNoData && (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {counts.LCS > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            LCS {counts.LCS}
                          </span>
                        )}
                        {counts.Reference > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            Reference {counts.Reference}
                          </span>
                        )}
                        {counts.Inactive > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            Inactive {counts.Inactive}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {isPromptOpen && (
                    <div className="absolute left-4 right-4 top-[76px] z-30 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            No monitors in {country.country} yet
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            Add a monitor to help build Africa&apos;s air
                            quality picture.
                          </p>
                        </div>
                        <button type="button" onClick={onClosePrompt}>
                          <FiX className="h-4 w-4 text-slate-400" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(VERTEX_APP_URL, '_blank')}
                        className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Add a monitor
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedCountry && !selectedMonitor && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-[24px] font-semibold leading-7 text-slate-900 sm:text-[26px]">
                {selectedCountry.country}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {filteredCountryMonitors.length} monitor
                {filteredCountryMonitors.length === 1 ? '' : 's'} available with
                current filters
              </p>
            </div>

            {filteredCountryMonitors.map((monitor) => (
              <button
                key={monitor.id}
                type="button"
                onClick={() => onSelectMonitor(monitor.id, selectedCountry.id)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-blue-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-slate-900 sm:text-lg">
                    {monitor.name}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      monitor.type === 'Reference'
                        ? 'bg-emerald-100 text-emerald-700'
                        : monitor.type === 'LCS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {monitor.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{monitor.city}</p>
              </button>
            ))}

            {filteredCountryMonitors.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                No monitors match the current filters.
              </div>
            )}
          </div>
        )}

        {selectedMonitor && (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                {selectedMonitor.type} Monitor
              </div>
              <h3 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {selectedMonitor.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-lg text-slate-500 sm:text-xl">
                <AqMarkerPin01 className="h-4 w-4 text-slate-400" />
                {selectedMonitor.city}, {selectedMonitor.country}
              </p>
            </div>

            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Network
              </h4>
              <p className="mb-2 text-[15px] font-semibold text-slate-900">
                {selectedMonitor.network}
              </p>
              <StatLine label="Operator" value={selectedMonitor.operator} />
              <StatLine
                label="Status"
                value={
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700">
                    {selectedMonitor.status}
                  </span>
                }
              />
              <StatLine
                label="Last Active"
                value={selectedMonitor.lastActive}
              />
            </div>

            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Equipment
              </h4>
              <StatLine label="Instrument" value={selectedMonitor.equipment} />
              <StatLine
                label="Manufacturer"
                value={selectedMonitor.manufacturer}
              />
              <StatLine
                label="Pollutants"
                value={selectedMonitor.pollutants.join(' · ')}
              />
              <StatLine label="Resolution" value={selectedMonitor.resolution} />
              <StatLine
                label="Transmission"
                value={selectedMonitor.transmission}
              />
            </div>

            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Location
              </h4>
              <StatLine label="Site" value={selectedMonitor.site} />
              <StatLine label="Land Use" value={selectedMonitor.landUse} />
              <StatLine
                label="Coordinates"
                value={`${selectedMonitor.latitude.toFixed(4)}°N ${selectedMonitor.longitude.toFixed(4)}°E`}
              />
              <StatLine label="Deployed" value={selectedMonitor.deployed} />
            </div>

            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Calibration
              </h4>
              <StatLine
                label="Last Date"
                value={selectedMonitor.calibrationLastDate}
              />
              <StatLine
                label="Method"
                value={selectedMonitor.calibrationMethod}
              />
              <StatLine
                label="Uptime (30d)"
                value={selectedMonitor.uptime30d}
              />
            </div>

            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Data Access
              </h4>
              <StatLine
                label="Public Data"
                value={selectedMonitor.publicData}
              />
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => window.open(VERTEX_APP_URL, '_blank')}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700"
                >
                  View data
                </button>
              </div>
            </div>

            <div className="p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
                Contact
              </h4>
              <StatLine
                label="Organisation"
                value={selectedMonitor.organisation}
              />
              <StatLine
                label="Co-location"
                value={
                  <span className="font-semibold text-emerald-600">
                    {selectedMonitor.coLocation}
                  </span>
                }
              />
              <p className="mt-2 text-sm text-slate-500">
                {selectedMonitor.coLocationNote}
              </p>
              <button
                type="button"
                onClick={() => window.open(VERTEX_APP_URL, '_blank')}
                className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                Request co-location
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default NetworkCoverageSidebar;
