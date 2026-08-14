'use client';

import React, { useState, useEffect } from 'react';
import { AqCloudSun01 } from '@airqo/icons-react';

interface WeatherWidgetProps {
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Kampala&units=metric&appid=demo'
        );
        if (response.ok) {
          const data = await response.json();
          setTemperature(Math.round(data.main.temp));
        } else {
          setTemperature(25);
        }
      } catch {
        setTemperature(25);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 bg-card border border-t-0 border-border rounded-b-md ${className}`}
    >
      <AqCloudSun01 className="w-6 h-6 text-orange-500" />
      <span className="text-lg font-semibold text-foreground">
        {temperature !== null ? `${temperature}°C` : '--°C'}
      </span>
      <div className="w-px h-4 bg-border" />
      <span className="text-lg font-medium text-muted-foreground">
        {currentTime || '00:00'}
      </span>
    </div>
  );
};

export default WeatherWidget;
