import { AqCopy06 } from '@airqo/icons-react';
import { FiChevronDown } from 'react-icons/fi';

import { cn } from '@/lib/utils';

import type { DataType, Item } from '../types';
import { formatDisplayName } from '../utils';

interface ItemSelectorProps {
  hideControls?: boolean;
  dataType: DataType;
  selectedItem: Item | null;
  items: Item[];
  searchQuery: string;
  isDropdownOpen: boolean;
  hoveredItemId: string | null;
  copiedItemId: string | null;
  onItemSelect: (item: Item) => void;
  onCopyUrl: (item: Item) => void;
  onSearchChange: (query: string) => void;
  onDropdownToggle: () => void;
  onHover: (id: string | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const ItemSelector = ({
  hideControls,
  dataType: _dataType, // eslint-disable-line @typescript-eslint/no-unused-vars
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
}: ItemSelectorProps) => {
  if (hideControls) return null;

  const filteredItems = items.filter((item: any) => {
    if (!searchQuery) return true;
    const itemName = (item.name || item.long_name || '').toLowerCase();
    return itemName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative z-[100] mb-6 sm:mb-8" ref={dropdownRef}>
      <div className="relative max-w-md">
        <button
          onClick={onDropdownToggle}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 backdrop-blur-sm text-sm sm:text-base flex items-center justify-between"
        >
          <span>
            {selectedItem
              ? formatDisplayName(
                  selectedItem.name || selectedItem.long_name || '',
                )
              : 'Select...'}
          </span>
          <FiChevronDown
            className={cn(
              'w-5 h-5 transition-transform',
              isDropdownOpen && 'rotate-180',
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200">
            {/* Search Bar */}
            <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
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

            {/* Items List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="relative group"
                    onMouseEnter={() => onHover(item._id)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => onItemSelect(item)}
                        className={cn(
                          'flex-1 px-4 py-3 text-left text-gray-800 hover:bg-blue-50 transition-colors',
                          selectedItem?._id === item._id &&
                            'bg-blue-100 font-semibold',
                        )}
                      >
                        {formatDisplayName(item.name || item.long_name)}
                      </button>

                      {/* Copy Icon - Shows on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyUrl(item);
                        }}
                        className={cn(
                          'px-3 py-3 hover:bg-blue-200 transition-all flex items-center justify-center',
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
                          <AqCopy06 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No results found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSelector;
