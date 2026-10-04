import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiDownload } from 'react-icons/fi';
import { TbMenu2 } from 'react-icons/tb';

import NetworkCoverageNavDrawer from './NetworkCoverageNavDrawer';

const PAGE_TITLE = 'Air Quality Monitoring Landscape in Africa';

const INTRO_PARAGRAPHS = [
  "This platform provides a unified view of Africa's air quality monitoring landscape. It integrates metadata on monitoring initiatives across the continent, combining both low-cost sensors and high-precision reference monitors. Users can explore the geographic distribution of monitoring stations by country, identify active coverage, understand the types of instrumentation in use, and review institutional stewardship for each monitoring location.",
  "By offering a structured and comprehensive overview of Africa's air quality monitoring capacity, the platform seeks to incentivise collaboration towards scaling the development of open data infrastructure.",
];

interface CoverageStats {
  monitors: number;
  countries: number;
  cities: number;
}

interface NetworkCoverageHeaderProps {
  onDownload: () => void;
  onDownloadCsv?: () => void;
  isDownloading?: boolean;
  stats?: CoverageStats;
  scopeLabel?: string;
  dimmed?: boolean;
  /** True when a single country is selected (scope label refers to it). */
  isCountryScoped?: boolean;
  /** Full-report (all countries) PDF export, offered when a country is scoped. */
  onDownloadAll?: () => void;
  /** Full-report (all countries) CSV export, offered when a country is scoped. */
  onDownloadAllCsv?: () => void;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onDownload,
  onDownloadCsv,
  isDownloading = false,
  stats,
  scopeLabel = 'All countries',
  dimmed = false,
  isCountryScoped = false,
  onDownloadAll,
  onDownloadAllCsv,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDownloadMenu) {
        setShowDownloadMenu(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDownloadMenu]);

  return (
    <>
      <NetworkCoverageNavDrawer
        isOpen={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
      />

      {/* `relative z-50` keeps the download menu above the map/sidebar
          controls; `overflow-visible` at every breakpoint keeps the absolute
          menu from being clipped at the header's bottom edge (the last child
          re-applies its own rounded bottom corners instead). */}
      <header className="relative z-50 flex-shrink-0 overflow-visible rounded-xl border border-slate-300 bg-white shadow-sm">
        {/* ── Top control bar ── */}
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          {/* Hamburger for global nav drawer */}
          <button
            type="button"
            onClick={() => setNavDrawerOpen(true)}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label="Open site navigation"
          >
            <TbMenu2 className="h-5 w-5" />
          </button>

          {/* AirQo logo removed for Network Coverage page */}

          {/* Title */}
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-black sm:text-xl lg:text-2xl">
            {PAGE_TITLE}
          </h1>

          {/* Download button */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => !isDownloading && setShowDownloadMenu((p) => !p)}
              aria-expanded={showDownloadMenu}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all sm:px-4 sm:text-sm ${
                isDownloading
                  ? 'cursor-not-allowed border-blue-300 bg-blue-100 text-blue-400'
                  : 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900'
              }`}
            >
              {isDownloading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <FiDownload className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isDownloading ? 'Preparing...' : 'Download report'}
              </span>
              <span className="sm:hidden">
                {isDownloading ? '...' : 'Download'}
              </span>
              {!isDownloading && <FiChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDownloadMenu && !isDownloading && (
              <div className="absolute right-0 z-[100] mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onDownload();
                      setShowDownloadMenu(false);
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Export PDF report - {scopeLabel}
                  </button>
                  {onDownloadCsv && (
                    <button
                      type="button"
                      onClick={() => {
                        onDownloadCsv();
                        setShowDownloadMenu(false);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Export CSV data - {scopeLabel}
                    </button>
                  )}
                  {isCountryScoped && (
                    <>
                      <div className="my-1 h-px bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => {
                          onDownloadAll?.();
                          setShowDownloadMenu(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Export full report - All countries
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDownloadAllCsv?.();
                          setShowDownloadMenu(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        Export full CSV data - All countries
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Live stats strip ── */}
        {stats && (
          <div
            className={`border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 transition-opacity sm:px-5 ${dimmed ? 'opacity-40' : ''}`}
          >
            <div className="mx-auto grid max-w-2xl grid-cols-3 divide-x divide-slate-200">
              <div className="px-3 text-center first:pl-0 last:pr-0">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.monitors.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Monitors
                </div>
              </div>
              <div className="px-3 text-center first:pl-0 last:pr-0">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.countries.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Countries
                </div>
              </div>
              <div className="px-3 text-center first:pl-0 last:pr-0">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.cities.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Cities
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Collapsible intro disclosure (last child: re-rounds the header's
            bottom corners now that the header itself never clips) ── */}
        <div className="overflow-hidden rounded-b-xl border-t border-blue-100 bg-blue-50">
          <div className="px-4 sm:px-5">
            <button
              type="button"
              onClick={() => setAboutOpen((open) => !open)}
              aria-expanded={aboutOpen}
              aria-controls="coverage-about"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
            >
              About this map
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          {aboutOpen && (
            <div
              id="coverage-about"
              className="space-y-2 px-4 pb-4 text-sm text-slate-600 sm:px-5"
            >
              {INTRO_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className="leading-6">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default NetworkCoverageHeader;
