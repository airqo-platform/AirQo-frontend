// Simplified Org Auth HOC - delegates to main withAuth
import {
  withOrgAuth as _withOrgAuth,
  withOrgPermission as _withOrgPermission,
} from './withAuth';

// Re-export the main HOCs
export default _withOrgAuth;
export const withOrgPermission = _withOrgPermission;
