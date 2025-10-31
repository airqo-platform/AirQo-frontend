'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AqChevronUp, AqChevronDown } from '@airqo/icons-react';
import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqUnhealthy,
  AqVeryUnhealthy,
  AqHazardous,
  AqWind01,
} from '@airqo/icons-react';
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

interface CurrentAirQualityCardProps {
  locationData: LocationData;
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

export const CurrentAirQualityCard: React.FC<CurrentAirQualityCardProps> = ({
  locationData,
}) => {
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);

  const pm25Value = locationData.pm25Value || 8.63;
  const airQualityInfo = getAirQualityIcon(pm25Value);
  const AirQualityIcon = airQualityInfo.icon;

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-6">
        {/* Header with PM2.5 value and icon */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center flex-shrink-0 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
                <AqWind01 className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                PM2.5
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pm25Value}µg/m³
            </div>
          </div>
          <AirQualityIcon className="w-12 h-12" color={airQualityInfo.color} />
        </div>

        {/* Location section */}
        <div className="space-y-4">
          <div className="pb-3">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Location
              </div>
            </div>
            <div className="font-semibold text-base text-gray-900 dark:text-gray-100">
              {locationData.name}
            </div>
          </div>

          <div className="pb-3">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Air Quality
              </div>
            </div>
            <div className="font-semibold text-base text-gray-900 dark:text-gray-100">
              {airQualityInfo.level}
            </div>
          </div>

          {/* Expandable sections */}
          {showMoreDetails && (
            <>
              {/* Site name section */}
              {locationData.monitor && (
                <>
                  <div className="pb-3">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Site name
                      </div>
                    </div>
                    <div className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.name}
                    </div>
                  </div>

                  {/* Monitor section */}
                  <div className="pb-3">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Monitor
                      </div>
                    </div>
                    <div className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.monitor}
                    </div>
                  </div>
                </>
              )}

              {locationData.pollutionSource && locationData.pollutant && (
                <div className="pb-3">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Pollution Source
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Pollutant
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.pollutionSource}
                    </span>
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.pollutant}
                    </span>
                  </div>
                </div>
              )}

              {locationData.time && (
                <div className="pb-3">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Date
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Time • GMT(+3)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      Apr 12th, 2024
                    </span>
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      1:28PM
                    </span>
                  </div>
                </div>
              )}

              {locationData.city && locationData.country && (
                <div className="pb-3">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        City
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Country
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.city}
                    </span>
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                      {locationData.country}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Show more/less button */}
          <Button
            variant="outlined"
            Icon={showMoreDetails ? AqChevronUp : AqChevronDown}
            iconPosition="end"
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            className="w-full mt-2 h-8 shadow"
          >
            {showMoreDetails ? 'Show less' : 'Show more'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
