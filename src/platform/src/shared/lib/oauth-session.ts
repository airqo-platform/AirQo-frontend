import {
  buildBrowserApiUrl,
  buildServerApiUrl,
  resolveApiOrigin,
} from '@/shared/lib/api-routing';

const OAUTH_SIGNED_OUT_FLAG = 'airqo:oauth-signed-out';
const OAUTH_FRAGMENT_TOKEN_KEY = 'token';
const OAUTH_SUCCESS_PROVIDER_KEY = 'success';
const OAUTH_PROFILE_FETCH_TIMEOUT_MS = 10000;

export interface BackendOAuthProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  verified?: boolean;
  accessToken?: string;
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
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    image: string;
  };
}

export interface OAuthTokenHandoff {
  token: string;
  provider: string | null;
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const normalizeOAuthAccessToken = (token: string): string => {
  return token
    .replace(/^JWT\s+/i, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
};

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

  return {
    token,
    provider: provider || null,
  };
};

export const getApiBaseUrl = (): string => {
  try {
    return resolveApiOrigin();
  } catch {
    return '';
  }
};

export const buildBackendApiUrl = (path: string): string => {
  try {
    return buildServerApiUrl(path);
  } catch {
    return '';
  }
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

export const buildOAuthInitiationUrl = (
  provider = 'google',
  queryParams?: Record<string, string | undefined>
): string => {
  const baseUrl = buildBackendApiUrl(
    `/users/auth/${encodeURIComponent(provider)}`
  );
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

  return {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessToken: normalizedAccessToken,
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

export const verifyBackendOAuthSession =
  async (): Promise<BackendOAuthProfile | null> => {
    const profileUrl =
      typeof window === 'undefined'
        ? buildServerApiUrl('/users/profile/enhanced')
        : buildBrowserApiUrl('/users/profile/enhanced');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, OAUTH_PROFILE_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(profileUrl, {
        method: 'GET',
        signal: controller.signal,
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as BackendOAuthProfileResponse;
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
      };
    } catch (error) {
      const errorName = (error as { name?: string })?.name;
      if (errorName === 'AbortError') {
        return null;
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };
