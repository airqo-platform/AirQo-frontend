import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { getSession } from 'next-auth/react';
import { getApiToken } from '@/lib/envConstants';
import logger from '@/lib/logger';

// Type definitions
interface TokenCacheEntry {
  token: string;
  expiry: number;
}

interface ExtendedSession {
  user: {
    id: string;
    accessToken: string;
    userName: string;
    organization: string;
    privilege: string;
    firstName: string;
    lastName: string;
    country: string;
    timezone: string;
    phoneNumber: string;
  };
  expires: string;
  accessToken?: string;
}

// Token cache implementation
class TokenCache {
  private entry: TokenCacheEntry | null = null;
  private readonly ttl = 5 * 60 * 1000; // 5 minutes

  get(): string | null {
    const now = Date.now();
    if (!this.entry || now > this.entry.expiry) {
      this.clear();
      return null;
    }
    return this.entry.token;
  }

  set(token: string): void {
    if (!token) return;
    this.entry = { token, expiry: Date.now() + this.ttl };
  }

  clear(): void {
    this.entry = null;
  }
}

const tokenCache = new TokenCache();

async function getJwtToken(): Promise<string | null> {
  const cachedToken = tokenCache.get();
  if (cachedToken) {
    return cachedToken;
  }

  try {
    // Try to get token from NextAuth session first
    const session = (await getSession()) as ExtendedSession;
    let token = session?.accessToken || session?.user?.accessToken;
    
    // If NextAuth doesn't have the token, fallback to localStorage
    if (!token && typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken !== null) {
        token = localStorageToken;
      }
    }
    
    if (token) {
      tokenCache.set(token);
      return token;
    }
    
    return null;
  } catch (error: unknown) {
    logger.error('Failed to get JWT token:', { error: error instanceof Error ? error.message : String(error) });
    // Fallback to localStorage if session fails
    if (typeof window !== 'undefined') {
      const fallbackToken = localStorage.getItem('token');
      if (fallbackToken !== null) {
        tokenCache.set(fallbackToken);
        return fallbackToken;
      }
    }
    return null;
  }
}

// Secure API client configuration
const createSecureApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/api',
    withCredentials: true,
    timeout: 25000,
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const authType = config.headers?.['X-Auth-Type'] || 'JWT';
      
      if (authType === 'API_TOKEN') {
        try {
          const apiToken = getApiToken();
          if (apiToken) {
            config.url = config.url?.includes('?') ? `${config.url}&token=${apiToken}` : `${config.url}?token=${apiToken}`;
          }
        } catch (error) {
          logger.error('Failed to get API token:', {error: error instanceof Error ? error.message : String(error)});
        }
      } else {
        // Handle JWT authentication
        const jwtToken = await getJwtToken();
        if (jwtToken) {
          if (!config.headers) config.headers = new AxiosHeaders();
          // Add JWT token directly without Bearer prefix as requested
          config.headers.set('Authorization', jwtToken);
        }
      }
      
      // Set the x-auth-type header for the proxy to understand
      if (!config.headers) config.headers = new AxiosHeaders();
      config.headers.set('x-auth-type', authType === 'API_TOKEN' ? 'token' : 'jwt');
      
      return config;
    },
    (error) => {
      logger.error('Request interceptor error:', {error: error instanceof Error ? error.message : String(error)});
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      logger.error(`API request failed:`, {
        url,
        status,
        message: error.message,
        responseData: error.response?.data
      });
      
      if ([401, 403].includes(status)) {
        // Clear token cache on authentication/authorization failures
        tokenCache.clear();
        
        if (typeof window !== 'undefined') {
          // Also clear localStorage token if it exists
          localStorage.removeItem('token');
        }
        
        // Optionally trigger a re-authentication flow
        if (status === 401 && typeof window !== 'undefined') {
          // Dispatch a custom event that components can listen to
          window.dispatchEvent(new CustomEvent('auth-token-expired', {
            detail: { url, status }
          }));
        }
      }
      
      if (status === 429) {
        logger.warn(`Rate limit exceeded for ${url}`);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Utility functions for token management
export const clearTokenCache = () => {
  tokenCache.clear();
};

export const hasValidToken = async (): Promise<boolean> => {
  const token = await getJwtToken();
  return !!token;
};

export const secureApiProxy = createSecureApiClient();

export default createSecureApiClient;
