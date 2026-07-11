import NextAuth from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import type { NextRequest } from 'next/server';

const VALID_PROTOCOLS = new Set(['http:', 'https:']);

const sanitizeHeaderValue = (value: string): string | null => {
  // Take only the first value from comma-separated lists (first is the original)
  const first = value.split(',')[0].trim();
  // Reject values containing slashes, newlines, or null bytes (basic header injection protection)
  if (!first || /[\/\n\r\x00]/.test(first)) {
    return null;
  }
  return first;
};

const getRequestOrigin = (req: NextRequest): string | null => {
  const protoRaw = req.headers.get('x-forwarded-proto');
  const proto = protoRaw ? sanitizeHeaderValue(protoRaw) : null;
  const effectiveProto =
    proto && VALID_PROTOCOLS.has(`${proto}:`) ? proto : 'https';

  const hostRaw =
    req.headers.get('x-forwarded-host') || req.headers.get('host');
  const host = hostRaw ? sanitizeHeaderValue(hostRaw) : null;

  if (!host) {
    return null;
  }

  return `${effectiveProto}://${host}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (NextAuth as unknown as (options: any) => any)(authOptions);

const setRuntimeAuthUrls = (req: NextRequest) => {
  // Only derive NEXTAUTH_URL from headers when it is not already configured.
  // This avoids cross-request contamination (process.env is shared) and
  // ensures the stable, admin-configured value takes precedence.
  if (process.env.NEXTAUTH_URL) {
    return;
  }

  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) {
    process.env.NEXTAUTH_URL = requestOrigin;
    process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || 'true';
  }
};

export async function GET(
  req: NextRequest,
  context: { params: Record<string, unknown> }
) {
  setRuntimeAuthUrls(req);
  return handler(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Record<string, unknown> }
) {
  setRuntimeAuthUrls(req);
  return handler(req, context);
}
