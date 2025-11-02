'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { DatePicker, DateRange } from '@/shared/components/calendar';
// Icons are now imported from the centralized utility
import { getAirQualityInfo } from '@/shared/utils/airQuality';

interface WeeklyForecast {
  day: string;
  date: number;
  pm25: number;
  airQuality: string;
}

// Generate weekly forecast data (mock data for now)
const generateWeeklyForecast = (): WeeklyForecast[] => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const currentDay = today.getDay();
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  return days.map((day, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    const pm25 = Math.random() * 30 + 5; // Random PM2.5 value between 5-35
    const aqInfo = getAirQualityInfo(pm25, 'pm2_5');

    return {
      day,
      date: date.getDate(),
      pm25: Math.round(pm25 * 10) / 10,
      airQuality: aqInfo.label,
    };
  });
};

export const WeeklyForecastCard: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const weeklyForecast = React.useMemo(() => generateWeeklyForecast(), []);
  const today = new Date().getDay();
  // Convert Sunday (0) to 6, and shift Monday to 0
  const todayIndex = today === 0 ? 6 : today - 1;

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
          {weeklyForecast.map((forecast, index) => {
            const forecastAqInfo = getAirQualityInfo(forecast.pm25, 'pm2_5');
            const ForecastIcon = forecastAqInfo.icon;
            const isToday = index === todayIndex;

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
                  {forecast.day}
                </span>

                {/* Date number */}
                <span
                  className={cn(
                    'text-sm font-semibold mb-1',
                    isToday ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {String(forecast.date).padStart(2, '0')}
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
