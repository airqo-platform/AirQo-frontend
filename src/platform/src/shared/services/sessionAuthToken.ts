import { getSession } from 'next-auth/react';
import { normalizeOAuthAccessToken } from '@/shared/lib/oauth-session';
import type { ApiClient } from './apiClient';

type SessionAccessTokenResult = {
  fetchSucceeded: boolean;
  token: string | null;
};

let cachedSessionAccessToken: string | null = null;
let pendingSessionAccessToken: {
  version: number;
  promise: Promise<SessionAccessTokenResult>;
} | null = null;
let cacheVersion = 0;

const extractSessionAccessToken = (session: unknown): string | null => {
  const candidate = session as {
    accessToken?: string;
    user?: { accessToken?: string | null } | null;
  } | null;

  const accessToken = candidate?.accessToken ?? candidate?.user?.accessToken;
  if (typeof accessToken !== 'string') {
    return null;
  }

  const normalizedToken = normalizeOAuthAccessToken(accessToken);
  return normalizedToken || null;
};

export const getSessionAccessTokenFromSession = (
  session: unknown
): string | null => {
  return extractSessionAccessToken(session);
};

export const getCachedSessionAccessToken = (): string | null => {
  return cachedSessionAccessToken;
};

export const setCachedSessionAccessToken = (
  accessToken: string | null | undefined,
  version = cacheVersion
): void => {
  if (version !== cacheVersion) {
    return;
  }

  if (typeof accessToken !== 'string') {
    cachedSessionAccessToken = null;
    return;
  }

  const normalizedToken = normalizeOAuthAccessToken(accessToken);
  cachedSessionAccessToken = normalizedToken || null;
};

export const clearCachedSessionAccessToken = (): void => {
  cacheVersion += 1;
  cachedSessionAccessToken = null;
  pendingSessionAccessToken = null;
};

export const resolveSessionAccessToken =
  async (): Promise<SessionAccessTokenResult> => {
    if (cachedSessionAccessToken) {
      return {
        fetchSucceeded: true,
        token: cachedSessionAccessToken,
      };
    }

    if (!pendingSessionAccessToken) {
      const requestVersion = cacheVersion;
      const promise = getSession()
        .then(session => {
          const accessToken = extractSessionAccessToken(session);
          setCachedSessionAccessToken(accessToken, requestVersion);
          return {
            fetchSucceeded: true,
            token: accessToken,
          };
        })
        .catch(() => ({
          fetchSucceeded: false,
          token: null,
        }))
        .finally(() => {
          if (
            pendingSessionAccessToken?.version === requestVersion &&
            requestVersion === cacheVersion
          ) {
            pendingSessionAccessToken = null;
          }
        });

      pendingSessionAccessToken = {
        version: requestVersion,
        promise,
      };
    }

    const currentPending = pendingSessionAccessToken;
    if (!currentPending) {
      return {
        fetchSucceeded: false,
        token: null,
      };
    }

    const result = await currentPending.promise;
    if (currentPending.version !== cacheVersion) {
      return {
        fetchSucceeded: false,
        token: null,
      };
    }

    return result;
  };

export const syncClientSessionToken = async (
  client: ApiClient
): Promise<void> => {
  const { fetchSucceeded, token } = await resolveSessionAccessToken();

  if (!fetchSucceeded) {
    return;
  }

  if (!token) {
    client.removeAuthToken();
    return;
  }

  client.setAuthToken(token);
};
