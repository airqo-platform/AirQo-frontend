import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import { buildServerApiUrl } from '@/shared/lib/api-routing';
import { normalizeOAuthAccessToken } from '@/shared/lib/oauth-session';
import { sanitizeErrorForLogging } from '@/shared/utils/sanitizeErrorForLogging';
import type { Session } from 'next-auth';
import type { UpdateTokenSecurityRequest } from '@/shared/types/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const DEFAULT_PROXY_TIMEOUT_MS = 30000;

type TokenSecurityProxyRequest = UpdateTokenSecurityRequest & {
  token?: string;
};

const resolveAuthorizationHeader = (
  request: NextRequest,
  session: Session | null
): string | null => {
  const authorizationHeader = request.headers.get('authorization');
  if (authorizationHeader?.trim()) {
    return authorizationHeader;
  }

  const accessToken = normalizeOAuthAccessToken(
    (session as { accessToken?: string } | null)?.accessToken || ''
  );

  return accessToken ? `JWT ${accessToken}` : null;
};

export async function PATCH(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const authorizationHeader = resolveAuthorizationHeader(request, session);

    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: TokenSecurityProxyRequest;
    try {
      body = (await request.json()) as TokenSecurityProxyRequest;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const payload = { ...body };
    delete payload.token;
    const upstreamUrl = buildServerApiUrl(
      `/users/tokens/${encodeURIComponent(token)}`
    );

    const upstreamAbortController = new AbortController();
    const timeoutId = setTimeout(() => {
      upstreamAbortController.abort();
    }, DEFAULT_PROXY_TIMEOUT_MS);

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(upstreamUrl, {
        method: 'PATCH',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorizationHeader,
        },
        body: JSON.stringify(payload),
        signal: upstreamAbortController.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        'Content-Type':
          upstreamResponse.headers.get('Content-Type') || 'application/json',
        Expires: '0',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }

    console.error(
      'Token security proxy error:',
      sanitizeErrorForLogging(error)
    );
    return NextResponse.json(
      { error: 'Failed to update token security' },
      { status: 500 }
    );
  }
}
