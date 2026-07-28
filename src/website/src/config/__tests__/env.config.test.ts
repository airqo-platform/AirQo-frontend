import envConfig from '../env.config';

describe('env.config', () => {
  it('exports an object', () => {
    expect(envConfig).toBeDefined();
    expect(typeof envConfig).toBe('object');
  });

  it('has all required fields', () => {
    expect(typeof envConfig.apiUrl).toBe('string');
    expect(typeof envConfig.apiToken).toBe('string');
    expect(typeof envConfig.mapboxAccessToken).toBe('string');
    expect(typeof envConfig.gaMeasurementId).toBe('string');
    expect(typeof envConfig.opencageApiKey).toBe('string');
    expect(typeof envConfig.isDev).toBe('boolean');
    expect(typeof envConfig.isProd).toBe('boolean');
  });

  it('isDev and isProd are mutually exclusive', () => {
    if (envConfig.isDev) {
      expect(envConfig.isProd).toBe(false);
    } else if (envConfig.isProd) {
      expect(envConfig.isDev).toBe(false);
    } else {
      expect(envConfig.isDev).toBe(false);
      expect(envConfig.isProd).toBe(false);
    }
  });

  it('apiUrl is a string', () => {
    expect(typeof envConfig.apiUrl).toBe('string');
  });

  it('apiToken is a string', () => {
    expect(typeof envConfig.apiToken).toBe('string');
  });

  it('mapboxAccessToken is a string', () => {
    expect(typeof envConfig.mapboxAccessToken).toBe('string');
  });

  it('gaMeasurementId is a string', () => {
    expect(typeof envConfig.gaMeasurementId).toBe('string');
  });

  it('opencageApiKey is a string', () => {
    expect(typeof envConfig.opencageApiKey).toBe('string');
  });
});
