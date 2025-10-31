'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { SingleCalendar } from '@/shared/components/calendar';
import { CollapsibleCard } from '@/modules/airqo-map/components/sidebar/collapsible-card';
import { CurrentAirQualityCard } from '@/modules/airqo-map/components/sidebar/CurrentAirQualityCard';
import { WeeklyForecastCard } from '@/modules/airqo-map/components/sidebar/WeeklyForecastCard';
import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqUnhealthy,
  AqVeryUnhealthy,
  AqHazardous,
} from '@airqo/icons-react';
import { AqChevronLeft, AqCalendar } from '@airqo/icons-react';
import {
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityLabel,
} from '@/modules/analytics';

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
  className?: string;
}

// Air quality icon mapping based on PM2.5 value using analytics utilities
const getAirQualityIcon = (pm25Value: number) => {
  const level = getAirQualityLevel(pm25Value, 'pm2_5');
  const color = getAirQualityColor(level);
  const label = getAirQualityLabel(level);

  const iconMap = {
    good: AqGood,
    moderate: AqModerate,
    'unhealthy-sensitive-groups': AqUnhealthyForSensitiveGroups,
    unhealthy: AqUnhealthy,
    'very-unhealthy': AqVeryUnhealthy,
    hazardous: AqHazardous,
    'no-value': AqGood, // fallback
  };

  return {
    icon: iconMap[level] || AqGood,
    color,
    level: label,
  };
};

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

export const LocationDetailsPanel: React.FC<LocationDetailsPanelProps> = ({
  locationData,
  onBack,
  className,
}) => {
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const pm25Value = locationData.pm25Value || 8.63;
  const airQualityInfo = getAirQualityIcon(pm25Value);

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setSelectedDate(range.from);
      setShowCalendar(false);
    }
  };

  return (
    <Card
      className={cn(
        'flex flex-col h-full md:max-w-[340px] md:min-w-[340px] rounded-none md:rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header with back button and date */}
      <CardHeader className="p-4 pb-2 border-b">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <AqChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="p-1 h-6 w-6"
            >
              <AqCalendar className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Calendar dropdown */}
        {showCalendar && (
          <div className="absolute top-16 right-4 z-50 bg-background border rounded-lg shadow-lg">
            <SingleCalendar
              onApply={handleDateSelect}
              onCancel={() => setShowCalendar(false)}
              initialRange={{ from: selectedDate, to: selectedDate }}
            />
          </div>
        )}
      </CardHeader>

      {/* Main content */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Weekly Forecast */}
        <WeeklyForecastCard />

        {/* Current Air Quality */}
        <CurrentAirQualityCard locationData={locationData} />

        {/* Health Alerts */}
        <CollapsibleCard title="Health Alerts" defaultExpanded={false}>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              {locationData.name}&apos;s Air Quality is {airQualityInfo.level}{' '}
              for breathing. {getHealthTip(airQualityInfo.level)}
            </p>
          </div>
        </CollapsibleCard>

        {/* More Insights */}
        <CollapsibleCard title="More Insights" defaultExpanded={false}>
          {/* PM2.5 Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">PM2.5</span>
              <span className="text-xs text-primary">{locationData.name}</span>
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
        </CollapsibleCard>
      </CardContent>
    </Card>
  );
};
