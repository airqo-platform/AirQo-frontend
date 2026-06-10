import NextAuth from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import type { NextRequest } from 'next/server';

const getRequestOrigin = (req: NextRequest) => {
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host');

  if (!host) {
    return null;
  }

  return `${forwardedProto}://${host}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (NextAuth as unknown as (options: any) => any)(authOptions);

const setRuntimeAuthUrls = (req: NextRequest) => {
  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) {
    process.env.NEXTAUTH_URL = requestOrigin;
    process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || 'true';
  }
};

export async function GET(req: NextRequest, context: { params: Record<string, unknown> }) {
  setRuntimeAuthUrls(req);
  return handler(req, context);
}

export async function POST(req: NextRequest, context: { params: Record<string, unknown> }) {
  setRuntimeAuthUrls(req);
  return handler(req, context);
}
