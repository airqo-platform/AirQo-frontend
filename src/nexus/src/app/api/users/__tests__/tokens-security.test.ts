/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

// Use absolute path to avoid Jest's trouble with [...] directory names
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../tokens/security/route');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PATCH } = require(routePath);

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

jest.mock('@/shared/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

jest.mock('@/shared/lib/api-routing', () => ({
  buildServerApiUrl: jest.fn(
    (path: string) => `http://upstream:8000/api/v2${path}`
  ),
}));

jest.mock('@/shared/lib/oauth-session', () => ({
  normalizeOAuthAccessToken: jest.fn((token: string) => token),
}));

jest.mock('@/shared/utils/sanitizeErrorForLogging', () => ({
  sanitizeErrorForLogging: jest.fn((error: unknown) => error),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeSecurityRequest(
  token: string,
  body?: object,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/users/tokens/security`,
    {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ token, ...body }),
    }
  );
}

describe('/api/users/tokens/security - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { _id: 'user123', email: 'test@test.com' },
      accessToken: 'session-access-token',
    });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"success":true}'),
      headers: new Headers({ 'content-type': 'application/json' }),
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no session and no authorization header', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = makeSecurityRequest('tok_abc123');
      const res = await PATCH(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('proceeds with authorization header from session', async () => {
      const req = makeSecurityRequest('tok_abc123');
      await PATCH(req);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('uses explicit authorization header over session token', async () => {
      const req = makeSecurityRequest(
        'tok_abc123',
        {},
        { authorization: 'Bearer custom-token' }
      );
      await PATCH(req);

      const fetchInit = mockFetch.mock.calls[0][1];
      expect(fetchInit.headers.Authorization).toBe('Bearer custom-token');
    });
  });

  describe('Input validation', () => {
    it('returns 400 when token is missing', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/users/tokens/security',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ someField: 'value' }),
        }
      );
      const res = await PATCH(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Missing token');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 when token is empty string', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/users/tokens/security',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: '' }),
        }
      );
      const res = await PATCH(req);

      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 when token is whitespace only', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/users/tokens/security',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: '   ' }),
        }
      );
      const res = await PATCH(req);

      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 on malformed JSON', async () => {
      const req = new NextRequest(
        'http://localhost:3000/api/users/tokens/security',
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: 'not-valid-json{{{',
        }
      );
      const res = await PATCH(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Invalid JSON payload');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Happy path', () => {
    it('forwards PATCH request to upstream with correct URL and body', async () => {
      const req = makeSecurityRequest('tok_abc123', { isSecure: true });
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [fetchUrl, fetchInit] = mockFetch.mock.calls[0];
      expect(fetchUrl).toBe(
        'http://upstream:8000/api/v2/users/tokens/tok_abc123'
      );
      expect(fetchInit.method).toBe('PATCH');
      expect(fetchInit.body).toBe(JSON.stringify({ isSecure: true }));
    });

    it('strips token from upstream body', async () => {
      const req = makeSecurityRequest('tok_abc123', { isSecure: true });
      await PATCH(req);

      const fetchInit = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchInit.body);
      expect(body.token).toBeUndefined();
    });

    it('returns upstream status and body on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"updated":true}'),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const req = makeSecurityRequest('tok_abc123');
      const res = await PATCH(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.updated).toBe(true);
    });

    it('returns 504 on upstream timeout', async () => {
      mockFetch.mockRejectedValue(
        Object.assign(new Error('aborted'), { name: 'AbortError' })
      );

      const req = makeSecurityRequest('tok_abc123');
      const res = await PATCH(req);

      expect(res.status).toBe(504);
      const body = await res.json();
      expect(body.error).toBe('Upstream request timed out');
    });

    it('returns 500 on other fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('network error'));

      const req = makeSecurityRequest('tok_abc123');
      const res = await PATCH(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Failed to update token security');
    });
  });
});
