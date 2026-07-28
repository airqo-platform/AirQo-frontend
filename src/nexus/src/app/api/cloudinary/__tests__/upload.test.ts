/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const routePath = path.resolve(__dirname, '../upload/route');
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
    errorWithSlack: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeUploadRequest(formData: FormData): NextRequest {
  return new NextRequest('http://localhost:3000/api/cloudinary/upload', {
    method: 'POST',
    body: formData,
  });
}

describe('/api/cloudinary/upload - Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUDINARY_NAME = 'test-cloud';
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET = 'test-preset';
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ secure_url: 'https://test.cloudinary.com/test.jpg' }),
    });
  });

  describe('Authentication', () => {
    it('returns 401 when no session exists', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const req = makeUploadRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const req = makeUploadRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(401);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('proceeds when session has a valid user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { _id: 'user123', email: 'test@test.com' },
      });

      const formData = new FormData();
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const req = makeUploadRequest(formData);
      await POST(req);

      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
