'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { DatePicker, DateRange } from '@/shared/components/calendar';
// Icons are now imported from the centralized utility
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import { useForecast } from '../../hooks';
import { AqCloudOff } from '@airqo/icons-react';
import { LoadingSpinner } from '../../../../shared/components/ui/loading-spinner';

interface WeeklyForecastCardProps {
  siteId?: string;
}

export const WeeklyForecastCard: React.FC<WeeklyForecastCardProps> = ({
  siteId,
}) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  // Use the forecast hook to fetch real data
  const { forecast, isLoading, error } = useForecast({
    siteId,
    enabled: !!siteId,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size={24} />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading forecast...
          </span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-center py-8 text-center">
          <AqCloudOff className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Unable to load forecast data
          </p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!forecast || forecast.length === 0) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-center py-8 text-center">
          <AqCloudOff className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No forecast data available
          </p>
        </div>
      </div>
    );
  }

  const handleDateChange = (
    date: string | Date | DateRange | { from: string; to: string } | undefined
  ) => {
    if (date instanceof Date) {
      setSelectedDate(date);
    } else if (
      date &&
      typeof date === 'object' &&
      'from' in date &&
      typeof date.from === 'string'
    ) {
      // Handle string date ranges
      const fromDate = new Date(date.from);
      if (!isNaN(fromDate.getTime())) {
        setSelectedDate(fromDate);
      }
    } else if (
      date &&
      typeof date === 'object' &&
      'from' in date &&
      date.from instanceof Date
    ) {
      setSelectedDate(date.from);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Date picker at top left */}
      <div className="flex items-center justify-start">
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          mode="single"
          placeholder="Select date"
          className="w-auto min-w-0 shadow-sm"
          align="start"
        />
      </div>

      {/* Horizontally scrollable forecast */}
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-2 sm:gap-3 min-w-max py-2">
          {forecast.slice(0, 7).map((forecastItem, index) => {
            const forecastAqInfo = getAirQualityInfo(
              forecastItem.pm2_5 || 0,
              'pm2_5'
            );
            const ForecastIcon = forecastAqInfo.icon;
            const isToday = index === 0; // First item is today

            // Parse the time to get day and date
            const forecastDate = new Date(forecastItem.time);
            const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const dayLetter = dayNames[forecastDate.getDay()];
            const dateNumber = forecastDate.getDate();

            // Get background color based on air quality
            const getBgColorClass = () => {
              const level = forecastAqInfo.level.toLowerCase();
              if (level.includes('good')) return 'bg-green-50';
              if (level.includes('moderate')) return 'bg-yellow-50';
              if (level.includes('sensitive')) return 'bg-orange-50';
              if (level.includes('unhealthy') && !level.includes('very'))
                return 'bg-red-50';
              if (level.includes('very unhealthy')) return 'bg-purple-50';
              if (level.includes('hazardous')) return 'bg-pink-50';
              return 'bg-gray-50';
            };

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center rounded-full py-2 px-1 min-w-[36px] sm:min-w-[40px] transition-all duration-200 flex-shrink-0',
                  isToday
                    ? 'bg-blue-600 shadow-lg scale-105'
                    : `${getBgColorClass()} border border-gray-200`
                )}
              >
                {/* Day letter */}
                <span
                  className={cn(
                    'text-xs font-medium mb-0.5',
                    isToday ? 'text-white' : 'text-gray-600'
                  )}
                >
                  {dayLetter}
                </span>

                {/* Date number */}
                <span
                  className={cn(
                    'text-sm font-semibold mb-1',
                    isToday ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {String(dateNumber).padStart(2, '0')}
                </span>

                {/* Air quality icon */}
                <div className="flex items-center justify-center">
                  <ForecastIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
