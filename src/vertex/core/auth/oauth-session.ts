import { getApiBaseUrl } from "@/lib/envConstants";

const OAUTH_FRAGMENT_TOKEN_KEY = 'token';
const OAUTH_SUCCESS_PROVIDER_KEY = 'success';

export interface OAuthTokenHandoff {
  token: string;
  provider: string | null;
  callbackUrl?: string | null;
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Normalizes an OAuth access token by removing common prefixes like "JWT " or "Bearer ".
 */
export const normalizeOAuthAccessToken = (token: string): string => {
  return token
    .replace(/^JWT\s+/i, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
};

/**
 * Extracts the OAuth token and provider from the URL fragment (hash).
 * This is used when the backend redirects the user back to the frontend
 * after a successful OAuth flow.
 */
export const consumeOAuthTokenHandoffFromUrl = (): OAuthTokenHandoff | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawHash = window.location.hash;
  if (!rawHash || rawHash === '#') {
    return null;
  }

  const hashParams = new URLSearchParams(
    rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
  );
  const hashToken = hashParams.get(OAUTH_FRAGMENT_TOKEN_KEY);
  if (!hashToken) {
    return null;
  }

  const token = normalizeOAuthAccessToken(safeDecodeURIComponent(hashToken));

  // Clear the hash from the URL to avoid reprocessing the token on refresh
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${window.location.search}`
  );

  if (!token) {
    return null;
  }

  const provider = new URLSearchParams(window.location.search)
    .get(OAUTH_SUCCESS_PROVIDER_KEY)
    ?.trim()
    .toLowerCase();

  const callbackUrl = hashParams.get('callbackUrl') || new URLSearchParams(window.location.search).get('callbackUrl');

  return {
    token,
    provider: provider || null,
    callbackUrl: callbackUrl || null,
  };
};

/**
 * Builds the URL to initiate the OAuth flow with the backend.
 */
export const buildOAuthInitiationUrl = (
  provider = 'google',
  queryParams?: Record<string, string | undefined>
): string => {
  const apiUrl = getApiBaseUrl();
  const baseUrl = `${apiUrl}/users/auth/${encodeURIComponent(provider)}`;
  const params = new URLSearchParams();

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
