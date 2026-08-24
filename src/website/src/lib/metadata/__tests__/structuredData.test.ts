import {
  generateBreadcrumbSchema,
  generateProductSchema,
  getProductDisplayName,
} from '@/lib/metadata/structuredData';

describe('structuredData', () => {
  describe('getProductDisplayName', () => {
    it('strips the "| AirQo" suffix', () => {
      expect(getProductDisplayName('AirQo Monitor | AirQo')).toBe(
        'AirQo Monitor',
      );
    });

    it('strips any SEO suffix after the first "|" separator', () => {
      expect(
        getProductDisplayName(
          'AirQo Vertex | Open Air Quality Data Sharing Platform',
        ),
      ).toBe('AirQo Vertex');
    });

    it('returns the title unchanged when there is no separator', () => {
      expect(getProductDisplayName('AirQo Nexus')).toBe('AirQo Nexus');
    });

    it('trims surrounding whitespace from the name', () => {
      expect(getProductDisplayName('  AirQo API  | Free Tier ')).toBe(
        'AirQo API',
      );
    });
  });

  describe('generateProductSchema', () => {
    const siteUrl = 'https://airqo.net/';

    it('produces a Product schema with the expected shape', () => {
      const schema = generateProductSchema(
        {
          title: 'AirQo Vertex | Open Air Quality Data Sharing Platform',
          description: 'Open air quality data sharing platform.',
          url: '/products/vertex',
          image: {
            url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/vertex.webp',
            alt: 'Vertex',
          },
        },
        siteUrl,
      );

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('AirQo Vertex');
      expect(schema.description).toBe(
        'Open air quality data sharing platform.',
      );
      expect(schema.image).toBe(
        'https://res.cloudinary.com/dbibjvyhm/image/upload/vertex.webp',
      );
    });

    it('offers the product for free in USD and in stock', () => {
      const schema = generateProductSchema(
        {
          title: 'AirQo API | Open Data Access',
          description: 'Free air quality API.',
          url: '/products/api',
        },
        siteUrl,
      );

      expect(schema.offers).toEqual({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      });
    });

    it('brands every product as AirQo', () => {
      const schema = generateProductSchema(
        {
          title: 'AirQo Beacon | Device Health Monitoring',
          description: 'Device health monitoring.',
          url: '/products/beacon',
        },
        siteUrl,
      );

      expect(schema.brand).toEqual({ '@type': 'Brand', name: 'AirQo' });
    });

    it('absolutizes relative config images against the site URL', () => {
      const schema = generateProductSchema(
        {
          title: 'AirQo Beacon | Device Health Monitoring',
          description: 'Device health monitoring.',
          url: '/products/beacon',
          image: {
            url: '/assets/images/products/beacon/beacon-home.webp',
            alt: 'Beacon',
          },
        },
        siteUrl,
      );

      expect(schema.image).toBe(
        'https://airqo.net/assets/images/products/beacon/beacon-home.webp',
      );
    });

    it('falls back to the default metadata image when none is set', () => {
      const schema = generateProductSchema(
        {
          title: 'AirQo Nexus | Real-time Dashboard',
          description: 'Real-time dashboard.',
          url: '/products/nexus',
        },
        siteUrl,
      );

      expect(schema.image).toBeTruthy();
      expect(typeof schema.image).toBe('string');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    const siteUrl = 'https://airqo.net/';

    it('produces a BreadcrumbList with sequential positions starting at 1', () => {
      const schema = generateBreadcrumbSchema(
        [
          { name: 'Our Products', url: 'https://airqo.net/products' },
          { name: 'AirQo Monitor', url: 'https://airqo.net/products/monitor' },
        ],
        siteUrl,
      );

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement.map((element) => element.position)).toEqual(
        [1, 2],
      );
    });

    it('preserves item names and urls', () => {
      const schema = generateBreadcrumbSchema(
        [
          { name: 'Our Products', url: 'https://airqo.net/products' },
          { name: 'AirQo Monitor', url: 'https://airqo.net/products/monitor' },
        ],
        siteUrl,
      );

      expect(schema.itemListElement).toEqual([
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Our Products',
          item: 'https://airqo.net/products',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'AirQo Monitor',
          item: 'https://airqo.net/products/monitor',
        },
      ]);
    });

    it('absolutizes relative item urls against the site URL', () => {
      const schema = generateBreadcrumbSchema(
        [
          { name: 'Our Products', url: '/products' },
          { name: 'AirQo Nexus', url: '/products/nexus' },
        ],
        siteUrl,
      );

      expect(schema.itemListElement.map((element) => element.item)).toEqual([
        'https://airqo.net/products',
        'https://airqo.net/products/nexus',
      ]);
    });

    it('strips trailing slashes from the site URL base', () => {
      const schema = generateBreadcrumbSchema(
        [{ name: 'Our Products', url: '/products' }],
        'https://airqo.net///',
      );

      expect(schema.itemListElement[0].item).toBe('https://airqo.net/products');
    });

    it('returns an empty element list for no items', () => {
      const schema = generateBreadcrumbSchema([], siteUrl);

      expect(schema.itemListElement).toEqual([]);
    });
  });
});
