// Simplified User Auth HOC - delegates to main withAuth
import {
  withUserAuth as _withUserAuth,
  withUserPermission as _withUserPermission,
} from './withAuth';

// Re-export the main HOCs
export default _withUserAuth;
export const withUserPermission = _withUserPermission;

// Backward compatibility
export const withPermission = _withUserPermission;
