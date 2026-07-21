/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../delete/route');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DELETE } = require(routePath);

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
    errorWithSlack: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeDeleteRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/cloudinary/delete', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/cloudinary/delete - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUDINARY_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-api-key';
    process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: 'ok' }),
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = makeDeleteRequest({ publicId: 'users/user123/photo.jpg' });
      const res = await DELETE(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const req = makeDeleteRequest({ publicId: 'users/user123/photo.jpg' });
      const res = await DELETE(req);

      expect(res.status).toBe(401);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Ownership check', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: {
          _id: 'user123',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });

    it('rejects publicId not matching user scope with 403', async () => {
      const req = makeDeleteRequest({ publicId: 'users/other-user/photo.jpg' });
      const res = await DELETE(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain('Forbidden');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('rejects publicId with no user prefix', async () => {
      const req = makeDeleteRequest({ publicId: 'some-random-asset.jpg' });
      const res = await DELETE(req);

      expect(res.status).toBe(403);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('allows publicId matching the authenticated user scope', async () => {
      const req = makeDeleteRequest({
        publicId: 'users/user123/uploads/photo.jpg',
      });
      await DELETE(req);

      expect(mockFetch).toHaveBeenCalled();
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain('cloudinary.com');
    });

    it('rejects path traversal in publicId targeting other users', async () => {
      const req = makeDeleteRequest({
        publicId: 'users/user123/../admin/secret.jpg',
      });
      const res = await DELETE(req);

      // The isOwnedByUser check starts with prefix matching,
      // and the publicId regex rejects some special chars, but
      // the traversal via /../ is not in the user's own folder.
      // The path should either fail ownership or be invalid.
      expect(res.status).toBe(403);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });
    });

    it('returns 400 for missing publicId', async () => {
      const req = makeDeleteRequest({});
      const res = await DELETE(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('No publicId');
    });

    it('returns 400 for invalid publicId format', async () => {
      const req = makeDeleteRequest({ publicId: 'users/user123/<>invalid.jpg' });
      const res = await DELETE(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid publicId format');
    });

    it('returns 400 for invalid JSON body', async () => {
      const req = new NextRequest('http://localhost:3000/api/cloudinary/delete', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: 'not-json',
      });
      const res = await DELETE(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Invalid JSON');
    });
  });

  describe('Cloudinary integration', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: {
          _id: 'user123',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });

    it('handles Cloudinary 404 gracefully (resource already deleted)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ result: 'not found' }),
      });

      const req = makeDeleteRequest({
        publicId: 'users/user123/uploads/photo.jpg',
      });
      const res = await DELETE(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.result).toBe('ok');
    });

    it('returns error on Cloudinary failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            error: { message: 'Invalid signature' },
          }),
      });

      const req = makeDeleteRequest({
        publicId: 'users/user123/uploads/photo.jpg',
      });
      const res = await DELETE(req);

      expect(res.status).toBe(400);
    });

    it('returns 500 when Cloudinary env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

      const req = makeDeleteRequest({
        publicId: 'users/user123/uploads/photo.jpg',
      });
      const res = await DELETE(req);

      expect(res.status).toBe(500);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
