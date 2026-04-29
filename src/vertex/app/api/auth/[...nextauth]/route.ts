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

const getHandler = (req: NextRequest) => {
  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) {
    process.env.NEXTAUTH_URL = requestOrigin;
    process.env.NEXTAUTH_URL_INTERNAL =
      process.env.NEXTAUTH_URL_INTERNAL || requestOrigin;
  }

  return NextAuth(options);
};

export function GET(req: NextRequest) {
  return getHandler(req)(req);
}

export function POST(req: NextRequest) {
  return getHandler(req)(req);
}
