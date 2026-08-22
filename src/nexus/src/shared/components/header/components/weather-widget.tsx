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
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  description: string | null;
  icon: WeatherIconKey | null;
  pressure: number | null;
  visibility: number | null;
  country: string;
  city: string;
}

interface OpenMeteoResponse {
  current?: Record<string, unknown>;
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
const WEATHER_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes
const PLACE_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

interface WeatherCacheEntry {
  data: WeatherData;
  expiresAt: number;
}

interface PlaceCacheEntry {
  city: string;
  country: string;
  expiresAt: number;
}

// Module caches prevent duplicate requests when the shared header is
// remounted during client-side navigation. Weather is short-lived; place
// names can safely be reused for the lifetime of the coordinate cache.
const weatherCache = new Map<string, WeatherCacheEntry>();
const placeCache = new Map<string, PlaceCacheEntry>();

const getCoordinateCacheKey = (lat: number, lon: number): string =>
  `${lat.toFixed(3)},${lon.toFixed(3)}`;

const getCachedWeather = (key: string): WeatherData | null => {
  const entry = weatherCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    weatherCache.delete(key);
    return null;
  }
  return entry.data;
};

const cacheWeather = (key: string, data: WeatherData): void => {
  weatherCache.set(key, {
    data,
    expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
  });
};

const getCachedPlace = (
  key: string
): { city: string; country: string } | null => {
  const entry = placeCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    placeCache.delete(key);
    return null;
  }
  return { city: entry.city, country: entry.country };
};

const cachePlace = (
  key: string,
  place: { city: string; country: string }
): void => {
  placeCache.set(key, {
    ...place,
    expiresAt: Date.now() + PLACE_CACHE_TTL_MS,
  });
};

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
  if (code === 85 || code === 86)
    return { icon: 'snow', label: 'Snow showers' };
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

const WEATHER_ICONS: Record<
  WeatherIconKey,
  React.ComponentType<{ className?: string }>
> = {
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
): Promise<OpenMeteoResponse> => {
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
  return (await response.json()) as OpenMeteoResponse;
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
    throw new Error(
      `Reverse geocode request failed with status ${response.status}`
    );
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
  data: OpenMeteoResponse,
  city: string,
  country: string
): WeatherData => {
  const current = data.current ?? {};
  const toNumber = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;
  const round = (value: unknown): number | null => {
    const number = toNumber(value);
    return number === null ? null : Math.round(number);
  };
  const code = toNumber(current.weather_code);
  const condition = code === null ? null : getWeatherCondition(code);
  const visibilityMeters = toNumber(current.visibility);

  return {
    temperature: round(current.temperature_2m),
    feelsLike: round(current.apparent_temperature ?? current.temperature_2m),
    humidity: round(current.relative_humidity_2m),
    // Open-Meteo reports wind speed in km/h by default — no conversion needed.
    windSpeed: round(current.wind_speed_10m),
    description: condition?.label ?? null,
    icon: condition?.icon ?? null,
    pressure: round(current.surface_pressure),
    // Open-Meteo reports visibility in meters — convert to km.
    visibility:
      visibilityMeters === null ? null : Math.round(visibilityMeters / 1000),
    country,
    city,
  };
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<
    'location' | 'weather' | null
  >(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let locationFailed = false;
    setIsLoadingWeather(true);
    setWeatherError(null);

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
          try {
            const coords = await getCurrentPosition();
            lat = coords.latitude;
            lon = coords.longitude;
            cacheCoords(coords);
          } catch (error) {
            locationFailed = true;
            throw error;
          }
        }

        // 2. Reverse-geocode the place name. A failure here is non-fatal —
        // the widget can still show weather without a city label.
        if (controller.signal.aborted) return;

        const coordinateCacheKey = getCoordinateCacheKey(lat, lon);
        const cachedWeather = getCachedWeather(coordinateCacheKey);
        if (cachedWeather) {
          setWeather(cachedWeather);
          return;
        }

        const cachedPlace = getCachedPlace(coordinateCacheKey);
        if (cachedPlace) {
          city = cachedPlace.city;
          country = cachedPlace.country;
        } else {
          try {
            const place = await fetchPlaceName(lat, lon, controller.signal);
            city = place.city;
            country = place.country;
            cachePlace(coordinateCacheKey, place);
          } catch (error) {
            if ((error as Error).name === 'AbortError') throw error;
            city = 'Your location';
            country = '';
          }
        }

        // 3. Fetch only current conditions; the widget does not display a forecast.
        const data = await fetchOpenMeteoWeather(lat, lon, controller.signal);
        const mappedWeather = mapWeatherData(data, city, country);
        cacheWeather(coordinateCacheKey, mappedWeather);
        setWeather(mappedWeather);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        // Geolocation denied/unavailable/timed out or the weather API failed:
        // there is no accurate weather for this user, so keep the widget
        // visible with placeholders rather than another city's conditions.
        setWeather(null);
        setWeatherError(locationFailed ? 'location' : 'weather');
      } finally {
        if (!controller.signal.aborted) setIsLoadingWeather(false);
      }
    };

    void loadWeather();

    return () => controller.abort();
  }, [retryNonce]);

  const WeatherIcon = weather?.icon
    ? WEATHER_ICONS[weather.icon]
    : WEATHER_ICONS.cloud;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main widget */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-t-0 border-primary/30 rounded-b-md cursor-default shadow-sm">
        {weather?.icon ? (
          <WeatherIcon className="w-5 h-5 text-orange-500" />
        ) : (
          <span className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-foreground">
          {weather?.temperature === null || weather?.temperature === undefined
            ? '--'
            : `${weather.temperature}°C`}
        </span>
        <div className="w-px h-3 bg-primary/30" />
        <span className="text-sm font-medium text-muted-foreground">
          {currentTime || '--:--:--'}
        </span>
      </div>

      {/* Hover details card */}
      {isHovered && (
        <div className="absolute right-0 top-full z-50 w-64 pt-1">
          <div className="bg-card border border-border rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoadingWeather ? (
            <p className="text-sm text-muted-foreground">Loading weather…</p>
          ) : !weather ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Weather unavailable
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {weatherError === 'location'
                    ? 'Allow location access in your browser, then try again to load weather for your location.'
                    : 'We could not load weather data for your location.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRetryNonce(value => value + 1)}
                className="w-full rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
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
                {weather.icon ? (
                  <WeatherIcon className="w-10 h-10 text-orange-500" />
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
              </div>

              {/* Temperature */}
              <div className="mb-3">
                <p className="text-3xl font-bold text-foreground">
                  {weather.temperature === null
                    ? '--'
                    : `${weather.temperature}°C`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Feels like{' '}
                  {weather.feelsLike === null ? '--' : `${weather.feelsLike}°C`}
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="text-sm font-medium text-foreground">
                    {weather.humidity === null ? '--' : `${weather.humidity}%`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="text-sm font-medium text-foreground">
                    {weather.windSpeed === null
                      ? '--'
                      : `${weather.windSpeed} km/h`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="text-sm font-medium text-foreground">
                    {weather.pressure === null
                      ? '--'
                      : `${weather.pressure} hPa`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="text-sm font-medium text-foreground">
                    {weather.visibility === null
                      ? '--'
                      : `${weather.visibility} km`}
                  </p>
                </div>
              </div>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 block border-t border-border pt-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Weather data by Open-Meteo
              </a>
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
