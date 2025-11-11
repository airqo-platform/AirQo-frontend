'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AqChevronUp, AqChevronDown } from '@airqo/icons-react';
import { AqWind01 } from '@airqo/icons-react';
import {
  getAirQualityInfo,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import { formatTruncatedNumber } from '@/shared/lib/utils';
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

interface CurrentAirQualityCardProps {
  locationData: LocationData;
  mapReading?: MapReading | AirQualityReading;
  selectedPollutant?: PollutantType;
}

export const CurrentAirQualityCard: React.FC<CurrentAirQualityCardProps> = ({
  locationData,
  mapReading,
  selectedPollutant = 'pm2_5',
}) => {
  const [showMoreDetails, setShowMoreDetails] = React.useState(false);

  const pollutantValue =
    selectedPollutant === 'pm2_5'
      ? (mapReading as MapReading)?.pm2_5?.value ||
        (mapReading as AirQualityReading)?.pm25Value
      : (mapReading as MapReading)?.pm10?.value ||
        (mapReading as AirQualityReading)?.pm10Value;

  const airQualityInfo = React.useMemo(() => {
    if (pollutantValue !== null && pollutantValue !== undefined) {
      return getAirQualityInfo(pollutantValue, selectedPollutant);
    }
    return null;
  }, [pollutantValue, selectedPollutant]);
  const AirQualityIcon = airQualityInfo?.icon;

  // Helper function to extract city and country from location name
  const parseLocationDetails = (locationName?: string) => {
    if (!locationName) return { city: 'N/A', country: 'N/A' };

    // For WAQI data, location names are typically in format "City, Country" or just "City"
    const parts = locationName.split(',').map(part => part.trim());

    if (parts.length >= 2) {
      return {
        city: parts[0],
        country: parts[parts.length - 1], // Last part is usually the country
      };
    } else {
      // If no comma, assume it's just a city name
      return {
        city: locationName,
        country: 'N/A',
      };
    }
  };

  // Get city and country information
  const getCityAndCountry = () => {
    // First try AirQo data structure
    const airQoCity = (mapReading as MapReading)?.siteDetails?.city;
    const airQoCountry = (mapReading as MapReading)?.siteDetails?.country;

    if (airQoCity && airQoCountry) {
      return { city: airQoCity, country: airQoCountry };
    }

    // Then try WAQI data from fullReadingData
    const waqiCityFromFullData = (mapReading as AirQualityReading)
      ?.fullReadingData?.siteDetails?.city;
    const waqiCountryFromFullData = (mapReading as AirQualityReading)
      ?.fullReadingData?.siteDetails?.country;

    if (waqiCityFromFullData && waqiCountryFromFullData) {
      return { city: waqiCityFromFullData, country: waqiCountryFromFullData };
    }

    // Finally, parse from locationName (for WAQI data)
    const locationName =
      (mapReading as AirQualityReading)?.locationName ||
      (mapReading as MapReading)?.siteDetails?.search_name ||
      (mapReading as MapReading)?.siteDetails?.formatted_name ||
      (mapReading as MapReading)?.siteDetails?.name;

    return parseLocationDetails(locationName);
  };

  const { city, country } = getCityAndCountry();

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

  const getLastUpdatedISOString = (
    lastUpdated: Date | string | undefined
  ): string | undefined => {
    if (!lastUpdated) return undefined;
    if (typeof lastUpdated === 'string') return lastUpdated;
    return lastUpdated.toISOString();
  };

  const { date, time } = formatDateTime(
    (mapReading as MapReading)?.time ||
      getLastUpdatedISOString((mapReading as AirQualityReading)?.lastUpdated)
  );

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
                {getPollutantLabel(selectedPollutant)}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {pollutantValue !== null && pollutantValue !== undefined
                ? `${formatTruncatedNumber(pollutantValue, 2)}µg/m³`
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
              {airQualityInfo?.level ||
                (mapReading as MapReading)?.aqi_category ||
                (mapReading as AirQualityReading)?.aqiCategory ||
                'N/A'}
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
                  {(mapReading as MapReading)?.siteDetails?.name ||
                    (mapReading as AirQualityReading)?.locationName ||
                    locationData.name}
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
                  {(mapReading as MapReading)?.device ||
                    (mapReading as AirQualityReading)?.provider ||
                    'N/A'}
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
                    {pollutantValue !== null && pollutantValue !== undefined
                      ? `${getPollutantLabel(selectedPollutant)}: ${formatTruncatedNumber(pollutantValue, 2)}`
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
                    {city}
                  </span>
                  <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {country}
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
