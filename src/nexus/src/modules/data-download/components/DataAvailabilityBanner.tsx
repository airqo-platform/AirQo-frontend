import React from 'react';
import { Button } from '@/shared/components/ui';
import {
  WarningBanner,
  InfoBanner,
  SuccessBanner,
} from '@/shared/components/ui/banner';
import type {
  AggregateAvailability,
  SiteAvailabilityEntry,
} from '../hooks/useDataAvailabilityCheck';
import { TabType } from '../types/dataExportTypes';

interface DataAvailabilityBannerProps {
  aggregateStatus: AggregateAvailability;
  totalSites: number;
  sitesWithData: number;
  sitesWithoutData: number;
  siteDetails: SiteAvailabilityEntry[];
  activeTab: TabType;
  isDownloadReady: boolean;
  onChangeFilters?: () => void;
  onChooseLocations?: () => void;
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return 'Unknown';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Displays data availability status for the current selection.
 * Shows which selected sites have measurement data and which don't.
 */
export const DataAvailabilityBanner: React.FC<DataAvailabilityBannerProps> = ({
  aggregateStatus,
  totalSites,
  sitesWithData,
  sitesWithoutData,
  siteDetails,
  activeTab,
  onChangeFilters,
  onChooseLocations,
}) => {
  // Don't show when nothing is selected or selection is not download-ready
  if (aggregateStatus === 'idle' || totalSites === 0) return null;

  if (aggregateStatus === 'loading') {
    return (
      <InfoBanner
        dense
        title="Checking data availability..."
        message="Verifying measurement data for selected locations."
      />
    );
  }

  if (aggregateStatus === 'none') {
    const locationLabel =
      activeTab === 'sites'
        ? 'sites'
        : activeTab === 'devices'
          ? 'devices'
          : 'locations';

    return (
      <WarningBanner
        dense
        title="No measurement data found"
        message={
          <div>
            <p>
              None of the {totalSites} selected {locationLabel} have measurement
              data for the selected date range and pollutants. The download will
              include site metadata only.
            </p>
            {siteDetails.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs space-y-0.5 opacity-80">
                {siteDetails.slice(0, 5).map(detail => (
                  <li key={detail.siteId}>
                    <span className="font-medium">
                      {detail.siteName || detail.siteId}
                    </span>
                    {detail.latestReadingDate && (
                      <>
                        {' '}
                        — latest reading:{' '}
                        {formatDate(detail.latestReadingDate)}
                      </>
                    )}
                    {!detail.latestReadingDate && ' — no readings'}
                  </li>
                ))}
                {siteDetails.length > 5 && (
                  <li className="opacity-70">
                    …and {siteDetails.length - 5} more
                  </li>
                )}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {onChangeFilters && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={onChangeFilters}
                >
                  Change Filters
                </Button>
              )}
              {onChooseLocations && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={onChooseLocations}
                >
                  Choose Other Locations
                </Button>
              )}
            </div>
          </div>
        }
      />
    );
  }

  if (aggregateStatus === 'partial') {
    return (
      <WarningBanner
        dense
        title="Partial data coverage"
        message={
          <div>
            <p>
              {sitesWithData} of {totalSites} selected locations have
              measurement data.{' '}
              <span className="font-medium">
                {sitesWithoutData} location{sitesWithoutData !== 1 ? 's' : ''}{' '}
                will export metadata only.
              </span>
            </p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5 opacity-80">
              {siteDetails
                .filter(d => d.status === 'no_data')
                .slice(0, 3)
                .map(detail => (
                  <li key={detail.siteId}>
                    {detail.siteName || detail.siteId} — no readings
                  </li>
                ))}
              {sitesWithoutData > 3 && (
                <li className="opacity-70">
                  …and {sitesWithoutData - 3} more without data
                </li>
              )}
            </ul>
          </div>
        }
      />
    );
  }

  // aggregateStatus === 'all_available'
  return (
    <SuccessBanner
      dense
      title="Data available"
      message={`All ${sitesWithData} selected location${sitesWithData !== 1 ? 's' : ''} have measurement data for the selected date range and pollutants.`}
    />
  );
};
