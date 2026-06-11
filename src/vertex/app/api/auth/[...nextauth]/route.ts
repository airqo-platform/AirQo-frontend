import NextAuth from 'next-auth';
import { options } from './options';
import type { NextRequest } from 'next/server';

const VALID_PROTOCOLS = new Set(['http:', 'https:']);

const sanitizeHeaderValue = (value: string): string | null => {
  const first = value.split(',')[0].trim();
  if (!first || /[\/\n\r\x00]/.test(first)) {
    return null;
  }
  return first;
};

const getRequestOrigin = (req: NextRequest): string | null => {
  const protoRaw = req.headers.get('x-forwarded-proto');
  const proto = protoRaw ? sanitizeHeaderValue(protoRaw) : null;
  const effectiveProto = proto && VALID_PROTOCOLS.has(`${proto}:`) ? proto : 'https';

  const hostRaw = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const host = hostRaw ? sanitizeHeaderValue(hostRaw) : null;

  if (!host) {
    return null;
  }

  return `${effectiveProto}://${host}`;
};

const handler = NextAuth(options);

const setRuntimeAuthUrls = (req: NextRequest) => {
  if (process.env.NEXTAUTH_URL) {
    return;
  }

  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) {
    process.env.NEXTAUTH_URL = requestOrigin;
    process.env.NEXTAUTH_URL_INTERNAL = requestOrigin;
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
