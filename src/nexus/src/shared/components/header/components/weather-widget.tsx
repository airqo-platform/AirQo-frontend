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
  icon: WeatherIconKey;
  pressure: number;
  visibility: number;
  country: string;
  city: string;
}

interface WeatherWidgetProps {
  className?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Cached, previously GRANTED coordinates. Reusing them on later page loads
 * avoids re-prompting the user for permission every visit (permissions UX
 * best practice — prompt once, then reuse until it becomes unreliable).
 * Expired entries are discarded and the prompt is shown again.
 */
const COORDS_CACHE_KEY = 'nexus:weather-coords';
const COORDS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const readCachedCoords = (): Coordinates | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COORDS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      latitude?: number;
      longitude?: number;
      ts?: number;
    };
    if (
      typeof parsed.latitude === 'number' &&
      Number.isFinite(parsed.latitude) &&
      typeof parsed.longitude === 'number' &&
      Number.isFinite(parsed.longitude) &&
      typeof parsed.ts === 'number' &&
      Date.now() - parsed.ts < COORDS_CACHE_TTL_MS
    ) {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
    window.localStorage.removeItem(COORDS_CACHE_KEY);
  } catch {
    // Storage unavailable — the widget just requests the position again.
  }
  return null;
};

const cacheCoords = (coords: Coordinates): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      COORDS_CACHE_KEY,
      JSON.stringify({ ...coords, ts: Date.now() })
    );
  } catch {
    // Best-effort — the widget still works for this page load.
  }
};

/**
 * Maps WMO weather codes (as returned by Open-Meteo) to an icon key + readable
 * label. See https://open-meteo.com/en/docs for the code table.
 */
const getWeatherCondition = (
  code: number
): { icon: WeatherIconKey; label: string } => {
  if (code === 0) return { icon: 'sun', label: 'Clear sky' };
  if (code === 1) return { icon: 'sun', label: 'Mainly clear' };
  if (code === 2) return { icon: 'cloud-sun', label: 'Partly cloudy' };
  if (code === 3) return { icon: 'cloud', label: 'Overcast' };
  if (code === 45 || code === 48) return { icon: 'cloud', label: 'Fog' };
  if (code >= 51 && code <= 57) return { icon: 'rain', label: 'Drizzle' };
  if (code >= 61 && code <= 67) return { icon: 'rain', label: 'Rain' };
  if (code >= 71 && code <= 77) return { icon: 'snow', label: 'Snow' };
  if (code >= 80 && code <= 82) return { icon: 'rain', label: 'Rain showers' };
  if (code === 85 || code === 86) return { icon: 'snow', label: 'Snow showers' };
  if (code >= 95) return { icon: 'lightning', label: 'Thunderstorm' };
  return { icon: 'cloud', label: 'Unknown' };
};

/** Stable icon keys so the mapping never breaks under minification. */
type WeatherIconKey =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'rain'
  | 'snow'
  | 'lightning';

const WEATHER_ICONS: Record<WeatherIconKey, React.ComponentType<{ className?: string }>> = {
  sun: AqSun,
  'cloud-sun': AqCloudSun01,
  cloud: AqCloud01,
  rain: AqCloudRaining01,
  snow: AqCloudSnowing01,
  lightning: AqCloudLightning,
};

/**
 * Resolves the user's current position once. Rejects on denial, timeout, or
 * when geolocation is unsupported so callers can fall back to a default city.
 */
const getCurrentPosition = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });

/**
 * Fetches current weather from Open-Meteo — free, open-source, no API key.
 * Docs: https://open-meteo.com/en/docs
 */
const fetchOpenMeteoWeather = async (
  lat: number,
  lon: number,
  signal: AbortSignal
): Promise<Record<string, unknown>> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility',
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }
  return (await response.json()) as Record<string, unknown>;
};

/**
 * Resolves the nearest place name for a coordinate — free, no API key.
 * Docs: https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api
 */
const fetchPlaceName = async (
  lat: number,
  lon: number,
  signal: AbortSignal
): Promise<{ city: string; country: string }> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    localityLanguage: 'en',
  });
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`,
    { signal }
  );
  if (!response.ok) {
    throw new Error(`Reverse geocode request failed with status ${response.status}`);
  }
  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    countryName?: string;
    countryCode?: string;
  };
  return {
    city: data.city || data.locality || 'Your location',
    country: data.countryName || data.countryCode || '',
  };
};

/**
 * Maps the Open-Meteo "current weather" JSON payload into the widget's shape.
 * Guards every field so a partial/odd response degrades gracefully.
 */
const mapWeatherData = (
  data: Record<string, unknown>,
  city: string,
  country: string
): WeatherData => {
  const current = (data.current ?? {}) as Record<string, number>;
  const code = typeof current.weather_code === 'number' ? current.weather_code : 2;
  const condition = getWeatherCondition(code);
  const visibilityMeters =
    typeof current.visibility === 'number' ? current.visibility : 10000;

  return {
    temperature: Math.round(current.temperature_2m ?? 0),
    feelsLike: Math.round(
      current.apparent_temperature ?? current.temperature_2m ?? 0
    ),
    humidity: Math.round(current.relative_humidity_2m ?? 0),
    // Open-Meteo reports wind speed in km/h by default — no conversion needed.
    windSpeed: Math.round(current.wind_speed_10m ?? 0),
    description: condition.label,
    icon: condition.icon,
    pressure: Math.round(current.surface_pressure ?? 0),
    // Open-Meteo reports visibility in meters — convert to km.
    visibility: Math.max(1, Math.round(visibilityMeters / 1000)),
    country,
    city,
  };
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
    const controller = new AbortController();

    const loadWeather = async () => {
      try {
        // 1. Resolve coordinates — reuse a previously granted position to
        // avoid re-prompting; otherwise ask once.
        let lat: number;
        let lon: number;
        let city: string;
        let country: string;

        const cached = readCachedCoords();
        if (cached) {
          lat = cached.latitude;
          lon = cached.longitude;
        } else {
          const coords = await getCurrentPosition();
          lat = coords.latitude;
          lon = coords.longitude;
          cacheCoords(coords);
        }

        // 2. Reverse-geocode the place name. A failure here is non-fatal —
        // the widget can still show weather without a city label.
        try {
          const place = await fetchPlaceName(lat, lon, controller.signal);
          city = place.city;
          country = place.country;
        } catch {
          city = 'Your location';
          country = '';
        }

        // 3. Fetch the weather. If this fails, hide the widget entirely —
        // never show fabricated values as if they were real conditions.
        const data = await fetchOpenMeteoWeather(lat, lon, controller.signal);
        setWeather(mapWeatherData(data, city, country));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        // Geolocation denied/unavailable/timed out or the weather API failed:
        // there is no accurate weather for this user, so the widget stays
        // hidden rather than presenting a different city's data.
        setWeather(null);
      }
    };

    void loadWeather();

    return () => controller.abort();
  }, []);

  // The widget only renders real weather for the user's actual location. When
  // the location can't be resolved accurately or the weather API fails, it
  // stays hidden — no placeholder values, no another-city's conditions.
  if (!weather) return null;

  const WeatherIcon = WEATHER_ICONS[weather.icon] ?? WEATHER_ICONS['cloud-sun'];

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
          {weather.temperature}°C
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
