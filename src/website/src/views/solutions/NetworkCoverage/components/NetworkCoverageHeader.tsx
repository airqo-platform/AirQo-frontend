import { AqDownload01 } from '@airqo/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMenu } from 'react-icons/fi';

interface NetworkCoverageHeaderProps {
  onToggleSidebar: () => void;
  onDownload: (format: 'csv' | 'pdf') => void;
}

const NetworkCoverageHeader: React.FC<NetworkCoverageHeaderProps> = ({
  onToggleSidebar,
  onDownload,
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
        <h1 className="text-lg font-semibold leading-none sm:text-2xl">
          Africa Air Sensor Coverages
        </h1>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setShowDownloadMenu((previous) => !previous)}
          className="inline-flex items-center gap-1 rounded-md border border-blue-700 bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white sm:gap-2 sm:px-3 sm:text-sm"
        >
          <AqDownload01 className="h-4 w-4" />
          <span className="hidden sm:inline">Download data</span>
          <span className="sm:hidden">Download</span>
          <FiChevronDown className="h-4 w-4" />
        </button>

        {showDownloadMenu && (
          <div className="absolute right-0 z-40 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onDownload('csv');
                setShowDownloadMenu(false);
              }}
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload('pdf');
                setShowDownloadMenu(false);
              }}
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NetworkCoverageHeader;
