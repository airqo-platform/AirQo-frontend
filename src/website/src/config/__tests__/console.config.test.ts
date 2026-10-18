type ConsoleConfig = {
  API_CONSOLE_URL: string;
  API_CONSOLE_SUBSCRIPTION_URL: string;
};

const loadConfig = (): ConsoleConfig => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../console.config') as ConsoleConfig;
};

describe('console.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_CONSOLE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('prefers the NEXT_PUBLIC_CONSOLE_URL override over site URL detection', () => {
    process.env.NEXT_PUBLIC_CONSOLE_URL = 'http://localhost:3001/console/';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.airqo.net';

    const config = loadConfig();

    expect(config.API_CONSOLE_URL).toBe('http://localhost:3001/console');
    expect(config.API_CONSOLE_SUBSCRIPTION_URL).toBe(
      'http://localhost:3001/console/subscriptions',
    );
  });

  it('uses the staging nexus console when the site URL is staging', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.airqo.net';

    const config = loadConfig();

    expect(config.API_CONSOLE_URL).toBe(
      'https://staging-nexus.airqo.net/console',
    );
    expect(config.API_CONSOLE_SUBSCRIPTION_URL).toBe(
      'https://staging-nexus.airqo.net/console/subscriptions',
    );
  });

  it('uses the production nexus console for a non-staging site URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      'https://airqo.net,https://www.airqo.net';

    const config = loadConfig();

    expect(config.API_CONSOLE_URL).toBe('https://nexus.airqo.net/console');
    expect(config.API_CONSOLE_SUBSCRIPTION_URL).toBe(
      'https://nexus.airqo.net/console/subscriptions',
    );
  });

  it('defaults to the production nexus console when no env is set', () => {
    const config = loadConfig();

    expect(config.API_CONSOLE_URL).toBe('https://nexus.airqo.net/console');
    expect(config.API_CONSOLE_SUBSCRIPTION_URL).toBe(
      'https://nexus.airqo.net/console/subscriptions',
    );
  });
});
