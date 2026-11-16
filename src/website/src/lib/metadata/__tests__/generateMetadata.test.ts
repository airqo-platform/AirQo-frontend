import { generateMetadata } from '@/lib/metadata/generateMetadata';
import {
  DEFAULT_METADATA,
  resolveMetadataImage,
} from '@/lib/metadata/metadata.config';

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
        title: 'Air Quality API | Air quality data for developers',
        description: '  Build with AirQo data.  ',
        url: '/products/api',
      },
      'airqo.net',
    );

    expect(metadata.title).toEqual({
      absolute: 'Air Quality API | Air quality data for developers',
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
    if (!Array.isArray(openGraphImages)) {
      throw new Error('Expected Open Graph images to be an array');
    }

    expect(openGraphImages[0]).toMatchObject({
      url: `https://airqo.net${DEFAULT_METADATA.defaultImage.url}`,
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    });
  });

  it('uses the first valid image from an ordered list of candidates', () => {
    expect(
      resolveMetadataImage(
        ['javascript:invalid', '/images/event.jpg'],
        'https://airqo.net',
      ),
    ).toBe('https://airqo.net/images/event.jpg');
  });

  it('skips whitespace-only image candidates', () => {
    expect(
      resolveMetadataImage([' ', '/images/event.jpg'], 'https://airqo.net'),
    ).toBe('https://airqo.net/images/event.jpg');
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
