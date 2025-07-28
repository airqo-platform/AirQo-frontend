import Card from '@/components/CardWrapper';
import React from 'react';
import { AqMarkerPin01 } from '@airqo/icons-react';

const NoResults = React.memo(({ hasSearched }) => (
  <Card contentClassName="flex flex-col items-center justify-center py-6">
    <div className="mb-4">
      <AqMarkerPin01 size={35} className="text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-lg font-medium text-secondary-neutral-dark-700 dark:text-white text-center">
      {hasSearched
        ? 'No results found'
        : 'Search for a location to view air quality data'}
    </h3>
    <p className="text-sm text-secondary-neutral-light-900 dark:text-gray-300 mt-2 text-center">
      {hasSearched
        ? 'Try adjusting your search term or search for a different location'
        : 'Enter a location name to see air quality information and forecasts'}
    </p>
  </Card>
));

NoResults.displayName = 'NoResults';
export default NoResults;
