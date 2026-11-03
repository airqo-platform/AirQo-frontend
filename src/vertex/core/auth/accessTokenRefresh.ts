import { jwtDecode } from 'jwt-decode';
import type { JWT } from 'next-auth/jwt';
import { buildServerApiUrl } from '@/lib/api-routing';
import { normalizeOAuthAccessToken } from '@/core/auth/oauth-session';
import logger from '@/lib/logger';

/**
 * Keeps the AirQo API token stored in the NextAuth session alive.
 *
 * The NextAuth cookie rolls forward on every visit but the API token inside it
 * does not, so a returning user would otherwise hold a valid session with a
 * dead API token and every request would come back 401. The API renews expired
 * tokens at /users/token/refresh, so the jwt callback swaps the token shortly
 * before it expires.
 */

export const ACCESS_TOKEN_REFRESH_ERROR = 'RefreshAccessTokenError';

// Refresh ahead of expiry so a token the browser has cached (up to 5 minutes)
// is still inside the API's grace period when it is next sent.
const REFRESH_AHEAD_SECONDS = 10 * 60;
const REFRESH_TIMEOUT_MS = 5000;
// getServerSession in route handlers cannot write the refreshed cookie, so the
// proxy keeps presenting the old token until the browser next reads its
// session. Reuse the result for that stretch instead of refreshing per request.
const REFRESH_REUSE_MS = 5 * 60 * 1000;
// Session reads wait on the refresh, so back off briefly after a failure
// rather than stalling every read while the API is unreachable.
const REFRESH_RETRY_AFTER_FAILURE_MS = 30 * 1000;

class TokenRefreshRejectedError extends Error {}

const pendingRefreshes = new Map<string, Promise<string>>();

export const getAccessTokenExpiry = (accessToken?: string): number | undefined => {
  if (!accessToken) return undefined;

  try {
    const { exp } = jwtDecode<{ exp?: number }>(normalizeOAuthAccessToken(accessToken));
    return typeof exp === 'number' ? exp : undefined;
  } catch {
    return undefined;
  }
};

const requestAccessTokenRefresh = async (accessToken: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  const response = await fetch(buildServerApiUrl('/users/token/refresh'), {
    method: 'POST',
    cache: 'no-store',
    signal: controller.signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${normalizeOAuthAccessToken(accessToken)}`,
    },
    body: '{}',
  }).finally(() => clearTimeout(timeoutId));

  if (response.status === 401 || response.status === 403) {
    throw new TokenRefreshRejectedError(`Token refresh rejected with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`Token refresh failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { success?: boolean; token?: string };
  const refreshedToken = normalizeOAuthAccessToken(
    typeof payload?.token === 'string' ? payload.token : ''
  );

  if (!payload?.success || !refreshedToken) {
    throw new Error('Token refresh response did not include a token');
  }

  // Keep the stored format: credential logins store "JWT <token>", OAuth logins the bare token.
  return /^JWT\s/i.test(accessToken) ? `JWT ${refreshedToken}` : refreshedToken;
};

const refreshAccessToken = (accessToken: string): Promise<string> => {
  const pending = pendingRefreshes.get(accessToken);
  if (pending) return pending;

  const request = requestAccessTokenRefresh(accessToken);
  pendingRefreshes.set(accessToken, request);

  const forgetAfter = (ms: number) => {
    setTimeout(() => pendingRefreshes.delete(accessToken), ms);
  };
  request.then(
    () => forgetAfter(REFRESH_REUSE_MS),
    () => forgetAfter(REFRESH_RETRY_AFTER_FAILURE_MS)
  );

  return request;
};

export const refreshAccessTokenIfNeeded = async (token: JWT): Promise<JWT> => {
  const expiresAt = getAccessTokenExpiry(token.accessToken);
  const now = Math.floor(Date.now() / 1000);

  if (!expiresAt || expiresAt - now > REFRESH_AHEAD_SECONDS) {
    return token;
  }

  try {
    const accessToken = await refreshAccessToken(token.accessToken);
    return { ...token, accessToken, error: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (error instanceof TokenRefreshRejectedError) {
      // The API will not renew this token (user removed, or past its refresh
      // window), so flag the session for the client to sign out.
      logger.warn('[NextAuth] Access token refresh rejected', { error: message });
      return { ...token, error: ACCESS_TOKEN_REFRESH_ERROR };
    }

    // Transient failure: keep the current token and try again on a later read.
    logger.warn('[NextAuth] Access token refresh failed', { error: message });
    return token;
  }
};
