
import { createProxyHandler } from '@/core/utils/proxyClient';
import { getAuthOptions } from '@/core/config/proxyConfig';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Dynamic API proxy handler
 *
 * This file handles all API proxy requests by forwarding them to the actual API
 * but without exposing sensitive tokens on the client side.
 *
 * For routes that need API_TOKEN authentication, the token is added on the server side.
 * For routes requiring JWT auth, the authorization header is forwarded from the client.
 *
 * Path pattern: /api/[...path]
 */

interface RouteParams {
  params: {
    path: string[];
  };
}

// Determine if the request needs authentication based on the path or explicit header
const handler = (request: NextRequest, { params }: RouteParams) => {
  // Extract path segments
  const { path } = params;

  // Skip NextAuth routes - they should be handled by NextAuth directly
  if (path && path.length > 0 && path[0] === 'auth') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // Check for explicit auth type header
  const authTypeHeader = request.headers.get('x-auth-type');

  // Get optimized auth options
  const options = getAuthOptions(path, authTypeHeader || undefined);

  // Create and execute the appropriate proxy handler
  return createProxyHandler(options)(request, { params });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
