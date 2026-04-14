'use client';

import * as React from 'react';
import { SearchField } from '@/shared/components/ui/search-field';
import { usePhotonSearch } from '../../hooks/usePhotonSearch';

interface MapHeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearchHeader?: boolean;
  searchQuery?: string;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  onSearch,
  searchPlaceholder = 'Search villages, cities or country',
  showSearchHeader = false,
  searchQuery = '',
}) => {
  const { isLoading } = usePhotonSearch(searchQuery, searchQuery.length > 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearch?.(query);
  };

  const handleClear = () => {
    onSearch?.('');
  };

  return (
    <div className="p-2 border-b border-gray-100 dark:border-gray-700 min-w-0 overflow-x-hidden">
      <div className="mb-4 min-w-0">
        <h1 className="text-xl font-semibold mb-1">Air Quality Map</h1>
        <p className="text-sm text-gray-600 break-words">
          Navigate air quality analytics with precision and actionable tips.
        </p>
      </div>

      <SearchField
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClear}
      />

      {/* Search Results Header */}
      {showSearchHeader && (
        <div className="pt-3">
          <p className="text-sm m-0 text-muted-foreground">
            {isLoading ? 'Searching...' : `Results for "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
};
