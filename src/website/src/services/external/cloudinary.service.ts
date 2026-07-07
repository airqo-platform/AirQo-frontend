export class CloudinaryService {
  private cloudName: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  }

  /**
   * Get optimized image URL using Cloudinary transformations
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
      gravity?: string;
    } = {},
  ): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop,
      gravity,
    } = options;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);

    const transformation =
      transformations.length > 0 ? transformations.join(',') + '/' : '';

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}${publicId}`;
  }

  /**
   * Get a blurred placeholder URL for progressive loading
   */
  getPlaceholderUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, {
      width: 20,
      quality: 1,
      format: 'auto',
    });
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
