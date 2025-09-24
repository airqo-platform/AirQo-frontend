/**
 * Session Authentication HOC Index
 *
 * Clean entry point for NextAuth session authentication system.
 * Only exports functions that actually exist.
 */

// Export the main session auth HOC and its constants
export {
  default as withSessionAuth,
  PROTECTION_LEVELS,
} from './withSessionAuth';

// Export logout utilities
export { default as LogoutUser } from './LogoutUser';
