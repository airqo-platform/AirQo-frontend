const DEFAULT_TENANT = 'airqo';
const OAUTH_SIGNED_OUT_FLAG = 'airqo:oauth-signed-out';

export interface BackendOAuthProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  verified?: boolean;
}

export interface BackendOAuthProfileResponse {
  success: boolean;
  message?: string;
  data?: BackendOAuthProfile;
}

export interface BackendOAuthSession {
  expires: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    image: string;
  };
}

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
  tenant = DEFAULT_TENANT
): string => {
  return buildBackendApiUrl(
    `/users/auth/${encodeURIComponent(provider)}?tenant=${encodeURIComponent(
      tenant
    )}`
  );
};

export const buildSessionFromProfile = (
  profile: BackendOAuthProfile
): BackendOAuthSession => {
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
    try {
      const response = await fetch(
        buildBackendApiUrl('/users/profile/enhanced'),
        {
          method: 'GET',
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

      return payload.data;
    } catch {
      return null;
    }
  };
