/* eslint-disable simple-import-sort/imports */
import React from 'react';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import {
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageMonitor,
} from '../networkCoverageTypes';

import { getEnvironmentAwareUrl } from '@/lib/environmentAwareUrl';

const formatRelativeTime = (value?: string | null) => {
  try {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--';
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch {
    return '--';
  }
};

const formatMonthYear = (value?: string | null) => {
  try {
    if (!value) return '--';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--';
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '--';
  }
};

const typeLabels: Record<MonitorType, string> = {
  Reference: 'Reference Monitor',
  LCS: 'Low-Cost Sensor (LCS)',
  Inactive: 'Inactive',
};

const typeDotClass: Record<MonitorType, string> = {
  Reference: 'bg-emerald-400',
  LCS: 'bg-blue-400',
  Inactive: 'bg-slate-300',
};

const getBadgeClassesForMonitorType = (t: MonitorType) => {
  if (t === 'Reference')
    return 'inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700';
  if (t === 'LCS')
    return 'inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700';
  return 'inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700';
};

const getStatusBadgeClasses = (status: 'active' | 'inactive') =>
  status === 'active'
    ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'
    : 'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600';

const ANALYTICS_APP_URL = 'https://nexus.airqo.net';

const formatCoordinates = (lat: number | null, lon: number | null) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '--';
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '--';

  const latSuffix = lat < 0 ? 'S' : 'N';
  const lonSuffix = lon < 0 ? 'W' : 'E';
  return `${Math.abs(lat).toFixed(4)}°${latSuffix} ${Math.abs(lon).toFixed(4)}°${lonSuffix}`;
};

const displayText = (value?: string | null) =>
  value && value.trim() ? value : '--';

const formatNetworkName = (value?: string | null) => {
  if (!value || !value.trim()) return '--';
  const trimmed = value.trim();
  return trimmed.toLowerCase() === 'airqo' ? 'AirQo' : trimmed;
};

const StatLine = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-600">
      {label}
    </span>
    <span className="text-[15px] text-slate-900">{value}</span>
  </div>
);

interface NetworkCoverageSidebarProps {
  countries: NetworkCoverageCountry[];
  query: string;
  searchQuery?: string;
  isSearching?: boolean;
  selectedTypes: MonitorType[];
  activeOnly: boolean;
  selectedNetworks: string[];
  availableNetworks: string[];
  selectedCountry: NetworkCoverageCountry | null;
  selectedMonitor: NetworkCoverageMonitor | null;
  showAddMonitorPromptFor: string | null;
  isLoading?: boolean;
  error?: string | null;
  onQueryChange: (value: string) => void;
  onToggleType: (type: MonitorType) => void;
  onToggleActiveOnly: () => void;
  onToggleNetwork: (network: string) => void;
  onSelectCountry: (countryId: string) => void;
  onSelectMonitor: (monitorId: string, countryId: string) => void;
  onClosePrompt: () => void;
  monitoredCountriesTotal?: number;
  onResetToOverview: () => void;
  onRetry?: () => void;
  onOpenAddMonitor?: (
    countryId: string,
    countryName?: string,
    iso2?: string,
  ) => void;
  monitorLoading?: boolean;
  isCountryLoading?: boolean;
  countryError?: string | null;
  onRetryCountry?: () => void;
  isSummaryLoading?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  toggleButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const NetworkCoverageSidebar: React.FC<NetworkCoverageSidebarProps> = ({
  countries,
  query,
  searchQuery,
  selectedTypes,
  activeOnly,
  selectedNetworks,
  availableNetworks,
  selectedCountry,
  selectedMonitor,
  showAddMonitorPromptFor,
  onQueryChange,
  onToggleType,
  onToggleActiveOnly,
  onToggleNetwork,
  onSelectCountry,
  onSelectMonitor,
  onClosePrompt,
  onResetToOverview,
  onRetry,
  onOpenAddMonitor,
  monitoredCountriesTotal,
  isLoading = false,
  error = null,
  monitorLoading = false,
  isCountryLoading = false,
  countryError = null,
  onRetryCountry,
  // `isSearching` indicates the user is typing and debounce hasn't settled
  isSearching = false,
  isSummaryLoading = false,
  isOpen = false,
  onClose,
  toggleButtonRef,
}) => {
  const q = (searchQuery || '').trim().toLowerCase();

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const networkDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLElement | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const [promptTop, setPromptTop] = React.useState<number | null>(null);
  const [networkDropdownOpen, setNetworkDropdownOpen] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [unmonitoredCollapsed, setUnmonitoredCollapsed] = React.useState(true);

  // On mobile the sidebar stays open after a country tap, so a deep scroll
  // position would leave the country header + "Add device" button off-screen.
  // Reset the list to the top whenever the selected country identity changes.
  const selectedCountryId = selectedCountry?.id;
  React.useEffect(() => {
    if (!selectedCountryId) return;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [selectedCountryId]);

  const filteredCountries = React.useMemo(() => {
    return countries.filter((country) => {
      if (!q) return true;
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

  // Split the country list into monitored / not-yet-monitored. Only used when
  // there is no active search query (search keeps the flat filtered list).
  const { monitoredCountries, unmonitoredCountries } = React.useMemo(() => {
    const monitored: NetworkCoverageCountry[] = [];
    const unmonitored: NetworkCoverageCountry[] = [];
    filteredCountries.forEach((country) => {
      if (country.monitors.length > 0) monitored.push(country);
      else unmonitored.push(country);
    });
    return { monitoredCountries: monitored, unmonitoredCountries: unmonitored };
  }, [filteredCountries]);

  // Letters that have at least one VISIBLE country, for the A-Z quick-jump
  // row. Only meaningful with no active search query. When the unmonitored
  // section is collapsed those rows are not rendered, so their letters must
  // not be indexed either (otherwise jumps target hidden rows).
  const azLetters = React.useMemo(() => {
    const visible = unmonitoredCollapsed
      ? monitoredCountries
      : filteredCountries;
    const present = new Set<string>();
    visible.forEach((country) => {
      const letter = (country.country || '').trim().charAt(0).toUpperCase();
      if (letter >= 'A' && letter <= 'Z') present.add(letter);
    });
    return Array.from(present).sort();
  }, [filteredCountries, monitoredCountries, unmonitoredCollapsed]);

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target as Node)
      ) {
        setNetworkDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && networkDropdownOpen) {
        setNetworkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [networkDropdownOpen]);

  // Detect mobile viewport (≤1023px) for focus management & a11y hiding.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 1023px)');
    const handle = () => setIsMobileViewport(mql.matches);
    handle();
    if (mql.addEventListener) {
      mql.addEventListener('change', handle);
      return () => mql.removeEventListener('change', handle);
    }
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const isOverviewLoading = isLoading && !selectedCountry;

  // Validate the monitor-provided view URL before enabling navigation.
  // Only absolute http(s) URLs are allowed to avoid opening non-web schemes.
  const validatedViewDataUrl = React.useMemo(() => {
    try {
      const raw = selectedMonitor?.viewDataUrl?.trim();
      if (!raw) return null;
      try {
        const parsed = new URL(raw);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return parsed.href;
        }
        return null;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }, [selectedMonitor?.viewDataUrl]);

  // Close on Escape when the sidebar is open on mobile.
  React.useEffect(() => {
    if (!isMobileViewport || !isOpen || !onClose) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isMobileViewport, isOpen, onClose]);

  // Move focus into the panel when it opens on mobile; return focus to the
  // document body is handled by the parent toggle. We focus the search input
  // (overview) or the close button (country/monitor view) on open.
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (!isMobileViewport || !isOpen) return;
    const target = searchInputRef.current || closeButtonRef.current;
    if (target) {
      window.setTimeout(() => target.focus(), 350);
    }
  }, [isMobileViewport, isOpen, selectedCountry]);

  // Return focus to the toggle button when the sidebar closes on mobile.
  const wasOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    if (!isMobileViewport) {
      wasOpenRef.current = isOpen;
      return;
    }
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (wasOpen && !isOpen && toggleButtonRef?.current) {
      window.setTimeout(() => toggleButtonRef.current?.focus(), 100);
    }
  }, [isMobileViewport, isOpen, toggleButtonRef]);

  // Scroll the country list so the first VISIBLE country starting with the
  // given letter sits at the top of the list container. Used by the A-Z
  // quick-jump row. Hidden rows (collapsed unmonitored section) are never
  // targeted because azLetters only indexes visible countries.
  const jumpToLetter = React.useCallback(
    (letter: string) => {
      const visible = unmonitoredCollapsed
        ? monitoredCountries
        : filteredCountries;
      const target = visible.find((country) =>
        (country.country || '').trim().toUpperCase().startsWith(letter),
      );
      if (!target) return;
      const container = scrollRef.current;
      if (!container) return;
      const id = `country-row-${target.iso2 || target.country}`;
      const el = container.querySelector<HTMLElement>(
        `[data-country-id="${CSS.escape(id)}"]`,
      );
      if (!el) return;
      const top = el.offsetTop - container.offsetTop;
      if (Number.isFinite(top)) {
        container.scrollTo({ top, behavior: 'smooth' });
      } else {
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    },
    [filteredCountries, monitoredCountries, unmonitoredCollapsed],
  );

  // Arrow-key navigation for a list of [data-nav-row] buttons. Handles both
  // the country list and the monitor list containers.
  const handleListKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      if (
        key !== 'ArrowDown' &&
        key !== 'ArrowUp' &&
        key !== 'Home' &&
        key !== 'End'
      ) {
        return;
      }
      const container = event.currentTarget;
      const rows = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button[data-nav-row]:not([disabled])',
        ),
      );
      if (rows.length === 0) return;
      const active = document.activeElement;
      const currentIndex = rows.findIndex((row) => row === active);
      let nextIndex = currentIndex;
      if (key === 'ArrowDown') {
        nextIndex =
          currentIndex < 0 ? 0 : Math.min(rows.length - 1, currentIndex + 1);
      } else if (key === 'ArrowUp') {
        nextIndex =
          currentIndex < 0 ? rows.length - 1 : Math.max(0, currentIndex - 1);
      } else if (key === 'Home') {
        nextIndex = 0;
      } else if (key === 'End') {
        nextIndex = rows.length - 1;
      }
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        rows[nextIndex].focus();
      }
    },
    [],
  );

  // Stable id used as the A-Z quick-jump scroll target for a country row.
  const countryRowId = (country: NetworkCoverageCountry) =>
    `country-row-${country.iso2 || country.country}`;

  // Shared "Add device" action: open the in-app add-monitor flow when the page
  // provides it, otherwise fall back to the Vertex dashboard in a new tab.
  const openAddDevice = (
    countryId: string,
    countryName?: string,
    iso2?: string,
  ) => {
    if (onOpenAddMonitor) {
      onOpenAddMonitor(countryId, countryName, iso2);
      return;
    }
    window.open(
      getEnvironmentAwareUrl('https://vertex.airqo.net'),
      '_blank',
      'noopener,noreferrer',
    );
  };

  // Renders a single country row (button + optional add-monitor prompt). Shared
  // by the flat (search) list and the monitored/unmonitored sections.
  const renderCountryRow = (country: NetworkCoverageCountry) => {
    const stats = country.stats;
    const lcsCount = stats?.LCS ?? 0;
    const refCount = stats?.Reference ?? 0;
    const inactiveCount = stats?.Inactive ?? 0;
    const totalMonitors = stats?.total ?? country.monitors.length;
    const activeMonitors = stats?.active;
    const isNoData = totalMonitors === 0;
    const isPromptOpen = showAddMonitorPromptFor === country.id;

    return (
      <div key={country.id} data-country-id={countryRowId(country)}>
        <button
          type="button"
          data-nav-row
          onClick={(event) => {
            if (isNoData) {
              try {
                const buttonEl = event.currentTarget as HTMLElement;
                const containerEl = scrollRef.current;
                if (containerEl && buttonEl) {
                  const containerRect = containerEl.getBoundingClientRect();
                  const buttonRect = buttonEl.getBoundingClientRect();
                  const top =
                    buttonRect.top -
                    containerRect.top +
                    containerEl.scrollTop -
                    8;
                  setPromptTop(Math.max(8, Math.round(top)));
                }
              } catch {
                setPromptTop(null);
              }
            }
            onSelectCountry(country.id);
          }}
          className={`group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${
            isNoData
              ? 'cursor-pointer border-slate-100 bg-slate-50 text-slate-500'
              : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm active:bg-blue-50/40'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={`truncate text-[15px] font-semibold leading-6 ${
                  isNoData ? 'text-slate-500' : 'text-slate-950'
                }`}
              >
                {country.country}
              </h3>
              {isNoData ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  No monitors registered
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {totalMonitors}
                  </span>{' '}
                  monitor{totalMonitors !== 1 ? 's' : ''}
                  {activeMonitors != null && (
                    <>
                      {' · '}
                      <span
                        className={
                          activeMonitors > 0
                            ? 'font-semibold text-emerald-700'
                            : 'text-slate-500'
                        }
                      >
                        {activeMonitors} active
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
            {!isNoData && (
              <FiChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-blue-400" />
            )}
          </div>

          {!isNoData && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lcsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {typeLabels['LCS']} · {lcsCount}
                </span>
              )}
              {refCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  {typeLabels['Reference']} · {refCount}
                </span>
              )}
              {inactiveCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Inactive · {inactiveCount}
                </span>
              )}
            </div>
          )}
        </button>

        {isPromptOpen && (
          <div
            className="absolute left-4 right-4 z-50 pointer-events-auto rounded-xl border border-slate-300 bg-white p-4 shadow-xl"
            style={{ top: promptTop ?? 76 }}
          >
            <button
              type="button"
              onClick={onClosePrompt}
              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close prompt"
            >
              <FiX className="h-4 w-4" />
            </button>

            <h4 className="mb-2 text-lg font-semibold text-slate-950">
              No devices registered in {country.country}
            </h4>
            <p className="mb-3 text-sm text-slate-600">
              You can add a device to start collecting data for this country.
            </p>

            <button
              type="button"
              onClick={() =>
                openAddDevice(country.id, country.country, country.iso2)
              }
              aria-label={`Add a device in ${country.country}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <FiPlus className="h-4 w-4" aria-hidden="true" />
              Add device
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      ref={panelRef}
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm lg:rounded-none lg:border-0 lg:border-r lg:border-slate-300 lg:shadow-none ${
        isMobileViewport && !isOpen
          ? 'invisible pointer-events-none'
          : 'visible pointer-events-auto'
      }`}
      aria-hidden={isMobileViewport && !isOpen ? 'true' : 'false'}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-3.5">
        {/* Screen-reader heading for the country/monitor navigation region */}
        <h2 className="sr-only">Countries and monitors</h2>
        {!selectedCountry ? (
          <>
            {/* Search input */}
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <label className="sr-only" htmlFor="nc-sidebar-search">
                Search countries, cities, networks or stations
              </label>
              <input
                id="nc-sidebar-search"
                ref={searchInputRef}
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search country, city, network or station..."
                aria-label="Search countries, cities, networks or stations"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <div role="group" aria-label="Monitor type filters">
                {(['Reference', 'LCS', 'Inactive'] as MonitorType[]).map(
                  (type) => {
                    const active = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onToggleType(type)}
                        aria-pressed={active}
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
                          aria-hidden="true"
                        />
                        {typeLabels[type]}
                      </button>
                    );
                  },
                )}
                <button
                  type="button"
                  onClick={onToggleActiveOnly}
                  aria-pressed={activeOnly}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                    activeOnly
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${activeOnly ? 'bg-blue-500' : 'bg-slate-300'}`}
                    aria-hidden="true"
                  />
                  Active only
                </button>
              </div>
            </div>

            {/* Source / Network filter */}
            {availableNetworks.length > 0 && (
              <div className="relative mt-3" ref={networkDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNetworkDropdownOpen((p) => !p)}
                  aria-expanded={networkDropdownOpen}
                  aria-haspopup="true"
                  className={`inline-flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    selectedNetworks.length > 0
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">
                    {selectedNetworks.length === 0
                      ? 'All sources'
                      : selectedNetworks.length === 1
                        ? formatNetworkName(selectedNetworks[0])
                        : `${selectedNetworks.length} sources selected`}
                  </span>
                  <FiChevronDown
                    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {networkDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="p-1">
                      {selectedNetworks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            selectedNetworks.forEach((n) => onToggleNetwork(n));
                          }}
                          className="w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Clear all
                        </button>
                      )}
                      {availableNetworks.map((network) => {
                        const isActive = selectedNetworks.includes(network);
                        return (
                          <button
                            key={network}
                            type="button"
                            onClick={() => onToggleNetwork(network)}
                            className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-50 font-semibold text-indigo-700'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-300'}`}
                            />
                            <span className="truncate">
                              {formatNetworkName(network)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="mt-3">
              {isOverviewLoading ? (
                <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
              ) : (
                (() => {
                  const hasClientOnlyFilter =
                    !!q ||
                    activeOnly ||
                    selectedTypes.includes('Inactive') ||
                    selectedTypes.length === 1 ||
                    selectedNetworks.length > 0;
                  const count = hasClientOnlyFilter
                    ? monitoredCountriesCount
                    : (monitoredCountriesTotal ?? monitoredCountriesCount);
                  return (
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold text-slate-950">
                        {count}
                      </span>{' '}
                      <span className="text-slate-500">
                        {hasClientOnlyFilter ? 'matching' : 'monitored'}{' '}
                        countries
                      </span>
                    </p>
                  );
                })()
              )}
            </div>

            {/* A-Z quick-jump index (only with no search query and > 10 countries) */}
            {!q &&
              !isOverviewLoading &&
              filteredCountries.length > 10 &&
              azLetters.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {azLetters.map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => jumpToLetter(letter)}
                      aria-label={`Jump to countries starting with ${letter}`}
                      className="rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}

            {/* Mobile close button for the sidebar panel */}
            {onClose && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onClose()}
                aria-label="Close countries panel"
                className="lg:hidden grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onResetToOverview}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              <FiChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="text-slate-600">All countries</span>
              <span className="text-slate-300">·</span>
              <span className="truncate font-semibold text-slate-900">
                {selectedCountry.country}
              </span>
            </button>
            {onClose && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onClose()}
                aria-label="Close countries panel"
                className="lg:hidden grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        aria-busy={isSummaryLoading}
        onKeyDown={handleListKeyDown}
      >
        {/* Error state */}
        {error && countries.length === 0 && !selectedCountry ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <p className="font-semibold text-red-900">
              Unable to load network coverage data
            </p>
            <p className="mt-1 text-red-700">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50"
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
            <div className="space-y-3">
              {q ? (
                // Active search: keep the flat filtered list (no sections, no A-Z).
                <div className="space-y-1.5">
                  {filteredCountries.map((country) =>
                    renderCountryRow(country),
                  )}
                </div>
              ) : (
                <>
                  {monitoredCountries.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Monitored ({monitoredCountries.length})
                      </p>
                      {monitoredCountries.map((country) =>
                        renderCountryRow(country),
                      )}
                    </div>
                  )}
                  {unmonitoredCountries.length > 0 && (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setUnmonitoredCollapsed((collapsed) => !collapsed)
                        }
                        aria-expanded={!unmonitoredCollapsed}
                        aria-controls="nc-unmonitored-list"
                        className="flex w-full items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-700"
                      >
                        <FiChevronDown
                          className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${unmonitoredCollapsed ? '-rotate-90' : ''}`}
                          aria-hidden="true"
                        />
                        Not yet monitored ({unmonitoredCountries.length})
                      </button>
                      {!unmonitoredCollapsed && (
                        <div id="nc-unmonitored-list" className="space-y-1.5">
                          {unmonitoredCountries.map((country) =>
                            renderCountryRow(country),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        {/* Empty search result state */}
        {!selectedCountry &&
        !isOverviewLoading &&
        filteredCountries.length === 0 &&
        !error ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <FiSearch className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">
              No countries match your search
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Try adjusting the filters or search term
            </p>
          </div>
        ) : null}

        {/* ── Country monitor list ── */}
        {selectedCountry && !selectedMonitor && (
          <div className="space-y-2">
            {/* Country-scoped loading state: name is already visible from the
                base object while the detailed monitors request resolves. */}
            {isCountryLoading && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <FiLoader className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">
                    Loading monitor data for {selectedCountry.country}…
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded bg-slate-200"
                      style={{
                        height: '14px',
                        width: `${60 + (index % 3) * 12}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Country-scoped error state with retry. */}
            {!isCountryLoading && countryError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  Couldn&apos;t load monitor details for{' '}
                  {selectedCountry.country}.
                </p>
                {onRetryCountry && (
                  <button
                    type="button"
                    onClick={onRetryCountry}
                    className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {!isCountryLoading && !countryError && (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                        {selectedCountry.country}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {filteredCountryMonitors.length}
                        </span>{' '}
                        monitor{filteredCountryMonitors.length !== 1 ? 's' : ''}{' '}
                        available
                      </p>
                      {(() => {
                        const stats = selectedCountry.stats;
                        const total =
                          stats?.total ?? selectedCountry.monitors.length;
                        if (total === 0) return null;
                        const refCount = stats?.Reference ?? 0;
                        const lcsCount = stats?.LCS ?? 0;
                        const refPct = (refCount / total) * 100;
                        const lcsPct = (lcsCount / total) * 100;
                        return (
                          <div className="mt-3">
                            <div
                              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                              role="img"
                              aria-label={`${refCount} reference and ${lcsCount} low-cost monitors out of ${total}`}
                            >
                              <div className="flex h-full">
                                <div
                                  className="bg-emerald-500"
                                  style={{ width: `${refPct}%` }}
                                />
                                <div
                                  className="bg-blue-500"
                                  style={{ width: `${lcsPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="mt-1.5 flex gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Reference · {refCount}
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                LCS · {lcsCount}
                              </span>
                            </div>
                            <span className="sr-only">
                              Of {total} monitors, {refCount} are reference
                              monitors and {lcsCount} are low-cost sensors.
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          openAddDevice(
                            selectedCountry.id,
                            selectedCountry.country,
                            selectedCountry.iso2,
                          )
                        }
                        aria-label={`Add a device in ${selectedCountry.country}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                      >
                        <FiPlus className="h-4 w-4" aria-hidden="true" />
                        Add device
                      </button>
                    </div>
                  </div>
                </div>

                {/* Helper nudge so device owners can register a device they own */}
                {selectedCountry.monitors.length > 0 && (
                  <p className="px-1 text-xs text-slate-500">
                    Can&apos;t find your device? Add it to{' '}
                    {selectedCountry.country}.{' '}
                    <button
                      type="button"
                      onClick={() =>
                        openAddDevice(
                          selectedCountry.id,
                          selectedCountry.country,
                          selectedCountry.iso2,
                        )
                      }
                      aria-label={`Add a device in ${selectedCountry.country}`}
                      className="font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline"
                    >
                      Add device
                    </button>
                  </p>
                )}

                {filteredCountryMonitors.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                    No monitors match the current filters.
                  </div>
                ) : (
                  filteredCountryMonitors.map((monitor) => {
                    const typeBadge =
                      monitor.type === 'Reference'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : monitor.type === 'LCS'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600';
                    const statusBadge =
                      monitor.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600';
                    const statusLabel =
                      monitor.status === 'active' ? 'Active' : 'Inactive';
                    return (
                      <button
                        key={monitor.id}
                        type="button"
                        data-nav-row
                        onClick={() =>
                          onSelectMonitor(monitor.id, selectedCountry.id)
                        }
                        aria-label={`${monitor.name}, ${typeLabels[monitor.type]}, ${statusLabel}`}
                        className="group w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-left transition-all hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-[15px] font-semibold text-slate-950">
                              {monitor.name}
                            </h4>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
                              <FiMapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                              {monitor.city}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${typeBadge}`}
                            >
                              {monitor.type}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  monitor.status === 'active'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                                aria-hidden="true"
                              />
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>
        )}

        {/* ── Monitor detail ── */}
        {monitorLoading && !selectedMonitor ? (
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white p-4">
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
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            {/* Monitor header */}
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <div
                className={getBadgeClassesForMonitorType(selectedMonitor.type)}
              >
                {typeLabels[selectedMonitor.type]}
              </div>
              <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950">
                {selectedMonitor.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-base text-slate-600">
                <FiMapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
                {selectedMonitor.city}, {selectedMonitor.country}
              </p>
            </div>

            {/* Station details */}
            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Station Details
              </h4>

              <StatLine
                label="Operator / Institution"
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
              <StatLine
                label="Network"
                value={formatNetworkName(selectedMonitor.network)}
              />
            </div>

            {/* Equipment */}
            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Equipment
              </h4>
              <StatLine
                label="Instrument"
                value={displayText(selectedMonitor.equipment)}
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
            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
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
            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
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
            <div className="border-b border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Data Access
              </h4>
              <StatLine
                label="Public Data"
                value={displayText(selectedMonitor.publicData)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {/* View data (from monitor.viewDataUrl) */}
                {/**
                 * If monitor provides a `viewDataUrl`, enable the button and
                 * open it in a new tab. Otherwise keep the button disabled.
                 */}
                <button
                  type="button"
                  onClick={() => {
                    if (!validatedViewDataUrl) return;
                    window.open(
                      validatedViewDataUrl,
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                  disabled={!validatedViewDataUrl}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                    validatedViewDataUrl
                      ? 'bg-blue-700 text-white hover:bg-blue-800'
                      : 'cursor-not-allowed bg-slate-100 text-slate-500'
                  }`}
                >
                  Visit website
                  <FiChevronRight className="h-4 w-4" />
                </button>

                {/* View on analytics (generic analytics app) */}
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      ANALYTICS_APP_URL,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 active:bg-blue-200"
                >
                  View on analytics
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Manufacturer */}
            <div className="p-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
                Organization
              </h4>
              <StatLine
                label="Manufacturer"
                value={displayText(selectedMonitor.manufacturer)}
              />
              <StatLine
                label="Co-location"
                value={displayText(selectedMonitor.coLocation)}
              />
              {selectedMonitor.coLocationNote &&
                selectedMonitor.coLocationNote !== '--' && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
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
