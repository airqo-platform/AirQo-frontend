import NextAuth from 'next-auth';
import { options } from './options';
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

const handler = NextAuth(options);

const setRuntimeAuthUrls = (req: NextRequest) => {
  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) {
    process.env.NEXTAUTH_URL = requestOrigin;
    process.env.NEXTAUTH_URL_INTERNAL =
      process.env.NEXTAUTH_URL_INTERNAL || requestOrigin;
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
