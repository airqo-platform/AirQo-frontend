/**
 * Shared list of public routes that don't require authentication.
 * Used by both middleware.ts (edge-level protection) and
 * auth-provider.tsx (client-side UX layer).
 */

export const publicRoutes = [
  '/user/login',
  '/user/creation/individual/register',
  '/user/creation/individual/verify-email',
  '/user/creation/individual/interest',
  '/user/forgotPwd',
  '/user/forgotPwd/reset',
  '/user/delete/confirm',
  '/org-invite',
  '/request-organization',
];

/**
 * Regex pattern that matches public auth routes.
 * Covers the explicit list plus org-scoped login/register.
 */
const orgAuthRoutePattern = /^\/org\/[^/]+\/(login|register)$/;

export const isPublicAuthRoute = (pathname: string): boolean =>
  publicRoutes.some(route => pathname.startsWith(route)) ||
  orgAuthRoutePattern.test(pathname);

/**
 * Public routes that authenticated users can access (e.g., invitation pages).
 */
export const isAuthenticatedAccessiblePublicRoute = (
  pathname: string
): boolean =>
  pathname.startsWith('/org-invite') ||
  pathname.startsWith('/request-organization');
