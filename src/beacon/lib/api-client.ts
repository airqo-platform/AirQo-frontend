import axios from 'axios';
import { signOut } from 'next-auth/react';
import { sendToSlack } from '@/lib/logger';
// Import authService lazily inside handleUnauthorized to avoid a circular dependency with services/api-service.

let isLoggingOut = false;
let logoutPromise: Promise<void> | null = null;

/**
 * Handles 401 Unauthorized errors centrally.
 * Clears authentication data and signs out the user.
 * Stores in-flight operation in a shared promise to handle concurrent calls.
 */
export function handleUnauthorized(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (logoutPromise) {
    return logoutPromise;
  }

  if (isLoggingOut) return Promise.resolve();

  logoutPromise = (async () => {
    isLoggingOut = true;
    try {
      try {
        const { default: authService } = await import('@/services/api-service');
        if (typeof authService?.clearAllAuthData === 'function') {
          authService.clearAllAuthData();
        }
      } catch (e) {
        console.error('Error clearing auth data on 401:', e);
      }

      try {
        await signOut({ callbackUrl: '/login?action=logout' });
      } catch (e) {
        console.error('Error signing out on 401:', e);
        window.location.href = '/login?action=logout';
      }
    } finally {
      setTimeout(() => {
        isLoggingOut = false;
      }, 5000);
      logoutPromise = null;
    }
  })();

  return logoutPromise;
}

const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      await handleUnauthorized();
    } else if (!status || status >= 500) {
      sendToSlack("API request failed", error, {
        statusCode: status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    }
    return Promise.reject(error);
  },
);

/**
 * Centralized fetch wrapper that intercepts 401 Unauthorized responses.
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401) {
    await handleUnauthorized();
  }
  return response;
}

export default apiClient;
