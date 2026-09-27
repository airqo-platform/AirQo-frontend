/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

const mockGetServerSession = jest.fn();
const mockBuildServerApiUrl = jest.fn(
  (inputPath: string) => `https://upstream.test/api/v2/${inputPath}`
);
const mockFetch = jest.fn();

jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock('@/shared/lib/auth', () => ({ authOptions: {} }));

jest.mock('@/shared/lib/api-routing', () => ({
  buildServerApiUrl: (inputPath: string) => mockBuildServerApiUrl(inputPath),
}));

global.fetch = mockFetch;

// Use an absolute path because Jest resolution is unreliable around [...path].
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../[...path]/route');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require(routePath);

const makeRequest = (relativePath: string, body: object) =>
  new NextRequest(`http://localhost:3000/api/data/${relativePath}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'JWT browser-token-must-not-be-forwarded',
    },
    body: JSON.stringify(body),
  });

describe('/api/data/[...path]', () => {
  const originalApiToken = process.env.API_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_TOKEN = 'server-api-token';
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockFetch.mockResolvedValue({
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            status: 'success',
            message: 'ok',
            data: [],
            metadata: { total_count: 0, has_more: false, next: null },
          })
        ),
      headers: new Headers({ 'content-type': 'application/json' }),
    });
  });

  afterAll(() => {
    if (originalApiToken === undefined) delete process.env.API_TOKEN;
    else process.env.API_TOKEN = originalApiToken;
  });

  it('forwards the canonical chart route with the server API_TOKEN', async () => {
    const request = makeRequest('analytics/dashboard/chart/data', {
      sites: ['site-1'],
      pollutants: ['pm2_5'],
    });

    const response = await POST(request, {
      params: { path: ['analytics', 'dashboard', 'chart', 'data'] },
    });

    expect(response.status).toBe(200);
    expect(mockBuildServerApiUrl).toHaveBeenCalledWith(
      'analytics/dashboard/chart/data'
    );
    const [upstreamUrl, init] = mockFetch.mock.calls[0];
    const parsedUrl = new URL(upstreamUrl);
    expect(parsedUrl.pathname).toBe('/api/v2/analytics/dashboard/chart/data');
    expect(parsedUrl.searchParams.get('token')).toBe('server-api-token');
    expect(parsedUrl.searchParams.get('access_token')).toBe('server-api-token');
    expect(init.headers.get('authorization')).toBeNull();
  });

  it('allows data-download and rejects the retired D3 client route', async () => {
    const download = makeRequest('analytics/data-download', {});
    await expect(
      POST(download, {
        params: { path: ['analytics', 'data-download'] },
      })
    ).resolves.toEqual(expect.objectContaining({ status: 200 }));

    const legacy = makeRequest('analytics/dashboard/chart/d3/data', {});
    const legacyResponse = await POST(legacy, {
      params: { path: ['analytics', 'dashboard', 'chart', 'd3', 'data'] },
    });
    expect(legacyResponse.status).toBe(403);
  });

  it('requires both an authenticated session and configured API_TOKEN', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);
    const unauthorized = await POST(
      makeRequest('analytics/data-download', {}),
      { params: { path: ['analytics', 'data-download'] } }
    );
    expect(unauthorized.status).toBe(401);

    delete process.env.API_TOKEN;
    const misconfigured = await POST(
      makeRequest('analytics/data-download', {}),
      { params: { path: ['analytics', 'data-download'] } }
    );
    expect(misconfigured.status).toBe(500);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
