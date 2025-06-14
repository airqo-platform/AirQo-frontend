/**
 * Session Authentication HOC Index
 *
 * Simplified entry point for the session-aware authentication system.
 * All HOCs use a single, optimized session management approach.
 */

// Export everything from the main session auth HOC
export {
  withSessionAuth,
  PROTECTION_LEVELS,
  // Convenience HOCs
  withAuth,
  withAuthRoute,
  withPublicRoute,
  withPermission,
  withAdminAccess,
  // Session-aware permission utilities (consolidated)
  withSessionAwarePermissions,
  useSessionAwarePermissions,
  // Backward compatibility aliases
  withUserAuth,
  withOrgAuth,
  withUserAuthRoute,
  withOrgAuthRoute,
  withUserPermission,
  withOrgPermission,
} from './withSessionAuth';

// Export auth utilities
export { checkAccess, usePermissions } from './authUtils';

// Export logout utilities
export { default as LogoutUser } from './LogoutUser';

// Default export
export { default } from './withSessionAuth';
