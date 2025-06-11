/**
 * Consolidated Auth Route HOCs
 * This file provides all auth route HOCs that redirect authenticated users to dashboards
 * Used by login/register pages
 */

// Import the main auth HOCs
import {
  withUserAuthRoute,
  withOrgAuthRoute,
  withUserAuth,
  withOrgAuth,
  withPermission,
  withUserPermission,
  withOrgPermission,
} from './withAuth';

// Default export for user auth routes
export default withUserAuthRoute;

// Named exports for specific use cases
export {
  withUserAuthRoute,
  withOrgAuthRoute,
  withUserAuth,
  withOrgAuth,
  withPermission,
  withUserPermission,
  withOrgPermission,
};
