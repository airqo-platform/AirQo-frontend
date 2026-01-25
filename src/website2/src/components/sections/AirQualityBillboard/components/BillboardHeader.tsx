'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AqCopy06 } from '@airqo/icons-react';
import { FiChevronDown } from 'react-icons/fi';

import { cn } from '@/lib/utils';

import type { Item, Measurement } from '../types';
import { formatDisplayName } from '../utils';

interface BillboardHeaderProps {
  hideControls?: boolean;
  selectedItem?: Item | null;
  items?: Item[];
  searchQuery?: string;
  isDropdownOpen?: boolean;
  hoveredItemId?: string | null;
  copiedItemId?: string | null;
  onItemSelect?: (item: Item) => void;
  onCopyUrl?: (item: Item) => void;
  onSearchChange?: (query: string) => void;
  onDropdownToggle?: () => void;
  onHover?: (id: string | null) => void;
  dropdownRef?: React.RefObject<HTMLDivElement>;
  currentMeasurement?: Measurement | null;
  centered?: boolean;
  hideDropdown?: boolean;
}

const BillboardHeader = ({
  hideControls,
  selectedItem,
  items,
  searchQuery,
  isDropdownOpen,
  hoveredItemId,
  copiedItemId,
  onItemSelect,
  onCopyUrl,
  onSearchChange,
  onDropdownToggle,
  onHover,
  dropdownRef,
  currentMeasurement,
  centered,
  hideDropdown = false,
}: BillboardHeaderProps) => {
  if (hideControls) return null;

  const filteredItems = items
    ? items.filter((item: any) => {
        if (!searchQuery) return true;
        const itemName = (item.name || item.long_name || '').toLowerCase();
        return itemName.includes(searchQuery.toLowerCase());
      })
    : [];

  // Format timestamp professionally
  const formattedDate = currentMeasurement?.time
    ? new Date(currentMeasurement.time).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '--';

  const formattedTime = currentMeasurement?.time
    ? new Date(currentMeasurement.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

  // Refs and portal state for dropdown positioning (prevent clipping by overflow)
  const centeredButtonRef = useRef<HTMLButtonElement | null>(null);
  const normalButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!isDropdownOpen) {
      setDropdownStyle(null);
      return;
    }

    const btn = centered ? centeredButtonRef.current : normalButtonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    // place dropdown immediately below the button
    setDropdownStyle({
      top: Math.round(rect.bottom + 8),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
    });

    const onResize = () => {
      const r = btn.getBoundingClientRect();
      setDropdownStyle({
        top: Math.round(r.bottom + 8),
        left: Math.round(r.left),
        width: Math.round(r.width),
      });
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, [isDropdownOpen, centered]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
      {/* Professional Timestamp Display */}
      {centered ? (
        // Grid page - simple header with just date/time and location name
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-3 bg-black/30 border border-white/10 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap text-white/95">
                {formattedDate}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-white/95">
                {formattedTime}
              </span>
            </div>
          </div>
          {!hideDropdown && (
            <div
              className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[240px]"
              ref={dropdownRef}
            >
              <button
                ref={centeredButtonRef}
                onClick={onDropdownToggle}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 backdrop-blur-sm text-xs sm:text-sm flex items-center justify-between hover:bg-white/15 transition-colors"
              >
                <span className="truncate text-xs sm:text-sm">
                  {selectedItem
                    ? formatDisplayName(
                        selectedItem.name || selectedItem.long_name || '',
                      )
                    : 'Select location...'}
                </span>
                <FiChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform flex-shrink-0 ml-2',
                    isDropdownOpen && 'rotate-180',
                  )}
                />
              </button>

              {isDropdownOpen &&
                dropdownStyle &&
                createPortal(
                  <div
                    style={{
                      position: 'fixed',
                      top: dropdownStyle.top,
                      left: dropdownStyle.left,
                      width: dropdownStyle.width,
                      zIndex: 99999,
                    }}
                    data-billboard-portal="true"
                  >
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
                      <div className="sticky top-0 bg-white p-2 sm:p-3 border-b border-gray-200 rounded-t-lg">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 pr-8 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => onSearchChange?.('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Clear search"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {filteredItems && filteredItems.length > 0 ? (
                          filteredItems.map((item: any) => (
                            <div
                              key={item._id}
                              className="relative group"
                              onMouseEnter={() => onHover?.(item._id)}
                              onMouseLeave={() => onHover?.(null)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <button
                                  onClick={() => onItemSelect?.(item)}
                                  className={cn(
                                    'flex-1 px-3 py-2 text-left text-gray-800 hover:bg-blue-50 transition-colors text-xs sm:text-sm',
                                    selectedItem?._id === item._id &&
                                      'bg-blue-100 font-semibold',
                                  )}
                                >
                                  {formatDisplayName(
                                    item.name || item.long_name,
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyUrl?.(item);
                                  }}
                                  className={cn(
                                    'px-2 py-2 hover:bg-blue-200 transition-all flex items-center justify-center',
                                    hoveredItemId === item._id
                                      ? 'opacity-100 visible'
                                      : 'opacity-0 invisible',
                                  )}
                                  title="Copy URL"
                                >
                                  {copiedItemId === item._id ? (
                                    <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                                      Copied!
                                    </span>
                                  ) : (
                                    <AqCopy06 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-gray-500 text-xs sm:text-sm">
                            No locations found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>,
                  document.body,
                )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Left: Last Updated (badge) */}
          <div className="inline-flex items-center gap-3 bg-black/30 border border-white/10 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap text-white/95">
              {formattedDate}
            </span>
            <span className="text-white/40">|</span>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-white/95">
              {formattedTime}
            </span>
          </div>

          {/* Right: Dropdown Selector */}
          {!hideDropdown && (
            <div
              className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[240px]"
              ref={dropdownRef}
            >
              <button
                ref={normalButtonRef}
                onClick={onDropdownToggle}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 backdrop-blur-sm text-xs sm:text-sm flex items-center justify-between hover:bg-white/15 transition-colors"
              >
                <span className="truncate text-xs sm:text-sm">
                  {selectedItem
                    ? formatDisplayName(
                        selectedItem.name || selectedItem.long_name || '',
                      )
                    : 'Select location...'}
                </span>
                <FiChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform flex-shrink-0 ml-2',
                    isDropdownOpen && 'rotate-180',
                  )}
                />
              </button>

              {isDropdownOpen &&
                dropdownStyle &&
                createPortal(
                  <div
                    style={{
                      position: 'fixed',
                      top: dropdownStyle.top,
                      left: dropdownStyle.left,
                      width: dropdownStyle.width,
                      zIndex: 99999,
                    }}
                    data-billboard-portal="true"
                  >
                    <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
                      <div className="sticky top-0 bg-white p-2 sm:p-3 border-b border-gray-200 rounded-t-lg">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 pr-8 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => onSearchChange?.('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Clear search"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {filteredItems && filteredItems.length > 0 ? (
                          filteredItems.map((item: any) => (
                            <div
                              key={item._id}
                              className="relative group"
                              onMouseEnter={() => onHover?.(item._id)}
                              onMouseLeave={() => onHover?.(null)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <button
                                  onClick={() => onItemSelect?.(item)}
                                  className={cn(
                                    'flex-1 px-3 py-2 text-left text-gray-800 hover:bg-blue-50 transition-colors text-xs sm:text-sm',
                                    selectedItem?._id === item._id &&
                                      'bg-blue-100 font-semibold',
                                  )}
                                >
                                  {formatDisplayName(
                                    item.name || item.long_name,
                                  )}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCopyUrl?.(item);
                                  }}
                                  className={cn(
                                    'px-2 py-2 hover:bg-blue-200 transition-all flex items-center justify-center',
                                    hoveredItemId === item._id
                                      ? 'opacity-100 visible'
                                      : 'opacity-0 invisible',
                                  )}
                                  title="Copy URL"
                                >
                                  {copiedItemId === item._id ? (
                                    <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                                      Copied!
                                    </span>
                                  ) : (
                                    <AqCopy06 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-gray-500 text-xs sm:text-sm">
                            No locations found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>,
                  document.body,
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BillboardHeader;
