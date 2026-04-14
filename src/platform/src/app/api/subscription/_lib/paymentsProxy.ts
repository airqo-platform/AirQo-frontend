import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';
import { normalizeOAuthAccessToken } from '@/shared/lib/oauth-session';

type SessionWithAccessToken = Session & {
  accessToken?: string;
  user?: (Session['user'] & { accessToken?: string | null }) | null;
};

type PrimitiveQueryValue = string | number | boolean;

const resolveUsersApiBaseUrl = (): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (!trimmedBaseUrl) {
    throw new Error('API_BASE_URL is not configured');
  }

  if (trimmedBaseUrl.endsWith('/api/v2/users')) {
    return trimmedBaseUrl;
  }

  if (trimmedBaseUrl.endsWith('/api/v2')) {
    return `${trimmedBaseUrl}/users`;
  }

  return `${trimmedBaseUrl}/api/v2/users`;
};

const getSessionJwtToken = (session: SessionWithAccessToken | null): string => {
  const rawToken = session?.accessToken || session?.user?.accessToken || '';
  if (typeof rawToken !== 'string') {
    return '';
  }

  return normalizeOAuthAccessToken(rawToken);
};

const buildUsersApiUrl = (
  path: string,
  query?: Record<string, PrimitiveQueryValue | null | undefined>
): URL => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${resolveUsersApiBaseUrl()}${normalizedPath}`);

  url.searchParams.set('tenant', 'airqo');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url;
};

export const parseJsonSafe = async <T>(
  response: Response
): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const extractEnvelopeData = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const envelope = payload as { data?: unknown };
  if (envelope.data === undefined) {
    return payload as T;
  }

  return envelope.data as T;
};

export const isPaymentProviderUnavailable = (
  status: number,
  payload: unknown
): boolean => {
  if (status === 503) {
    return true;
  }

  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const envelope = payload as { status?: number; message?: string };
  const message = (envelope.message || '').toLowerCase();

  return (
    envelope.status === 503 ||
    message.includes('payment service is not configured') ||
    message.includes('payment provider is not configured')
  );
};

export const unauthorizedResponse = () =>
  NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 }
  );

export const makeUsersApiRequest = async (
  path: string,
  init: RequestInit = {},
  query?: Record<string, PrimitiveQueryValue | null | undefined>
): Promise<{ response: Response } | { error: NextResponse }> => {
  const session = (await getServerSession(
    authOptions
  )) as SessionWithAccessToken | null;

  if (!session?.user) {
    return { error: unauthorizedResponse() };
  }

  const jwtToken = getSessionJwtToken(session);
  if (!jwtToken) {
    return { error: unauthorizedResponse() };
  }

  const url = buildUsersApiUrl(path, query);
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');
  headers.set('Authorization', `JWT ${jwtToken}`);

  if (
    init.body &&
    typeof init.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url.toString(), {
    ...init,
    cache: 'no-store',
    headers,
  });

  return { response };
};
