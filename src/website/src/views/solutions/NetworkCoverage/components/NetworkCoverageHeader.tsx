import { AqDownload01 } from '@airqo/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMenu } from 'react-icons/fi';

interface NetworkCoverageHeaderProps {
  onToggleSidebar: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
  onAddToNetwork?: () => void;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onToggleSidebar,
  onDownload,
  isDownloading = false,
  onAddToNetwork,
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
          Africa Air Quality Monitoring Network Coverage
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => !isDownloading && setShowDownloadMenu((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              isDownloading
                ? 'cursor-not-allowed border-blue-400 bg-white text-blue-400'
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
                {/* CSV export removed per request - keep PDF only */}
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

        <button
          type="button"
          onClick={() => onAddToNetwork?.()}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 sm:px-4 sm:text-sm"
        >
          Add to Network
        </button>
      </div>
    </header>
  );
};

export default NetworkCoverageHeader;
