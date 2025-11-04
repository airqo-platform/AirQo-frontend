// WAQI API Types

export interface WAQIStation {
  lat: number;
  lon: number;
  aqi: string; // Can be number or "-" for unavailable
  station: {
    name: string;
    url?: string;
  };
  uid?: number; // Station ID
}

export interface WAQIMapBoundsResponse {
  status: 'ok' | 'error';
  data: WAQIStation[];
}

export interface WAQICityResponse {
  status: 'ok' | 'error';
  data: {
    aqi: string;
    time: {
      s: string; // ISO timestamp
    };
    city: {
      name: string;
      url: string;
      geo: [string, string]; // [lat, lng]
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
      o3?: { v: number };
      [key: string]: { v: number } | undefined;
    };
    forecast?: {
      daily: {
        pm25?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
        pm10?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
        o3?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
        no2?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
        so2?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
        co?: Array<{
          avg: number;
          day: string;
          max: number;
          min: number;
        }>;
      };
    };
    attributions?: Array<{
      url: string;
      name: string;
    }>;
  };
}

export interface WAQIError {
  status: 'error';
  data: string; // Error message
}
