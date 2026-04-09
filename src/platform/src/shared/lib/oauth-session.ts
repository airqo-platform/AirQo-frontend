const OAUTH_SIGNED_OUT_FLAG = 'airqo:oauth-signed-out';
const DEFAULT_PROFILE_FETCH_TIMEOUT_MS = 8000;
const OAUTH_FRAGMENT_TOKEN_KEY = 'token';
const OAUTH_SUCCESS_PROVIDER_KEY = 'success';

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

const normalizeApiBaseUrl = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, '');

  if (trimmedBaseUrl.endsWith('/api/v2')) {
    return trimmedBaseUrl.slice(0, -'/api/v2'.length);
  }

  return trimmedBaseUrl;
};

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return normalizeApiBaseUrl(baseUrl);
};

export const buildBackendApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}/api/v2${normalizedPath}`;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, DEFAULT_PROFILE_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(
        buildBackendApiUrl('/users/profile/enhanced'),
        {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

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
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };
