'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { CollapsibleCard } from '@/modules/airqo-map/components/sidebar/collapsible-card';
import { CurrentAirQualityCard } from '@/modules/airqo-map/components/sidebar/CurrentAirQualityCard';
import { WeeklyForecastCard } from '@/modules/airqo-map/components/sidebar/WeeklyForecastCard';
import { LocationDetailsSkeleton } from '@/modules/airqo-map/components/sidebar/LocationDetailsSkeleton';
import { SiteInsightsChart } from '@/modules/airqo-map/components/sidebar/SiteInsightsChart';
// Icons are now imported from the centralized utility
import { AqXClose } from '@airqo/icons-react';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import type { MapReading } from '../../../../shared/types/api';
import type { AirQualityReading } from '../map/MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';

// Types for location data
interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationDetailsPanelProps {
  locationData?: LocationData; // Keep for backward compatibility
  mapReading?: MapReading | AirQualityReading; // Can be MapReading or AirQualityReading
  onBack?: () => void;
  loading?: boolean;
  selectedPollutant?: PollutantType;
}

// Get health tip based on air quality level
const getHealthTip = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'good':
      return 'Enjoy your day with confidence in clean air around you.';
    case 'moderate':
      return 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.';
    case 'unhealthy for sensitive groups':
      return 'Sensitive groups should reduce prolonged or heavy outdoor exertion.';
    case 'unhealthy':
      return 'Everyone should reduce prolonged or heavy exertion. Take more breaks during outdoor activities.';
    case 'very unhealthy':
      return 'Everyone should avoid prolonged or heavy exertion. Move activities indoors or reschedule.';
    case 'hazardous':
      return 'Everyone should avoid all physical activities outdoors. Stay indoors and keep activity levels low.';
    default:
      return 'Check local air quality reports for the latest information.';
  }
};

// Location Details Header Component
export const LocationDetailsHeader: React.FC<{
  locationData: LocationData;
  onBack?: () => void;
}> = ({ locationData, onBack }) => (
  <div className="flex-shrink-0 p-4 pb-2 border-b">
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <h2
          className="text-lg font-semibold text-foreground truncate"
          title={locationData.name}
        >
          {locationData.name}
        </h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-1 h-8 w-8 flex-shrink-0"
      >
        <AqXClose className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Location Details Content Component
export const LocationDetailsPanel: React.FC<LocationDetailsPanelProps> = ({
  locationData,
  mapReading,
  onBack,
  loading = false,
  selectedPollutant = 'pm2_5',
}) => {
  // Use mapReading data if available, otherwise fall back to locationData
  const currentLocationData = React.useMemo(() => {
    if (mapReading) {
      // Check if it's a MapReading (has siteDetails)
      if ((mapReading as MapReading).siteDetails) {
        const mr = mapReading as MapReading;
        return {
          _id: mr.siteDetails._id,
          name: mr.siteDetails.location_name,
          latitude: mr.siteDetails.approximate_latitude,
          longitude: mr.siteDetails.approximate_longitude,
        };
      } else {
        // It's an AirQualityReading
        const aqr = mapReading as AirQualityReading;
        return {
          _id: aqr.siteId,
          name: aqr.locationName || aqr.siteId,
          latitude: aqr.latitude,
          longitude: aqr.longitude,
        };
      }
    }
    return locationData;
  }, [mapReading, locationData]);

  const pollutantValue =
    selectedPollutant === 'pm2_5'
      ? (mapReading as MapReading)?.pm2_5?.value ||
        (mapReading as AirQualityReading)?.pm25Value ||
        (mapReading as AirQualityReading)?.fullReadingData?.pm2_5?.value
      : (mapReading as MapReading)?.pm10?.value ||
        (mapReading as AirQualityReading)?.pm10Value ||
        (mapReading as AirQualityReading)?.fullReadingData?.pm10?.value;

  const airQualityInfo = React.useMemo(() => {
    if (pollutantValue !== null && pollutantValue !== undefined) {
      return getAirQualityInfo(pollutantValue, selectedPollutant);
    }
    return null;
  }, [pollutantValue, selectedPollutant]);

  const healthTips =
    (mapReading as MapReading)?.health_tips ||
    (mapReading as AirQualityReading)?.fullReadingData?.health_tips;

  const hasSiteDetails =
    (mapReading as MapReading)?.siteDetails ||
    (mapReading as AirQualityReading)?.fullReadingData?.siteDetails;

  return (
    <>
      {loading ? (
        // Full loading skeleton including header
        <LocationDetailsSkeleton />
      ) : (
        <>
          {/* Header - Show when not loading */}
          <LocationDetailsHeader
            locationData={currentLocationData!}
            onBack={onBack}
          />

          {/* Scrollable Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
            {/* Weekly Forecast */}
            <WeeklyForecastCard
              siteId={
                (mapReading as MapReading)?.site_id ||
                (mapReading as AirQualityReading)?.siteId
              }
              waqiForecastData={(mapReading as AirQualityReading)?.forecastData}
            />

            {/* Current Air Quality */}
            <CurrentAirQualityCard
              locationData={currentLocationData!}
              mapReading={mapReading}
              selectedPollutant={selectedPollutant}
            />

            {/* Health Alerts */}
            <CollapsibleCard title="Health Alerts" defaultExpanded={false}>
              {healthTips && healthTips.length > 0 ? (
                <div className="space-y-3">
                  {healthTips.map((tip, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-start gap-3">
                        {tip.image && (
                          <Image
                            src={tip.image}
                            alt={tip.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-orange-900 mb-1">
                            {tip.title}
                          </h4>
                          <p className="text-sm text-orange-800 mb-2">
                            {tip.description}
                          </p>
                          {tip.tag_line && (
                            <p className="text-xs text-orange-700 italic">
                              {tip.tag_line}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : airQualityInfo ? (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    {currentLocationData!.name}&apos;s Air Quality is{' '}
                    {airQualityInfo.label} for breathing.{' '}
                    {getHealthTip(airQualityInfo.label)}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    No health information available at this time.
                  </p>
                </div>
              )}
            </CollapsibleCard>

            {/* More Insights - Only show for readings with site data */}
            {hasSiteDetails && (
              <CollapsibleCard title="More Insights" defaultExpanded={false}>
                <SiteInsightsChart
                  siteId={currentLocationData!._id}
                  height={150}
                />
              </CollapsibleCard>
            )}
          </div>
        </>
      )}
    </>
  );
};
