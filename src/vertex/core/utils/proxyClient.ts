import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/app/api/auth/[...nextauth]/options';
import logger from '@/lib/logger';
import { getApiBaseUrl, getApiToken } from '@/lib/envConstants';
import { NextRequest, NextResponse } from 'next/server';

// Type definitions
interface ProxyOptions {
  requiresAuth?: boolean;
  requiresApiToken?: boolean;
}

interface CacheEntry {
  session: unknown;
  timestamp: number;
}

interface ProxyContext {
  params?: {
    path: string[];
  };
}

interface ExtendedAxiosConfig extends AxiosRequestConfig {
  data?: Record<string, unknown> | string;
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
}

// Session cache implementation
class SessionCache {
  private cache = new Map<string, CacheEntry>();
  private ttl = 5 * 60 * 1000; // 5 minutes
  private maxSize = 50;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    if (typeof process !== 'undefined') {
      process.on('exit', () => this.clear());
      process.on('SIGINT', () => this.clear());
      process.on('SIGTERM', () => this.clear());
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(0, this.cache.size - this.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get(key: string): unknown {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.session;
  }

  set(key: string, session: unknown): void {
    this.cache.set(key, {
      session,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

const sessionCache = new SessionCache();

const getCachedSession = async (): Promise<ExtendedSession | null> => {
  sessionCache.init();

  const cacheKey = 'nextauth_session';
  const cachedSession = sessionCache.get(cacheKey);
  
  if (cachedSession) {
    return cachedSession as ExtendedSession | null;
  }

  try {
    const session = await getServerSession(authOptions);
    if (session) {
      sessionCache.set(cacheKey, session);
    }
    return session as ExtendedSession | null;
  } catch (error: unknown) {
    logger.warn('Failed to get server session:', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
};

export const createProxyHandler = (options: ProxyOptions = {}) => {
  const { requiresAuth = false, requiresApiToken = false } = options;

  return async (req: NextRequest, context: ProxyContext): Promise<NextResponse> => {
    let path: string[] | undefined;
    let queryParams: Record<string, string>;

    // Handle App Router format
    if (context?.params) {
      path = context.params.path;
      try {
        const url = new URL(req.url);
        queryParams = Object.fromEntries(url.searchParams.entries());
      } catch (urlError) {
        const error = urlError as Error;
        logger.error('Proxy client: Failed to parse request URL', {
          message: error.message,
          url: req.url,
        });
        return NextResponse.json(
          { success: false, message: 'Bad Request: Invalid URL' },
          { status: 400 }
        );
      }
    } else {
      // Fallback for other formats
      queryParams = {};
      path = [];
    }

    const targetPath = Array.isArray(path) ? path.join('/') : '';

    // Method validation
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!allowedMethods.includes(req.method)) {
      return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
      );
    }

    try {
      // Get API base URL
      let API_BASE_URL: string;
      try {
        API_BASE_URL = getApiBaseUrl();
      } catch (envError) {
        logger.error('Failed to get API base URL from environment:', { error: envError instanceof Error ? envError.message : String(envError) });
        return NextResponse.json(
          {
            success: false,
            message: 'API configuration error: Unable to determine base URL',
          },
          { status: 500 }
        );
      }

      if (!API_BASE_URL) {
        return NextResponse.json(
          {
            success: false,
            message: 'API configuration error: Base URL not defined',
          },
          { status: 500 }
        );
      }

      // Normalize URL
      const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '');

      // Configure request
      const config: ExtendedAxiosConfig = {
        method: req.method,
        url: `${normalizedBaseUrl}/${targetPath}`,
        params: { ...queryParams },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      };

      // Handle request body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.text();
          if (body) {
            config.data = JSON.parse(body);
          }
        } catch {
          config.data = {};
        }
      }

      // Add API token if required
      if (requiresApiToken) {
        const API_TOKEN = getApiToken();
        if (!API_TOKEN) {
          throw new Error('API_TOKEN environment variable not defined');
        }
        if (!config.params) config.params = {};
        config.params.token = API_TOKEN;
      }

      // Add JWT token if required
      if (requiresAuth) {
        const session = await getCachedSession();
        let authHeader: string | null = null;

        if (session?.user?.accessToken) {
          const token = session.user.accessToken;
          authHeader = token.startsWith('JWT ') ? token : `JWT ${token}`;
        } else {
          authHeader = req.headers.get('authorization');
        }

        if (authHeader) {
          if (!authHeader.startsWith('JWT ') && !authHeader.startsWith('Bearer ')) {
            authHeader = `JWT ${authHeader}`;
          }
          if (!config.headers) config.headers = {};
          (config.headers as Record<string, string>).Authorization = authHeader;
        }
      }

      // Make request
      const response: AxiosResponse = await axios(config);

      return NextResponse.json(response.data, { status: response.status });

    } catch (error: unknown) {
      const statusCode = (error as AxiosError)?.response?.status || 500;
      const errorMessage = (error as AxiosError)?.response?.data || {
        success: false,
        message: 'An error occurred while processing the request',
      };

      return NextResponse.json(errorMessage, { status: statusCode });
    }
  };
};
