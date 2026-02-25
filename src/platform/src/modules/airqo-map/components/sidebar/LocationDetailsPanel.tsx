'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { CollapsibleCard } from '@/modules/airqo-map/components/sidebar/collapsible-card';
import { CurrentAirQualityCard } from '@/modules/airqo-map/components/sidebar/CurrentAirQualityCard';
import { WeeklyForecastCard } from '@/modules/airqo-map/components/sidebar/WeeklyForecastCard';
import { LocationDetailsSkeleton } from '@/modules/airqo-map/components/sidebar/LocationDetailsSkeleton';
import { SiteInsightsChart } from '@/modules/airqo-map/components/sidebar/SiteInsightsChart';
import { AqXClose } from '@airqo/icons-react';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import type { MapReading } from '../../../../shared/types/api';
import type { AirQualityReading } from '../map/MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';

interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationDetailsPanelProps {
  locationData?: LocationData;
  mapReading?: MapReading | AirQualityReading;
  onBack?: () => void;
  loading?: boolean;
  selectedPollutant?: PollutantType;
}

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

export const LocationDetailsHeader: React.FC<{
  locationData: LocationData;
  onBack?: () => void;
}> = ({ locationData, onBack }) => (
  <div className="flex-none px-4 py-3 border-b border-border">
    <div className="flex items-center gap-2">
      <h2
        className="flex-1 min-w-0 text-lg font-semibold text-foreground truncate"
        title={locationData.name}
      >
        {locationData.name}
      </h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex-none p-1 h-8 w-8"
      >
        <AqXClose className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export const LocationDetailsPanel: React.FC<LocationDetailsPanelProps> = ({
  locationData,
  mapReading,
  onBack,
  loading = false,
  selectedPollutant = 'pm2_5',
}) => {
  const currentLocationData = React.useMemo(() => {
    if (mapReading) {
      if ((mapReading as MapReading).siteDetails) {
        const mr = mapReading as MapReading;
        return {
          _id: mr.siteDetails._id,
          name: mr.siteDetails.location_name,
          latitude: mr.siteDetails.approximate_latitude,
          longitude: mr.siteDetails.approximate_longitude,
        };
      }
      const aqr = mapReading as AirQualityReading;
      return {
        _id: aqr.siteId,
        name: aqr.locationName || aqr.siteId,
        latitude: aqr.latitude,
        longitude: aqr.longitude,
      };
    }
    return locationData;
  }, [mapReading, locationData]);

  const pollutantValue =
    selectedPollutant === 'pm2_5'
      ? ((mapReading as MapReading)?.pm2_5?.value ??
        (mapReading as AirQualityReading)?.pm25Value ??
        (mapReading as AirQualityReading)?.fullReadingData?.pm2_5?.value)
      : ((mapReading as MapReading)?.pm10?.value ??
        (mapReading as AirQualityReading)?.pm10Value ??
        (mapReading as AirQualityReading)?.fullReadingData?.pm10?.value);

  const airQualityInfo = React.useMemo(() => {
    if (pollutantValue != null) {
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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full w-full overflow-hidden">
        <LocationDetailsSkeleton />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!currentLocationData) {
    return (
      // h-full fills the MapSidebar wrapper; flex col so we can center content
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-none px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-lg font-semibold text-foreground">
              Location Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex-none p-1 h-8 w-8"
            >
              <AqXClose className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            No location data available
          </p>
        </div>
      </div>
    );
  }

  // ── Main panel ─────────────────────────────────────────────────────────────
  //
  // HEIGHT CONTRACT
  // ───────────────
  // MapSidebar wraps this component in:
  //   <div className="flex-1 min-h-0 overflow-hidden">
  //
  // That div is a flex child of the Card (flex col, explicit dvh height).
  // For scroll to work here, this component's root must be h-full so it
  // fills that wrapper, then its own content area uses overflow-y-auto.
  //
  // Structure:
  //   root (h-full flex flex-col overflow-hidden)
  //   ├── header   (flex-none)
  //   └── content  (flex-1 min-h-0 overflow-y-auto)  ← scrolls here
  //
  // flex-none on header: header never grows — it takes exactly its rendered
  // height. Without this the header can claim space from the scroll area.
  //
  // flex-1 min-h-0 on content: takes all remaining height. min-h-0 overrides
  // the browser default min-height:auto on flex children which would otherwise
  // let content expand the parent instead of scrolling.
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <LocationDetailsHeader
        locationData={currentLocationData}
        onBack={onBack}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="p-4 space-y-4 pb-8">
          <WeeklyForecastCard
            siteId={
              (mapReading as MapReading)?.site_id ||
              (mapReading as AirQualityReading)?.siteId
            }
            waqiForecastData={(mapReading as AirQualityReading)?.forecastData}
          />

          <CurrentAirQualityCard
            locationData={currentLocationData}
            mapReading={mapReading}
            selectedPollutant={selectedPollutant}
          />

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
                          className="w-12 h-12 rounded-full object-cover flex-none"
                        />
                      )}
                      <div className="flex-1 min-w-0">
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
                  {currentLocationData.name}&apos;s Air Quality is{' '}
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

          {hasSiteDetails && (
            <CollapsibleCard title="More Insights" defaultExpanded={false}>
              <SiteInsightsChart
                siteId={currentLocationData._id}
                height={150}
              />
            </CollapsibleCard>
          )}
        </div>
      </div>
    </div>
  );
};
