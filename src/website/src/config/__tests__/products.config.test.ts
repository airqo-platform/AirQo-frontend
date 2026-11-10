import {
  getProductById,
  getProductsByFamily,
  PRODUCT_FAMILIES,
  PRODUCT_FAMILY_ORDER,
  PRODUCTS,
} from '@/config/products.config';

describe('products.config', () => {
  it('defines the three product families in order', () => {
    expect(PRODUCT_FAMILY_ORDER).toEqual(['measure', 'understand', 'act']);
    expect(PRODUCT_FAMILIES.map((family) => family.id)).toEqual(
      PRODUCT_FAMILY_ORDER,
    );
    expect(PRODUCT_FAMILIES.map((family) => family.number)).toEqual([
      '01',
      '02',
      '03',
    ]);
  });

  it('lists all eight products', () => {
    expect(PRODUCTS).toHaveLength(8);
  });

  it('gives every product a unique id and destination', () => {
    const ids = PRODUCTS.map((product) => product.id);
    const hrefs = PRODUCTS.map((product) => product.href);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('gives every product the required content', () => {
    PRODUCTS.forEach((product) => {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(product.tagline.length).toBeGreaterThan(0);
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.imageAlt.length).toBeGreaterThan(0);
      expect(product.cta.length).toBeGreaterThan(0);
      expect(product.href).toMatch(/^\/products\//);
      expect(['measure', 'understand', 'act']).toContain(product.family);
    });
  });

  it('groups products by family', () => {
    expect(getProductsByFamily('measure')).toHaveLength(3);
    expect(getProductsByFamily('understand')).toHaveLength(3);
    expect(getProductsByFamily('act')).toHaveLength(2);
  });

  it('looks up products by id', () => {
    expect(getProductById('monitor')?.name).toBe('Binos Monitor');
    expect(getProductById('vertex')?.name).toBe('AirQo Vertex');
    expect(getProductById('missing')).toBeUndefined();
  });
});
