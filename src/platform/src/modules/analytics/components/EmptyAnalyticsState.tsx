'use client';

import React from 'react';
import { InfoBanner } from '@/shared/components/ui/banner';
import { Button } from '@/shared/components/ui/button';

interface EmptyAnalyticsStateProps {
  className?: string;
}

export const EmptyAnalyticsState: React.FC<EmptyAnalyticsStateProps> = ({
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
        title="Set Up Your Organization's Monitoring Coverage"
        message={
          <div className="space-y-3">
            <p>
              Access open air quality data and set up monitoring coverage for
              locations relevant to your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleOpenVertex}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Set Up Coverage via AirQo Vertex
              </Button>
            </div>
            <div className="text-sm">
              <strong>Next Steps:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Browse open air quality data across the AirQo network</li>
                <li>
                  Set up monitoring coverage for your specific locations through
                  AirQo Vertex
                </li>
                <li>
                  Once configured, add locations as favorites to track trends
                  and generate insights
                </li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
};
