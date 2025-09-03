'use client';

import MapPage from '@/common/features/airQuality-map/pages/MapPage';
import ErrorBoundary from '@/common/components/ErrorBoundary';

const page = () => {
  return (
    <ErrorBoundary>
      <MapPage />
    </ErrorBoundary>
  );
};

export default page;
