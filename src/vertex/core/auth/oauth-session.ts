import { buildServerApiUrl, buildBrowserApiUrl } from "@/lib/api-routing";

const OAUTH_FRAGMENT_TOKEN_KEY = 'token';
const OAUTH_SUCCESS_PROVIDER_KEY = 'success';
const LAST_USED_OAUTH_PROVIDER_KEY = 'vertex:last-oauth-provider';
const OAUTH_PROFILE_FETCH_TIMEOUT_MS = 10000;
const OAUTH_SIGNED_OUT_FLAG = 'vertex:oauth-signed-out';

export const SUPPORTED_SOCIAL_AUTH_PROVIDERS = [
  'google',
  'github',
  'linkedin',
  'twitter',
] as const;

export type SupportedSocialAuthProvider =
  (typeof SUPPORTED_SOCIAL_AUTH_PROVIDERS)[number];

export const isSupportedSocialAuthProvider = (
  value: string | null | undefined
): value is SupportedSocialAuthProvider => {
  if (!value) {
    return false;
  }

  return (SUPPORTED_SOCIAL_AUTH_PROVIDERS as readonly string[]).includes(value);
};

export const resolveOAuthRedirectAfterUrl = (
  targetPath = '/home'
): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalizedTargetPath = targetPath.startsWith('/')
    ? targetPath
    : `/${targetPath}`;

  try {
    return new URL(normalizedTargetPath, window.location.origin).toString();
  } catch {
    return null;
  }
};

export const getLastUsedOAuthProvider =
  (): SupportedSocialAuthProvider | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const provider = localStorage.getItem(LAST_USED_OAUTH_PROVIDER_KEY)?.trim();

    return isSupportedSocialAuthProvider(provider) ? provider : null;
  };

export const setLastUsedOAuthProvider = (
  provider: string | null | undefined
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isSupportedSocialAuthProvider(provider)) {
    localStorage.removeItem(LAST_USED_OAUTH_PROVIDER_KEY);
    return;
  }

  localStorage.setItem(LAST_USED_OAUTH_PROVIDER_KEY, provider);
};

export const shouldSkipBackendOAuthBootstrap = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(OAUTH_SIGNED_OUT_FLAG) === 'true';
};

export const clearBackendOAuthSignedOutFlag = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(OAUTH_SIGNED_OUT_FLAG);
};

export const setBackendOAuthSignedOutFlag = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(OAUTH_SIGNED_OUT_FLAG, 'true');
};

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
    provider: provider || getLastUsedOAuthProvider(),
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
  const baseUrl = buildServerApiUrl(`/users/auth/${encodeURIComponent(provider)}`);
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

// --- Backend Session Verification (SSO fallback) ---

const AUTH_METHOD_KEYS = [
  'password',
  'google',
  'github',
  'linkedin',
  'microsoft',
  'twitter',
  'facebook',
  'apple',
] as const;

type AuthMethodKey = (typeof AUTH_METHOD_KEYS)[number];

export interface AuthMethods {
  password: boolean;
  google: boolean;
  github: boolean;
  linkedin: boolean;
  microsoft: boolean;
  twitter: boolean;
  facebook: boolean;
  apple: boolean;
}

const normalizeAuthMethods = (value: unknown): AuthMethods | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<Record<AuthMethodKey, unknown>>;
  const hasKnownKey = AUTH_METHOD_KEYS.some(key => key in candidate);

  if (!hasKnownKey) {
    return undefined;
  }

  return {
    password: Boolean(candidate.password),
    google: Boolean(candidate.google),
    github: Boolean(candidate.github),
    linkedin: Boolean(candidate.linkedin),
    microsoft: Boolean(candidate.microsoft),
    twitter: Boolean(candidate.twitter),
    facebook: Boolean(candidate.facebook),
    apple: Boolean(candidate.apple),
  };
};

export interface BackendOAuthProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  verified?: boolean;
  accessToken?: string;
  authMethods?: AuthMethods;
}

export interface BackendOAuthProfileResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  data?: BackendOAuthProfile;
}

export interface BackendOAuthSession {
  expires: string;
  accessToken?: string;
  authMethods?: AuthMethods;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    image: string;
  };
}

export interface FetchEnhancedUserProfileOptions {
  accessToken?: string;
  signal?: AbortSignal;
}

export const buildSessionFromProfile = (
  profile: BackendOAuthProfile
): BackendOAuthSession => {
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const normalizedAccessToken = profile.accessToken
    ? normalizeOAuthAccessToken(profile.accessToken) || undefined
    : undefined;
  const authMethods = normalizeAuthMethods(profile.authMethods);

  return {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessToken: normalizedAccessToken,
    authMethods,
    user: {
      _id: profile._id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: fullName || profile.email,
      image: profile.profilePicture ?? '',
    },
  };
};

const resolveEnhancedUserProfileUrl = (): string => {
  return typeof window === 'undefined'
    ? buildServerApiUrl('/users/profile/enhanced')
    : buildBrowserApiUrl('/users/profile/enhanced');
};

const normalizeBackendOAuthProfile = (
  payload: BackendOAuthProfileResponse
): BackendOAuthProfile | null => {
  if (!payload?.success || !payload.data?._id) {
    return null;
  }

  return {
    ...payload.data,
    accessToken: payload.data.accessToken
      ? normalizeOAuthAccessToken(payload.data.accessToken) || undefined
      : payload.accessToken
        ? normalizeOAuthAccessToken(payload.accessToken) || undefined
        : undefined,
    authMethods: normalizeAuthMethods(payload.data.authMethods),
  };
};

export const fetchEnhancedUserProfile = async (
  options: FetchEnhancedUserProfileOptions = {}
): Promise<BackendOAuthProfile | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, OAUTH_PROFILE_FETCH_TIMEOUT_MS);
  const normalizedAccessToken = normalizeOAuthAccessToken(
    typeof options.accessToken === 'string' ? options.accessToken : ''
  );
  const handleExternalAbort = () => {
    controller.abort();
  };

  if (options.signal?.aborted) {
    controller.abort();
  } else if (options.signal) {
    options.signal.addEventListener('abort', handleExternalAbort, {
      once: true,
    });
  }

  try {
    const response = await fetch(resolveEnhancedUserProfileUrl(), {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(normalizedAccessToken
          ? { Authorization: `JWT ${normalizedAccessToken}` }
          : {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as BackendOAuthProfileResponse;
    return normalizeBackendOAuthProfile(payload);
  } catch (error) {
    const errorName = (error as { name?: string })?.name;
    if (errorName === 'AbortError') {
      return null;
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', handleExternalAbort);
  }
};

export const verifyBackendOAuthSession = async (
  options: Omit<FetchEnhancedUserProfileOptions, 'accessToken'> = {}
): Promise<BackendOAuthProfile | null> => {
  return fetchEnhancedUserProfile(options);
};
