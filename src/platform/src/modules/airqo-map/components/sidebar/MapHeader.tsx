'use client';

import * as React from 'react';
import { SearchField } from '@/shared/components/ui/search-field';

interface MapHeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  onSearch,
  searchPlaceholder = 'Search villages, cities or country',
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Air Quality Map
        </h1>
        <p className="text-sm text-gray-600">
          Navigate air quality analytics with precision and actionable tips.
        </p>
      </div>

      <SearchField
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClear}
      />
    </div>
  );
};
