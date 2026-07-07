'use client';

export interface PhotonSearchResult {
  type: 'Feature';
  geometry: {
    coordinates: [number, number]; // [lon, lat]
    type: 'Point';
  };
  properties: {
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    country?: string;
    city?: string;
    postcode?: string;
    state?: string;
    housenumber?: string;
    street?: string;
    extent?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  };
}

export interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonSearchResult[];
}

class PhotonService {
  private baseUrl = 'https://photon.komoot.io';

  async search(
    query: string,
    limit = 5,
    lang = 'en'
  ): Promise<PhotonSearchResult[]> {
    if (!query.trim()) return [];

    try {
      const url = new URL('/api/', this.baseUrl);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('lang', lang);

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'AirQo-frontend/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Photon API error: ${response.status}`);
      }

      const data: PhotonResponse = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Photon search error:', error);
      return [];
    }
  }

  async reverseGeocode(
    lat: number,
    lon: number
  ): Promise<PhotonSearchResult | null> {
    try {
      const url = new URL('/reverse', this.baseUrl);
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lon', lon.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'AirQo-frontend/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Photon reverse geocoding error: ${response.status}`);
      }

      const data: PhotonResponse = await response.json();
      return data.features?.[0] || null;
    } catch (error) {
      console.error('Photon reverse geocoding error:', error);
      return null;
    }
  }
}

export const photonService = new PhotonService();
