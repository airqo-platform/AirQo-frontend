import {
  CLOUDINARY_IMAGES,
  optimizeCloudinaryUrl,
} from '@/services/external/cloudinary.service';

const BASE_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp';

describe('optimizeCloudinaryUrl', () => {
  it('adds width, c_limit, q_auto and f_webp to a raw delivery URL', () => {
    const result = optimizeCloudinaryUrl(BASE_URL, { width: 1200 });
    expect(result).toBe(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/c_limit,w_1200,q_auto,f_webp/v1728132435/website/photos/AirQuality_meyioj.webp',
    );
  });

  it('returns non-Cloudinary URLs unchanged', () => {
    const url = 'https://example.com/image.jpg';
    expect(optimizeCloudinaryUrl(url, { width: 800 })).toBe(url);
  });

  it('returns empty input unchanged', () => {
    expect(optimizeCloudinaryUrl('', { width: 800 })).toBe('');
  });

  it('does not double-transform URLs that already have transformations', () => {
    const transformed =
      'https://res.cloudinary.com/dbibjvyhm/video/upload/so_2,f_jpg,q_auto,w_1280/v1716038850/website/videos/opening_jtpafn.jpg';
    expect(optimizeCloudinaryUrl(transformed, { width: 1600 })).toBe(
      transformed,
    );
  });

  it('skips SVG assets', () => {
    const svg =
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/Communities_Star_qcl1e6.svg';
    expect(optimizeCloudinaryUrl(svg, { width: 400 })).toBe(svg);
  });

  it('skips PDF documents', () => {
    const pdf =
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1773140737/website/docs/AirQo_Air_Quality_Monitoring_Solution_rtiz2c.pdf';
    expect(optimizeCloudinaryUrl(pdf, { width: 800 })).toBe(pdf);
  });

  it('normalizes http to https', () => {
    const httpUrl = BASE_URL.replace('https://', 'http://');
    const result = optimizeCloudinaryUrl(httpUrl, { width: 440 });
    expect(result.startsWith('https://')).toBe(true);
    expect(result).toContain('c_limit,w_440,q_auto,f_webp');
  });

  it('supports custom quality and format', () => {
    const result = optimizeCloudinaryUrl(BASE_URL, {
      width: 800,
      quality: '80',
      format: 'png',
    });
    expect(result).toContain('c_limit,w_800,q_80,f_png');
  });

  it('supports crop and height options', () => {
    const result = optimizeCloudinaryUrl(BASE_URL, {
      width: 1200,
      height: 630,
      crop: 'fill',
    });
    expect(result).toContain('c_fill,w_1200,h_630,q_auto,f_webp');
  });

  it('omits c_limit when no width is given', () => {
    const result = optimizeCloudinaryUrl(BASE_URL, { quality: '80' });
    expect(result).toBe(
      'https://res.cloudinary.com/dbibjvyhm/image/upload/q_80,f_webp/v1728132435/website/photos/AirQuality_meyioj.webp',
    );
  });
});

describe('CLOUDINARY_IMAGES', () => {
  it('exposes an optimized logo URL', () => {
    expect(CLOUDINARY_IMAGES.logo).toMatch(
      /^https:\/\/res\.cloudinary\.com\/dbibjvyhm\/image\/upload\/c_limit,w_200,q_auto,f_webp\//,
    );
  });
});
