'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { CollapsibleCard } from '@/modules/airqo-map/components/sidebar/collapsible-card';
import { CurrentAirQualityCard } from '@/modules/airqo-map/components/sidebar/CurrentAirQualityCard';
import { WeeklyForecastCard } from '@/modules/airqo-map/components/sidebar/WeeklyForecastCard';
// Icons are now imported from the centralized utility
import { AqXClose } from '@airqo/icons-react';
import { getAirQualityInfo } from '@/shared/utils/airQuality';

// Types for location data
interface LocationData {
  _id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  pm25Value?: number;
  airQuality?: string;
  monitor?: string;
  pollutionSource?: string;
  pollutant?: string;
  time?: string;
  city?: string;
  country?: string;
}

interface LocationDetailsPanelProps {
  locationData: LocationData;
  onBack?: () => void;
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
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground truncate">
          {locationData.name}
        </h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-1 h-8 w-8 ml-2 flex-shrink-0"
      >
        <AqXClose className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Location Details Content Component
export const LocationDetailsPanel: React.FC<LocationDetailsPanelProps> = ({
  locationData,
  onBack,
}) => {
  const pm25Value = locationData.pm25Value || 8.63;
  const airQualityInfo = React.useMemo(
    () => getAirQualityInfo(pm25Value, 'pm2_5'),
    [pm25Value]
  );

  return (
    <>
      {/* Header */}
      <LocationDetailsHeader locationData={locationData} onBack={onBack} />

      {/* Scrollable Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
        {/* Weekly Forecast */}
        <WeeklyForecastCard />

        {/* Current Air Quality */}
        <CurrentAirQualityCard locationData={locationData} />

        {/* Health Alerts */}
        <CollapsibleCard title="Health Alerts" defaultExpanded={false}>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              {locationData.name}&apos;s Air Quality is {airQualityInfo.label}{' '}
              for breathing. {getHealthTip(airQualityInfo.label)}
            </p>
          </div>
        </CollapsibleCard>

        {/* More Insights */}
        <CollapsibleCard title="More Insights" defaultExpanded={false}>
          <PM25Chart locationName={locationData.name} />
        </CollapsibleCard>
      </div>
    </>
  );
};

// Create a reusable chart component for the More Insights section
const PM25ChartComponent: React.FC<{ locationName: string }> = ({
  locationName,
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground">PM2.5</span>
      <span className="text-xs text-primary">{locationName}</span>
    </div>

    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
      <span>20</span>
      <span>15</span>
      <span>10</span>
      <span>5</span>
      <span>00</span>
    </div>

    {/* Simple chart representation */}
    <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded relative overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 40"
        className="absolute inset-0"
      >
        <path
          d="M 0 30 Q 20 20 40 25 T 80 15 T 100 20"
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="70" cy="15" r="2" fill="#3B82F6" />
      </svg>
    </div>

    <div className="flex justify-between text-xs text-muted-foreground mt-2">
      <span>Apr 10</span>
      <span>Apr 14</span>
      <span>Apr 16</span>
    </div>
  </div>
);

PM25ChartComponent.displayName = 'PM25Chart';
export const PM25Chart = React.memo(PM25ChartComponent);
