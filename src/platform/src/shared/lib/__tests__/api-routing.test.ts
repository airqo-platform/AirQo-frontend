import {
  resolveVersionedApiPath,
  buildServerApiUrl,
  buildBrowserApiUrl,
  resolveApiOrigin,
} from '../api-routing';

describe('resolveVersionedApiPath', () => {
  it('simple path gets /api/v2/ prefix', () => {
    expect(resolveVersionedApiPath('/users/login')).toBe('/api/v2/users/login');
  });

  it('absolute URL unchanged', () => {
    expect(resolveVersionedApiPath('https://external.api/data')).toBe(
      'https://external.api/data'
    );
  });

  it('already-versioned path unchanged', () => {
    expect(resolveVersionedApiPath('/api/v2/users')).toBe('/api/v2/users');
  });

  it('v2/ prefix gets /api/ prepended', () => {
    expect(resolveVersionedApiPath('v2/users')).toBe('/api/v2/users');
  });

  it('empty input returns /api/v2', () => {
    expect(resolveVersionedApiPath('')).toBe('/api/v2');
  });

  it('null returns /api/v2', () => {
    expect(resolveVersionedApiPath(null as unknown as string)).toBe('/api/v2');
  });

  it('undefined returns /api/v2', () => {
    expect(resolveVersionedApiPath(undefined as unknown as string)).toBe(
      '/api/v2'
    );
  });

  it('whitespace-only returns /api/v2', () => {
    expect(resolveVersionedApiPath('   ')).toBe('/api/v2');
  });

  it('path with query string preserved', () => {
    expect(resolveVersionedApiPath('/users?page=1&limit=10')).toBe(
      '/api/v2/users?page=1&limit=10'
    );
  });

  it('query string on versioned path preserved', () => {
    expect(resolveVersionedApiPath('/api/v2/users?page=1')).toBe(
      '/api/v2/users?page=1'
    );
  });
});

describe('buildServerApiUrl', () => {
  beforeEach(() => {
    process.env.API_BASE_URL = 'https://api.airqo.net';
  });

  afterEach(() => {
    delete process.env.API_BASE_URL;
  });

  it('combines origin with versioned path', () => {
    const result = buildServerApiUrl('/users/login');
    expect(result).toBe('https://api.airqo.net/api/v2/users/login');
  });

  it('absolute URL returned unchanged', () => {
    const result = buildServerApiUrl('https://external.api/data');
    expect(result).toBe('https://external.api/data');
  });
});

describe('buildBrowserApiUrl', () => {
  beforeEach(() => {
    process.env.API_BASE_URL = 'https://api.airqo.net';
  });

  afterEach(() => {
    delete process.env.API_BASE_URL;
  });

  it('returns versioned path only', () => {
    const result = buildBrowserApiUrl('/users/login');
    expect(result).toBe('/api/v2/users/login');
  });

  it('absolute URL returned unchanged', () => {
    const result = buildBrowserApiUrl('https://external.api/data');
    expect(result).toBe('https://external.api/data');
  });
});

describe('stripApiSuffix / resolveApiOrigin', () => {
  afterEach(() => {
    delete process.env.API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('strips trailing service path from API_BASE_URL', () => {
    process.env.API_BASE_URL = 'https://api.airqo.net/api/v2/users';
    expect(buildServerApiUrl('/login')).toBe(
      'https://api.airqo.net/api/v2/login'
    );
  });

  it('strips trailing /api/v2 from API_BASE_URL', () => {
    process.env.API_BASE_URL = 'https://api.airqo.net/api/v2';
    expect(buildServerApiUrl('/login')).toBe(
      'https://api.airqo.net/api/v2/login'
    );
  });

  it('strips trailing /api from API_BASE_URL', () => {
    process.env.API_BASE_URL = 'https://api.airqo.net/api';
    expect(buildServerApiUrl('/login')).toBe(
      'https://api.airqo.net/api/v2/login'
    );
  });

  it('trims whitespace and trailing slashes from API_BASE_URL', () => {
    process.env.API_BASE_URL = '  https://api.airqo.net/  ';
    expect(buildServerApiUrl('/login')).toBe(
      'https://api.airqo.net/api/v2/login'
    );
  });

  it('falls back to NEXT_PUBLIC_API_BASE_URL', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://public.api.airqo.net';
    expect(buildServerApiUrl('/login')).toBe(
      'https://public.api.airqo.net/api/v2/login'
    );
  });

  it('throws when no API base URL is configured', () => {
    expect(() => resolveApiOrigin()).toThrow(
      'API base URL is not defined. Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in environment variables.'
    );
  });
});
