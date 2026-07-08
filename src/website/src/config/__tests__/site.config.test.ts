import siteConfig from '../site.config';

describe('site.config', () => {
  it('exports an object', () => {
    expect(siteConfig).toBeDefined();
    expect(typeof siteConfig).toBe('object');
  });

  it('has all required fields', () => {
    expect(typeof siteConfig.templateName).toBe('string');
    expect(typeof siteConfig.homePageUrl).toBe('string');
    expect(typeof siteConfig.containerClass).toBe('string');
    expect(typeof siteConfig.name).toBe('string');
    expect(typeof siteConfig.title).toBe('string');
    expect(typeof siteConfig.description).toBe('string');
    expect(typeof siteConfig.url).toBe('string');
    expect(typeof siteConfig.ogImage).toBe('string');
  });

  it('has correct static values', () => {
    expect(siteConfig.templateName).toBe('AirQo Website');
    expect(siteConfig.homePageUrl).toBe('/home');
    expect(siteConfig.name).toBe('AirQo');
    expect(siteConfig.ogImage).toBe('/og-image.png');
  });

  it('containerClass is non-empty', () => {
    expect(siteConfig.containerClass.length).toBeGreaterThan(0);
  });

  it('title includes the site name', () => {
    expect(siteConfig.title).toContain('AirQo');
  });

  it('description is non-empty', () => {
    expect(siteConfig.description.length).toBeGreaterThan(0);
  });

  it('url starts with http or https', () => {
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });

  it('homePageUrl starts with /', () => {
    expect(siteConfig.homePageUrl).toMatch(/^\//);
  });

  it('ogImage is a relative path', () => {
    expect(siteConfig.ogImage).toMatch(/^\//);
  });

  it('templateName is a non-empty string', () => {
    expect(siteConfig.templateName.length).toBeGreaterThan(0);
  });
});
