import { AqDownload01 } from '@airqo/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { TbMenu2 } from 'react-icons/tb';

import NetworkCoverageNavDrawer from './NetworkCoverageNavDrawer';

const PAGE_TITLE = 'Air Quality Monitoring Landscape in Africa';

const INTRO_PARAGRAPHS = [
  "This platform provides a unified view of Africa's air quality monitoring landscape. It integrates metadata on monitoring initiatives across the continent, combining both low-cost sensors and high-precision reference monitors. Users can explore the geographic distribution of monitoring stations by country, identify active coverage, understand the types of instrumentation in use, and review institutional stewardship for each monitoring location.",
  "By offering a structured and comprehensive overview of Africa's air quality monitoring capacity, the platform seeks to incentivise collaboration towards scaling the development of open data infrastructure.",
];

interface NetworkCoverageHeaderProps {
  onDownload: () => void;
  isDownloading?: boolean;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onDownload,
  isDownloading = false,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <NetworkCoverageNavDrawer
        isOpen={navDrawerOpen}
        onClose={() => setNavDrawerOpen(false)}
      />

      <header className="flex-shrink-0 overflow-visible rounded-xl border border-slate-300 bg-white shadow-sm lg:overflow-hidden">
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

          {/* Mobile sidebar toggle moved into the map for absolute positioning */}

          {/* Download button */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => !isDownloading && setShowDownloadMenu((p) => !p)}
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
                <AqDownload01 className="h-4 w-4" />
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
              <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onDownload();
                      setShowDownloadMenu(false);
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Export PDF report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Intro text strip (hidden on very small screens) ── */}
        <div className="hidden border-t border-slate-200 bg-white px-4 py-3 sm:block sm:px-5 sm:py-3.5">
          <div className="w-full space-y-3">
            {INTRO_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[14px] leading-6 text-black sm:text-[15px] sm:leading-7"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default NetworkCoverageHeader;
