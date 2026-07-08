export class MapsService {
  private mapboxToken: string;

  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Get Mapbox access token
   */
  getAccessToken(): string {
    return this.mapboxToken;
  }

  /**
   * Build a static map URL for a given location
   */
  getStaticMapUrl(
    lat: number,
    lng: number,
    options: {
      width?: number;
      height?: number;
      zoom?: number;
      style?: string;
    } = {},
  ): string {
    const {
      width = 600,
      height = 400,
      zoom = 12,
      style = 'mapbox/streets-v12',
    } = options;

    return `https://api.mapbox.com/styles/v1/${style}/static/${lng},${lat},${zoom}/${width}x${height}x2@2x?access_token=${this.mapboxToken}`;
  }

  /**
   * Build a Mapbox embed URL for a given location
   */
  getEmbedUrl(lat: number, lng: number, zoom: number = 12): string {
    return `https://www.mapbox.com/maps/embed?place=${lat},${lng}/${zoom}/${lat}/${lng}&access_token=${this.mapboxToken}`;
  }
}

export const mapsService = new MapsService();
export default mapsService;
