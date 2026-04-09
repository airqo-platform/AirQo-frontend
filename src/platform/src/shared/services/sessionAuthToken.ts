import { getSession } from 'next-auth/react';
import { normalizeOAuthAccessToken } from '@/shared/lib/oauth-session';
import type { ApiClient } from './apiClient';

let cachedSessionAccessToken: string | null = null;
let pendingSessionAccessToken: Promise<string | null> | null = null;

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
  accessToken: string | null | undefined
): void => {
  if (typeof accessToken !== 'string') {
    cachedSessionAccessToken = null;
    return;
  }

  const normalizedToken = normalizeOAuthAccessToken(accessToken);
  cachedSessionAccessToken = normalizedToken || null;
};

export const clearCachedSessionAccessToken = (): void => {
  cachedSessionAccessToken = null;
  pendingSessionAccessToken = null;
};

export const resolveSessionAccessToken = async (): Promise<string | null> => {
  if (cachedSessionAccessToken) {
    return cachedSessionAccessToken;
  }

  if (!pendingSessionAccessToken) {
    pendingSessionAccessToken = getSession()
      .then(session => {
        const accessToken = extractSessionAccessToken(session);
        cachedSessionAccessToken = accessToken;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        pendingSessionAccessToken = null;
      });
  }

  return pendingSessionAccessToken;
};

export const syncClientSessionToken = async (
  client: ApiClient
): Promise<void> => {
  const accessToken = await resolveSessionAccessToken();

  if (!accessToken) {
    client.removeAuthToken();
    return;
  }

  client.setAuthToken(accessToken);
};
