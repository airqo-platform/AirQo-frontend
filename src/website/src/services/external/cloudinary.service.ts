const CLOUDINARY_HOST = 'res.cloudinary.com';

const SKIP_EXTENSIONS = new Set(['svg', 'pdf', 'gif']);

export type CloudinaryImageOptions = {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
};

const hasExistingTransformation = (segment: string): boolean =>
  /^(w_|h_|q_|f_|c_|g_|dpr_|e_|fl_|so_|vc_|br_)/.test(segment);

export function optimizeCloudinaryUrl(
  url: string,
  options: CloudinaryImageOptions = {},
): string {
  if (!url || !url.includes(CLOUDINARY_HOST)) {
    return url;
  }

  const normalized = url.startsWith('http://')
    ? `https://${url.slice(7)}`
    : url;

  const extension = /\.([a-zA-Z0-9]{2,5})(\?.*)?$/.exec(normalized)?.[1];
  if (extension && SKIP_EXTENSIONS.has(extension.toLowerCase())) {
    return normalized;
  }

  const match =
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/)(.*)$/.exec(
      normalized,
    );
  if (!match) {
    return normalized;
  }

  const [, base, , rest] = match;
  const firstSegment = rest.split('/')[0];
  if (hasExistingTransformation(firstSegment)) {
    return normalized;
  }

  const {
    width,
    height,
    crop = width ? 'limit' : undefined,
    quality = 'auto',
    format = 'webp',
  } = options;

  const transformations: string[] = [];
  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length === 0) {
    return normalized;
  }

  return `${base}${transformations.join(',')}/${rest}`;
}

export const CLOUDINARY_IMAGES = {
  logo: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png',
    { width: 200 },
  ),
  makerereName: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728142537/website/Logos/MakName_xmsi0k.png',
    { width: 320 },
  ),
  appleStoreBadge: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179257/website/photos/apple_vpcn6j.png',
    { width: 320 },
  ),
  googlePlayBadge: optimizeCloudinaryUrl(
    'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728179280/website/photos/google_play_vdmjrx.png',
    { width: 320 },
  ),
} as const;

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
   * Apply optimization transformations to an existing Cloudinary delivery URL
   */
  getOptimizedImageUrl(url: string, options?: CloudinaryImageOptions): string {
    return optimizeCloudinaryUrl(url, options);
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
