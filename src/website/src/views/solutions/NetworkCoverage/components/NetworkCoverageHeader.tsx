import { AqDownload01 } from '@airqo/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMenu } from 'react-icons/fi';

interface NetworkCoverageHeaderProps {
  onToggleSidebar: () => void;
  onDownload: (format: 'csv' | 'pdf') => void;
  isDownloading?: boolean;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onToggleSidebar,
  onDownload,
  isDownloading = false,
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
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
    <header className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 shadow-sm sm:h-14 sm:px-4">
      <div className="flex items-center gap-2 text-slate-800 sm:gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 lg:hidden"
          aria-label="Toggle country sidebar"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold leading-none text-slate-900 sm:text-xl">
          Africa Air Sensor Coverages
        </h1>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          disabled={isDownloading}
          onClick={() => !isDownloading && setShowDownloadMenu((p) => !p)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
            isDownloading
              ? 'cursor-not-allowed border-blue-400 bg-blue-400 text-white'
              : 'border-blue-700 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
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
          <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Export format
              </p>
            </div>
            <div className="space-y-0.5 p-1.5">
              <button
                type="button"
                onClick={() => {
                  onDownload('csv');
                  setShowDownloadMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <AqDownload01 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    CSV Spreadsheet
                  </p>
                  <p className="text-xs text-slate-400">
                    Server export · filtered data
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDownload('pdf');
                  setShowDownloadMenu(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <AqDownload01 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    PDF Report
                  </p>
                  <p className="text-xs text-slate-400">
                    Table format · client generated
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NetworkCoverageHeader;
