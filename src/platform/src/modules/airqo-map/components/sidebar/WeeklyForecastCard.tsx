'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqUnhealthy,
  AqVeryUnhealthy,
  AqHazardous,
} from '@airqo/icons-react';
import {
  getAirQualityLevel,
  getAirQualityColor,
  getAirQualityLabel,
} from '@/modules/analytics';

interface WeeklyForecast {
  day: string;
  date: number;
  pm25: number;
  airQuality: string;
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
    const aqInfo = getAirQualityIcon(pm25);

    return {
      day,
      date: date.getDate(),
      pm25: Math.round(pm25 * 10) / 10,
      airQuality: aqInfo.level,
    };
  });
};

export const WeeklyForecastCard: React.FC = () => {
  const weeklyForecast = React.useMemo(() => generateWeeklyForecast(), []);

  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          {weeklyForecast.map((forecast, index) => {
            const forecastAqInfo = getAirQualityIcon(forecast.pm25);
            const ForecastIcon = forecastAqInfo.icon;
            const isToday =
              index === new Date().getDay() - 1 ||
              (new Date().getDay() === 0 && index === 6);

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-1',
                  isToday && 'bg-primary/10 rounded-lg p-2'
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {forecast.day}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {forecast.date}
                </span>
                <div className="w-6 h-6">
                  <ForecastIcon
                    className="w-full h-full"
                    color={forecastAqInfo.color}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
