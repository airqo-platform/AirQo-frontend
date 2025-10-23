'use client';

import React from 'react';
import { InfoBanner } from '@/shared/components/ui/banner';
import { Button } from '@/shared/components/ui/button';

interface EmptyAnalyticsStateProps {
  onAddFavorites: () => void;
  className?: string;
}

export const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({
  onAddFavorites,
  className = '',
}) => {
  // Determine the correct Vertex URL based on environment
  const vertexUrl =
    process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS === 'staging'
      ? 'https://staging-vertex.airqo.net/'
      : 'https://vertex.airqo.net/';

  const handleOpenVertex = () => {
    window.open(vertexUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={className}>
      <InfoBanner
        title="No Monitoring Data Available"
        message={
          <div className="space-y-3">
            <p>
              To access air quality data and insights, you need to have
              monitoring devices deployed and configured. Currently, no devices
              or monitoring sites are available for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onAddFavorites}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Add Favorite Locations
              </Button>
              <Button
                onClick={handleOpenVertex}
                variant="outlined"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Deploy Devices
              </Button>
            </div>
            <p className="text-sm">
              <strong>Next Steps:</strong> Visit{' '}
              <a
                href={vertexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                AirQo Vertex
              </a>{' '}
              to deploy monitoring devices and configure your air quality
              monitoring network. Once devices are deployed and collecting data,
              you can add favorite locations here for analysis.
            </p>
          </div>
        }
      />
    </div>
  );
};
