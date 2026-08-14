'use client';

import React, { useState, useEffect } from 'react';
import {
  AqCloudSun01,
  AqCloudRaining01,
  AqCloud01,
  AqSun,
  AqCloudLightning,
  AqCloudSnowing01,
} from '@airqo/icons-react';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  country: string;
  city: string;
}

interface WeatherWidgetProps {
  className?: string;
}

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes('01')) return AqSun;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04'))
    return AqCloudSun01;
  if (iconCode.includes('09') || iconCode.includes('10')) return AqCloudRaining01;
  if (iconCode.includes('11')) return AqCloudLightning;
  if (iconCode.includes('13')) return AqCloudSnowing01;
  return AqCloud01;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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
          setWeather({
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            pressure: data.main.pressure,
            visibility: Math.round(data.visibility / 1000),
            country: data.sys.country,
            city: data.name,
          });
        } else {
          setWeather({
            temperature: 25,
            feelsLike: 27,
            humidity: 65,
            windSpeed: 12,
            description: 'partly cloudy',
            icon: '02d',
            pressure: 1013,
            visibility: 10,
            country: 'UG',
            city: 'Kampala',
          });
        }
      } catch {
        setWeather({
          temperature: 25,
          feelsLike: 27,
          humidity: 65,
          windSpeed: 12,
          description: 'partly cloudy',
          icon: '02d',
          pressure: 1013,
          visibility: 10,
          country: 'UG',
          city: 'Kampala',
        });
      }
    };

    fetchWeather();
  }, []);

  const WeatherIcon = weather ? getWeatherIcon(weather.icon) : AqCloudSun01;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main widget */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-t-0 border-primary/30 rounded-b-md cursor-default shadow-sm">
        <WeatherIcon className="w-5 h-5 text-orange-500" />
        <span className="text-sm font-semibold text-foreground">
          {weather !== null ? `${weather.temperature}°C` : '--°C'}
        </span>
        <div className="w-px h-3 bg-primary/30" />
        <span className="text-sm font-medium text-muted-foreground">
          {currentTime || '00:00'}
        </span>
      </div>

      {/* Hover details card */}
      {isHovered && weather && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {weather.city}, {weather.country}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {weather.description}
              </p>
            </div>
            <WeatherIcon className="w-10 h-10 text-orange-500" />
          </div>

          {/* Temperature */}
          <div className="mb-3">
            <p className="text-3xl font-bold text-foreground">
              {weather.temperature}°C
            </p>
            <p className="text-xs text-muted-foreground">
              Feels like {weather.feelsLike}°C
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium text-foreground">
                {weather.humidity}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium text-foreground">
                {weather.windSpeed} km/h
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-sm font-medium text-foreground">
                {weather.pressure} hPa
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium text-foreground">
                {weather.visibility} km
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
