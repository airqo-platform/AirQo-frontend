/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

// Use absolute path to avoid Jest's trouble with [...] directory names
// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../notify/route');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require(routePath);

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

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeNotifyRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/slack/notify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/slack/notify - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('ok'),
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = makeNotifyRequest({ error: { message: 'test' } });
      const res = await POST(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const req = makeNotifyRequest({ error: { message: 'test' } });
      const res = await POST(req);

      expect(res.status).toBe(401);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('proceeds when session has a valid user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });

      const req = makeNotifyRequest({ error: { message: 'test' } });
      await POST(req);

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('returns 400 when error field is missing', async () => {
      const req = makeNotifyRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 when error is not an object', async () => {
      const req = makeNotifyRequest({ error: 'not-an-object' });
      const res = await POST(req);

      expect(res.status).toBe(400);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 500 when webhook URL is not configured', async () => {
      delete process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

      const req = makeNotifyRequest({ error: { message: 'test' } });
      const res = await POST(req);

      expect(res.status).toBe(500);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Happy path', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('sends error notification to Slack webhook', async () => {
      const errorPayload = {
        error: { message: 'Something broke', name: 'TypeError', stack: 'at foo' },
        timestamp: '2025-01-01T00:00:00Z',
        userAgent: 'Mozilla/5.0',
        url: 'http://localhost:3000/dashboard',
        additionalData: { errorType: 'react-error-boundary' },
      };

      const req = makeNotifyRequest(errorPayload);
      const res = await POST(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [fetchUrl, fetchInit] = mockFetch.mock.calls[0];
      expect(fetchUrl).toBe('https://hooks.slack.com/test');
      expect(fetchInit.method).toBe('POST');
      expect(fetchInit.headers['Content-Type']).toBe('application/json');

      const sentBody = JSON.parse(fetchInit.body);
      expect(sentBody.blocks).toBeDefined();
      expect(sentBody.blocks.length).toBeGreaterThan(0);
      expect(sentBody.blocks[0].text.text).toContain('Critical Error Alert');
    });

    it('returns 408 on Slack webhook timeout', async () => {
      const abortError = Object.assign(new Error('aborted'), {
        name: 'AbortError',
      });
      mockFetch.mockRejectedValue(abortError);

      const req = makeNotifyRequest({ error: { message: 'test' } });
      const res = await POST(req);

      expect(res.status).toBe(408);
    });

    it('returns 500 on upstream Slack failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const req = makeNotifyRequest({ error: { message: 'test' } });
      const res = await POST(req);

      expect(res.status).toBe(500);
    });
  });
});
