import type {
  WAQIMapBoundsResponse,
  WAQICityResponse,
  WAQIStation,
  WAQIError,
} from '../types/waqi';

export class WAQIService {
  private baseUrl = '/api/waqi';

  constructor() {
    // No token needed - handled server-side
  }

  /**
   * Get stations within map bounds
   * @param latlng - "lat1,lng1,lat2,lng2" format
   */
  async getStationsInBounds(latlng: string): Promise<WAQIStation[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?endpoint=map/bounds/&latlng=${latlng}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WAQIMapBoundsResponse | WAQIError = await response.json();

      if (data.status === 'error') {
        throw new Error(
          typeof data.data === 'string' ? data.data : 'Unknown WAQI error'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching WAQI stations:', error);
      throw error;
    }
  }

  /**
   * Get air quality data for a specific city
   * @param city - City name or station ID
   */
  async getCityData(city: string): Promise<WAQICityResponse['data'] | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}?endpoint=feed/${encodeURIComponent(city)}/`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WAQICityResponse | WAQIError = await response.json();

      if (data.status === 'error') {
        console.warn(`WAQI data not available for ${city}:`, data.data);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error(`Error fetching WAQI data for ${city}:`, error);
      return null;
    }
  }

  /**
   * Get air quality data for multiple cities
   * @param cities - Array of city names
   */
  async getMultipleCitiesData(
    cities: string[]
  ): Promise<WAQICityResponse['data'][]> {
    const promises = cities.map(city => this.getCityData(city));
    const results = await Promise.all(promises);
    return results.filter(
      result => result !== null
    ) as WAQICityResponse['data'][];
  }
}

// Create service instance
export const waqiService = new WAQIService();
