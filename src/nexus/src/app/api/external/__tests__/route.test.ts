/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

// Use absolute path to avoid Jest's trouble with [...] directory names
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../[...path]/route');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routeModule = require(routePath);
const { GET, POST, PATCH } = routeModule;

const mockGetServerSession = jest.fn();

jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock('@/shared/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/shared/lib/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeRequest(
  method: string,
  path: string,
  body?: string,
  headers?: Record<string, string>
): NextRequest {
  const url = `http://localhost:3000/api/external/${path}`;
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };
  if (body && method !== 'GET') {
    init.body = body;
  }
  return new NextRequest(url, init);
}

describe('/api/external/[...path] - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_BASE_URL = 'http://upstream:8000/api/v2';
    process.env.API_TOKEN = 'test-api-token';
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"result":"ok"}'),
      headers: new Headers({ 'content-type': 'application/json' }),
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(401);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('proceeds when session has a valid user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });

      const req = makeRequest('GET', 'devices/sites/summary');
      await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Path traversal protection', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('rejects paths containing .. segments', async () => {
      const req = makeRequest('GET', '../../admin/config');
      const res = await GET(req, { params: { path: ['..', '..', 'admin', 'config'] } });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Invalid path');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('rejects encoded .. in path segments', async () => {
      const req = makeRequest('GET', '%2e%2e/secret');
      const res = await GET(req, { params: { path: ['%2e%2e', 'secret'] } });

      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Path allowlist', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('allows GET to devices/ prefix', async () => {
      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('allows GET to analytics/ prefix', async () => {
      const req = makeRequest('GET', 'analytics/data-download');
      const res = await GET(req, { params: { path: ['analytics', 'data-download'] } });

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('allows GET to predict/ prefix', async () => {
      const req = makeRequest('GET', 'predict/daily-forecasting/');
      const res = await GET(req, { params: { path: ['predict', 'daily-forecasting/'] } });

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('allows GET to users/ prefix', async () => {
      const req = makeRequest('GET', 'users/preferences/replace');
      const res = await GET(req, { params: { path: ['users', 'preferences', 'replace'] } });

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('rejects non-allowlisted paths with 403', async () => {
      const req = makeRequest('GET', 'admin/delete-all');
      const res = await GET(req, { params: { path: ['admin', 'delete-all'] } });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe('Forbidden');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('rejects empty path', async () => {
      const req = makeRequest('GET', '');
      const res = await GET(req, { params: { path: [] } });

      expect(res.status).toBe(403);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Method restrictions', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('allows GET requests', async () => {
      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(200);
    });

    it('allows POST requests', async () => {
      const req = makeRequest('POST', 'analytics/data-download', '{"key":"value"}');
      const res = await POST(req, { params: { path: ['analytics', 'data-download'] } });

      expect(res.status).toBe(200);
    });

    it('allows PATCH requests', async () => {
      const req = makeRequest('PATCH', 'users/preferences/replace', '{"key":"value"}');
      const res = await PATCH(req, { params: { path: ['users', 'preferences', 'replace'] } });

      expect(res.status).toBe(200);
    });

    it('PUT handler is not exported (Next.js returns 405)', () => {
      expect(routeModule.PUT).toBeUndefined();
    });

    it('DELETE handler is not exported (Next.js returns 405)', () => {
      expect(routeModule.DELETE).toBeUndefined();
    });
  });

  describe('Token injection', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('injects API_TOKEN as both token and access_token query params', async () => {
      process.env.API_TOKEN = 'secret-token-123';
      const req = makeRequest('GET', 'devices/sites/summary');
      await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('token=secret-token-123');
      expect(fetchUrl).toContain('access_token=secret-token-123');
    });

    it('strips user-supplied token and access_token query params', async () => {
      process.env.API_TOKEN = 'real-token';
      const req = new NextRequest(
        'http://localhost:3000/api/external/devices/sites/summary?token=user-supplied&access_token=user-supplied'
      );
      await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('token=real-token');
      expect(fetchUrl).not.toContain('token=user-supplied');
    });

    it('returns 500 when API_TOKEN is not configured', async () => {
      process.env.API_TOKEN = '';
      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('API_TOKEN not configured');
    });
  });

  describe('Upstream fetch errors', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('returns 504 on upstream timeout', async () => {
      mockFetch.mockRejectedValue(
        Object.assign(new Error('aborted'), { name: 'AbortError' })
      );

      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(504);
      const body = await res.json();
      expect(body.error).toBe('Upstream request timed out');
    });

    it('returns 500 on other fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const req = makeRequest('GET', 'devices/sites/summary');
      const res = await GET(req, { params: { path: ['devices', 'sites', 'summary'] } });

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });
  });
});
