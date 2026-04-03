import { AqDownload01 } from '@airqo/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMenu } from 'react-icons/fi';
import { TbMenu2 } from 'react-icons/tb';

import NetworkCoverageNavDrawer from './NetworkCoverageNavDrawer';

const INTRO_TEXT =
  'Spanning 54 nations across Africa, this platform provides a unified view of the continent’s air quality monitoring landscape. It integrates low-cost sensors deployed in urban communities with high-precision reference stations at strategic research locations, offering both scale and technical depth. Users can explore the geographic distribution of monitoring stations by country, identify active coverage, and understand the types of instrumentation in use. Designed to support evidence-based planning, collaboration, and environmental stewardship, the platform presents a structured and comprehensive overview of Africa’s air quality monitoring infrastructure.';

interface NetworkCoverageHeaderProps {
  onToggleSidebar: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onToggleSidebar,
  onDownload,
  isDownloading = false,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
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

      <header className="flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* ── Top control bar ── */}
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          {/* Hamburger for global nav drawer */}
          <button
            type="button"
            onClick={() => setNavDrawerOpen(true)}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open site navigation"
          >
            <TbMenu2 className="h-5 w-5" />
          </button>

          {/* AirQo logo removed for Network Coverage page */}

          {/* Title */}
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:text-base lg:text-lg">
            Africa Air Quality Monitoring Network Coverage
          </h1>

          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle country sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {/* Download button */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => !isDownloading && setShowDownloadMenu((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                isDownloading
                  ? 'cursor-not-allowed border-blue-300 bg-white text-blue-400'
                  : 'border-blue-700 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100'
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
                {isDownloading ? 'Preparing...' : 'Download data'}
              </span>
              <span className="sm:hidden">
                {isDownloading ? '...' : 'Download'}
              </span>
              {!isDownloading && <FiChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDownloadMenu && !isDownloading && (
              <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onDownload();
                      setShowDownloadMenu(false);
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Intro text strip (hidden on very small screens) ── */}
        <div className="hidden border-t border-slate-100 bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-transparent px-4 py-2.5 sm:block sm:px-5 sm:py-3">
          <p
            className={`text-xs leading-relaxed text-slate-600 sm:text-[13px] transition-all duration-300 ${
              introExpanded ? '' : 'line-clamp-2 lg:line-clamp-none'
            }`}
          >
            {INTRO_TEXT}
          </p>
          {/* Toggle only visible on sm–md where text is clamped */}
          <button
            type="button"
            onClick={() => setIntroExpanded((p) => !p)}
            className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-800 lg:hidden"
          >
            {introExpanded ? 'Show less' : 'Read more'}
          </button>
        </div>
      </header>
    </>
  );
};

export default NetworkCoverageHeader;
