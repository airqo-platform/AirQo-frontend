import { generateMetadata } from '@/lib/metadata/generateMetadata';
import { DEFAULT_METADATA } from '@/lib/metadata/metadata.config';

describe('generateMetadata', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://airqo.net';
  });

  afterAll(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it('sets page-specific canonical and share metadata with a brand-safe title', () => {
    const metadata = generateMetadata(
      {
        title: 'AirQo API | Air quality data for developers',
        description: '  Build with AirQo data.  ',
        url: '/products/api',
      },
      'airqo.net',
    );

    expect(metadata.title).toEqual({
      absolute: 'AirQo API | Air quality data for developers',
    });
    expect(metadata.alternates?.canonical).toBe(
      'https://airqo.net/products/api',
    );
    expect(metadata.openGraph?.url).toBe('https://airqo.net/products/api');
    expect(metadata.openGraph?.siteName).toBe('AirQo');
    expect(metadata.openGraph?.description).toBe('Build with AirQo data.');
    expect(metadata.alternates).not.toHaveProperty('languages');
  });

  it('uses the local share image when an image URL is invalid', () => {
    const metadata = generateMetadata(
      {
        title: 'AirQo page',
        description: 'Page description.',
        url: '/page',
        image: {
          url: 'javascript:alert(1)',
          alt: 'Page image',
        },
      },
      'airqo.net',
    );

    const openGraphImages = metadata.openGraph?.images;
    expect(Array.isArray(openGraphImages)).toBe(true);
    expect(openGraphImages?.[0]).toMatchObject({
      url: `https://airqo.net${DEFAULT_METADATA.defaultImage.url}`,
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    });
  });

  it('strips markup and shortens long page descriptions for share cards', () => {
    const metadata = generateMetadata(
      {
        title: 'AirQo page',
        description: `<p>${'Air quality information across Africa. '.repeat(10)}</p>`,
        url: '/page',
      },
      'airqo.net',
    );

    expect(metadata.description?.length).toBeLessThanOrEqual(200);
    expect(metadata.description).not.toContain('<p>');
  });
});
