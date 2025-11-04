'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AqChevronUp, AqChevronDown } from '@airqo/icons-react';
import { AqWind01 } from '@airqo/icons-react';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import { formatTruncatedNumber } from '@/shared/lib/utils';
import type { MapReading } from '../../../../shared/types/api';

// Types for location data
interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface CurrentAirQualityCardProps {
  locationData: LocationData;
  mapReading?: MapReading;
}

export const CurrentAirQualityCard: React.FC<CurrentAirQualityCardProps> = ({
  locationData,
  mapReading,
}) => {
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);

  const pm25Value = mapReading?.pm2_5?.value;
  const pm10Value = mapReading?.pm10?.value;
  const airQualityInfo = React.useMemo(() => {
    if (pm25Value !== null && pm25Value !== undefined) {
      return getAirQualityInfo(pm25Value, 'pm2_5');
    }
    return null;
  }, [pm25Value]);
  const AirQualityIcon = airQualityInfo?.icon;

  // Format date and time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return { date: formattedDate, time: formattedTime };
  };

  const { date, time } = formatDateTime(mapReading?.time);

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
              {pm25Value !== null && pm25Value !== undefined
                ? `${formatTruncatedNumber(pm25Value, 2)}µg/m³`
                : 'N/A'}
            </div>
          </div>
          {AirQualityIcon && <AirQualityIcon className="w-12 h-12" />}
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
              {airQualityInfo?.level || mapReading?.aqi_category || 'N/A'}
            </div>
          </div>

          {/* Expandable sections */}
          {showMoreDetails && (
            <>
              {/* Site name section */}
              <div className="pb-3">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Site name
                  </div>
                </div>
                <div className="font-semibold text-base text-gray-900 dark:text-gray-100">
                  {mapReading?.siteDetails?.name || locationData.name}
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
                  {mapReading?.device || 'N/A'}
                </div>
              </div>

              {/* Pollution source and pollutant */}
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
                    N/A
                  </span>
                  <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {pm25Value !== null && pm25Value !== undefined
                      ? `PM2.5: ${formatTruncatedNumber(pm25Value, 2)}`
                      : pm10Value !== null && pm10Value !== undefined
                        ? `PM10: ${formatTruncatedNumber(pm10Value, 2)}`
                        : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Date and time */}
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
                    {date}
                  </span>
                  <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {time}
                  </span>
                </div>
              </div>

              {/* City and country */}
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
                    {mapReading?.siteDetails?.city || 'N/A'}
                  </span>
                  <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {mapReading?.siteDetails?.country || 'N/A'}
                  </span>
                </div>
              </div>
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
