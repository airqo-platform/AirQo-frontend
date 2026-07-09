import { CLEAN_AIR_FORUM_2026_RESULTS_ROUTE } from '@/features/clean-air-forum-2026/constants/learn';

const OAUTH_FRAGMENT_TOKEN_KEY = 'token';
const OAUTH_SUCCESS_PROVIDER_KEY = 'success';

export type CleanAirForum2026OAuthTokenHandoff = {
  token: string;
  provider: string | null;
};

function stripApiSuffix(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (/\/api\/v\d+\/[^/]+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+\/[^/]+$/i, '');
  }

  if (/\/api\/v\d+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+$/i, '');
  }

  if (/\/api$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api$/i, '');
  }

  return trimmedBaseUrl;
}

function resolveBackendOrigin() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '';

  return stripApiSuffix(configuredBaseUrl);
}

export function buildCleanAirForumGoogleSignInUrl() {
  const backendOrigin = resolveBackendOrigin();

  if (!backendOrigin) {
    throw new Error('Google sign-in is not configured yet.');
  }

  const oauthUrl = new URL('/users/auth/google', backendOrigin);

  if (typeof window !== 'undefined') {
    const redirectAfter = new URL(
      CLEAN_AIR_FORUM_2026_RESULTS_ROUTE,
      window.location.origin,
    ).toString();

    oauthUrl.searchParams.set('redirect_after', redirectAfter);
  }

  oauthUrl.searchParams.set('prompt', 'select_account');

  return oauthUrl.toString();
}

export function normalizeOAuthAccessToken(token: string) {
  return token
    .replace(/^JWT\s+/i, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

export function consumeOAuthTokenHandoffFromUrl(): CleanAirForum2026OAuthTokenHandoff | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawHash = window.location.hash;
  if (!rawHash || rawHash === '#') {
    return null;
  }

  const hashParams = new URLSearchParams(
    rawHash.startsWith('#') ? rawHash.slice(1) : rawHash,
  );
  const hashToken = hashParams.get(OAUTH_FRAGMENT_TOKEN_KEY);

  if (!hashToken) {
    return null;
  }

  const token = normalizeOAuthAccessToken(decodeURIComponent(hashToken));

  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${window.location.search}`,
  );

  if (!token) {
    return null;
  }

  const provider = new URLSearchParams(window.location.search)
    .get(OAUTH_SUCCESS_PROVIDER_KEY)
    ?.trim()
    .toLowerCase();

  return {
    token,
    provider: provider || null,
  };
}
